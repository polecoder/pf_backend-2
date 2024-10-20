import { Router } from "express";
import mongoose from "mongoose";
import { io } from "../index.js";
import {
  validateProductCreation,
  validateProductModification,
} from "../middleware/products.middleware.js";
import {
  addProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  getProducts,
  updateProduct,
} from "../utils/products.js";

const productsRouter = Router();

/**
 * GET /api/products
 *
 * Returns a list of products with a default limit of 20.
 *
 * QUERY PARAMS:
 * - limit: Number of products to return.
 * - page: Page number to return.
 * - category: Filter products by category. The possible values are: "first", "second", "third" "goalkeeper"
 * - sort: Sort products by price in ascending or descending order.
 */
productsRouter.get("/", async (req, res) => {
  const { limit, page, category, sort } = req.query;

  const result = await getProducts({ limit, page, category, sort });

  if (result.docs.length === 0) {
    return res.status(404).send({ error: "No products found" });
  }

  res.send({
    status: result.docs.length > 0 ? "success" : "error",
    payload: result.docs,
    totalPages: result.totalPages,
    prevPage: result.prevPage,
    nextPage: result.nextPage,
    page: result.page,
    hasPrevPage: result.hasPrevPage,
    hasNextPage: result.hasNextPage,
    prevLink: result.prevLink,
    nextLink: result.nextLink,
  });
});

/**
 * GET /api/products/:id
 *
 * Returns the product with the given id.
 * If the given id does not exist, returns a 404 status code.
 */
productsRouter.get("/:pid", async (req, res) => {
  let id = req.params.pid;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).send({ error: "Invalid object id" });
  }

  const desiredProduct = await getProductById(id);

  if (!desiredProduct) {
    return res.status(404).send({ error: "Product not found" });
  }

  res.send({ message: "Product found successfully", product: desiredProduct });
});

/**
 * POST /api/products
 *
 * Creates a new product from the recieved req.body data.
 * The data is checked with the validateProductCreation middleware.
 */
productsRouter.post("/", validateProductCreation, async (req, res) => {
  const productId = await addProduct(req.body);

  const result = await getAllProducts();
  io.emit("productsChange", result.docs);

  res.send({
    message: "Product added to list successfully",
    id: productId,
  });
});

/**
 * PUT /api/products/:pid
 *
 * Updates the product with the given id.
 * If the given id does not exist, returns a 404 status code.
 *
 * The data is checked with the validateProductCreation middleware.
 */
productsRouter.put("/:pid", validateProductModification, async (req, res) => {
  const id = req.params.pid;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).send({ error: "Invalid object id" });
  }

  const { title, description, code, price, status, stock, category } = req.body;

  const productToUpdate = await getProductById(id);

  if (!productToUpdate) {
    return res.status(404).send({ error: "Product not found" });
  }

  // If the request body does not contain a field, the product field remains the same
  const updatedTitle = title || productToUpdate.title;
  const updatedDescription = description || productToUpdate.description;
  const updatedCode = code || productToUpdate.code;
  const updatedPrice = price || productToUpdate.price;
  const updatedStatus = status || productToUpdate.status;
  const updatedStock = stock || productToUpdate.stock;
  const updatedCategory = category || productToUpdate.category;

  const updatedProduct = {
    title: updatedTitle,
    description: updatedDescription,
    code: updatedCode,
    price: updatedPrice,
    status: updatedStatus,
    stock: updatedStock,
    category: updatedCategory,
  };

  await updateProduct(id, updatedProduct);

  const result = await getAllProducts();

  io.emit("productsChange", result.docs);

  res.send({
    message: "Product updated successfully",
  });
});

/**
 * DELETE /api/products/:pid
 *
 * Deletes the product with the given id.
 * If the given id does not exist, returns a 404 status code.
 */
productsRouter.delete("/:pid", async (req, res) => {
  const id = req.params.pid;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).send({ error: "Invalid object id" });
  }

  const productToDelete = await getProductById(id);
  if (!productToDelete) {
    return res.status(404).send({ error: "Product not found" });
  }

  await deleteProduct(id);

  const result = await getAllProducts();

  io.emit("productsChange", result.docs);

  res.send({ message: "Product deleted successfully" });
});

export default productsRouter;
