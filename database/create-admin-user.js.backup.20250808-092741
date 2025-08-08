#!/usr/bin/env node

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createAdminUser() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'flexjobs_db',
  });

  try {
    console.log('🔍 Checking for existing admin users...\n');

    // Check existing admin users
    const existingAdmins = await pool.query(
      "SELECT id, email, first_name, last_name FROM users WHERE user_type = 'admin'"
    );

    if (existingAdmins.rows.length > 0) {
      console.log('✅ Existing admin users found:');
      existingAdmins.rows.forEach(admin => {
        console.log(`   - ${admin.email} (${admin.first_name} ${admin.last_name})`);
      });
      console.log('\n🎯 You can use any of these to log in to the admin panel.');
      return;
    }

    console.log('❌ No admin users found. Creating new admin user...\n');

    // Create admin user
    const adminData = {
      email: process.env.ADMIN_EMAIL || 'admin@flexjobs.com',
      password: process.env.ADMIN_PASSWORD || 'change-me-in-production', // SECURITY: Set in environment
      first_name: 'Admin',
      last_name: 'User',
      user_type: 'admin'
    };

    // Hash password
    const hashedPassword = await bcrypt.hash(adminData.password, 12);

    // Insert admin user
    const result = await pool.query(`
      INSERT INTO users (
        email, password, first_name, last_name, user_type, 
        is_active, email_verified, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING id, email, first_name, last_name, user_type;
    `, [
      adminData.email,
      hashedPassword,
      adminData.first_name,
      adminData.last_name,
      adminData.user_type,
      true, // is_active
      true  // email_verified
    ]);

    const newAdmin = result.rows[0];

    console.log('✅ Admin user created successfully!\n');
    console.log('📧 Admin Login Credentials:');
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Password: ${adminData.password}`);
    console.log(`   User ID: ${newAdmin.id}`);
    console.log('\n🚀 You can now log in to the admin panel at:');
    console.log('   http://localhost:3000/login');
    console.log('\n⚠️  IMPORTANT: Change the admin password after first login!');

  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      console.log('⚠️  Admin user with this email already exists.');
      console.log('   Try logging in with: admin@flexjobs.com / admin123');
    } else {
      console.error('❌ Failed to create admin user:', error);
    }
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  createAdminUser();
}

module.exports = createAdminUser;
