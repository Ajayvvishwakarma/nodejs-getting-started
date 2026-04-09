const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal'],
      required: true,
    },
    cardType: {
      type: String,
      enum: ['mastercard', 'visa', 'paypal'],
      required: true,
    },
    // For credit/debit cards
    cardholderName: String,
    cardNumber: String, // Last 4 digits only for security
    expiryDate: String, // MM/YY format
    cvv: String, // Don't actually store this in real apps!
    
    // For PayPal
    email: String,
    
    // Status
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index to ensure only one default payment method per user
paymentMethodSchema.index({ userId: 1, isDefault: 1 });

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);
