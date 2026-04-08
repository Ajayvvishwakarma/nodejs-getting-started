const mongoose = require('mongoose')
const SaaS = require('./models/SaaS')

// Connection string
const mongoURL = 'mongodb+srv://ecomus-store:ecomus123@cluster0.j9y8s.mongodb.net/?retryWrites=true&w=majority'

async function createSaaSData() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/ecomus-store')
    console.log('\n✅ Connected to MongoDB')

    // Delete existing SaaS data
    await SaaS.deleteMany({})
    console.log('🗑️  Cleared existing SaaS data')

    // Create SaaS data
    const saasData = new SaaS({
      totalRevenue: 125450.75,
      activeSubscribers: 2450,
      churnRate: 2.3,
      monthlyRecurringRevenue: 12542.50,
      plans: [
        {
          name: 'Starter',
          price: 29,
          subscribers: 845,
          currency: 'USD'
        },
        {
          name: 'Professional',
          price: 79,
          subscribers: 1204,
          currency: 'USD'
        },
        {
          name: 'Enterprise',
          price: 199,
          subscribers: 401,
          currency: 'USD'
        }
      ],
      segments: [
        {
          name: 'New Customers',
          count: 324,
          revenue: 8950.50,
          growth: 12.5
        },
        {
          name: 'Active Users',
          count: 1829,
          revenue: 95420.25,
          growth: 8.2
        },
        {
          name: 'At Risk',
          count: 297,
          revenue: 21080.00,
          growth: -5.3
        }
      ],
      revenueBreakdown: [
        {
          month: 'January',
          amount: 118500
        },
        {
          month: 'February',
          amount: 121800
        },
        {
          month: 'March',
          amount: 125450
        }
      ],
      transactions: [
        {
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          amount: 79,
          plan: 'Professional',
          customer: 'Acme Corp',
          status: 'completed'
        },
        {
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          amount: 199,
          plan: 'Enterprise',
          customer: 'TechStart Inc',
          status: 'completed'
        },
        {
          date: new Date(),
          amount: 29,
          plan: 'Starter',
          customer: 'Sam Studios',
          status: 'completed'
        }
      ],
      revenueChange: 5.2,
      subscriberChange: 2.1,
      churnChange: -0.5
    })

    await saasData.save()
    console.log('✅ SaaS data created successfully')
    console.log('\n📊 SaaS Data Summary:')
    console.log(`   Total Revenue: $${saasData.totalRevenue}`)
    console.log(`   Active Subscribers: ${saasData.activeSubscribers}`)
    console.log(`   Churn Rate: ${saasData.churnRate}%`)
    console.log(`   Plans: ${saasData.plans.length}`)
    console.log(`   Segments: ${saasData.segments.length}`)
    console.log(`   Transactions: ${saasData.transactions.length}`)

    mongoose.connection.close()
    console.log('\n✅ Database connection closed')
  } catch (error) {
    console.error('❌ Error:', error.message)
    mongoose.connection.close()
    process.exit(1)
  }
}

createSaaSData()
