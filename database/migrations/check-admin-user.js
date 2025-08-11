const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'flexjobs_db',
  port: process.env.DB_PORT || 5433,
  password: process.env.DB_PASSWORD || 'postgres'
});

async function checkAdminUser() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking Admin User Details...\n');
    console.log('📊 Database Configuration:');
    console.log(`   • Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   • Port: ${process.env.DB_PORT || 5433}`);
    console.log(`   • Database: ${process.env.DB_NAME || 'flexjobs_db'}`);
    console.log(`   • User: ${process.env.DB_USER || 'postgres'}`);
    
    // Test database connection
    await client.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL server\n');
    
    // Check users table structure
    console.log('📋 Users Table Structure:');
    const tableStructure = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `);
    console.table(tableStructure.rows);
    
    // Count total users
    const userCount = await client.query('SELECT COUNT(*) as count FROM users');
    console.log(`\n👥 Total users in database: ${userCount.rows[0].count}`);
    
    // Find admin users
    console.log('\n🔐 Admin Users:');
    const adminUsers = await client.query(`
      SELECT id, email, first_name, last_name, user_type, is_active, email_verified, created_at
      FROM users 
      WHERE user_type = 'admin'
      ORDER BY created_at DESC
    `);
    
    if (adminUsers.rows.length > 0) {
      console.table(adminUsers.rows);
    } else {
      console.log('❌ No admin users found!');
    }
    
    // Check for the specific admin email from .env
    const envAdminEmail = process.env.ADMIN_EMAIL || 'admin@flexjobseu.com';
    console.log(`\n🔍 Checking for admin with email: ${envAdminEmail}`);
    
    const specificAdmin = await client.query(`
      SELECT id, email, first_name, last_name, user_type, is_active, email_verified, created_at
      FROM users 
      WHERE email = $1
    `, [envAdminEmail]);
    
    if (specificAdmin.rows.length > 0) {
      console.log('✅ Found admin user:');
      console.table(specificAdmin.rows);
    } else {
      console.log('❌ Admin user not found with that email!');
      
      // Show all users to help debug
      console.log('\n📋 All Users in Database:');
      const allUsers = await client.query(`
        SELECT id, email, first_name, last_name, user_type, is_active, created_at
        FROM users 
        ORDER BY created_at DESC
        LIMIT 10
      `);
      console.table(allUsers.rows);
    }
    
    // Check if we need to create an admin user
    if (adminUsers.rows.length === 0) {
      console.log('\n💡 No admin users found. Would you like to create one?');
      console.log('Environment admin configuration:');
      console.log(`   Email: ${process.env.ADMIN_EMAIL}`);
      console.log(`   Password: ${process.env.ADMIN_PASSWORD}`);
    }
    
  } catch (error) {
    console.error('❌ Error checking admin user:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Connection refused. Please check:');
      console.log('   1. PostgreSQL is running');
      console.log('   2. Database exists');
      console.log('   3. Port 5433 is correct');
      console.log('   4. Username/password are correct');
    }
  } finally {
    client.release();
    await pool.end();
  }
}

checkAdminUser()
  .then(() => {
    console.log('\n✅ Admin check completed!');
  })
  .catch((error) => {
    console.error('\n💥 Check failed:', error);
  });
