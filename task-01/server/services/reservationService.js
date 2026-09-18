const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { RESERVATION_STATUS, ORDER_STATUS } = require('../utils/constants');

/**
 * Get reservation by Order ID (either Mongo ObjectId or custom orderId string)
 */
const getReservationByOrderId = async (orderIdParam) => {
  let order;
  if (mongoose.Types.ObjectId.isValid(orderIdParam)) {
    order = await Order.findById(orderIdParam);
  }
  if (!order) {
    order = await Order.findOne({ orderId: orderIdParam });
  }

  if (!order) {
    return null;
  }

  return await Reservation.findOne({ orderId: order._id }).populate('items.productId');
};

/**
 * Safely expire an active reservation and restore product stock.
 * Uses atomic check-and-update to prevent double-restoring stock across concurrent triggers.
 */
const expireReservation = async (reservationId) => {
  // Concurrency-safe atomic status flip from ACTIVE to EXPIRED
  const reservation = await Reservation.findOneAndUpdate(
    { _id: reservationId, status: RESERVATION_STATUS.ACTIVE },
    { $set: { status: RESERVATION_STATUS.EXPIRED } },
    { new: true }
  );

  // If already expired, converted, or released, do nothing (idempotent)
  if (!reservation) {
    return null;
  }

  // Restore inventory stock for all items
  const itemsToRestore = reservation.items && reservation.items.length > 0
    ? reservation.items
    : reservation.productId
    ? [{ productId: reservation.productId, quantity: reservation.quantity }]
    : [];

  for (const item of itemsToRestore) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { availableStock: item.quantity },
    });
  }

  // Transition corresponding order status to EXPIRED
  await Order.findOneAndUpdate(
    { _id: reservation.orderId, status: ORDER_STATUS.RESERVED },
    { $set: { status: ORDER_STATUS.EXPIRED, stockRestored: true } }
  );

  return reservation;
};

module.exports = {
  getReservationByOrderId,
  expireReservation,
};
