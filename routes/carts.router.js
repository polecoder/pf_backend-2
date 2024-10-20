import { Router } from "express";
import { isValidObjectId } from "mongoose";
import {
  addProductToCart,
  createCart,
  emptyCart,
  getCartById,
  populateCart,
  productInCart,
  removeProductFromCart,
} from "../utils/carts.js";
import { getProductById } from "../utils/products.js";

const cartsRouter = Router();

/**
 * POST /api/carts
 * Creates a new empty cart and returns its ID.
 */
cartsRouter.post("/", async (req, res) => {
  const newCartId = await createCart();
  res.send({ message: `Cart created with id: ${newCartId}` });
});

/**
 * GET /api/carts/:cid
 * Returns the products in the cart with the given id.
 * If the given id does not exist, returns a 404 status code.
 */
cartsRouter.get("/:cid", async (req, res) => {
  const cid = req.params.cid;

  if (!isValidObjectId(cid)) {
    return res.status(400).send({ error: "Invalid object id" });
  }

  let cart = await getCartById(cid);
  if (!cart) {
    return res.status(404).send({ error: "Cart not found" });
  }

  cart = await populateCart(cart);

  res.send({ message: "Cart found successfully", cart });
});

/**
 * POST /api/carts/:cid/products/:pid
 * Adds the product with the given pid to the cart with the given cid.
 * If the cart or product does not exist, returns a 404 status code.
 * If the product is already in the cart, increments its quantity by desired amount.
 * If the product is not in the cart, adds it with the desired quantity.
 */
cartsRouter.post("/:cid/products/:pid", async (req, res) => {
  const { cid, pid } = req.params;

  if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
    return res.status(400).send({ error: "Invalid object id" });
  }

  const desiredCart = await getCartById(cid);
  if (!desiredCart) {
    return res.status(404).send({ error: "Cart not found" });
  }

  const desiredProduct = await getProductById(pid);
  if (!desiredProduct) {
    return res.status(404).send({ error: "Product not found" });
  }

  const updatedCart = await addProductToCart(cid, pid, 1);

  if (!updatedCart) {
    return res.status(500).send({ error: "Error adding product to cart" });
  }

  res.send({
    message: `Product with id ${pid} added to cart with id ${cid} successfully`,
  });
});

/**
 * DELETE /api/carts/:cid/products/:pid
 * Removes the product with the given pid from the cart with the given cid.
 * If the cart or product does not exist, returns a 404 status code.
 */
cartsRouter.delete("/:cid/products/:pid", async (req, res) => {
  const { cid, pid } = req.params;

  if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
    return res.status(400).send({ error: "Invalid object id" });
  }

  if (!(await getCartById(cid))) {
    return res.status(404).send({ error: "Cart not found" });
  }

  if (!(await getProductById(pid))) {
    return res.status(404).send({ error: "Product not found" });
  }

  const updatedCart = await removeProductFromCart(cid, pid);

  if (!updatedCart) {
    return res.status(500).send({ error: "Error removing product from cart" });
  }

  res.send({
    message: `Product with id ${pid} removed from cart with id ${cid} successfully`,
  });
});

/**
 * PUT /api/carts/:cid
 * Updates the cart with the given cid by adding all the products given in req.body as an array of objects.
 *
 * Example req.body:
 * [
 *   { product: "60b0e4f3b4f45b001f6f3f5d", quantity: 2 },
 *   { product: "60b0e4f3b4f45b001f6f3f5e", quantity: 1 },
 *   { product: "60b0e4f3b4f45b001f6f3f5f", quantity: 3 },
 * ]
 *
 * If the given cid does not exist, returns a 404 status code.
 */
cartsRouter.put("/:cid", async (req, res) => {
  const cid = req.params.cid;

  if (!isValidObjectId(cid)) {
    return res.status(400).send({ error: "Invalid object id" });
  }

  const desiredCart = await getCartById(cid);
  if (!desiredCart) {
    return res.status(404).send({ error: "Cart not found" });
  }

  // req.body Array type checking
  if (!Array.isArray(req.body)) {
    return res.status(400).send({ error: "Invalid request body" });
  }

  // objects inside array type checking
  for (const product of req.body) {
    // missing properties checking
    if (!product.product || !product.quantity) {
      return res
        .status(400)
        .send({ error: "Products are missing information" });
    }

    // product properties type checking
    if (
      !isValidObjectId(product.product) ||
      typeof product.quantity !== "number"
    ) {
      return res
        .status(400)
        .send({ error: "Products properties have incorrect type" });
    }

    // product existence checking
    if (!(await getProductById(product.product))) {
      return res.status(404).send({ error: "Products not found" });
    }
  }

  for (const product of req.body) {
    await addProductToCart(cid, product.product, product.quantity);
  }

  res.send({ message: `Cart with id ${cid} updated successfully` });
});

/**
 * PUT /api/carts/:cid/products/:pid
 * Updates the quantity of the product with the given pid in the cart with the given cid by the quantity specified in the request body.
 *
 * Example req.body:
 * { quantity: 5 }
 *
 * If the cart or product does not exist, returns a 404 status code.
 *
 * If the product is not in the cart, returns a 404 status code.
 */
cartsRouter.put("/:cid/products/:pid", async (req, res) => {
  const { cid, pid } = req.params;

  if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
    return res.status(400).send({ error: "Invalid object id" });
  }

  // existence checking
  if (!(await getCartById(cid))) {
    return res.status(404).send({ error: "Cart not found" });
  }
  if (!(await getProductById(pid))) {
    return res.status(404).send({ error: "Product not found" });
  }

  // product in cart checking
  if (!(await productInCart(cid, pid))) {
    return res.status(404).send({ error: "Product not in cart" });
  }

  // req.body checking
  if (!req.body.quantity) {
    return res.status(400).send({ error: "Quantity is missing" });
  }
  if (typeof req.body.quantity !== "number") {
    return res.status(400).send({ error: "Quantity has incorrect type" });
  }

  await addProductToCart(cid, pid, req.body.quantity);

  res.send({
    message: `Added ${req.body.quantity} of product with id ${pid} to cart with id ${cid} successfully`,
  });
});

/**
 * DELETE /api/carts/:cid
 * Deletes ALL the products from the cart with the given cid.
 * If the cart does not exist, returns a 404 status code.
 */
cartsRouter.delete("/:cid", async (req, res) => {
  const cid = req.params.cid;

  if (!isValidObjectId(cid)) {
    return res.status(400).send({ error: "Invalid object id" });
  }

  if (!(await getCartById(cid))) {
    return res.status(404).send({ error: "Cart not found" });
  }

  await emptyCart(cid);

  res.send({ message: `Cart with id ${cid} emptied successfully` });
});

export default cartsRouter;
