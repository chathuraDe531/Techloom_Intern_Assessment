const paymentService = require('../services/paymentService');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @route   POST /api/payments
 * @desc    Simulate payment with SUCCESS, FAILED, or TIMEOUT
 */
const simulatePayment = async (req, res, next) => {
  try {
    const { orderId, outcome } = req.body;
    const result = await paymentService.processPayment({ orderId, outcome });
    return successResponse(res, 200, result.message, {
      order: result.order,
      payment: result.payment,
    });
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @route   GET /api/payments/:orderId
 * @desc    Get all payment history/logs for an order
 */
const getPaymentsForOrder = async (req, res, next) => {
  try {
    const payments = await paymentService.getPaymentsByOrderId(req.params.orderId);
    return successResponse(res, 200, 'Payments retrieved successfully', payments);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  simulatePayment,
  getPaymentsForOrder,
};
