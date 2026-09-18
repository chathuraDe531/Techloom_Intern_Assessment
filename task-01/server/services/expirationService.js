const Reservation = require('../models/Reservation');
const { RESERVATION_STATUS } = require('../utils/constants');
const { expireReservation } = require('./reservationService');

let intervalId = null;

/**
 * Background worker checking for expired reservations every 10 seconds.
 * Ensures stock is automatically returned to inventory server-side without relying on frontend timers.
 */
const checkExpiredReservations = async () => {
  try {
    const now = new Date();
    // Find all active reservations where expiration time has elapsed
    const expiredReservations = await Reservation.find({
      status: RESERVATION_STATUS.ACTIVE,
      expiresAt: { $lte: now },
    });

    if (expiredReservations.length > 0) {
      console.log(`[Expiration Worker] Found ${expiredReservations.length} expired reservation(s). Restoring stock...`);
      for (const res of expiredReservations) {
        await expireReservation(res._id);
        console.log(`[Expiration Worker] Expired reservation ${res._id} and restored stock to inventory.`);
      }
    }
  } catch (error) {
    console.error('[Expiration Worker] Error checking expired reservations:', error.message);
  }
};

const startExpirationWorker = (intervalMs = 10000) => {
  if (!intervalId) {
    console.log(`[Expiration Worker] Started. Polling for expired reservations every ${intervalMs / 1000}s.`);
    intervalId = setInterval(checkExpiredReservations, intervalMs);
  }
};

const stopExpirationWorker = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('[Expiration Worker] Stopped.');
  }
};

module.exports = {
  startExpirationWorker,
  stopExpirationWorker,
  checkExpiredReservations,
};
