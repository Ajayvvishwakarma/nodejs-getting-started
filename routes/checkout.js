const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const CustomerOrder = require('../models/CustomerOrder');
const Product = require('../models/Product');
const DiscountCode = require('../models/DiscountCode');
const { verifyToken } = require('../middleware/auth');
const { sendEmail } = require('../utils/emailService');

// Create order from cart
router.post('/checkout', verifyToken, async (req, res) => {
  try {
    const { shippingAddress, billingAddress, paymentMethod, discountCode } = req.body;

    // Get customer and populate cart with products
    const customer = await Customer.findById(req.user.id).populate('cart.product');
    if (!customer || customer.cart.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
      return res.status(400).json({ success: false, message: 'Valid shipping address required' });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const cartItem of customer.cart) {
      const product = cartItem.product;
      const itemTotal = product.price * cartItem.quantity;
      
      subtotal += itemTotal;
      
      orderItems.push({
        product: product._id,
        quantity: cartItem.quantity,
        price: product.price,
        subtotal: itemTotal
      });
    }

    const shippingCost = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const tax = subtotal * 0.1; // 10% tax
    let discount = 0;

    // Apply discount code if provided
    if (discountCode) {
      const code = await DiscountCode.findOne({ code: discountCode.toUpperCase() });
      
      if (code && code.isValid() && !code.isUsageLimitExceeded()) {
        // Check customer usage
        const customerUsage = code.usedBy.filter(u => u.customer.toString() === req.user.id).length;
        if (customerUsage < code.maxUsagePerCustomer) {
          // Calculate discount
          if (code.type === 'percentage') {
            discount = (subtotal * code.value) / 100;
            if (code.maxDiscount) discount = Math.min(discount, code.maxDiscount);
          } else if (code.type === 'fixed') {
            discount = Math.min(code.value, subtotal);
          }

          // Record usage
          code.usedBy.push({
            customer: req.user.id,
            usedAt: new Date()
          });
          code.usageCount += 1;
          await code.save();
        }
      }
    }

    const total = subtotal + shippingCost + tax - discount;

    // Create order
    const order = new CustomerOrder({
      customer: req.user.id,
      items: orderItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      subtotal,
      shippingCost,
      tax,
      discount,
      total,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'pending',
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });

    await order.save();

    // Clear cart
    customer.cart = [];
    await customer.save();

    // Send confirmation email
    await sendEmail(customer.email, 'orderConfirmation', {
      customer,
      order
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        orderId: order.orderId,
        total: order.total,
        discount: discount.toFixed(2),
        orderStatus: order.orderStatus,
        estimatedDelivery: order.estimatedDelivery
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user's orders
router.get('/', verifyToken, async (req, res) => {
  try {
    const orders = await CustomerOrder.find({ customer: req.user.id })
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get order details
router.get('/:orderId', verifyToken, async (req, res) => {
  try {
    const order = await CustomerOrder.findOne({
      orderId: req.params.orderId,
      customer: req.user.id
    }).populate('items.product');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
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

// Cancel order
router.put('/:orderId/cancel', verifyToken, async (req, res) => {
  try {
    const order = await CustomerOrder.findOne({
      orderId: req.params.orderId,
      customer: req.user.id
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.orderStatus !== 'pending' && order.orderStatus !== 'processing') {
      return res.status(400).json({ success: false, message: 'Cannot cancel this order' });
    }

    order.orderStatus = 'cancelled';
    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update payment status (for webhook/payment completion)
router.put('/:orderId/payment', async (req, res) => {
  try {
    const { paymentStatus, transactionId } = req.body;

    const order = await CustomerOrder.findOne({ orderId: req.params.orderId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.paymentStatus = paymentStatus;
    if (paymentStatus === 'completed') {
      order.orderStatus = 'processing';
    }

    await order.save();

    res.json({
      success: true,
      message: 'Payment status updated',
      data: { paymentStatus: order.paymentStatus, orderStatus: order.orderStatus }
    });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
