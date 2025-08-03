/**
 * Auto Admin Creation from Environment Variables
 * Add this to your server.js or create a separate init script
 * 
 * Set these environment variables:
 * ADMIN_EMAIL=admin@yoursite.com
 * ADMIN_PASSWORD=your-secure-password
 * ADMIN_FIRSTNAME=Admin
 * ADMIN_LASTNAME=User
 */

const bcrypt = require('bcryptjs');
const { getOne, insertOne } = require('./backend/database');

async function createAdminFromEnv() {
    try {
        // Only run if environment variables are set
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const adminFirstName = process.env.ADMIN_FIRSTNAME || 'Admin';
        const adminLastName = process.env.ADMIN_LASTNAME || 'User';

        if (!adminEmail || !adminPassword) {
            console.log('ℹ️ ADMIN_EMAIL or ADMIN_PASSWORD not set, skipping admin creation');
            return;
        }

        // Check if admin already exists
        const existingAdmin = await getOne('SELECT id FROM users WHERE email = ?', [adminEmail.toLowerCase()]);
        if (existingAdmin) {
            console.log('ℹ️ Admin user already exists');
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(adminPassword, 12);

        // Create admin user
        const adminData = {
            first_name: adminFirstName,
            last_name: adminLastName,
            email: adminEmail.toLowerCase(),
            password: hashedPassword,
            user_type: 'admin',
            is_active: true,
            is_verified: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const userId = await insertOne('users', adminData);

        console.log('✅ Admin user created from environment variables');
        console.log(`📧 Email: ${adminEmail}`);
        console.log(`🆔 User ID: ${userId}`);

        // Clear environment variables for security
        delete process.env.ADMIN_PASSWORD;

    } catch (error) {
        console.error('❌ Error creating admin from environment:', error.message);
    }
}

module.exports = { createAdminFromEnv };
