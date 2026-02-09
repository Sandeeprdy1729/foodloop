const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrdersByBuyer,
  getOrdersByFarmer,
  updateOrderStatus,
  getOrderById
} = require('../controllers/orderController');

// POST create order
router.post('/', createOrder);

// GET orders by buyer
router.get('/buyer/:buyerId', getOrdersByBuyer);

// GET orders by farmer
router.get('/farmer/:farmerId', getOrdersByFarmer);

// GET order by ID
router.get('/:orderId', getOrderById);

// PUT update order status
router.put('/:orderId/status', updateOrderStatus);

module.exports = router;
