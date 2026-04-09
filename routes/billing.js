const express = require('express');
const router = express.Router();
const Billing = require('../models/Billing');
const { verifyToken } = require('../middleware/auth');

// Get billing details for current user
router.get('/my-billing', verifyToken, async (req, res) => {
  try {
    let billing = await Billing.findOne({ userId: req.user.id });

    // If no billing record exists, create one
    if (!billing) {
      billing = new Billing({
        userId: req.user.id,
        billingInfo: {
          name: req.user.username || 'User',
          street: '800 E Elcamino Real, suite #400',
          city: 'Mountain View',
          state: 'CA',
          zipCode: '94040',
          country: 'United States of America',
          vatNumber: 'DE4920348',
        },
        paymentMethods: [
          {
            id: new require('mongoose').Types.ObjectId(),
            type: 'credit_card',
            cardBrand: 'Mastercard',
            lastFourDigits: '9029',
            expiryMonth: 1,
            expiryYear: 24,
            isDefault: true,
          },
          {
            id: new require('mongoose').Types.ObjectId(),
            type: 'credit_card',
            cardBrand: 'Visa',
            lastFourDigits: '4328',
            expiryMonth: 1,
            expiryYear: 25,
            isDefault: false,
          },
          {
            id: new require('mongoose').Types.ObjectId(),
            type: 'paypal',
            paypalEmail: 'name@example.com',
            isDefault: false,
          },
        ],
        invoices: [
          {
            invoiceNumber: 'Invoice #012',
            date: new Date('2024-05-01'),
            amount: 120,
            plan: 'Starter Plan',
            status: 'paid',
          },
          {
            invoiceNumber: 'Invoice #013',
            date: new Date('2024-06-01'),
            amount: 120,
            plan: 'Starter Plan',
            status: 'paid',
          },
          {
            invoiceNumber: 'Invoice #014',
            date: new Date('2024-07-01'),
            amount: 120,
            plan: 'Starter Plan',
            status: 'unpaid',
          },
          {
            invoiceNumber: 'Invoice #015',
            date: new Date('2024-08-01'),
            amount: 250,
            plan: 'Pro Plan',
            status: 'paid',
          },
          {
            invoiceNumber: 'Invoice #016',
            date: new Date('2024-09-01'),
            amount: 250,
            plan: 'Pro Plan',
            status: 'paid',
          },
        ],
        planBenefits: [
          '25,500 orders per month',
          'Unlimited integrations',
          'Exclusive AutoFile discount',
          '10 GB Storage',
          'Custom Templates',
          'Advanced Marketing tool',
        ],
      });

      await billing.save();
    }

    res.status(200).json({
      success: true,
      data: billing,
    });
  } catch (error) {
    console.error('Error fetching billing:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching billing details',
      error: error.message,
    });
  }
});

// Update billing info
router.put('/update-billing-info', verifyToken, async (req, res) => {
  try {
    const { name, street, city, state, zipCode, country, vatNumber } = req.body;

    let billing = await Billing.findOne({ userId: req.user.id });

    if (!billing) {
      return res.status(404).json({
        success: false,
        message: 'Billing record not found',
      });
    }

    billing.billingInfo = {
      name: name || billing.billingInfo.name,
      street: street || billing.billingInfo.street,
      city: city || billing.billingInfo.city,
      state: state || billing.billingInfo.state,
      zipCode: zipCode || billing.billingInfo.zipCode,
      country: country || billing.billingInfo.country,
      vatNumber: vatNumber || billing.billingInfo.vatNumber,
    };

    await billing.save();

    res.status(200).json({
      success: true,
      message: 'Billing info updated successfully',
      data: billing,
    });
  } catch (error) {
    console.error('Error updating billing info:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating billing info',
      error: error.message,
    });
  }
});

// Update orders usage
router.put('/update-orders-usage', verifyToken, async (req, res) => {
  try {
    const { ordersUsed } = req.body;

    let billing = await Billing.findOne({ userId: req.user.id });

    if (!billing) {
      return res.status(404).json({
        success: false,
        message: 'Billing record not found',
      });
    }

    billing.ordersUsed = ordersUsed || 0;
    await billing.save();

    res.status(200).json({
      success: true,
      message: 'Orders usage updated',
      data: billing,
    });
  } catch (error) {
    console.error('Error updating orders usage:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating orders usage',
      error: error.message,
    });
  }
});

// Get invoices
router.get('/invoices', verifyToken, async (req, res) => {
  try {
    const billing = await Billing.findOne({ userId: req.user.id });

    if (!billing) {
      return res.status(404).json({
        success: false,
        message: 'Billing record not found',
      });
    }

    res.status(200).json({
      success: true,
      data: billing.invoices,
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invoices',
      error: error.message,
    });
  }
});

// Add payment method
router.post('/add-payment-method', verifyToken, async (req, res) => {
  try {
    const { type, cardBrand, lastFourDigits, expiryMonth, expiryYear, paypalEmail } = req.body;

    let billing = await Billing.findOne({ userId: req.user.id });

    if (!billing) {
      return res.status(404).json({
        success: false,
        message: 'Billing record not found',
      });
    }

    const newPaymentMethod = {
      id: new require('mongoose').Types.ObjectId(),
      type,
      cardBrand: cardBrand || null,
      lastFourDigits: lastFourDigits || null,
      expiryMonth,
      expiryYear,
      paypalEmail: paypalEmail || null,
      isDefault: billing.paymentMethods.length === 0,
    };

    billing.paymentMethods.push(newPaymentMethod);
    await billing.save();

    res.status(201).json({
      success: true,
      message: 'Payment method added successfully',
      data: newPaymentMethod,
    });
  } catch (error) {
    console.error('Error adding payment method:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding payment method',
      error: error.message,
    });
  }
});

// Set default payment method
router.put('/set-default-payment/:paymentId', verifyToken, async (req, res) => {
  try {
    const { paymentId } = req.params;

    let billing = await Billing.findOne({ userId: req.user.id });

    if (!billing) {
      return res.status(404).json({
        success: false,
        message: 'Billing record not found',
      });
    }

    // Set all to false first
    billing.paymentMethods.forEach((method) => {
      method.isDefault = false;
    });

    // Set selected as default
    const payment = billing.paymentMethods.find(
      (m) => m.id.toString() === paymentId
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found',
      });
    }

    payment.isDefault = true;
    await billing.save();

    res.status(200).json({
      success: true,
      message: 'Default payment method updated',
      data: payment,
    });
  } catch (error) {
    console.error('Error setting default payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting default payment method',
      error: error.message,
    });
  }
});

// Delete payment method
router.delete('/delete-payment/:paymentId', verifyToken, async (req, res) => {
  try {
    const { paymentId } = req.params;

    let billing = await Billing.findOne({ userId: req.user.id });

    if (!billing) {
      return res.status(404).json({
        success: false,
        message: 'Billing record not found',
      });
    }

    billing.paymentMethods = billing.paymentMethods.filter(
      (m) => m.id.toString() !== paymentId
    );

    await billing.save();

    res.status(200).json({
      success: true,
      message: 'Payment method deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting payment method',
      error: error.message,
    });
  }
});

module.exports = router;
