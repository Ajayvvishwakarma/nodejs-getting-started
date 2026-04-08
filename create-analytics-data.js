const mongoose = require('mongoose');
const Analytics = require('./models/Analytics');

mongoose.connect('mongodb://localhost:27017/ecomus-store')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Delete existing analytics
      await Analytics.deleteMany({});
      
      // Create new analytics record
      const analytics = new Analytics({
        // Visitor metrics
        uniqueVisitors: 24700,
        totalPageviews: 55900,
        bounceRate: 54,
        visitDuration: '2m 56s',
        
        // Percentage changes
        visitorsChangePercent: 20,
        pageviewsChangePercent: 4,
        bounceRateChangePercent: -1.59,
        visitDurationChangePercent: 7,
        
        // Top Channels
        topChannels: [
          { source: 'Google', visitors: 4700 },
          { source: 'Facebook', visitors: 3400 },
          { source: 'Threads', visitors: 2900 },
          { source: 'LinkedIn', visitors: 1500 }
        ],
        
        // Top Pages
        topPages: [
          { url: 'tailadmin.com', pageviews: 4700 },
          { url: 'preview.tailadmin.com', pageviews: 3400 },
          { url: 'docs.tailadmin.com', pageviews: 2900 },
          { url: 'tailadmin.com/components', pageviews: 1500 }
        ],
        
        // Active Users
        liveVisitors: 588,
        avgDaily: 224,
        avgWeekly: 1400,
        avgMonthly: 22100,
        
        // Sessions by Device
        sessionsByDevice: [
          { device: 'Desktop', sessions: 45000, percentage: 65 },
          { device: 'Mobile', sessions: 18000, percentage: 26 },
          { device: 'Tablet', sessions: 7000, percentage: 9 }
        ],
        
        // Customer Demographics
        customersByCountry: [
          { country: 'USA', code: 'US', customers: 2379, percentage: 79 },
          { country: 'France', code: 'FR', customers: 589, percentage: 21 }
        ]
      });
      
      await analytics.save();
      
      console.log('\n✅ Real-time analytics data created!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📊 Analytics Metrics:');
      console.log(`   Unique Visitors: ${analytics.uniqueVisitors.toLocaleString()}`);
      console.log(`   Total Pageviews: ${analytics.totalPageviews.toLocaleString()}`);
      console.log(`   Bounce Rate: ${analytics.bounceRate}%`);
      console.log(`   Visit Duration: ${analytics.visitDuration}`);
      console.log(`   Live Visitors: ${analytics.liveVisitors}`);
      console.log(`   Top Channels: ${analytics.topChannels.length}`);
      console.log(`   Top Pages: ${analytics.topPages.length}`);
      console.log(`   Customer Countries: ${analytics.customersByCountry.length}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      process.exit(0);
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  });
