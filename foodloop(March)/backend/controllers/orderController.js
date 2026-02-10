const Order = require('../models/Order');
const Product = require('../models/Product');
const Buyer = require('../models/Buyer');
const Farmer = require('../models/Farmer');
const Notification = require('../models/Notification');
const { sendNotification } = require('../utils/socket');

// Create order
exports.createOrder = async (req, res) => {
  try {
    const { buyerId, farmerId, items, deliveryType, address, notes } = req.body;

    let totalAmount = 0;
    const processedItems = [];

    // Validate items and calculate total
    for (let item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found`
        });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient quantity for ${product.name}`
        });
      }

      const itemTotal = product.pricePerUnit * item.quantity;
      totalAmount += itemTotal;

      processedItems.push({
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        unit: product.unit,
        pricePerUnit: product.pricePerUnit,
        totalPrice: itemTotal
      });

      // Reduce product quantity
      product.quantity -= item.quantity;
      if (product.quantity === 0) {
        product.inStock = false;
      }
      await product.save();
    }

    const orderId = 'ORD-' + Date.now();
    const order = new Order({
      orderId,
      buyerId,
      farmerId,
      items: processedItems,
      totalAmount,
      delivery: {
        type: deliveryType,
        address
      },
      notes
    });

    await order.save();

    // Update buyer info
    await Buyer.findByIdAndUpdate(buyerId, {
      $inc: {
        totalPurchases: 1,
        totalSpent: totalAmount
      }
    });

    // Update farmer info
    await Farmer.findByIdAndUpdate(farmerId, {
      $inc: { totalOrders: 1 }
    });

    // Send Notification to Farmer
    try {
      const notification = new Notification({
        recipient: farmerId,
        recipientModel: 'Farmer',
        type: 'NEW_ORDER',
        title: 'New Order Received! 📦',
        message: `You have received a new order (${order.orderId}) from ${order.buyerId?.businessName || 'a buyer'}.`,
        metadata: {
          orderId: order._id,
          externalId: order.orderId
        }
      });
      await notification.save();
      sendNotification(farmerId, 'Farmer', 'NEW_ORDER', notification);
    } catch (notifError) {
      console.error('Error sending farmer notification:', notifError);
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get orders by buyer
exports.getOrdersByBuyer = async (req, res) => {
  try {
    const orders = await Order.find({ buyerId: req.params.buyerId })
      .populate('farmerId', 'name phone email location');

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get orders by farmer
exports.getOrdersByFarmer = async (req, res) => {
  try {
    const orders = await Order.find({ farmerId: req.params.farmerId })
      .populate('buyerId', 'name businessName phone location');

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status, updatedAt: Date.now() },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('buyerId farmerId');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
