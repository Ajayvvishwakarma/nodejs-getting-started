const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/ecomus-store')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const user = await User.findOneAndUpdate(
      { email: 'admin@test.com' },
      { name: '' },
      { returnDocument: 'after' }
    );
    
    if (user) {
      console.log('✅ Admin user updated!');
      console.log('👤 Name:', user.name);
      console.log('📧 Email:', user.email);
      console.log('🖼️ Profile Image:', user.profileImage);
      console.log('📝 Bio:', user.bio);
    } else {
      console.log('❌ User not found');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
