const Product = require('../models/Product');
const Farmer = require('../models/Farmer');

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const { category, farmerId, search, maxPrice, minPrice } = req.query;
    let filter = { inStock: true };

    if (category) filter.category = category;
    if (farmerId) filter.farmerId = farmerId;
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (maxPrice) filter.pricePerUnit = { ...filter.pricePerUnit, $lte: maxPrice };
    if (minPrice) filter.pricePerUnit = { ...filter.pricePerUnit, $gte: minPrice };

    const products = await Product.find(filter)
      .populate('farmerId', 'name location rating')
      .sort({ createdAt: -1 });

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

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('farmerId', 'name location rating phone email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create product (farmer)
exports.createProduct = async (req, res) => {
  try {
    const { name, category, pricePerUnit, quantity, unit, description, farmerId } = req.body;

    const product = new Product({
      farmerId,
      name,
      category,
      pricePerUnit,
      quantity,
      unit,
      description
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update product quantity
exports.updateProductQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { quantity, updatedAt: Date.now() },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get products by farmer
exports.getProductsByFarmer = async (req, res) => {
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
