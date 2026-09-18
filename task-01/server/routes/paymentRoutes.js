const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { validatePayment } = require('../middleware/validate');

router.post('/', validatePayment, paymentController.simulatePayment);
router.get('/:orderId', paymentController.getPaymentsForOrder);

module.exports = router;
