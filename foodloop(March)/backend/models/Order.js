const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Buyer',
    required: true
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  items: [{
    productId: mongoose.Schema.Types.ObjectId,
    productName: String,
    quantity: Number,
    unit: String,
    pricePerUnit: Number,
    totalPrice: Number
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Ready for Pickup', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  payment: {
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed'],
      default: 'Pending'
    },
    method: {
      type: String,
      enum: ['Card', 'Bank Transfer', 'UPI', 'Cash on Delivery'],
      default: 'Bank Transfer'
    },
    transactionId: String,
    paidAt: Date
  },
  delivery: {
    type: {
      type: String,
      enum: ['Pickup', 'Delivery'],
      default: 'Delivery'
    },
    address: String,
    scheduledDate: Date,
    estimatedDelivery: Date,
    actualDelivery: Date,
    trackingNumber: String
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
