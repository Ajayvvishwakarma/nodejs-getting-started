const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const JWT_SECRET = 'your-secret-key-here-change-in-production';

mongoose.connect('mongodb://localhost:27017/ecomus-store')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Find admin user
    const user = await User.findOne({ email: 'admin@test.com' });
    if (!user) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }
    
    // Generate valid token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('✅ Valid JWT Token Generated:');
    console.log(token);
    console.log('\n📍 Test API with this token:');
    console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:5006/api/dashboard/stats`);
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
