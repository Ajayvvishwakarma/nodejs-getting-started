const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const { verifyToken } = require('../middleware/auth');

// Customer Register
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword, phone } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ email: email.toLowerCase() });
    if (existingCustomer) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new customer
    const customer = new Customer({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone?.trim() || ''
    });

    await customer.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: customer._id, email: customer.email, role: 'customer' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        customerId: customer._id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// Customer Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Find customer
    const customer = await Customer.findOne({ email: email.toLowerCase() });
    if (!customer) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Update last login
    customer.lastLogin = new Date();
    await customer.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: customer._id, email: customer.email, role: 'customer' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        customerId: customer._id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        profileImage: customer.profileImage,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// Get customer profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id).select('-password');
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update customer profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { firstName, lastName, phone, profileImage } = req.body;

    const customer = await Customer.findByIdAndUpdate(
      req.user.id,
      {
        firstName: firstName?.trim() || undefined,
        lastName: lastName?.trim() || undefined,
        phone: phone?.trim() || undefined,
        profileImage: profileImage || undefined
      },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: customer
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add to cart
router.post('/cart/add', verifyToken, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const customer = await Customer.findById(req.user.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Check if product already in cart
    const cartItem = customer.cart.find(item => item.product.toString() === productId);
    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      customer.cart.push({ product: productId, quantity });
    }

    await customer.save();

    res.json({
      success: true,
      message: 'Product added to cart',
      data: { cartCount: customer.cart.length }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get cart
router.get('/cart', verifyToken, async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id).populate('cart.product');
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({
      success: true,
      data: customer.cart
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Remove from cart
router.delete('/cart/:productId', verifyToken, async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    customer.cart = customer.cart.filter(item => item.product.toString() !== req.params.productId);
    await customer.save();

    res.json({
      success: true,
      message: 'Product removed from cart',
      data: { cartCount: customer.cart.length }
    });
  } catch (error) {
    console.error('Remove cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update cart quantity
router.put('/cart/:productId', verifyToken, async (req, res) => {
  try {
    const { quantity } = req.body;

    const customer = await Customer.findById(req.user.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const cartItem = customer.cart.find(item => item.product.toString() === req.params.productId);
    if (!cartItem) {
      return res.status(404).json({ success: false, message: 'Product not in cart' });
    }

    if (quantity <= 0) {
      customer.cart = customer.cart.filter(item => item.product.toString() !== req.params.productId);
    } else {
      cartItem.quantity = quantity;
    }

    await customer.save();

    res.json({
      success: true,
      message: 'Cart updated',
      data: { cartCount: customer.cart.length }
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add to wishlist
router.post('/wishlist/add', verifyToken, async (req, res) => {
  try {
    const { productId } = req.body;

    const customer = await Customer.findById(req.user.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    if (!customer.wishlist.includes(productId)) {
      customer.wishlist.push(productId);
      await customer.save();
    }

    res.json({
      success: true,
      message: 'Product added to wishlist'
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get wishlist
router.get('/wishlist', verifyToken, async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id).populate('wishlist');
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({
      success: true,
      data: customer.wishlist
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = { router, customerRouter: router };
