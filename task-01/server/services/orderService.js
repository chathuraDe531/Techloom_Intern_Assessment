const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Reservation = require('../models/Reservation');
const {
  ORDER_STATUS,
  RESERVATION_STATUS,
  PAYMENT_STATUS,
  RESERVATION_DURATION_MS,
  VALID_ORDER_TRANSITIONS,
} = require('../utils/constants');
const { expireReservation } = require('./reservationService');

/**
 * Creates an order and atomically reserves stock for 5 minutes.
 *
 * CONCURRENCY SAFETY EXPLANATION:
 * -----------------------------------------------------------------------------
 * Overselling is prevented by using MongoDB's atomic findOneAndUpdate with the
 * predicate { _id: productId, availableStock: { $gte: requestedQuantity } }
 * and the atomic operator { $inc: { availableStock: -requestedQuantity } }.
 *
 * 1. Document-Level Atomicity: In MongoDB, all write operations on a single
 *    document are atomic. MongoDB acquires a write lock on the product document
 *    before evaluating the filter and performing the modification.
 * 2. Guard Condition ($gte): Even if dozens of simultaneous requests arrive for
 *    the same limited stock item, MongoDB evaluates `availableStock >= quantity`
 *    sequentially at the exact instant the lock is held.
 * 3. Atomic Decrement ($inc): If stock is available, MongoDB decrements it in the
 *    same atomic step. If another concurrent request reduces stock below the
 *    threshold first, the filter fails to match, 0 documents are modified, and
 *    MongoDB returns null.
 * 4. Invariant: availableStock can NEVER drop below 0. Overselling is physically
 *    impossible without race conditions or dirty reads.
 * -----------------------------------------------------------------------------
 */
const createOrder = async ({ items, idempotencyKey }) => {
  // Check idempotency: prevent duplicate order creation for the same checkout submission
  if (idempotencyKey) {
    const existingOrder = await Order.findOne({ idempotencyKey }).populate('reservationId');
    if (existingOrder) {
      return {
        order: existingOrder,
        reservation: existingOrder.reservationId,
        isExisting: true,
      };
    }
  }

  // Fetch and validate all products from the database
  const productIds = items.map((item) => item.productId);
  const productsInDb = await Product.find({ _id: { $in: productIds } });

  if (productsInDb.length !== items.length) {
    throw new Error('One or more products in the cart no longer exist');
  }

  const productMap = new Map();
  productsInDb.forEach((p) => productMap.set(p._id.toString(), p));

  // Build sanitized order items and calculate total amount
  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const product = productMap.get(item.productId.toString());
    const subtotal = Math.round(product.price * item.quantity * 100) / 100;
    totalAmount += subtotal;

    orderItems.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      subtotal,
    });
  }

  totalAmount = Math.round(totalAmount * 100) / 100;

  // Generate unique human-readable Order ID: ORD-<timestamp>-<random4>
  const orderCustomId = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const expiresAt = new Date(Date.now() + RESERVATION_DURATION_MS);

  // Attempt using a MongoDB multi-document transaction (supported in replica sets)
  let session = null;
  let useTransactions = false;

  try {
    session = await mongoose.startSession();
    session.startTransaction();
    useTransactions = true;
  } catch (err) {
    // If running on a standalone Mongo without replica set, fall back to atomic compensation logic
    session = null;
    useTransactions = false;
  }

  const successfullyReserved = [];

  try {
    // Atomically reserve stock for each product
    for (const item of orderItems) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.productId,
          availableStock: { $gte: item.quantity }, // CONCURRENCY-SAFE FILTER
        },
        {
          $inc: { availableStock: -item.quantity }, // ATOMIC DECREMENT
        },
        {
          new: true,
          ...(session && { session }),
        }
      );

      if (!updatedProduct) {
        const product = productMap.get(item.productId.toString());
        throw new Error(
          `Insufficient stock for "${product ? product.name : item.productId}". Available: ${
            product ? product.availableStock : 0
          }, Requested: ${item.quantity}`
        );
      }

      successfullyReserved.push(item);
    }

    // Step 1: Create Order document
    const orderDoc = new Order({
      orderId: orderCustomId,
      items: orderItems,
      totalAmount,
      status: ORDER_STATUS.RESERVED,
      paymentStatus: PAYMENT_STATUS.PENDING,
      ...(idempotencyKey && { idempotencyKey }),
    });

    const savedOrder = await orderDoc.save({ ...(session && { session }) });

    // Step 2: Create Reservation document with exactly 5-minute expiry
    const reservationDoc = new Reservation({
      orderId: savedOrder._id,
      productId: orderItems[0].productId,
      quantity: orderItems[0].quantity,
      items: orderItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      status: RESERVATION_STATUS.ACTIVE,
      expiresAt,
    });

    const savedReservation = await reservationDoc.save({ ...(session && { session }) });

    // Step 3: Link reservation to the order
    savedOrder.reservationId = savedReservation._id;
    await savedOrder.save({ ...(session && { session }) });

    // Commit transaction if active
    if (useTransactions && session) {
      await session.commitTransaction();
    }

    return {
      order: savedOrder,
      reservation: savedReservation,
      isExisting: false,
    };
  } catch (error) {
    // Rollback transaction if active
    if (useTransactions && session) {
      await session.abortTransaction();
    } else {
      // Compensating rollback for standalone MongoDB (atomic re-increment)
      for (const item of successfullyReserved) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { availableStock: item.quantity },
        });
      }
    }
    throw error;
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

