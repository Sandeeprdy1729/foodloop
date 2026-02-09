const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProductQuantity,
  getProductsByFarmer
} = require('../controllers/productController');

// GET all products with filters
router.get('/', getAllProducts);

// GET product by ID
router.get('/:id', getProductById);

// GET products by farmer
router.get('/farmer/:farmerId', getProductsByFarmer);

// POST create product
router.post('/', createProduct);

// PUT update product quantity
router.put('/:id/quantity', updateProductQuantity);

module.exports = router;
