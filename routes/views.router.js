import { Router } from "express";
import { isValidObjectId } from "mongoose";
import {
  prepareProductCreation,
  validateProductCreation,
} from "../middleware/products.middleware.js";
import { getCartById, populateCart } from "../utils/carts.js";
import { addProduct, getAllProducts, getProducts } from "../utils/products.js";

const viewsRouter = Router();

/**
 * Adds the products to the request object for the /realtimeproducts route.
 *
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @param {import("express").NextFunction} next - The next middleware function
 */
async function addProductsToRequest(req, res, next) {
  req.products = await getAllProducts();
  next();
}

/**
 * GET /products - Returns the home view with the products.
 */
viewsRouter.get("/products", async (req, res) => {
  const query = { page: req.query.page, limit: 5 };
  const products = await getProducts(query);
  res.render("home", {
    products: products.docs.map((product) => product.toObject()), // convert the products to plain objects to avoid hb error
    hasPrevPage: products.hasPrevPage,
    hasNextPage: products.hasNextPage,
    prevPage: products.prevPage,
    nextPage: products.nextPage,
    totalPages: products.totalPages,
    page: products.page,
  });
});

/**
 * GET /carts/:cid - Returns the cart view with the products in the cart.
 */
viewsRouter.get("/carts/:cid", async (req, res) => {
  if (!isValidObjectId(req.params.cid)) {
    return res.status(400).send({ error: "Invalid object id" });
  }

  const cart = await getCartById(req.params.cid);
  if (!cart) {
    return res.status(404).send({ error: "Cart not found" });
  }

  const result = await populateCart(req.params.cid);
  const plainProducts = result.products.map((product) => product.toObject());
  res.render("cart", { products: plainProducts, id: req.params.cid });
});

/**
 * GET /realtimeproducts - Returns the realtimeproducts view with the products.
 */
viewsRouter.get("/realtimeproducts", addProductsToRequest, async (req, res) => {
  const plainProducts = req.products.map((product) => product.toObject());
  res.render("realtimeproducts", { products: plainProducts });
});

/**
 * POST /realtimeproducts - Adds a new product to the products array, from the form in the realtimeproducts view.
 */
viewsRouter.post(
  "/realtimeproducts",
  prepareProductCreation,
  validateProductCreation,
  async (req, res) => {
    await addProduct(req.body);
    // redirect the users to the realtimeproducts page after adding a new product from the form
    res.redirect("/realtimeproducts");
  }
);

export default viewsRouter;
