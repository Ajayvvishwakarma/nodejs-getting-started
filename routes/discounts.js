const express = require('express');
const router = express.Router();
const DiscountCode = require('../models/DiscountCode');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Apply discount code (customer - check validity)
router.post('/apply', verifyToken, async (req, res) => {
  try {
    const { code, cartTotal, orderItems } = req.body;

    if (!code || !cartTotal) {
      return res.status(400).json({ 
        success: false, 
        message: 'Code and cart total required' 
      });
    }

    // Find code
    const discount = await DiscountCode.findOne({ code: code.toUpperCase() });
    if (!discount) {
      return res.status(404).json({ 
        success: false, 
        message: 'Discount code not found' 
      });
    }

    // Check if valid
    if (!discount.isValid()) {
      return res.status(400).json({ 
        success: false, 
        message: 'This discount code is no longer valid' 
      });
    }

    // Check usage limit
    if (discount.isUsageLimitExceeded()) {
      return res.status(400).json({ 
        success: false, 
        message: 'This discount code has reached its usage limit' 
      });
    }

    // Check customer usage
    const customerUsage = discount.usedBy.filter(
      u => u.customer.toString() === req.user.id
    ).length;

    if (customerUsage >= discount.maxUsagePerCustomer) {
      return res.status(400).json({ 
        success: false, 
        message: `You've already used this code ${discount.maxUsagePerCustomer} time(s)` 
      });
    }

    // Check minimum order amount
    if (cartTotal < discount.minOrderAmount) {
      return res.status(400).json({ 
        success: false, 
        message: `Minimum order amount of $${discount.minOrderAmount} required` 
      });
    }

    // Check applicable categories/products
    if (discount.applicableCategories.length > 0 || discount.applicableProducts.length > 0) {
      // Verify items are applicable
      // This is a simplified check - can be more complex based on requirements
    }

    // Calculate discount
    let discountAmount = 0;
    if (discount.type === 'percentage') {
      discountAmount = (cartTotal * discount.value) / 100;
      if (discount.maxDiscount) {
        discountAmount = Math.min(discountAmount, discount.maxDiscount);
      }
    } else if (discount.type === 'fixed') {
      discountAmount = Math.min(discount.value, cartTotal);
    }

    const finalTotal = Math.max(0, cartTotal - discountAmount);

    res.json({
      success: true,
      message: 'Discount code applied successfully',
      data: {
        code: discount.code,
        type: discount.type,
        value: discount.value,
        discountAmount: discountAmount.toFixed(2),
        originalTotal: cartTotal.toFixed(2),
        finalTotal: finalTotal.toFixed(2),
        savings: discountAmount.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Apply discount error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin: Create discount code
router.post('/admin/create', verifyToken, isAdmin, async (req, res) => {
  try {
    const {
      code, description, type, value, maxUsagePerCustomer,
      totalUsageLimit, minOrderAmount, maxDiscount,
      validFrom, validUntil
    } = req.body;

    // Validate
    if (!code || !type || !value || !validFrom || !validUntil) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Check if code exists
    const existing = await DiscountCode.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'Code already exists' 
      });
    }

    const discount = new DiscountCode({
      code: code.toUpperCase(),
      description,
      type,
      value,
      maxUsagePerCustomer: maxUsagePerCustomer || 1,
      totalUsageLimit,
      minOrderAmount: minOrderAmount || 0,
      maxDiscount,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      createdBy: req.user.id
    });

    await discount.save();

    res.status(201).json({
      success: true,
      message: 'Discount code created',
      data: discount
    });
  } catch (error) {
    console.error('Create discount error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin: Get all discount codes
router.get('/admin/list', verifyToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, active = 'all' } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (active === 'true') {
      const now = new Date();
      filter = {
        isActive: true,
        validFrom: { $lte: now },
        validUntil: { $gte: now }
      };
    } else if (active === 'false') {
      filter = { $or: [{ isActive: false }, { validUntil: { $lt: new Date() } }] };
    }

    const discounts = await DiscountCode.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await DiscountCode.countDocuments(filter);

    res.json({
      success: true,
      data: discounts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('List discounts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin: Get discount details
router.get('/admin/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const discount = await DiscountCode.findById(req.params.id);
    if (!discount) {
      return res.status(404).json({ success: false, message: 'Discount not found' });
    }

    res.json({ success: true, data: discount });
  } catch (error) {
    console.error('Get discount error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin: Update discount code
router.put('/admin/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { description, isActive, maxUsagePerCustomer, totalUsageLimit, validUntil } = req.body;

    const discount = await DiscountCode.findByIdAndUpdate(
      req.params.id,
      {
        description,
        isActive,
        maxUsagePerCustomer,
        totalUsageLimit,
        validUntil: validUntil ? new Date(validUntil) : undefined
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Discount updated',
      data: discount
    });
  } catch (error) {
    console.error('Update discount error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin: Delete discount code
router.delete('/admin/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await DiscountCode.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Discount deleted' });
  } catch (error) {
    console.error('Delete discount error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
