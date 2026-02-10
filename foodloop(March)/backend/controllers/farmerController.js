const Farmer = require('../models/Farmer');
const Product = require('../models/Product');

// Get farmer dashboard data
exports.getDashboard = async (req, res) => {
  try {
    const farmerId = req.params.farmerId;

    const farmer = await Farmer.findById(farmerId).select('-password');
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    const products = await Product.find({ farmerId });
    const stats = {
      totalProducts: products.length,
      totalInventory: products.reduce((sum, p) => sum + p.quantity, 0),
      activeProducts: products.filter(p => p.inStock).length,
      totalOrders: farmer.totalOrders
    };

    res.status(200).json({
      success: true,
      data: {
        farmer,
        products,
        stats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get farmer's products
exports.getFarmerProducts = async (req, res) => {
  try {
    const products = await Product.find({ farmerId: req.params.farmerId });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add new product
exports.addProduct = async (req, res) => {
  try {
    const { name, category, description, quantity, unit, pricePerUnit, marketPrice, organic, minOrderQuantity } = req.body;
    const farmerId = req.params.farmerId;

    const product = new Product({
      farmerId,
      name,
      category,
      description,
      quantity,
      unit,
      pricePerUnit,
      marketPrice,
      organic: organic || false,
      inStock: quantity > 0,
      minOrderQuantity: minOrderQuantity || 1,
      harvestDate: new Date(),
      rating: 5.0
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.body.productId || req.body._id;
    const { name, description, quantity, pricePerUnit, marketPrice, organic } = req.body;

    const product = await Product.findByIdAndUpdate(
      productId,
      {
        name,
        description,
        quantity,
        pricePerUnit,
        marketPrice,
        organic,
        inStock: quantity > 0,
        updatedAt: Date.now()
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.productId);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
