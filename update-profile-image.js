const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/ecomus-store')
  .then(() => {
    console.log('Connected to MongoDB');
    
    User.findOneAndUpdate(
      { email: 'admin@test.com' },
      { 
        profileImage: 'https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff&bold=true&size=200',
        bio: 'System Administrator'
      },
      { returnDocument: 'after' }
    ).then(user => {
      if (user) {
        console.log('✅ Admin user updated with profile image!');
        console.log('📧 Email:', user.email);
        console.log('🖼️ Profile Image URL:', user.profileImage);
        console.log('📝 Bio:', user.bio);
      } else {
        console.log('❌ User not found');
      }
      process.exit(0);
    });
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
