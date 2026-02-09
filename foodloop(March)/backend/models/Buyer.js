const mongoose = require('mongoose');

const buyerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  businessName: {
    type: String,
    required: true
  },
  businessType: {
    type: String,
    enum: ['Retail Mart', 'Supermarket', 'Restaurant', 'Wholesaler', 'Other'],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  state: String,
  city: String,
  address: String,
  licenseNumber: String,
  verified: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 5.0
  },
  totalPurchases: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  bankAccount: String,
  bankCode: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Buyer', buyerSchema);
