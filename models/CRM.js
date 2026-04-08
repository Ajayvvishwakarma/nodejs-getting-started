const mongoose = require('mongoose');

const crmSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    
    // Key Metrics
    activeDeal: { type: Number, default: 0 }, // Active Deal amount
    revenueTotal: { type: Number, default: 0 }, // Total Revenue
    closedDeals: { type: Number, default: 0 }, // Number of closed deals
    
    // Comparison percentages
    activeDealChangePercent: { type: Number, default: 0 },
    revenueChangePercent: { type: Number, default: 0 },
    closedDealsChangePercent: { type: Number, default: 0 },
    
    // Statistics - Monthly/Quarterly/Annually
    monthlyAvgProfit: { type: Number, default: 0 },
    monthlyProfitChangePercent: { type: Number, default: 0 },
    quarterlyAvgProfit: { type: Number, default: 0 },
    quarterlyProfitChangePercent: { type: Number, default: 0 },
    estimatedRevenue: { type: Number, default: 0 },
    estimatedRevenueChangePercent: { type: Number, default: 0 },
    
    // Goals - June Goals
    marketingGoal: { type: Number, default: 0 },
    marketingProgress: { type: Number, default: 0 }, // percentage
    salesGoal: { type: Number, default: 0 },
    salesProgress: { type: Number, default: 0 }, // percentage
    
    // Sales Category
    salesCategory: [
      {
        name: String,
        percentage: Number,
        products: Number
      }
    ],
    
    // Upcoming Schedule
    upcomingSchedule: [
      {
        date: String,
        time: String,
        title: String,
        description: String
      }
    ],
    
    // Recent Orders
    recentOrders: [
      {
        dealId: String,
        customer: {
          name: String,
          initials: String,
          email: String
        },
        product: String,
        value: Number,
        closeDate: String,
        status: String // Complete, Pending
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('CRM', crmSchema);