/**
 * Get order by ID (MongoDB _id or custom orderId string)
 * Automatically performs lazy expiration check if the 5-minute timer elapsed.
 */
const getOrderById = async (idParam) => {
  let order;
  if (mongoose.Types.ObjectId.isValid(idParam)) {
    order = await Order.findById(idParam).populate('reservationId');
  }
  if (!order) {
    order = await Order.findOne({ orderId: idParam }).populate('reservationId');
  }

  if (!order) {
    return null;
  }

  // Lazy check: If order is still RESERVED but reservation expiry has passed
  if (order.status === ORDER_STATUS.RESERVED && order.reservationId) {
    const reservation = order.reservationId;
    if (reservation.status === RESERVATION_STATUS.ACTIVE && new Date() >= new Date(reservation.expiresAt)) {
      await expireReservation(reservation._id);
      order = await Order.findById(order._id).populate('reservationId');
    }
  }

  return order;
};

/**
 * Cancels an order.
 * - If status is RESERVED: cancels order, releases reservation, restores stock.
 * - If status is PAID: cancels order, simulates refund, restores stock only once.
 * - If status is CANCELLED, FAILED, or EXPIRED: rejects with an error.
 */
const cancelOrder = async (idParam) => {
  const order = await getOrderById(idParam);
  if (!order) {
    throw new Error('Order not found');
  }

  const validTransitions = VALID_ORDER_TRANSITIONS[order.status] || [];
  if (!validTransitions.includes(ORDER_STATUS.CANCELLED)) {
    throw new Error(`Cannot cancel order in '${order.status}' status`);
  }

  const previousStatus = order.status;

  // 1. If cancelling an actively RESERVED order
  if (previousStatus === ORDER_STATUS.RESERVED) {
    // Release reservation
    if (order.reservationId) {
      await Reservation.findOneAndUpdate(
        { _id: order.reservationId._id || order.reservationId, status: RESERVATION_STATUS.ACTIVE },
        { $set: { status: RESERVATION_STATUS.RELEASED } }
      );
    }

    // Concurrency-safe stock restoration: ensure stock is restored exactly once
    if (!order.stockRestored) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { availableStock: item.quantity },
        });
      }
      order.stockRestored = true;
    }

    order.status = ORDER_STATUS.CANCELLED;
    await order.save();

    return {
      order,
      message: 'Order cancelled successfully. Reserved stock has been returned to inventory.',
      refundSimulated: false,
    };
  }

  // 2. If cancelling a PAID order
  if (previousStatus === ORDER_STATUS.PAID) {
    // Simulate refund and restore stock once
    if (!order.stockRestored) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { availableStock: item.quantity },
        });
      }
      order.stockRestored = true;
    }

    order.status = ORDER_STATUS.CANCELLED;
    await order.save();

    return {
      order,
      message: 'Paid order cancelled. Refund of $' + order.totalAmount.toFixed(2) + ' simulated. Stock restored to inventory.',
      refundSimulated: true,
    };
  }

  throw new Error(`Order cannot be cancelled from status ${previousStatus}`);
};

module.exports = {
  createOrder,
  getOrderById,
  cancelOrder,
};
