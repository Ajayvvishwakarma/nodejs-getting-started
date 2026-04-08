const mongoose = require('mongoose');
const CRM = require('./models/CRM');

mongoose.connect('mongodb://localhost:27017/ecomus-store')
.then(async () => {
  console.log('Connected to MongoDB');

  try {
    // Delete existing CRM data
    await CRM.deleteMany({});

    // Create new CRM data with real metrics
    const crmData = new CRM({
      // Key Metrics
      activeDeal: 120369,
      revenueTotal: 234210,
      closedDeals: 874,
      
      // Comparison percentages
      activeDealChangePercent: 20,
      revenueChangePercent: 9.0,
      closedDealsChangePercent: -4.5,
      
      // Statistics - Monthly/Quarterly/Annually
      monthlyAvgProfit: 212142.12,
      monthlyProfitChangePercent: 23.2,
      quarterlyAvgProfit: 30321.23,
      quarterlyProfitChangePercent: -12.3,
      estimatedRevenue: 180000,
      estimatedRevenueChangePercent: 8.5,
      
      // Goals - June Goals
      marketingGoal: 30569,
      marketingProgress: 85,
      salesGoal: 20486,
      salesProgress: 55,
      
      // Sales Category
      salesCategory: [
        { name: 'Affiliate Program', percentage: 48, products: 2040 },
        { name: 'Direct Buy', percentage: 33, products: 1402 },
        { name: 'Adsense', percentage: 19, products: 510 }
      ],
      
      // Upcoming Schedule
      upcomingSchedule: [
        {
          date: 'Wed, 11 jan',
          time: '09:20 AM',
          title: 'Business Analytics Press',
          description: 'Exploring the Future of Data-Driven +6 more'
        },
        {
          date: 'Fri, 15 feb',
          time: '10:35 AM',
          title: 'Business Sprint',
          description: 'Techniques from Business Sprint +2 more'
        },
        {
          date: 'Thu, 18 mar',
          time: '1:15 AM',
          title: 'Customer Review Meeting',
          description: 'Insights from the Customer Review Meeting +8 more'
        }
      ],
      
      // Recent Orders/Deals
      recentOrders: [
        {
          dealId: 'DE124321',
          customer: { name: 'John Doe', initials: 'JD', email: 'johndeo@gmail.com' },
          product: 'Software License',
          value: 1850.34,
          closeDate: '2024-06-15',
          status: 'Complete'
        },
        {
          dealId: 'DE124322',
          customer: { name: 'Kierra Franci', initials: 'KF', email: 'kierra@gmail.com' },
          product: 'Software License',
          value: 1850.34,
          closeDate: '2024-06-15',
          status: 'Complete'
        },
        {
          dealId: 'DE124323',
          customer: { name: 'Emerson Workman', initials: 'EW', email: 'emerson@gmail.com' },
          product: 'Software License',
          value: 1850.34,
          closeDate: '2024-06-15',
          status: 'Pending'
        },
        {
          dealId: 'DE124324',
          customer: { name: 'Chance Philips', initials: 'CP', email: 'chance@gmail.com' },
          product: 'Software License',
          value: 1850.34,
          closeDate: '2024-06-15',
          status: 'Complete'
        },
        {
          dealId: 'DE124325',
          customer: { name: 'Terry Geidt', initials: 'TG', email: 'terry@gmail.com' },
          product: 'Software License',
          value: 1850.34,
          closeDate: '2024-06-15',
          status: 'Complete'
        }
      ]
    });

    await crmData.save();
    
    console.log('\n✅ Real-time CRM data created!');
    console.log('📊 CRM Metrics:');
    console.log(`   Active Deal: $${crmData.activeDeal.toLocaleString()} (+${crmData.activeDealChangePercent}%)`);
    console.log(`   Revenue Total: $${crmData.revenueTotal.toLocaleString()} (+${crmData.revenueChangePercent}%)`);
    console.log(`   Closed Deals: ${crmData.closedDeals} (${crmData.closedDealsChangePercent}%)`);
    console.log(`   Monthly Avg Profit: $${crmData.monthlyAvgProfit.toLocaleString()}`);
    console.log(`   Goals: Marketing $${crmData.marketingGoal.toLocaleString()} (${crmData.marketingProgress}%), Sales $${crmData.salesGoal.toLocaleString()} (${crmData.salesProgress}%)`);
    console.log(`   Sales Categories: 3 (Affiliate 48%, Direct Buy 33%, Adsense 19%)`);
    console.log(`   Upcoming Events: 3 scheduled`);
    console.log(`   Recent Orders: 5 deals`);

    process.exit(0);
  } catch (error) {
    console.error('Error creating CRM data:', error.message);
    process.exit(1);
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
