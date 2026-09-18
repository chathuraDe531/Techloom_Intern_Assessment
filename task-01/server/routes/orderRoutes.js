const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { validateOrderCreation } = require('../middleware/validate');

router.post('/', validateOrderCreation, orderController.createOrder);
router.get('/:id', orderController.getOrder);
router.post('/:id/cancel', orderController.cancelOrder);

module.exports = router;
