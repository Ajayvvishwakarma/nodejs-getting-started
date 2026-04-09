const nodemailer = require('nodemailer');

// Email configuration
const emailConfig = {
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
};

// Create transporter
const transporter = nodemailer.createTransport(emailConfig);

// Email templates
const emailTemplates = {
  orderConfirmation: (customer, order) => ({
    subject: `Order Confirmed - ${order.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa; border-radius: 8px;">
        <h1 style="color: #333; margin-bottom: 20px;">Order Confirmed! ✓</h1>
        
        <p style="color: #666; line-height: 1.6;">Hi <strong>${customer.firstName}</strong>,</p>
        <p style="color: #666; line-height: 1.6;">Thank you for your order! We're excited to get your items to you.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1;">
          <h3 style="color: #333; margin-top: 0;">Order Details</h3>
          <p style="margin: 10px 0;"><strong>Order ID:</strong> ${order.orderId}</p>
          <p style="margin: 10px 0;"><strong>Total:</strong> $${order.total.toFixed(2)}</p>
          <p style="margin: 10px 0;"><strong>Estimated Delivery:</strong> ${new Date(order.estimatedDelivery).toLocaleDateString()}</p>
          <p style="margin: 10px 0;"><strong>Status:</strong> <span style="background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px;">${order.orderStatus.toUpperCase()}</span></p>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Items Ordered</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${order.items.map(item => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px 0;"><strong>${item.product?.name || 'Product'}</strong></td>
                <td style="text-align: right;">x${item.quantity}</td>
                <td style="text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </table>
          <div style="margin-top: 15px; text-align: right; border-top: 2px solid #6366f1; padding-top: 15px;">
            <p style="margin: 5px 0;"><strong>Subtotal:</strong> $${order.subtotal.toFixed(2)}</p>
            <p style="margin: 5px 0;"><strong>Shipping:</strong> $${order.shippingCost.toFixed(2)}</p>
            <p style="margin: 5px 0;"><strong>Tax:</strong> $${order.tax.toFixed(2)}</p>
            <p style="margin: 10px 0; font-size: 1.1em;"><strong>Total:</strong> $${order.total.toFixed(2)}</p>
          </div>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Shipping Address</h3>
          <p style="color: #666; line-height: 1.8;">
            ${order.shippingAddress.street}<br/>
            ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br/>
            ${order.shippingAddress.country}
          </p>
        </div>

        <div style="background: #f0f4ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1;">
          <p style="color: #333; margin: 0;">
            <strong>What's next?</strong> You'll receive a shipping confirmation email with a tracking number once your order ships.
          </p>
        </div>

        <p style="color: #666; font-size: 0.9em; line-height: 1.6; margin-top: 30px;">
          Questions? Contact us at support@ecomus.com
        </p>
        
        <p style="color: #999; font-size: 0.85em; text-align: center; margin-top: 20px;">
          © 2026 Ecomus. All rights reserved.
        </p>
      </div>
    `
  }),

  shippingNotification: (customer, order, trackingNumber) => ({
    subject: `Your Order is Shipping - Track It Now! 📦`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa; border-radius: 8px;">
        <h1 style="color: #333; margin-bottom: 20px;">Order Shipped! 📦</h1>
        
        <p style="color: #666; line-height: 1.6;">Hi <strong>${customer.firstName}</strong>,</p>
        <p style="color: #666; line-height: 1.6;">Your order has been shipped and is on its way to you!</p>
        
        <div style="background: #10b981; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h2 style="margin: 0; font-size: 1.2em;">Tracking Number</h2>
          <p style="font-size: 1.8em; font-weight: bold; margin: 10px 0; font-family: monospace;">${trackingNumber}</p>
          <p style="margin: 10px 0;"><a href="#" style="color: white; text-decoration: none; font-weight: bold;">Track Your Shipment →</a></p>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Order #${order.orderId}</h3>
          <p style="color: #666;"><strong>Estimated Delivery:</strong> ${new Date(order.estimatedDelivery).toLocaleDateString()}</p>
        </div>

        <p style="color: #666; font-size: 0.9em; line-height: 1.6;">
          Questions? Contact us at support@ecomus.com
        </p>
      </div>
    `
  }),

  deliveryConfirmation: (customer, order) => ({
    subject: `Delivery Confirmed - Order ${order.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa; border-radius: 8px;">
        <h1 style="color: #333; margin-bottom: 20px;">Your Order Has Been Delivered! ✓</h1>
        
        <p style="color: #666; line-height: 1.6;">Hi <strong>${customer.firstName}</strong>,</p>
        <p style="color: #666; line-height: 1.6;">We're excited to confirm that your order has been delivered!</p>
        
        <div style="background: #10b981; color: white; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0;">Delivered on ${new Date().toLocaleDateString()}</p>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Leave a Review</h3>
          <p style="color: #666;">We'd love to hear what you think about your purchase! Your feedback helps us improve.</p>
          <p style="text-align: center; margin-top: 15px;">
            <a href="#" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Leave a Review ⭐
            </a>
          </p>
        </div>

        <p style="color: #666; font-size: 0.9em; line-height: 1.6;">
          Thank you for shopping with us!
        </p>
      </div>
    `
  }),

  abandonedCart: (customer, cartItems, totalAmount) => ({
    subject: `Your Cart is Waiting - Complete Your Purchase 🛒`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa; border-radius: 8px;">
        <h1 style="color: #333; margin-bottom: 20px;">Don't Forget Your Items! 🛒</h1>
        
        <p style="color: #666; line-height: 1.6;">Hi <strong>${customer.firstName}</strong>,</p>
        <p style="color: #666; line-height: 1.6;">We noticed you left some great items in your cart. Complete your purchase before they're gone!</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Items in Your Cart</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${cartItems.map(item => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px 0;"><strong>${item.product?.name || 'Product'}</strong></td>
                <td style="text-align: right;">$${item.product?.price.toFixed(2)}</td>
              </tr>
            `).join('')}
          </table>
          <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #eee; text-align: right;">
            <p style="margin: 0; font-weight: bold; font-size: 1.1em;">Total: $${totalAmount.toFixed(2)}</p>
          </div>
        </div>

        <p style="text-align: center; margin: 20px 0;">
          <a href="#" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Continue Shopping →
          </a>
        </p>

        <p style="color: #999; font-size: 0.85em; text-align: center; margin-top: 20px; line-height: 1.6;">
          Offer expires in 24 hours. Prices may vary.
        </p>
      </div>
    `
  })
};

// Send email function
const sendEmail = async (to, templateName, params) => {
  try {
    const template = emailTemplates[templateName]?.(params.customer, params.order, params.trackingNumber);
    
    if (!template) {
      console.error(`Email template '${templateName}' not found`);
      return false;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@ecomus.com',
      to,
      ...template
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to} - ${templateName}`);
    return true;
  } catch (error) {
    console.error(`❌ Email error for ${to}:`, error);
    return false;
  }
};

// Test connection
const testEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email service connected and ready');
    return true;
  } catch (error) {
    console.error('❌ Email service failed:', error);
    return false;
  }
};

module.exports = {
  sendEmail,
  testEmailConnection,
  emailTemplates
};
