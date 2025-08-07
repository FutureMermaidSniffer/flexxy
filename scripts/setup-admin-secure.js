#!/usr/bin/env node
/**
 * SECURE ADMIN SETUP - ONE TIME USE ONLY
 * 
 * This script creates an admin user ONLY when manually run.
 * Never runs automatically on server startup.
 * 
 * Usage: node scripts/setup-admin-secure.js
 * 
 * SECURITY FEATURES:
 * - Requires manual execution
 * - Prompts for secure password
 * - Validates password strength
 * - Prevents duplicate admin creation
 * - Logs security events
 */

const bcrypt = require('bcryptjs');
const readline = require('readline');
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'password',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5433, // Using consistent port
    database: process.env.POSTGRES_DB || 'flexjobs_db'
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Password strength validation
function validatePassword(password) {
    const minLength = 12;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
        return `Password must be at least ${minLength} characters long`;
    }
    if (!hasUpperCase) {
        return 'Password must contain at least one uppercase letter';
    }
    if (!hasLowerCase) {
        return 'Password must contain at least one lowercase letter';
    }
    if (!hasNumbers) {
        return 'Password must contain at least one number';
    }
    if (!hasSpecialChar) {
        return 'Password must contain at least one special character';
    }
    return null;
}

// Check if admin already exists
async function checkExistingAdmin() {
    try {
        const result = await pool.query(
            "SELECT id FROM users WHERE user_type = 'admin' LIMIT 1"
        );
        return result.rows.length > 0;
    } catch (error) {
        console.error('❌ Database error:', error.message);
        return false;
    }
}

// Create secure admin user
async function createSecureAdmin(email, password, firstName, lastName) {
    try {
        // Hash password with high salt rounds
        const saltRounds = 14; // Higher than default for admin
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const result = await pool.query(`
            INSERT INTO users (
                email, password, first_name, last_name, 
                user_type, is_active, email_verified, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, email, user_type
        `, [
            email,
            hashedPassword,
            firstName,
            lastName,
            'admin',
            true,
            true,
            new Date().toISOString()
        ]);

        return result.rows[0];
    } catch (error) {
        throw new Error(`Failed to create admin: ${error.message}`);
    }
}

// Main setup function
async function setupSecureAdmin() {
    console.log('🔐 SECURE ADMIN SETUP');
    console.log('====================');
    console.log('This script will create a secure admin user for production use.');
    console.log('');

    try {
        // Check if admin already exists
        const adminExists = await checkExistingAdmin();
        if (adminExists) {
            console.log('⚠️  Admin user already exists!');
            console.log('For security reasons, only one admin can be created.');
            process.exit(1);
        }

        // Get admin details
        const email = await new Promise(resolve => {
            rl.question('Enter admin email: ', resolve);
        });

        const firstName = await new Promise(resolve => {
            rl.question('Enter first name: ', resolve);
        });

        const lastName = await new Promise(resolve => {
            rl.question('Enter last name: ', resolve);
        });

        // Get secure password
        let password;
        let passwordValid = false;
        
        while (!passwordValid) {
            password = await new Promise(resolve => {
                rl.question('Enter secure password (12+ chars, mixed case, numbers, symbols): ', resolve);
            });

            const validationError = validatePassword(password);
            if (validationError) {
                console.log(`❌ ${validationError}`);
                console.log('Please try again.');
            } else {
                passwordValid = true;
            }
        }

        // Confirm password
        const confirmPassword = await new Promise(resolve => {
            rl.question('Confirm password: ', resolve);
        });

        if (password !== confirmPassword) {
            console.log('❌ Passwords do not match!');
            process.exit(1);
        }

        // Create admin
        console.log('');
        console.log('🔄 Creating secure admin user...');
        
        const admin = await createSecureAdmin(email, password, firstName, lastName);
        
        console.log('');
        console.log('✅ ADMIN USER CREATED SUCCESSFULLY!');
        console.log('===================================');
        console.log(`Admin ID: ${admin.id}`);
        console.log(`Email: ${admin.email}`);
        console.log(`Type: ${admin.user_type}`);
        console.log('');
        console.log('🔒 SECURITY REMINDER:');
        console.log('- Store credentials securely');
        console.log('- Delete this script after use');
        console.log('- Never commit passwords to version control');
        console.log('- Enable 2FA when available');

    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    } finally {
        rl.close();
        await pool.end();
    }
}

// Prevent accidental execution in production
if (process.env.NODE_ENV === 'production' && !process.env.FORCE_ADMIN_SETUP) {
    console.log('🚨 PRODUCTION SAFETY CHECK');
    console.log('This script is disabled in production for security.');
    console.log('To run in production, set FORCE_ADMIN_SETUP=true');
    process.exit(1);
}

// Run setup
setupSecureAdmin();
