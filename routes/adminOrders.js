const express = require('express');
const router = express.Router();
const CustomerOrder = require('../models/CustomerOrder');
const Customer = require('../models/Customer');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { sendEmail } = require('../utils/emailService');

// Admin: Get all orders with filters
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, paymentStatus, search, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};

    // Status filter
    if (status) filter.orderStatus = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    // Search by orderId or customer email
    if (search) {
      filter.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { 'shippingAddress.city': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await CustomerOrder.find(filter)
      .populate('customer', 'firstName lastName email phone')
      .populate('items.product', 'name price sku')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CustomerOrder.countDocuments(filter);

    // Get summary stats
    const stats = await CustomerOrder.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' },
          statusDistribution: {
            $push: {
              status: '$orderStatus',
              count: 1
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: orders,
      stats: stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin: Get order details
router.get('/:orderId', verifyToken, isAdmin, async (req, res) => {
  try {
    const order = await CustomerOrder.findOne({ orderId: req.params.orderId })
      .populate('customer')
      .populate('items.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin: Update order status
router.put('/:orderId/status', verifyToken, isAdmin, async (req, res) => {
  try {
    const { orderStatus, trackingNumber } = req.body;

    if (!orderStatus) {
      return res.status(400).json({
        success: false,
        message: 'Order status required'
      });
    }

    const order = await CustomerOrder.findOneAndUpdate(
      { orderId: req.params.orderId },
      {
        orderStatus,
        trackingNumber: trackingNumber || order?.trackingNumber
      },
      { new: true }
    ).populate('customer');

    // Send email notification if status changes to shipped
    if (orderStatus === 'shipped' && order.customer) {
      await sendEmail(order.customer.email, 'shippingNotification', {
        customer: order.customer,
        order,
        trackingNumber: trackingNumber || 'TBD'
      });
    }

    // Send email if delivered
    if (orderStatus === 'delivered' && order.customer) {
      await sendEmail(order.customer.email, 'deliveryConfirmation', {
        customer: order.customer,
        order
      });
    }

    res.json({
      success: true,
      message: 'Order status updated',
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin: Update payment status
router.put('/:orderId/payment-status', verifyToken, isAdmin, async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    const order = await CustomerOrder.findOneAndUpdate(
      { orderId: req.params.orderId },
      { paymentStatus },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Payment status updated',
      data: order
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin: Add order notes
router.put('/:orderId/notes', verifyToken, isAdmin, async (req, res) => {
  try {
    const { notes } = req.body;

    const order = await CustomerOrder.findOneAndUpdate(
      { orderId: req.params.orderId },
      { notes },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Notes updated',
      data: order
    });
  } catch (error) {
    console.error('Update notes error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin: Get order analytics
router.get('/analytics/summary', verifyToken, isAdmin, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Total revenue
    const revenueData = await CustomerOrder.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$total' }
        }
      }
    ]);

    // Orders by status
    const statusData = await CustomerOrder.aggregate([
      {
        $match: { createdAt: { $gte: thirtyDaysAgo } }
      },
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    // Daily revenue trend
    const dailyRevenue = await CustomerOrder.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        revenue: revenueData[0] || {
          totalRevenue: 0,
          totalOrders: 0,
          averageOrderValue: 0
        },
        statusBreakdown: statusData,
        dailyTrend: dailyRevenue
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin: Export orders to CSV
router.get('/export/csv', verifyToken, isAdmin, async (req, res) => {
  try {
    const orders = await CustomerOrder.find()
      .populate('customer', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

    let csv = 'Order ID,Customer,Email,Phone,Total,Status,Payment Status,Order Date,Delivery Date\n';

    orders.forEach(order => {
      csv += `"${order.orderId}","${order.customer?.firstName} ${order.customer?.lastName}","${order.customer?.email}","${order.customer?.phone}","$${order.total.toFixed(2)}","${order.orderStatus}","${order.paymentStatus}","${new Date(order.createdAt).toLocaleDateString()}","${order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : 'N/A'}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="orders-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
