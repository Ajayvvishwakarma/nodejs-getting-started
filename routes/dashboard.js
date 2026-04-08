const express = require('express')
const router = express.Router()
const Product = require('../models/Product')
const Order = require('../models/Order')
const User = require('../models/User')
const Analytics = require('../models/Analytics')
const Marketing = require('../models/Marketing')
const CRM = require('../models/CRM')
const Stocks = require('../models/Stocks')
const SaaS = require('../models/SaaS')
const Logistics = require('../models/Logistics')
const AIAssistant = require('../models/AIAssistant')
const { verifyToken, isAdmin } = require('../middleware/auth')

// Dashboard Statistics Overview
router.get('/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments()
    const totalOrders = await Order.countDocuments()
    const totalCustomers = await User.countDocuments({ role: 'customer' })
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ])

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name email')
      .select('orderNumber customer totalAmount status paymentStatus createdAt')

    const topProducts = await Product.find()
      .sort({ sales: -1 })
      .limit(5)
      .select('name price stock rating')

    const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
      .limit(10)
      .select('name sku stock category price')

    res.json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        totalCustomers,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentOrders,
        topProducts,
        lowStockProducts,
      }
    })
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, error: error.message })
  }
})

// Dashboard Products List
router.get('/products', verifyToken, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const products = await Product.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })

    const total = await Product.countDocuments()

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Dashboard Orders List
router.get('/orders', verifyToken, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const orders = await Order.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email phone')
      .select('orderNumber customer totalAmount status paymentStatus createdAt')

    const total = await Order.countDocuments()

    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    })
  } catch (error) {
    console.error('Dashboard orders error:', error);
    // Return data without populate if it fails
    const orders = await Order.find()
      .skip((parseInt(req.query.page) || 1 - 1) * (parseInt(req.query.limit) || 10))
      .limit(parseInt(req.query.limit) || 10)
      .sort({ createdAt: -1 })
      .select('orderNumber customer totalAmount status paymentStatus createdAt')
    
    const total = await Order.countDocuments()
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    
    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    })
  }
})

// Dashboard Customers List
router.get('/customers', verifyToken, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const customers = await User.find({ role: 'customer' })
      .skip(skip)
      .limit(limit)
      .select('-password')
      .sort({ createdAt: -1 })

    const total = await User.countDocuments({ role: 'customer' })

    res.json({
      success: true,
      data: customers,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Get Sales Analytics
router.get('/analytics/sales', verifyToken, isAdmin, async (req, res) => {
  try {
    const salesByMonth = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          sales: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])

    const salesByCategory = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' }
        }
      }
    ])

    res.json({
      success: true,
      data: {
        salesByMonth,
        salesByCategory
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Get Inventory Status
router.get('/inventory', verifyToken, isAdmin, async (req, res) => {
  try {
    const inventory = await Product.find()
      .select('name sku stock category')
      .sort({ stock: 1 })

    const stats = {
      totalItems: await Product.countDocuments(),
      inStock: await Product.countDocuments({ stock: { $gt: 0 } }),
      lowStock: await Product.countDocuments({ stock: { $lt: 10, $gt: 0 } }),
      outOfStock: await Product.countDocuments({ stock: 0 }),
      totalValue: await Product.aggregate([
        { $group: { _id: null, total: { $sum: { $multiply: ['$price', '$stock'] } } } }
      ])
    }

    res.json({
      success: true,
      data: {
        inventory,
        stats: {
          total: stats.totalItems,
          inStock: stats.inStock,
          lowStock: stats.lowStock,
          outOfStock: stats.outOfStock,
          totalValue: stats.totalValue[0]?.total || 0
        }
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Get User Profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const user = await User.findById(userId).select('-password')
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }
    
    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Get Analytics Data
router.get('/analytics', verifyToken, isAdmin, async (req, res) => {
  try {
    const analytics = await Analytics.findOne().sort({ createdAt: -1 })
    
    if (!analytics) {
      return res.status(404).json({ success: false, error: 'Analytics data not found' })
    }
    
    res.json({
      success: true,
      data: analytics
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Get Marketing Data
router.get('/marketing', verifyToken, isAdmin, async (req, res) => {
  try {
    const marketing = await Marketing.findOne().sort({ createdAt: -1 })
    
    if (!marketing) {
      return res.status(404).json({ success: false, error: 'Marketing data not found' })
    }
    
    res.json({
      success: true,
      data: marketing
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Get CRM Data
router.get('/crm', verifyToken, isAdmin, async (req, res) => {
  try {
    const crm = await CRM.findOne().sort({ createdAt: -1 })
    
    if (!crm) {
      return res.status(404).json({ success: false, error: 'CRM data not found' })
    }
    
    res.json({
      success: true,
      data: crm
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Get Stocks Data
router.get('/stocks', verifyToken, async (req, res) => {
  try {
    const stocks = await Stocks.findOne().sort({ createdAt: -1 })
    
    if (!stocks) {
      return res.status(404).json({ success: false, error: 'Stocks data not found' })
    }
    
    res.json({
      success: true,
      data: stocks
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Get SaaS Data
router.get('/saas', verifyToken, async (req, res) => {
  try {
    const saas = await SaaS.findOne().sort({ createdAt: -1 })
    
    if (!saas) {
      return res.status(404).json({ success: false, error: 'SaaS data not found' })
    }
    
    res.json({
      success: true,
      data: saas
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Get Logistics Data
router.get('/logistics', verifyToken, async (req, res) => {
  try {
    const logistics = await Logistics.findOne().sort({ createdAt: -1 })
    
    if (!logistics) {
      return res.status(404).json({ success: false, error: 'Logistics data not found' })
    }
    
    res.json({
      success: true,
      data: logistics
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Get AI Assistant Data
router.get('/ai-assistant', verifyToken, async (req, res) => {
  try {
    const aiAssistant = await AIAssistant.findOne().sort({ createdAt: -1 })
    
    if (!aiAssistant) {
      return res.status(404).json({ success: false, error: 'AI Assistant data not found' })
    }
    
    res.json({
      success: true,
      data: aiAssistant
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

module.exports = router
