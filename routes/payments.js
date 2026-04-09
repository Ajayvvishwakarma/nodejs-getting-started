const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const Order = require('../models/Order');

// Note: This is a basic Stripe integration structure
// You'll need to install: npm install stripe
// And add: const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create Stripe payment session
router.post('/create-session', verifyToken, async (req, res) => {
  try {
    const { orderId } = req.body;

    // Fetch order
    const order = await Order.findById(orderId).populate('items.productId');
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify ownership
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // In a real implementation, you would create a Stripe session here
    // For now, we'll return a mock response
    
    // Example with Stripe (requires API key):
    // const session = await stripe.checkout.sessions.create({
    //   payment_method_types: ['card'],
    //   line_items: order.items.map(item => ({
    //     price_data: {
    //       currency: 'usd',
    //       product_data: { name: item.productName },
    //       unit_amount: Math.round(item.price * 100),
    //     },
    //     quantity: item.quantity,
    //   })),
    //   mode: 'payment',
    //   success_url: `${process.env.FRONTEND_URL}/customer-payment-confirmation.html?orderId=${orderId}`,
    //   cancel_url: `${process.env.FRONTEND_URL}/customer-checkout.html`,
    // });

    res.status(200).json({
      success: true,
      message: 'Payment session created',
      data: {
        sessionId: 'cs_test_mock_' + Date.now(),
        orderId,
        amount: order.total,
        // In real implementation: sessionUrl: session.url
        sessionUrl: '#',
      },
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Handle Stripe webhook (for production use)
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    // In production, verify the signature:
    // const event = stripe.webhooks.constructEvent(
    //   req.body,
    //   sig,
    //   process.env.STRIPE_WEBHOOK_SECRET
    // );

    // Handle different event types
    // case 'checkout.session.completed':
    //   Update order status to paid
    // case 'charge.refunded':
    //   Handle refunds

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get payment methods for user
router.get('/methods', verifyToken, async (req, res) => {
  try {
    // Fetch user's saved payment methods
    // This would integrate with Stripe's payment method API
    
    res.status(200).json({
      success: true,
      data: [
        {
          id: 'pm_test_1',
          type: 'card',
          card: {
            brand: 'visa',
            last4: '4242',
            exp_month: 12,
            exp_year: 2025,
          },
        },
      ],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
