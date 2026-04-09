const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // Current Plan
    currentPlan: {
      name: { type: String, default: 'Professional' },
      cost: { type: Number, default: 199 }, // in USD
      monthlyOrders: { type: Number, default: 25500 },
      renewalDate: { type: Date, default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
    },
    // Orders Usage
    ordersUsed: { type: Number, default: 0 },
    ordersLimit: { type: Number, default: 25500 },
    // Billing Information
    billingInfo: {
      name: { type: String, default: '' },
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' },
      country: { type: String, default: '' },
      vatNumber: { type: String, default: '' },
    },
    // Payment Methods
    paymentMethods: [
      {
        id: mongoose.Schema.Types.ObjectId,
        type: { type: String, enum: ['credit_card', 'debit_card', 'paypal'], default: 'credit_card' },
        cardBrand: { type: String }, // Mastercard, Visa, etc.
        lastFourDigits: { type: String },
        expiryMonth: { type: Number },
        expiryYear: { type: Number },
        isDefault: { type: Boolean, default: false },
        paypalEmail: { type: String },
      },
    ],
    // Invoices
    invoices: [
      {
        invoiceNumber: { type: String, unique: true },
        date: { type: Date, default: Date.now },
        amount: { type: Number },
        plan: { type: String },
        status: { type: String, enum: ['paid', 'unpaid', 'overdue'], default: 'unpaid' },
        downloadUrl: { type: String },
      },
    ],
    // Plan Benefits
    planBenefits: [
      { type: String, default: 'Unlimited integrations' },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Billing', billingSchema);
