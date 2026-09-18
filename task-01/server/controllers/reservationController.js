const reservationService = require('../services/reservationService');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @route   GET /api/reservations/:orderId
 * @desc    Get reservation info for an order
 */
const getReservation = async (req, res, next) => {
  try {
    const reservation = await reservationService.getReservationByOrderId(req.params.orderId);
    if (!reservation) {
      return errorResponse(res, 404, 'Reservation not found for this order');
    }
    return successResponse(res, 200, 'Reservation retrieved successfully', reservation);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReservation,
};
