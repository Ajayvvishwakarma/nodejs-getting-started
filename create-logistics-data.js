const mongoose = require('mongoose')
const Logistics = require('./models/Logistics')

// Connection string
const mongoURL = 'mongodb+srv://ecomus-store:ecomus123@cluster0.j9y8s.mongodb.net/?retryWrites=true&w=majority'

async function createLogisticsData() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/ecomus-store')
    console.log('\n✅ Connected to MongoDB')

    // Delete existing Logistics data
    await Logistics.deleteMany({})
    console.log('🗑️  Cleared existing Logistics data')

    // Create Logistics data
    const logisticsData = new Logistics({
      totalShipments: 3450,
      deliveredPackages: 2890,
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      activeShipments: 450,
      averageDeliveryTime: 2.3, // days
      regions: [
        {
          name: 'North America',
          shipments: 1250,
          delivered: 1050,
          pending: 200,
          delayed: 8
        },
        {
          name: 'Europe',
          shipments: 890,
          delivered: 765,
          pending: 110,
          delayed: 5
        },
        {
          name: 'Asia Pacific',
          shipments: 750,
          delivered: 625,
          pending: 110,
          delayed: 3
        },
        {
          name: 'Latin America',
          shipments: 320,
          delivered: 280,
          pending: 35,
          delayed: 2
        },
        {
          name: 'Middle East & Africa',
          shipments: 240,
          delivered: 180,
          pending: 55,
          delayed: 1
        }
      ],
      deliveryStatus: [
        {
          status: 'Delivered',
          count: 2890,
          percentage: 83.8
        },
        {
          status: 'In Transit',
          count: 420,
          percentage: 12.2
        },
        {
          status: 'Processing',
          count: 30,
          percentage: 0.9
        },
        {
          status: 'Delayed',
          count: 19,
          percentage: 0.5
        }
      ],
      activeShipments: [
        {
          trackingNumber: 'TRK001254',
          origin: 'New York, USA',
          destination: 'Los Angeles, USA',
          status: 'In Transit',
          progress: 65,
          estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          carrier: 'FedEx'
        },
        {
          trackingNumber: 'TRK001255',
          origin: 'London, UK',
          destination: 'Berlin, Germany',
          status: 'In Transit',
          progress: 45,
          estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          carrier: 'DHL'
        },
        {
          trackingNumber: 'TRK001256',
          origin: 'Shanghai, China',
          destination: 'Tokyo, Japan',
          status: 'Processing',
          progress: 15,
          estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          carrier: 'UPS'
        },
        {
          trackingNumber: 'TRK001257',
          origin: 'Toronto, Canada',
          destination: 'Vancouver, Canada',
          status: 'In Transit',
          progress: 78,
          estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          carrier: 'Canada Post'
        },
        {
          trackingNumber: 'TRK001258',
          origin: 'Sydney, Australia',
          destination: 'Melbourne, Australia',
          status: 'In Transit',
          progress: 55,
          estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          carrier: 'StarTrack'
        }
      ],
      topRoutes: [
        {
          route: 'USA to USA',
          shipments: 1080,
          avgDeliveryTime: 1.8,
          onTimePercentage: 94.2
        },
        {
          route: 'UK to Europe',
          shipments: 620,
          avgDeliveryTime: 2.1,
          onTimePercentage: 92.5
        },
        {
          route: 'China to Asia',
          shipments: 540,
          avgDeliveryTime: 3.2,
          onTimePercentage: 88.9
        },
        {
          route: 'USA to Canada',
          shipments: 320,
          avgDeliveryTime: 1.5,
          onTimePercentage: 96.1
        },
        {
          route: 'Europe to Middle East',
          shipments: 210,
          avgDeliveryTime: 4.5,
          onTimePercentage: 85.3
        }
      ],
      shipmentsChange: 8.5,
      deliveredChange: 5.2,
      activeChange: 3.1
    })

    await logisticsData.save()
    console.log('✅ Logistics data created successfully')
    console.log('\n📦 Logistics Data Summary:')
    console.log(`   Total Shipments: ${logisticsData.totalShipments}`)
    console.log(`   Delivered: ${logisticsData.deliveredPackages}`)
    console.log(`   Active Shipments: ${logisticsData.activeShipments.length}`)
    console.log(`   Regions: ${logisticsData.regions.length}`)
    console.log(`   Top Routes: ${logisticsData.topRoutes.length}`)
    console.log(`   Avg Delivery Time: ${logisticsData.averageDeliveryTime} days`)

    mongoose.connection.close()
    console.log('\n✅ Database connection closed')
  } catch (error) {
    console.error('❌ Error:', error.message)
    mongoose.connection.close()
    process.exit(1)
  }
}

createLogisticsData()
