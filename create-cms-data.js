/**
 * Seed CMS data (Banners, Categories) for testing
 * Run with: node create-cms-data.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Banner = require('./models/Banner');
const Category = require('./models/Category');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/ecomus-store');
    console.log('✓ MongoDB connected');
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const seedCMS = async () => {
  try {
    // Sample banners
    const banners = [
      {
        title: 'Glamorous',
        subtitle: 'Discover elegance in every detail',
        image: '/uploads/banner-1.jpg',
        buttonText: 'Shop Now',
        buttonLink: '/products?category=glamorous',
        order: 1,
        isActive: true,
      },
      {
        title: 'Summer Collection',
        subtitle: 'New arrivals for the season',
        image: '/uploads/banner-2.jpg',
        buttonText: 'Explore',
        buttonLink: '/products?category=summer',
        order: 2,
        isActive: true,
      },
      {
        title: 'Sale Event',
        subtitle: 'Up to 50% off on selected items',
        image: '/uploads/banner-3.jpg',
        buttonText: 'View Deals',
        buttonLink: '/products?sale=true',
        order: 3,
        isActive: true,
      },
    ];

    // Sample categories
    const categories = [
      {
        name: 'Clothing',
        description: 'All kinds of clothing items',
        image: '/uploads/category-clothing.jpg',
        isActive: true,
      },
      {
        name: 'Accessories',
        description: 'Belts, bags, hats and more',
        image: '/uploads/category-accessories.jpg',
        isActive: true,
      },
      {
        name: 'Shoes',
        description: 'Footwear collection',
        image: '/uploads/category-shoes.jpg',
        isActive: true,
      },
      {
        name: 'Watches',
        description: 'Luxury and casual watches',
        image: '/uploads/category-watches.jpg',
        isActive: true,
      },
      {
        name: 'Glamorous',
        description: 'Premium collection',
        image: '/uploads/category-glamorous.jpg',
        isActive: true,
      },
    ];

    // Clear existing data
    await Banner.deleteMany({});
    await Category.deleteMany({});

    // Insert new data
    await Banner.insertMany(banners);
    await Category.insertMany(categories);

    console.log('✓ Banners created:', banners.length);
    console.log('✓ Categories created:', categories.length);
    console.log('\n📂 You can now manage these via API:\n');
    console.log('  GET    /api/cms/banners              - View all banners');
    console.log('  POST   /api/cms/banners              - Create banner (auth required)');
    console.log('  PUT    /api/cms/banners/:id          - Update banner (auth required)');
    console.log('  DELETE /api/cms/banners/:id          - Delete banner (auth required)');
    console.log('');
    console.log('  GET    /api/cms/categories           - View all categories');
    console.log('  POST   /api/cms/categories           - Create category (auth required)');
    console.log('  PUT    /api/cms/categories/:id       - Update category (auth required)');
    console.log('  DELETE /api/cms/categories/:id       - Delete category (auth required)');
    console.log('');
    console.log('  POST   /api/cms/upload               - Upload image (multipart/form-data)');

    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding data:', error.message);
    process.exit(1);
  }
};

connectDB().then(seedCMS);
