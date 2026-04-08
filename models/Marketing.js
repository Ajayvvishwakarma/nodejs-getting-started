const mongoose = require('mongoose');

const marketingSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    
    // Client Rating
    avgClientRating: { type: Number, default: 0 }, // e.g. 7.8
    ratingChangePercent: { type: Number, default: 0 },
    
    // Social Media
    instagramFollowers: { type: Number, default: 0 },
    instagramChangePercent: { type: Number, default: 0 },
    
    // Revenue
    totalRevenue: { type: Number, default: 0 },
    revenueChangePercent: { type: Number, default: 0 },
    revenueChangeValue: { type: String, default: '+7.96%' },
    
    // Featured Campaigns
    campaigns: [
      {
        creator: String,
        campaign: String,
        brand: String,
        status: { type: String, enum: ['Success', 'Pending', 'Failed'] },
        createdAt: Date
      }
    ],
    
    // Subscribers & Conversion
    newSubscribers: { type: Number, default: 0 },
    subscribersChangePercent: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    conversionChangePercent: { type: Number, default: 0 },
    
    // Page Bounce Rate
    pageBounceRate: { type: Number, default: 0 },
    bounceRateChangePercent: { type: Number, default: 0 },
    
    // Top Traffic Sources
    trafficSources: [
      {
        source: String,
        icon: String,
        percentage: Number
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Marketing', marketingSchema);
