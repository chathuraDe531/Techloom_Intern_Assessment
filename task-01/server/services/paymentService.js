const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Reservation = require('../models/Reservation');
const Payment = require('../models/Payment');
const {
  ORDER_STATUS,
  RESERVATION_STATUS,
  PAYMENT_STATUS,
  PAYMENT_OUTCOME,
} = require('../utils/constants');
const { expireReservation } = require('./reservationService');

/**
 * Process mock payment with strict duplicate payment protection and state transition checks.
 *
 * DUPLICATE PAYMENT PROTECTION:
 * 1. Pre-condition Check: Rejects if the order is already in 'PAID' status.
 * 2. Atomic Transition: Uses findOneAndUpdate with condition `{ _id: order._id, status: 'RESERVED' }`
 *    which guarantees that if two payment requests arrive simultaneously, only one succeeds;
 *    the second fails to find an order in 'RESERVED' status and is safely rejected.
 */
const processPayment = async ({ orderId, outcome }) => {
  // Find order by Mongo _id or custom orderId
  let order;
  if (mongoose.Types.ObjectId.isValid(orderId)) {
    order = await Order.findById(orderId).populate('reservationId');
  }
  if (!order) {
    order = await Order.findOne({ orderId }).populate('reservationId');
  }

  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  // DUPLICATE PAYMENT PROTECTION: Check if order is already paid
  if (order.status === ORDER_STATUS.PAID || order.paymentStatus === PAYMENT_STATUS.SUCCESS) {
    const error = new Error('Order is already paid. Duplicate payment is strictly prohibited.');
    error.statusCode = 400;
    throw error;
  }

  // Verify that the order is in a payable state (RESERVED)
  if (order.status === ORDER_STATUS.CANCELLED) {
    const error = new Error('Cannot process payment for a cancelled order.');
    error.statusCode = 400;
    throw error;
  }

  if (order.status === ORDER_STATUS.FAILED) {
    const error = new Error('Cannot process payment for a failed order.');
    error.statusCode = 400;
    throw error;
  }

  if (order.status === ORDER_STATUS.EXPIRED) {
    const error = new Error('Cannot process payment: Order reservation has already expired.');
    error.statusCode = 400;
    throw error;
  }

  // Check if 5-minute stock reservation has expired (Lazy Expiration Check)
  const reservation = order.reservationId || (await Reservation.findOne({ orderId: order._id }));
  if (!reservation) {
    const error = new Error('No associated stock reservation found for this order.');
    error.statusCode = 400;
    throw error;
  }

  if (reservation.status === RESERVATION_STATUS.EXPIRED || new Date() >= new Date(reservation.expiresAt)) {
    // Automatically expire and restore stock
    await expireReservation(reservation._id);
    const error = new Error('Payment rejected: Stock reservation expired after 5 minutes. Stock has been returned to inventory.');
    error.statusCode = 400;
    throw error;
  }

  const transactionId = `TXN-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`;

  // Process based on simulated outcome
  if (outcome === PAYMENT_OUTCOME.SUCCESS) {
    // Concurrency-safe atomic transition: only transition if status is currently RESERVED
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: order._id, status: ORDER_STATUS.RESERVED },
      {
        $set: {
          status: ORDER_STATUS.PAID,
          paymentStatus: PAYMENT_STATUS.SUCCESS,
        },
      },
      { new: true }
    );

    if (!updatedOrder) {
      const error = new Error('Payment conflict: Order status changed concurrently or already processed.');
      error.statusCode = 409;
      throw error;
    }

    // Convert reservation: permanently consumed
    await Reservation.findByIdAndUpdate(reservation._id, {
      $set: { status: RESERVATION_STATUS.CONVERTED },
    });

    // Record payment audit log
    const payment = await Payment.create({
      orderId: order._id,
      orderCustomId: order.orderId,
      amount: order.totalAmount,
      outcome: PAYMENT_OUTCOME.SUCCESS,
      transactionId,
      metadata: { message: 'Payment completed successfully. Stock permanently consumed.' },
    });

    return {
      order: updatedOrder,
      payment,
      message: 'Payment completed successfully! Order is confirmed.',
    };
  }

  if (outcome === PAYMENT_OUTCOME.FAILED) {
    // Update order status to FAILED
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: order._id, status: ORDER_STATUS.RESERVED },
      {
        $set: {
          status: ORDER_STATUS.FAILED,
          paymentStatus: PAYMENT_STATUS.FAILED,
        },
      },
      { new: true }
    );

    if (!updatedOrder) {
      const error = new Error('Payment conflict: Order is no longer in reserved status.');
      error.statusCode = 409;
      throw error;
    }

    // Release reservation
    await Reservation.findByIdAndUpdate(reservation._id, {
      $set: { status: RESERVATION_STATUS.RELEASED },
    });

    // Restore stock to inventory
    if (!updatedOrder.stockRestored) {
      for (const item of updatedOrder.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { availableStock: item.quantity },
        });
      }
      updatedOrder.stockRestored = true;
      await updatedOrder.save();
    }

    // Record payment audit log
    const payment = await Payment.create({
      orderId: order._id,
      orderCustomId: order.orderId,
      amount: order.totalAmount,
      outcome: PAYMENT_OUTCOME.FAILED,
      transactionId,
      metadata: { message: 'Payment simulation failed. Stock restored to inventory.' },
    });

    return {
      order: updatedOrder,
      payment,
      message: 'Payment simulation failed. Order marked as FAILED and stock has been restored to inventory.',
    };
  }

  if (outcome === PAYMENT_OUTCOME.TIMEOUT) {
    // Payment timed out: update paymentStatus to TIMEOUT
    const updatedOrder = await Order.findByIdAndUpdate(
      order._id,
      {
        $set: {
          paymentStatus: PAYMENT_STATUS.TIMEOUT,
        },
      },
      { new: true }
    );

    // Record payment audit log
    const payment = await Payment.create({
      orderId: order._id,
      orderCustomId: order.orderId,
      amount: order.totalAmount,
      outcome: PAYMENT_OUTCOME.TIMEOUT,
      transactionId,
      metadata: {
        message: 'Payment timed out. Stock remains reserved until the 5-minute expiry or manual cancellation.',
      },
    });

    return {
      order: updatedOrder,
      payment,
      message: 'Payment timed out. The reservation will remain active until its 5-minute window expires.',
    };
  }

  throw new Error('Invalid payment outcome');
};

/**
 * Get payment records for an order
 */
const getPaymentsByOrderId = async (orderIdParam) => {
  let order;
  if (mongoose.Types.ObjectId.isValid(orderIdParam)) {
    order = await Order.findById(orderIdParam);
  }
  if (!order) {
    order = await Order.findOne({ orderId: orderIdParam });
  }

  if (!order) {
    return [];
  }

  return await Payment.find({ orderId: order._id }).sort({ createdAt: -1 });
};

module.exports = {
  processPayment,
  getPaymentsByOrderId,
};
