const orderService = require('../services/orderService');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @route   POST /api/orders
 * @desc    Create an order and atomically reserve stock for 5 minutes
 */
const createOrder = async (req, res, next) => {
  try {
    const { items, idempotencyKey } = req.body;
    const result = await orderService.createOrder({ items, idempotencyKey });

    const statusCode = result.isExisting ? 200 : 201;
    const message = result.isExisting
      ? 'Order already exists for this submission (idempotent)'
      : 'Order created and stock successfully reserved for 5 minutes';

    return successResponse(res, statusCode, message, {
      order: result.order,
      reservation: result.reservation,
      expiresAt: result.reservation ? result.reservation.expiresAt : null,
    });
  } catch (error) {
    if (error.message && error.message.includes('Insufficient stock')) {
      return errorResponse(res, 400, error.message);
    }
    next(error);
  }
};

/**
 * @route   GET /api/orders/:id
 * @desc    Get order details by Mongo _id or custom orderId
 */
const getOrder = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }
    return successResponse(res, 200, 'Order retrieved successfully', order);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/orders/:id/cancel
 * @desc    Cancel an order and release/restore reserved stock
 */
const cancelOrder = async (req, res, next) => {
  try {
    const result = await orderService.cancelOrder(req.params.id);
    return successResponse(res, 200, result.message, {
      order: result.order,
      refundSimulated: result.refundSimulated,
    });
  } catch (error) {
    if (error.message.includes('Cannot cancel') || error.message.includes('not found')) {
      return errorResponse(res, 400, error.message);
    }
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrder,
  cancelOrder,
};
