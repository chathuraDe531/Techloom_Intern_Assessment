const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { validateProduct } = require('../middleware/validate');

router.route('/')
  .get(productController.getProducts)
  .post(validateProduct, productController.createProduct);

router.route('/:id')
  .get(productController.getProduct)
  .put(validateProduct, productController.updateProduct)
  .delete(productController.deleteProduct);

module.exports = router;
