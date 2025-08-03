const bcrypt = require('bcryptjs');
const { insertOne, getOne } = require('./backend/database.js');

async function createAdminUser() {
  try {
    
    const existingAdmin = await getOne('SELECT * FROM users WHERE email = $1', ['admin@flexjobs.com']);
    
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      console.log('Email: admin@flexjobs.com');
      console.log('Password: admin123');
      console.log('User Type: admin');
      process.exit(0);
    }

    
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    
    const userId = await insertOne('users', {
      email: 'admin@flexjobs.com',
      password: hashedPassword,
      first_name: 'Admin',
      last_name: 'User',
      user_type: 'admin',
      is_active: true,
      email_verified: true,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('User ID:', userId);
    console.log('Email: admin@flexjobs.com');
    console.log('Password: admin123');
    console.log('User Type: admin');
    console.log('');
    console.log('🚀 How to access Admin Dashboard:');
    console.log('1. Start the FlexJobs server: npm run dev');
    console.log('2. Open: http:
    console.log('3. Click "Login" in the top menu');
    console.log('4. Enter the admin credentials above');
    console.log('5. After login, navigate to: http:
    console.log('');
    console.log('Or login directly at: http:
    
  } catch (error) {
    if (error.message.includes('duplicate key') || error.message.includes('UNIQUE constraint')) {
      console.log('ℹ️  Admin user already exists');
      console.log('Email: admin@flexjobs.com');
      console.log('Password: admin123');
    } else {
      console.error('❌ Error creating admin user:', error.message);
    }
  }
  process.exit(0);
}

createAdminUser();
