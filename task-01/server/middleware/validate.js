const mongoose = require('mongoose');
const { PAYMENT_OUTCOME } = require('../utils/constants');

/**
 * Validates product creation & update payload
 */
const validateProduct = (req, res, next) => {
  const { name, price, availableStock } = req.body;

  if (req.method === 'POST') {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required and must be a non-empty string',
      });
    }

    if (price === undefined || typeof price !== 'number' || price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Product price must be a positive number greater than 0',
      });
    }

    if (
      availableStock === undefined ||
      typeof availableStock !== 'number' ||
      !Number.isInteger(availableStock) ||
      availableStock < 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Product availableStock must be a non-negative integer (>= 0)',
      });
    }
  } else if (req.method === 'PUT') {
    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Product name must be a non-empty string',
      });
    }

    if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'Product price must be a positive number greater than 0',
      });
    }

    if (
      availableStock !== undefined &&
      (typeof availableStock !== 'number' || !Number.isInteger(availableStock) || availableStock < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Product availableStock must be a non-negative integer (>= 0)',
      });
    }
  }

  next();
};

/**
 * Validates checkout / order creation payload
 */
const validateOrderCreation = (req, res, next) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Order items must be a non-empty array',
    });
  }

  for (const [index, item] of items.entries()) {
    if (!item.productId || !mongoose.Types.ObjectId.isValid(item.productId)) {
      return res.status(400).json({
        success: false,
        message: `Item at index ${index} has an invalid or missing productId`,
      });
    }

    if (
      item.quantity === undefined ||
      typeof item.quantity !== 'number' ||
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: `Item at index ${index} must have a positive integer quantity (>= 1)`,
      });
    }
  }

  next();
};

/**
 * Validates payment simulation payload
 */
const validatePayment = (req, res, next) => {
  const { orderId, outcome } = req.body;

  if (!orderId) {
    return res.status(400).json({
      success: false,
      message: 'orderId is required',
    });
  }

  if (!outcome || !Object.values(PAYMENT_OUTCOME).includes(outcome)) {
    return res.status(400).json({
      success: false,
      message: `outcome is required and must be one of: ${Object.values(PAYMENT_OUTCOME).join(', ')}`,
    });
  }

  next();
};

module.exports = {
  validateProduct,
  validateOrderCreation,
  validatePayment,
};
