const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Spices', 'Other'],
    required: true
  },
  description: String,
  quantity: {
    type: Number,
    required: true,
    default: 0
  },
  unit: {
    type: String,
    enum: ['kg', 'liter', 'dozen', 'piece'],
    default: 'kg'
  },
  pricePerUnit: {
    type: Number,
    required: true
  },
  marketPrice: {
    type: Number
  },
  discount: {
    type: Number,
    default: 0
  },
  harvestDate: Date,
  expiryDate: Date,
  organic: {
    type: Boolean,
    default: false
  },
  image: String,
  inStock: {
    type: Boolean,
    default: true
  },
  minOrderQuantity: {
    type: Number,
    default: 1
  },
  rating: {
    type: Number,
    default: 5.0
  },
  reviews: [{
    buyerId: mongoose.Schema.Types.ObjectId,
    rating: Number,
    comment: String,
    createdAt: Date
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);
