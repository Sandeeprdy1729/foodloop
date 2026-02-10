const Order = require('../models/Order');
const Notification = require('../models/Notification');
const { sendNotification } = require('../utils/socket');
const Product = require('../models/Product');

// Get farmer's orders
exports.getFarmerOrders = async (req, res) => {
  try {
    const farmerId = req.params.farmerId;

    const orders = await Order.find({ farmerId })
      .populate('buyerId', 'name businessName phone email city')
      .sort({ createdAt: -1 });

    // Calculate stats
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'Pending').length,
      confirmed: orders.filter(o => o.status === 'Confirmed').length,
      readyForPickup: orders.filter(o => o.status === 'Ready for Pickup').length,
      shipped: orders.filter(o => o.status === 'Shipped').length,
      delivered: orders.filter(o => o.status === 'Delivered').length,
      totalRevenue: orders
        .filter(o => o.payment.status === 'Completed')
        .reduce((sum, o) => sum + o.totalAmount, 0)
    };

    res.status(200).json({
      success: true,
      stats,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single order details
exports.getOrderDetail = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('buyerId', 'name businessName phone email address city state')
      .populate('farmerId', 'name phone email location');

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

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Ready for Pickup', 'Shipped', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        status,
        updatedAt: Date.now()
      },
      { new: true }
    ).populate('buyerId', 'name businessName phone email');

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Send Notification to Buyer
    try {
      const notification = new Notification({
        recipient: updatedOrder.buyerId._id,
        recipientModel: 'Buyer',
        type: 'ORDER_STATUS_UPDATE',
        title: 'Order Status Updated! 🚚',
        message: `Your order ${updatedOrder.orderId} is now: ${status}.`,
        metadata: {
          orderId: updatedOrder._id,
          externalId: updatedOrder.orderId
        }
      });
      await notification.save();
      sendNotification(updatedOrder.buyerId._id, 'Buyer', 'ORDER_STATUS_UPDATE', notification);
    } catch (notifError) {
      console.error('Error sending buyer status notification:', notifError);
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: updatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update order payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { orderId, paymentStatus } = req.body;

    const validStatuses = ['Pending', 'Completed', 'Failed'];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status'
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        'payment.status': paymentStatus,
        'payment.paidAt': paymentStatus === 'Completed' ? new Date() : null,
        updatedAt: Date.now()
      },
      { new: true }
    ).populate('buyerId', 'name businessName');

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Send Notification to Buyer
    try {
      const notification = new Notification({
        recipient: updatedOrder.buyerId._id,
        recipientModel: 'Buyer',
        type: 'PAYMENT_UPDATE',
        title: 'Payment Status Updated! 💰',
        message: `Payment for order ${updatedOrder.orderId} is now: ${paymentStatus}.`,
        metadata: {
          orderId: updatedOrder._id,
          externalId: updatedOrder.orderId
        }
      });
      await notification.save();
      sendNotification(updatedOrder.buyerId._id, 'Buyer', 'PAYMENT_UPDATE', notification);
    } catch (notifError) {
      console.error('Error sending buyer payment notification:', notifError);
    }

    res.status(200).json({
      success: true,
      message: 'Payment status updated',
      data: updatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get orders stats by date range
exports.getOrderStats = async (req, res) => {
  try {
    const farmerId = req.params.farmerId;
    const { startDate, endDate } = req.query;

    let filter = { farmerId };

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const orders = await Order.find(filter);

    const stats = {
      totalOrders: orders.length,
      totalRevenue: orders
        .filter(o => o.payment.status === 'Completed')
        .reduce((sum, o) => sum + o.totalAmount, 0),
      averageOrderValue: orders.length > 0
        ? (orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length).toFixed(2)
        : 0,
      statusBreakdown: {
        pending: orders.filter(o => o.status === 'Pending').length,
        confirmed: orders.filter(o => o.status === 'Confirmed').length,
        delivered: orders.filter(o => o.status === 'Delivered').length,
        cancelled: orders.filter(o => o.status === 'Cancelled').length
      },
      paymentBreakdown: {
        completed: orders.filter(o => o.payment.status === 'Completed').length,
        pending: orders.filter(o => o.payment.status === 'Pending').length,
        failed: orders.filter(o => o.payment.status === 'Failed').length
      }
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
