const mongoose = require('mongoose');
const Marketing = require('./models/Marketing');

mongoose.connect('mongodb://localhost:27017/ecomus-store')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Delete existing marketing data
      await Marketing.deleteMany({});
      
      // Create new marketing record
      const marketing = new Marketing({
        // Client Rating
        avgClientRating: 7.8,
        ratingChangePercent: 20,
        
        // Instagram
        instagramFollowers: 5934,
        instagramChangePercent: -3.59,
        
        // Revenue
        totalRevenue: 9758,
        revenueChangePercent: 15,
        revenueChangeValue: '+7.96%',
        
        // Featured Campaigns
        campaigns: [
          {
            creator: 'Wilson Gouse',
            campaign: 'Grow your brand by...',
            brand: 'Brand Campaign',
            status: 'Success',
            createdAt: new Date()
          },
          {
            creator: 'Terry Franci',
            campaign: 'Make Better Ideas...',
            brand: 'Brand Campaign',
            status: 'Pending',
            createdAt: new Date()
          },
          {
            creator: 'Alena Franci',
            campaign: 'Increase your website tra...',
            brand: 'Brand Campaign',
            status: 'Success',
            createdAt: new Date()
          },
          {
            creator: 'Jocelyn Kenter',
            campaign: 'Digital Marketing that...',
            brand: 'Brand Campaign',
            status: 'Failed',
            createdAt: new Date()
          },
          {
            creator: 'Brandon Philips',
            campaign: 'Self branding',
            brand: 'Brand Campaign',
            status: 'Success',
            createdAt: new Date()
          },
          {
            creator: 'James Lipshutz',
            campaign: 'Increase your website tra...',
            brand: 'Brand Campaign',
            status: 'Success',
            createdAt: new Date()
          }
        ],
        
        // Subscribers & Conversion
        newSubscribers: 567000,
        subscribersChangePercent: 3.85,
        conversionRate: 276000,
        conversionChangePercent: -5.39,
        
        // Page Bounce Rate
        pageBounceRate: 285,
        bounceRateChangePercent: 12.74,
        
        // Top Traffic Sources
        trafficSources: [
          { source: 'Google', icon: 'google', percentage: 79 },
          { source: 'YouTube', icon: 'youtube', percentage: 55 },
          { source: 'Facebook', icon: 'facebook', percentage: 48 },
          { source: 'Instagram', icon: 'instagram', percentage: 48 }
        ]
      });
      
      await marketing.save();
      
      console.log('\n✅ Real-time marketing data created!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📊 Marketing Metrics:');
      console.log(`   Avg Client Rating: ${marketing.avgClientRating}/10 (+${marketing.ratingChangePercent}%)`);
      console.log(`   Instagram Followers: ${marketing.instagramFollowers.toLocaleString()}`);
      console.log(`   Total Revenue: $${marketing.totalRevenue.toLocaleString()}`);
      console.log(`   New Subscribers: ${(marketing.newSubscribers / 1000).toFixed(0)}K`);
      console.log(`   Conversion Rate: ${(marketing.conversionRate / 1000).toFixed(0)}K`);
      console.log(`   Page Bounce Rate: ${marketing.pageBounceRate}`);
      console.log(`   Featured Campaigns: ${marketing.campaigns.length}`);
      console.log(`   Traffic Sources: ${marketing.trafficSources.length}`);
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
