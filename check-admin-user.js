const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/ecomus-store')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const user = await User.findOne({ email: 'admin@test.com' });
    if (user) {
      console.log('✅ Admin User Found:');
      console.log('📧 Email:', user.email);
      console.log('👤 Name:', user.name);
      console.log('🖼️ Profile Image:', user.profileImage);
      console.log('📝 Bio:', user.bio);
      console.log('⭐ Role:', user.role);
    } else {
      console.log('❌ Admin user not found');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
