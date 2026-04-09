const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const ModuleManagement = require('../models/ModuleManagement');

// Get all products for customer store (no admin restrictions)
router.get('/products', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12, sort = 'newest' } = req.query;

    let filter = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let sortQuery = {};
    switch (sort) {
      case 'price-low':
        sortQuery = { price: 1 };
        break;
      case 'price-high':
        sortQuery = { price: -1 };
        break;
      case 'oldest':
        sortQuery = { createdAt: 1 };
        break;
      case 'newest':
      default:
        sortQuery = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;
    
    const products = await Product.find(filter)
      .sort(sortQuery)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single product details
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Get related products
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true,
    }).limit(4);

    res.status(200).json({
      success: true,
      data: product,
      related: relatedProducts,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get product categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get featured/promotional products
router.get('/featured', async (req, res) => {
  try {
    const featured = await Product.find({
      isFeatured: true,
      isActive: true,
    }).limit(6);

    res.status(200).json({ success: true, data: featured });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all customer-facing modules/services
router.get('/modules', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;

    let filter = { status: 'active' };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    
    const modules = await ModuleManagement.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ModuleManagement.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: modules,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single module details
router.get('/modules/:id', async (req, res) => {
  try {
    const module = await ModuleManagement.findById(req.params.id);
    
    if (!module || module.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    res.status(200).json({ success: true, data: module });
  } catch (error) {
    console.error('Error fetching module:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
