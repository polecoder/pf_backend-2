import { cartsModel } from "../models/carts.model.js";
import { getProductById } from "./products.js";

/**
 * Creates a new empty cart in the database and returns its _id.
 *
 * @returns {Promise<string>} The _id of the created cart
 */
export async function createCart() {
  try {
    const newCart = new cartsModel();
    const savedCart = await newCart.save();
    return savedCart._id;
  } catch (err) {
    console.error("Error creating cart in the database");
  }
}

/**
 * Returns the cart with the given id from the database.
 * If the product does not exist, returns null.
 *
 * @param {import("mongoose").ObjectId} - id
 * @returns
 */
export async function getCartById(id) {
  try {
    const cart = await cartsModel.findById(id);
    return cart;
  } catch (err) {
    console.error(`Error getting cart with id: ${id} from the database`);
  }
}

/**
 * Returns true if the product with the given pid is in the cart with the given cid, false otherwise.
 *
 * @param {import("mongoose").ObjectId} cid - The id of the cart to check
 * @param {import("mongoose").ObjectId} pid - The id of the product to check
 *
 * @returns {Promise<boolean>} - Whether the product is in the cart or not
 */
export async function productInCart(cid, pid) {
  try {
    const result = await cartsModel
      .findOne({ _id: cid, "products.product": pid })
      .exec();
    return result !== null;
  } catch (err) {
    console.error("Error checking if product is in cart in the database");
  }
}

/**
 * PRE-CONDITION: The product with the given pid exists.
 * PRE-CONDITION: The cart with the given cid exists.
 * Adds the product with the given pid to the cart with the given cid.
 * If the product is already in the cart, increments its quantity by 1.
 * If the product is not in the cart, adds it with a quantity of 1.
 *
 * @param {string} cid - The id of the cart to add the product to
 * @param {string} pid - The id of the product to add to the cart
 * @param {number} quantity - The quantity of the product to add to the cart
 *
 * @returns {Promise<Object>} - The updated cart
 */
export async function addProductToCart(cid, pid, quantity) {
  try {
    if (await productInCart(cid, pid)) {
      await cartsModel.updateOne(
        { _id: cid, "products.product": pid },
        { $inc: { "products.$.quantity": quantity } },
        { new: true } // returns the updated cart
      );
    } else {
      await cartsModel.updateOne(
        { _id: cid },
        { $push: { products: { product: pid, quantity } } }
      );
    }

    return await getCartById(cid);
  } catch (err) {
    console.error("Error adding product to cart in the database");
  }
}

/**
 * PRE-CONDITION: The product with the given pid exists.
 * PRE-CONDITION: The cart with the given cid exists.
 * Removes the product with the given pid from the cart with the given cid.
 *
 * @param {string} cid - The id of the cart to remove the product from
 * @param {string} pid - The id of the product to remove from the cart
 *
 * @returns {Promise<Object>} - The updated cart
 */
export async function removeProductFromCart(cid, pid) {
  try {
    await cartsModel.updateOne(
      { _id: cid },
      { $pull: { products: { product: pid } } }
    );

    return await getCartById(cid);
  } catch (err) {
    console.error("Error removing product from cart in the database");
  }
}

/**
 * PRE-CONDITION: The cart with the given cid exists.
 * Empties the cart with the given cid.
 *
 * @param {string} cid - The id of the cart to empty
 *
 * @returns {Promise<Object>} - The updated cart
 */
export async function emptyCart(cid) {
  try {
    await cartsModel.updateOne({ _id: cid }, { products: [] });
    return await getCartById(cid);
  } catch (err) {
    console.error("Error emptying cart in the database");
  }
}

/**
 * PRE-CONDITION: The cart with the given cid exists.
 * Populates the products in the cart with the given cid.
 *
 * @param {string} cid - The id of the cart to populate
 *
 * @returns {Promise<Object>} - The populated cart
 */
export async function populateCart(cid) {
  try {
    return await cartsModel.findById(cid).populate("products.product");
  } catch (err) {
    console.error("Error populating cart in the database");
  }
}
