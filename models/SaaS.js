const mongoose = require('mongoose');

const saasSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    
    // Key Metrics
    totalRevenue: { type: Number, default: 0 },
    activeSubscribers: { type: Number, default: 0 },
    churnRate: { type: Number, default: 0 }, // percentage
    mrr: { type: Number, default: 0 }, // Monthly Recurring Revenue
    
    // Comparison percentages
    revenueChangePercent: { type: Number, default: 0 },
    subscribersChangePercent: { type: Number, default: 0 },
    churnChangePercent: { type: Number, default: 0 },
    mrrChangePercent: { type: Number, default: 0 },
    
    // Subscription Plans
    plans: [
      {
        name: String,
        price: Number,
        subscribers: Number,
        percentage: Number
      }
    ],
    
    // Customer Segments
    segments: [
      {
        name: String,
        value: Number,
        percentage: Number
      }
    ],
    
    // Revenue Breakdown
    revenueBreakdown: [
      {
        source: String,
        amount: Number,
        percentage: Number
      }
    ],
    
    // Recent Transactions
    transactions: [
      {
        id: String,
        customer: String,
        plan: String,
        amount: Number,
        date: String,
        status: String // New, Upgrade, Downgrade, Cancelled
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('SaaS', saasSchema);
