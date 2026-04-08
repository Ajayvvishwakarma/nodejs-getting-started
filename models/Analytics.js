const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    
    // Unique Visitors & Pageviews
    uniqueVisitors: { type: Number, default: 0 },
    totalPageviews: { type: Number, default: 0 },
    bounceRate: { type: Number, default: 0 }, // percentage
    visitDuration: { type: String, default: '0m 0s' }, // format: "2m 56s"
    
    // Comparison with last month
    visitorsChangePercent: { type: Number, default: 0 },
    pageviewsChangePercent: { type: Number, default: 0 },
    bounceRateChangePercent: { type: Number, default: 0 },
    visitDurationChangePercent: { type: Number, default: 0 },
    
    // Top Channels
    topChannels: [
      {
        source: String,
        visitors: Number
      }
    ],
    
    // Top Pages
    topPages: [
      {
        url: String,
        pageviews: Number
      }
    ],
    
    // Active Users
    liveVisitors: { type: Number, default: 0 },
    avgDaily: { type: Number, default: 0 },
    avgWeekly: { type: Number, default: 0 },
    avgMonthly: { type: Number, default: 0 },
    
    // Sessions by Device
    sessionsByDevice: [
      {
        device: String,
        sessions: Number,
        percentage: Number
      }
    ],
    
    // Customer Demographics
    customersByCountry: [
      {
        country: String,
        code: String,
        customers: Number,
        percentage: Number
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Analytics', analyticsSchema);
