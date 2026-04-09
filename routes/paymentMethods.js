const express = require('express');
const router = express.Router();
const PaymentMethod = require('../models/PaymentMethod');
const { verifyToken } = require('../middleware/auth');

// Get all payment methods for logged-in user
router.get('/', verifyToken, async (req, res) => {
  try {
    const paymentMethods = await PaymentMethod.find({
      userId: req.user.id,
      isActive: true,
    }).sort({ isDefault: -1, createdAt: -1 });

    res.json({
      success: true,
      data: paymentMethods,
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment methods',
    });
  }
});

// Add new payment method
router.post('/', verifyToken, async (req, res) => {
  try {
    const { type, cardType, cardholderName, cardNumber, expiryDate, email } = req.body;

    // Validate required fields
    if (!type || !cardType) {
      return res.status(400).json({
        success: false,
        message: 'Type and cardType are required',
      });
    }

    // Check if this is the first payment method (make it default)
    const existingMethods = await PaymentMethod.countDocuments({
      userId: req.user.id,
      isActive: true,
    });

    const isDefault = existingMethods === 0;

    const paymentMethod = new PaymentMethod({
      userId: req.user.id,
      type,
      cardType,
      cardholderName,
      cardNumber,
      expiryDate,
      email,
      isDefault,
    });

    await paymentMethod.save();

    res.json({
      success: true,
      message: 'Payment method added successfully',
      data: paymentMethod,
    });
  } catch (error) {
    console.error('Error adding payment method:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add payment method',
    });
  }
});

// Set payment method as default
router.put('/:id/default', verifyToken, async (req, res) => {
  try {
    // Remove default from all other methods
    await PaymentMethod.updateMany(
      { userId: req.user.id, isActive: true },
      { isDefault: false }
    );

    // Set this one as default
    const paymentMethod = await PaymentMethod.findByIdAndUpdate(
      req.params.id,
      { isDefault: true },
      { new: true }
    );

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found',
      });
    }

    res.json({
      success: true,
      message: 'Payment method set as default',
      data: paymentMethod,
    });
  } catch (error) {
    console.error('Error setting default payment method:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set payment method as default',
    });
  }
});

// Update payment method
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { cardholderName, expiryDate, email } = req.body;

    const paymentMethod = await PaymentMethod.findByIdAndUpdate(
      req.params.id,
      { cardholderName, expiryDate, email },
      { new: true }
    );

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found',
      });
    }

    res.json({
      success: true,
      message: 'Payment method updated successfully',
      data: paymentMethod,
    });
  } catch (error) {
    console.error('Error updating payment method:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment method',
    });
  }
});

// Delete payment method (soft delete)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found',
      });
    }

    res.json({
      success: true,
      message: 'Payment method deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete payment method',
    });
  }
});

// Get default payment method
router.get('/default', verifyToken, async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.findOne({
      userId: req.user.id,
      isActive: true,
      isDefault: true,
    });

    res.json({
      success: true,
      data: paymentMethod,
    });
  } catch (error) {
    console.error('Error fetching default payment method:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch default payment method',
    });
  }
});

module.exports = router;
