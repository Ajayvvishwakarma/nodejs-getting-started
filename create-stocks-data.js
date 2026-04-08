const mongoose = require('mongoose');
const Stocks = require('./models/Stocks');

mongoose.connect('mongodb://localhost:27017/ecomus-store')
.then(async () => {
  console.log('Connected to MongoDB');

  try {
    // Delete existing Stocks data
    await Stocks.deleteMany({});

    // Create new Stocks data with real metrics
    const stocksData = new Stocks({
      // Portfolio Stocks
      portfolio: [
        { symbol: 'AAPL', company: 'Apple, Inc', price: 1232.00, change: 11.01 },
        { symbol: 'PYPL', company: 'Paypal, Inc', price: 965.00, change: 9.05 },
        { symbol: 'TSLA', company: 'Tesla, Inc', price: 1232.00, change: 11.01 },
        { symbol: 'AMZN', company: 'Amazon.com, Inc', price: 2567.99, change: 11.01 }
      ],
      
      // Portfolio Performance
      performanceMonthly: 5.25,
      performanceQuarterly: 12.80,
      performanceAnnually: 28.45,
      
      // Trending Stocks
      trending: [
        { symbol: 'TSLA', company: 'Tesla, Inc', price: 192.53, change: 1.01, status: 'Short Stock' },
        { symbol: 'AAPL', company: 'Apple, Inc', price: 192.53, change: 3.59, status: 'Buy Stock' },
        { symbol: 'SPOT', company: 'Spotify, Inc', price: 192.53, change: 1.01, status: 'Short Stock' },
        { symbol: 'PYPL', company: 'Paypal, Inc', price: 192.53, change: 1.01, status: 'Buy Stock' },
        { symbol: 'AMZN', company: 'Amazon, Inc', price: 192.53, change: 1.01, status: 'Short Stock' }
      ],
      
      // Watchlist
      watchlist: [
        { symbol: 'AAPL', company: 'Apple, Inc', price: 4008.65, change: 11.01 },
        { symbol: 'SPOT', company: 'Spotify.com', price: 11689.00, change: 9.48 },
        { symbol: 'ABNB', company: 'Airbnb, Inc', price: 32227.00, change: 0.29 },
        { symbol: 'ENVT', company: 'Envato, Inc', price: 13895.00, change: 3.79 },
        { symbol: 'QIWI', company: 'qiwi.com, Inc', price: 4008.65, change: 4.52 },
        { symbol: 'AAPL', company: 'Apple, Inc', price: 4008.65, change: 11.01 },
        { symbol: 'SPOT', company: 'Spotify.com', price: 11689.00, change: 9.48 },
        { symbol: 'ABNB', company: 'Airbnb, Inc', price: 32227.00, change: 0.29 },
        { symbol: 'ENVT', company: 'Envato, Inc', price: 13895.00, change: 3.79 },
        { symbol: 'QIWI', company: 'qiwi.com, Inc', price: 4008.65, change: 4.52 }
      ],
      
      // Latest Transactions
      transactions: [
        {
          action: 'Bought',
          symbol: 'PYPL',
          date: 'Nov 23',
          time: '01:00 PM',
          price: 2567.88,
          category: 'Finance',
          status: 'Success'
        },
        {
          action: 'Bought',
          symbol: 'AAPL',
          date: 'Nov 22',
          time: '09:00 PM',
          price: 2567.88,
          category: 'Technology',
          status: 'Pending'
        },
        {
          action: 'Sell',
          symbol: 'KKST',
          date: 'Oct 12',
          time: '03:54 PM',
          price: 6754.99,
          category: 'Finance',
          status: 'Success'
        },
        {
          action: 'Bought',
          symbol: 'FB',
          date: 'Sep 09',
          time: '02:00 AM',
          price: 1445.41,
          category: 'Social Media',
          status: 'Success'
        },
        {
          action: 'Sell',
          symbol: 'AMZN',
          date: 'Feb 14',
          time: '08:00 PM',
          price: 5698.55,
          category: 'E-commerce',
          status: 'Failed'
        }
      ]
    });

    await stocksData.save();
    
    console.log('\n✅ Real-time Stocks data created!');
    console.log('📊 Stocks Metrics:');
    console.log(`   Portfolio Stocks: ${stocksData.portfolio.length}`);
    console.log(`   Portfolio Performance: Monthly ${stocksData.performanceMonthly}%, Quarterly ${stocksData.performanceQuarterly}%, Annually ${stocksData.performanceAnnually}%`);
    console.log(`   Trending Stocks: ${stocksData.trending.length}`);
    console.log(`   Watchlist Items: ${stocksData.watchlist.length}`);
    console.log(`   Transactions: ${stocksData.transactions.length}`);

    process.exit(0);
  } catch (error) {
    console.error('Error creating Stocks data:', error.message);
    process.exit(1);
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
