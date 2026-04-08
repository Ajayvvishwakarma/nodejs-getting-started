const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/ecomus-store', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB');

  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('random123', salt);

    // Create the new user with real data
    const newUser = new User({
      name: 'Rajan Kumar',
      email: 'randomuser@pimjo.com',
      password: hashedPassword,
      phone: '+91 98765 43210',
      bio: 'Business Analyst | Data Enthusiast | Tech Innovator',
      profileImage: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Rajan',
      taxId: 'TAX-987654321',
      address: '456 Business Street, Mumbai, Maharashtra 400001, India',
      role: 'admin'
    });

    await newUser.save();
    console.log('\n✅ New user created successfully!');
    console.log('📊 User Details:');
    console.log(`   Name: ${newUser.name}`);
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Phone: ${newUser.phone}`);
    console.log(`   Bio: ${newUser.bio}`);
    console.log(`   Address: ${newUser.address}`);
    console.log(`   Role: ${newUser.role}`);
    console.log('\n🔐 Login Credentials:');
    console.log(`   Email: randomuser@pimjo.com`);
    console.log(`   Password: random123`);

    process.exit(0);
  } catch (error) {
    console.error('Error creating user:', error.message);
    process.exit(1);
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
