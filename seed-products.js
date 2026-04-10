// seed-products.js
const mongoose = require('mongoose');

const uri = 'mongodb://localhost:27017/yourDatabaseName'; // Change to your DB name
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  image: String,
  category: String,
  brand: String,
  stock: Number,
  sku: String
});

const Product = mongoose.model('Product', productSchema);

const demoProducts = [
  {
    name: 'Demo T-Shirt',
    description: 'A stylish demo t-shirt.',
    price: 19.99,
    image: 'images/products/black-1.jpg',
    category: 'Apparel',
    brand: 'DemoBrand',
    stock: 100,
    sku: 'DEMO-TSHIRT-01'
  },
  {
    name: 'Demo Headphones',
    description: 'High quality demo headphones.',
    price: 49.99,
    image: 'images/products/headphone-black.jpg',
    category: 'Electronics',
    brand: 'DemoBrand',
    stock: 50,
    sku: 'DEMO-HEADPHONE-01'
  }
  // Add more demo products as needed
];

async function seed() {
  await Product.deleteMany({});
  await Product.insertMany(demoProducts);
  console.log('Demo products seeded!');
  mongoose.disconnect();
}

seed();
