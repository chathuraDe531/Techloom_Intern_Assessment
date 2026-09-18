const Product = require('../models/Product');

/**
 * Get all products
 */
const getAllProducts = async () => {
  return await Product.find().sort({ createdAt: -1 });
};

/**
 * Get product by ID
 */
const getProductById = async (id) => {
  return await Product.findById(id);
};

/**
 * Create a new product
 */
const createProduct = async (productData) => {
  const { name, price, availableStock } = productData;
  const product = new Product({
    name: name.trim(),
    price: Number(price),
    availableStock: Number(availableStock),
  });
  return await product.save();
};

/**
 * Update an existing product
 */
const updateProduct = async (id, updateData) => {
  const allowedUpdates = {};
  if (updateData.name !== undefined) allowedUpdates.name = updateData.name.trim();
  if (updateData.price !== undefined) allowedUpdates.price = Number(updateData.price);
  if (updateData.availableStock !== undefined) allowedUpdates.availableStock = Number(updateData.availableStock);

  return await Product.findByIdAndUpdate(id, { $set: allowedUpdates }, { new: true, runValidators: true });
};

/**
 * Delete a product by ID
 */
const deleteProduct = async (id) => {
  return await Product.findByIdAndDelete(id);
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
