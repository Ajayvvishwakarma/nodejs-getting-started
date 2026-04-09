const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { verifyToken } = require('../middleware/auth');

// Get user's cart
router.get('/', verifyToken, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id })
      .populate('items.productId', 'name price image category');
    
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
      await cart.save();
    }

    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    console.error('Error getting cart:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add to cart
router.post('/add', verifyToken, async (req, res) => {
  try {
    const { productId, quantity = 1, variant = {} } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({ 
        success: false, 
        message: `Only ${product.stock} items available` 
      });
    }

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    // Check if product already in cart
    const existingItem = cart.items.find(
      item => item.productId.toString() === productId && 
               JSON.stringify(item.variant) === JSON.stringify(variant)
    );

    if (existingItem) {
      // Check if new quantity exceeds stock
      if (existingItem.quantity + quantity > product.stock) {
        return res.status(400).json({ 
          success: false, 
          message: `Cannot add more items. Only ${product.stock} available` 
        });
      }
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        productId,
        quantity,
        price: product.price,
        variant,
      });
    }

    await cart.save();
    
    res.status(200).json({ 
      success: true, 
      message: 'Added to cart',
      data: cart 
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update cart item quantity
router.put('/item/:itemId', verifyToken, async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be greater than 0' });
    }

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const cartItem = cart.items.id(req.params.itemId);
    if (!cartItem) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    // Verify stock
    const product = await Product.findById(cartItem.productId);
    if (quantity > product.stock) {
      return res.status(400).json({ 
        success: false, 
        message: `Only ${product.stock} items available` 
      });
    }

    cartItem.quantity = quantity;
    await cart.save();

    res.status(200).json({ 
      success: true, 
      message: 'Cart updated',
      data: cart 
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove from cart
router.delete('/item/:itemId', verifyToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
    await cart.save();

    res.status(200).json({ 
      success: true, 
      message: 'Item removed from cart',
      data: cart 
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Clear cart
router.delete('/', verifyToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = [];
    cart.total = 0;
    await cart.save();

    res.status(200).json({ 
      success: true, 
      message: 'Cart cleared',
      data: cart 
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
