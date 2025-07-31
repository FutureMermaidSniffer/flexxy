const bcrypt = require('bcryptjs');
const { insertOne } = require('./backend/database.js');

async function createTestUser() {
  try {
    const hashedPassword = await bcrypt.hash('test123', 12);
    const userId = await insertOne('users', {
      email: 'test@example.com',
      password: hashedPassword,
      first_name: 'Test',
      last_name: 'User',
      user_type: 'job_seeker',
      is_active: true,
      email_verified: true,
      created_at: new Date(),
      updated_at: new Date()
    });
    console.log('✅ Test user created successfully!');
    console.log('User ID:', userId);
    console.log('Email: test@example.com');
    console.log('Password: test123');
  } catch (error) {
    if (error.message.includes('duplicate key')) {
      console.log('ℹ️  Test user already exists');
      console.log('Email: test@example.com');
      console.log('Password: test123');
    } else {
      console.error('❌ Error creating test user:', error.message);
    }
  }
  process.exit(0);
}

createTestUser();
