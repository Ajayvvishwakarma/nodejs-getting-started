const mongoose = require('mongoose');
const Product = require('./models/Product');
const Order = require('./models/Order');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/ecomus-store')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Get admin user ID
      const adminUser = await User.findOne({ email: 'admin@test.com' });
      if (!adminUser) {
        console.log('❌ Admin user not found');
        process.exit(1);
      }
      
      // Check existing data
      const productCount = await Product.countDocuments();
      const orderCount = await Order.countDocuments();
      
      console.log('📊 Current Database Status:');
      console.log(`   Products: ${productCount}`);
      console.log(`   Orders: ${orderCount}`);
      
      // Create sample products if none exist
      if (productCount === 0) {
        const products = [
          {
            name: 'Wireless Headphones',
            description: 'High-quality wireless headphones with noise cancellation',
            price: 199.99,
            stock: 45,
            category: 'Electronics',
            sku: 'WH-001',
            images: ['headphones.jpg'],
            rating: 4.5,
            sales: 125
          },
          {
            name: 'USB-C Cable',
            description: 'Durable USB-C charging cable',
            price: 19.99,
            stock: 150,
            category: 'Accessories',
            sku: 'UC-001',
            images: ['cable.jpg'],
            rating: 4.2,
            sales: 450
          },
          {
            name: 'Phone Case',
            description: 'Protective phone case with shockproof design',
            price: 29.99,
            stock: 8,
            category: 'Accessories',
            sku: 'PC-001',
            images: ['case.jpg'],
            rating: 4.3,
            sales: 200
          },
          {
            name: 'Screen Protector',
            description: 'Tempered glass screen protector',
            price: 14.99,
            stock: 3,
            category: 'Accessories',
            sku: 'SP-001',
            images: ['protector.jpg'],
            rating: 4.1,
            sales: 350
          },
          {
            name: 'Portable Charger',
            description: '20000mAh portable power bank',
            price: 49.99,
            stock: 30,
            category: 'Electronics',
            sku: 'PC-002',
            images: ['charger.jpg'],
            rating: 4.6,
            sales: 180
          }
        ];
        
        await Product.insertMany(products);
        console.log('✅ Created 5 sample products');
      }
      
      // Create sample orders if none exist
      if (orderCount === 0) {
        const orders = [
          {
            orderNumber: 'ORD-001',
            customer: 'John Doe',
            userId: adminUser._id,
            totalAmount: 249.98,
            status: 'Completed',
            paymentStatus: 'Paid',
            items: ['Wireless Headphones', 'USB-C Cable'],
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
          },
          {
            orderNumber: 'ORD-002',
            customer: 'Jane Smith',
            userId: adminUser._id,
            totalAmount: 94.96,
            status: 'Pending',
            paymentStatus: 'Pending',
            items: ['Phone Case', 'Screen Protector'],
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
          },
          {
            orderNumber: 'ORD-003',
            customer: 'Bob Johnson',
            userId: adminUser._id,
            totalAmount: 199.99,
            status: 'Shipped',
            paymentStatus: 'Paid',
            items: ['Portable Charger'],
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
          },
          {
            orderNumber: 'ORD-004',
            customer: 'Alice Brown',
            userId: adminUser._id,
            totalAmount: 314.95,
            status: 'Processing',
            paymentStatus: 'Paid',
            items: ['Wireless Headphones', 'Phone Case', 'USB-C Cable'],
            createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
          },
          {
            orderNumber: 'ORD-005',
            customer: 'Michael Wilson',
            userId: adminUser._id,
            totalAmount: 64.98,
            status: 'Completed',
            paymentStatus: 'Paid',
            items: ['Portable Charger', 'Screen Protector'],
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
          }
        ];
        
        await Order.insertMany(orders);
        console.log('✅ Created 5 sample orders');
      }
      
      console.log('\n✅ Real-time sample data created successfully!');
      console.log('📊 Dashboard will now show:');
      console.log('   - Total Products: 5');
      console.log('   - Total Orders: 5');
      console.log('   - Total Revenue: $924.86');
      console.log('   - Recent Orders table with real data');
      
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
