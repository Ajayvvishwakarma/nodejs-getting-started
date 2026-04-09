const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Banner = require('../models/Banner');
const Category = require('../models/Category');
const Product = require('../models/Product');
const { verifyToken: auth } = require('../middleware/auth');

// Configure multer for file uploads
const uploadDir = path.join(__dirname, '../public/uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  },
});

// ==================== UPLOAD IMAGE ====================
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      image: imageUrl,
      filename: req.file.filename,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
});

// ==================== BANNERS / SLIDER ====================

// GET all banners
router.get('/banners', async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching banners', error: error.message });
  }
});

// GET all banners (admin - including inactive)
router.get('/banners/admin/all', auth, async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching banners', error: error.message });
  }
});

// CREATE banner
router.post('/banners', auth, async (req, res) => {
  try {
    const { title, subtitle, image, buttonText, buttonLink } = req.body;

    const banner = new Banner({
      title,
      subtitle,
      image,
      buttonText: buttonText || 'Shop Now',
      buttonLink: buttonLink || '/products',
    });

    await banner.save();
    res.status(201).json({ success: true, message: 'Banner created', banner });
  } catch (error) {
    res.status(400).json({ message: 'Error creating banner', error: error.message });
  }
});

// UPDATE banner
router.put('/banners/:id', auth, async (req, res) => {
  try {
    const { title, subtitle, image, buttonText, buttonLink, isActive, order } = req.body;

    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      {
        title,
        subtitle,
        image,
        buttonText,
        buttonLink,
        isActive,
        order,
      },
      { new: true, runValidators: true }
    );

    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    res.json({ success: true, message: 'Banner updated', banner });
  } catch (error) {
    res.status(400).json({ message: 'Error updating banner', error: error.message });
  }
});

// DELETE banner
router.delete('/banners/:id', auth, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);

    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    res.json({ success: true, message: 'Banner deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting banner', error: error.message });
  }
});

// ==================== CATEGORIES ====================

// GET all categories (public)
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

// GET all categories (admin)
router.get('/categories/admin/all', auth, async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

// CREATE category
router.post('/categories', auth, async (req, res) => {
  try {
    const { name, description, image } = req.body;

    const category = new Category({
      name,
      description,
      image,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
    });

    await category.save();
    res.status(201).json({ success: true, message: 'Category created', category });
  } catch (error) {
    res.status(400).json({ message: 'Error creating category', error: error.message });
  }
});

// UPDATE category
router.put('/categories/:id', auth, async (req, res) => {
  try {
    const { name, description, image, isActive } = req.body;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        image,
        isActive,
        slug: name ? name.toLowerCase().replace(/\s+/g, '-') : undefined,
      },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ success: true, message: 'Category updated', category });
  } catch (error) {
    res.status(400).json({ message: 'Error updating category', error: error.message });
  }
});

// DELETE category
router.delete('/categories/:id', auth, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
});

// ==================== PRODUCTS (CMS) ====================

// Get all products with filters
router.get('/products-cms', async (req, res) => {
  try {
    const { category, search, limit = 20, page = 1 } = req.query;
    let query = {};

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const products = await Product.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });
    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// CREATE product
router.post('/products-cms', auth, async (req, res) => {
  try {
    const { name, description, price, originalPrice, category, brand, image, images, stock, sku } = req.body;

    const product = new Product({
      name,
      description,
      price,
      originalPrice,
      category,
      brand,
      image,
      images,
      stock,
      sku,
    });

    await product.save();
    res.status(201).json({ success: true, message: 'Product created', product });
  } catch (error) {
    res.status(400).json({ message: 'Error creating product', error: error.message });
  }
});

// UPDATE product
router.put('/products-cms/:id', auth, async (req, res) => {
  try {
    const { name, description, price, originalPrice, category, brand, image, images, stock, sku } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        price,
        originalPrice,
        category,
        brand,
        image,
        images,
        stock,
        sku,
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ success: true, message: 'Product updated', product });
  } catch (error) {
    res.status(400).json({ message: 'Error updating product', error: error.message });
  }
});

// DELETE product
router.delete('/products-cms/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

module.exports = router;
