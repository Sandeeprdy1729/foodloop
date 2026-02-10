const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getFarmerProducts,
  addProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/farmerController');

const {
  getFarmerOrders,
  getOrderDetail,
  updateOrderStatus,
  updatePaymentStatus,
  getOrderStats
} = require('../controllers/farmerOrderController');

// GET farmer dashboard
router.get('/dashboard/:farmerId', getDashboard);

// GET farmer's products
router.get('/products/:farmerId', getFarmerProducts);

// POST add new product
router.post('/products/:farmerId/add', addProduct);

// PUT update product
router.put('/products/update', updateProduct);

// DELETE product
router.delete('/products/:productId', deleteProduct);

// GET farmer's orders
router.get('/orders/:farmerId', getFarmerOrders);

// GET single order details
router.get('/orders/detail/:orderId', getOrderDetail);

// PUT update order status
router.put('/orders/status/update', updateOrderStatus);

// PUT update payment status
router.put('/orders/payment/update', updatePaymentStatus);

// GET order stats
router.get('/stats/:farmerId', getOrderStats);

module.exports = router;
