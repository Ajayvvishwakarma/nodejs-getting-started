const mongoose = require('mongoose');

const stocksSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    
    // Portfolio Stocks
    portfolio: [
      {
        symbol: String,
        company: String,
        price: Number,
        change: Number // percentage
      }
    ],
    
    // Portfolio Performance
    performanceMonthly: { type: Number, default: 0 },
    performanceQuarterly: { type: Number, default: 0 },
    performanceAnnually: { type: Number, default: 0 },
    
    // Trending Stocks
    trending: [
      {
        symbol: String,
        company: String,
        price: Number,
        change: Number,
        status: String // Short Stock, Buy Stock
      }
    ],
    
    // Watchlist
    watchlist: [
      {
        symbol: String,
        company: String,
        price: Number,
        change: Number
      }
    ],
    
    // Latest Transactions
    transactions: [
      {
        action: String, // Bought, Sell
        symbol: String,
        date: String,
        time: String,
        price: Number,
        category: String,
        status: String // Success, Pending, Failed
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Stocks', stocksSchema);
