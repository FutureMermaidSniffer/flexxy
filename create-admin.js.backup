/**
 * Admin User Creation Script
 * Run this script on your production server to create admin users
 * 
 * Usage: node create-admin.js
 */

const bcrypt = require('bcryptjs');
const readline = require('readline');

// Import your database connection
const { getOne, insertOne } = require('./backend/database');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(question) {
    return new Promise(resolve => {
        rl.question(question, resolve);
    });
}

function askPassword(question) {
    return new Promise(resolve => {
        const stdin = process.stdin;
        stdin.setRawMode(true);
        stdin.resume();
        stdin.setEncoding('utf8');
        
        process.stdout.write(question);
        
        let password = '';
        stdin.on('data', function(char) {
            char = char + '';
            
            switch (char) {
                case '\n': case '\r': case '\u0004':
                    stdin.setRawMode(false);
                    stdin.pause();
                    process.stdout.write('\n');
                    resolve(password);
                    break;
                case '\u0003':
                    process.exit();
                    break;
                case '\u007f': // Backspace
                    if (password.length > 0) {
                        password = password.slice(0, -1);
                        process.stdout.write('\b \b');
                    }
                    break;
                default:
                    password += char;
                    process.stdout.write('*');
                    break;
            }
        });
    });
}

async function createAdmin() {
    try {
        console.log('🔐 Admin User Creation Tool');
        console.log('============================\n');

        // Get admin details
        const firstName = await askQuestion('First Name: ');
        const lastName = await askQuestion('Last Name: ');
        const email = await askQuestion('Email: ');
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('❌ Invalid email format');
            process.exit(1);
        }

        // Check if user already exists
        const existingUser = await getOne('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser) {
            console.log('❌ User with this email already exists');
            process.exit(1);
        }

        const password = await askPassword('Password (hidden): ');
        const confirmPassword = await askPassword('Confirm Password (hidden): ');

        if (password !== confirmPassword) {
            console.log('❌ Passwords do not match');
            process.exit(1);
        }

        if (password.length < 6) {
            console.log('❌ Password must be at least 6 characters long');
            process.exit(1);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create admin user
        const adminData = {
            first_name: firstName,
            last_name: lastName,
            email: email.toLowerCase(),
            password: hashedPassword,
            user_type: 'admin',
            is_active: true,
            is_verified: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const userId = await insertOne('users', adminData);

        console.log('\n✅ Admin user created successfully!');
        console.log(`📧 Email: ${email}`);
        console.log(`👤 Name: ${firstName} ${lastName}`);
        console.log(`🆔 User ID: ${userId}`);
        console.log(`🔑 Role: admin`);
        console.log('\nYou can now log in to the admin panel with these credentials.');

    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        process.exit(1);
    } finally {
        rl.close();
        process.exit(0);
    }
}

// Check if running directly
if (require.main === module) {
    createAdmin();
}

module.exports = { createAdmin };
