const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

router.get('/:orderId', reservationController.getReservation);

module.exports = router;
