import { productsModel } from "../models/products.model.js";

/**
 * Returns the array of all the products from the database.
 * If there are no products, returns an empty array.
 */
export async function getAllProducts() {
  try {
    const products = await productsModel.find();
    return products;
  } catch (err) {
    console.error("Error getting ALL products from the database");
  }
}

/**
 * PRE-CONDITION: The query recieved as a parameter is correctly formatted or null.
 * Returns the array of all the products from the database and pagination data.
 *
 * @param {Object} query - The query parameters (limit, page, category, sort)
 *
 * @returns {Promise<Array>} - An array of products
 */
export async function getProducts(query) {
  try {
    // filter by category
    const filterQuery = {};
    if (query.category) {
      if (query.category === "first") {
        filterQuery.category = "Camisetas locales";
      } else if (query.category === "second") {
        filterQuery.category = "Camisetas visitantes";
      } else if (query.category === "third") {
        filterQuery.category = "Camisetas alternativas";
      } else if (query.category === "goalkeeper") {
        filterQuery.category = "Camisetas de portero";
      }
    }
    // filter by price
    const sortQuery = {};
    let sortOrder;
    if (query.sort === "asc") {
      sortOrder = 1;
    } else if (query.sort === "desc") {
      sortOrder = -1;
    }
    if (query.sort) {
      sortQuery.price = sortOrder;
    }

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;

    const products = await productsModel.paginate(filterQuery, {
      limit: limit,
      page: page,
      sort: sortQuery,
    });

    // previous url construction
    const prevQueryParams = [];
    if (query.limit) prevQueryParams.push(`limit=${limit}`); // use query.limit because if the user doesn't specify a limit, the default value is 10, so it's not necessary to add it to the next link
    if (products.hasPrevPage) prevQueryParams.push(`page=${products.prevPage}`);
    if (query.category) prevQueryParams.push(`category=${query.category}`);
    if (query.sort) prevQueryParams.push(`sort=${query.sort}`);

    const prevLink = products.hasPrevPage
      ? `http://localhost:8080/api/products?${prevQueryParams.join("&")}`
      : null;

    // next url construction
    const nextQueryParams = [];
    if (query.limit) nextQueryParams.push(`limit=${limit}`);
    if (products.hasNextPage) nextQueryParams.push(`page=${products.nextPage}`);
    if (query.category) nextQueryParams.push(`category=${query.category}`);
    if (query.sort) nextQueryParams.push(`sort=${query.sort}`);

    const nextLink = products.hasNextPage
      ? `http://localhost:8080/api/products?${nextQueryParams.join("&")}`
      : null;

    return {
      ...products,
      prevLink,
      nextLink,
    };
  } catch (err) {
    console.error("Error getting products from the database");
  }
}

/**
 * PRE-CONDITION: The product recieved as a parameter is correctly formatted.
 * Adds the product received as a parameter to the database.
 *
 * @param {Object} product - The product to add
 *
 * @returns {Promise<string>} The _id of the added product
 */
export async function addProduct(product) {
  try {
    const newProduct = new productsModel(product);
    const savedProduct = await newProduct.save();
    return savedProduct._id;
  } catch (err) {
    console.error("Error adding product to the database");
  }
}

/**
 * Returns the product with the given id from the database.
 * If the product does not exist, returns null.
 *
 * @param {import("mongoose").ObjectId} id - The id of the product to search for
 *
 * @returns {Promise<Object>} - The product with the given id
 */
export async function getProductById(id) {
  try {
    const product = await productsModel.findById(id);
    return product;
  } catch (err) {
    console.error(`Error getting product with id: ${id} from the database`);
  }
}

/**
 * PRE-CONDITION: The product recieved as a parameter is correctly and completely formatted.
 * PRE-CONDITION: The id recieved as a parameter is a valid id of an existing product.
 * Updates the product with the given id with the new data.
 *
 * @param {string} id - The id of the product to update
 * @param {Object} newData - The new data to update the product with
 *
 * @returns {Promise<Object>} - The updated product
 */
export async function updateProduct(id, newData) {
  try {
    await productsModel.findByIdAndUpdate(id, newData);
  } catch (err) {
    console.error(`Error updating product with id: ${id}`);
  }
}

/**
 * PRE-CONDITION: The id recieved as a parameter is a valid id of an existing product.
 *
 * Deletes the product with the given id from the database.
 *
 * @param {string} id - The id of the product to delete
 *
 * @returns {Promise<void>}
 */
export async function deleteProduct(id) {
  try {
    await productsModel.findByIdAndDelete(id);
  } catch (err) {
    console.error(`Error deleting product with id: ${id}`);
  }
}
