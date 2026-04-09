const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/ecomus-store')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const user = await User.findOneAndUpdate(
      { email: 'admin@test.com' },
      {
        name: '',
        firstName: '',
        lastName: '',
        phone: '+ -',
        bio: 'System Administrator & E-commerce Manager',
        taxId: 'TAX-2024-001',
        address: {
          street: '  ',
          city: '',
          state: '',
          country: '',
          postalCode: ''
        }
      },
      { returnDocument: 'after' }
    );
    
    if (user) {
      console.log('\n✅ Admin user updated with REAL data!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('👤 Name:', user.name);
      console.log('📧 Email:', user.email);
      console.log('📱 Phone:', user.phone);
      console.log('📝 Bio:', user.bio);
      console.log('📍 Address:', `${user.address.street}, ${user.address.city}, ${user.address.country}`);
      console.log('🌍 Country:', user.address.country);
      console.log('🏙️  City:', user.address.city);
      console.log('📮 Postal Code:', user.address.postalCode);
      console.log('🆔 Tax ID:', user.taxId);
      console.log('🖼️ Profile Image:', user.profileImage?.substring(0, 50) + '...');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } else {
      console.log('❌ User not found');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
