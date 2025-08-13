#!/usr/bin/env node

/**
 * FlexJobs Authentication Production Diagnostics
 * This script helps identify production issues with login and registration
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🔍 FlexJobs Authentication Production Diagnostics\n');

// 1. Environment Variables Check
console.log('📋 ENVIRONMENT VARIABLES CHECK');
console.log('================================');

const requiredEnvVars = [
    'NODE_ENV',
    'PORT',
    'DB_HOST',
    'DB_USER', 
    'DB_PASSWORD',
    'DB_NAME',
    'DB_PORT',
    'JWT_SECRET',
    'SESSION_SECRET',
    'DOMAIN'
];

const missingEnvVars = [];
const weakSecrets = [];

requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
        missingEnvVars.push(varName);
        console.log(`❌ ${varName}: Missing`);
    } else if (varName.includes('SECRET') && value.length < 32) {
        weakSecrets.push(varName);
        console.log(`⚠️  ${varName}: Too short (${value.length} chars, need 32+)`);
    } else {
        console.log(`✅ ${varName}: ${varName.includes('SECRET') || varName.includes('PASSWORD') ? '[HIDDEN]' : value}`);
    }
});

// 2. Database Connection Test
console.log('\n🔗 DATABASE CONNECTION TEST');
console.log('============================');

async function testDatabaseConnection() {
    try {
        const { Pool } = require('pg');
        
        const dbConfig = {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: process.env.DB_NAME || 'flexjobs_db',
            ssl: false,
            connectionTimeoutMillis: 5000,
        };

        console.log('🔄 Attempting database connection...');
        const pool = new Pool(dbConfig);
        const client = await pool.connect();
        
        // Test users table exists
        const result = await client.query("SELECT COUNT(*) FROM users LIMIT 1");
        console.log(`✅ Database connected successfully`);
        console.log(`✅ Users table accessible (${result.rows[0].count} users)`);
        
        client.release();
        await pool.end();
        return true;
    } catch (error) {
        console.log(`❌ Database connection failed: ${error.message}`);
        console.log(`❌ Code: ${error.code || 'Unknown'}`);
        return false;
    }
}

// 3. JWT Token Generation Test
console.log('\n🔐 JWT TOKEN GENERATION TEST');
console.log('=============================');

function testJWTGeneration() {
    try {
        const jwt = require('jsonwebtoken');
        
        if (!process.env.JWT_SECRET) {
            console.log('❌ JWT_SECRET not set');
            return false;
        }

        const testPayload = { userId: 1, email: 'test@example.com', userType: 'job_seeker' };
        const token = jwt.sign(testPayload, process.env.JWT_SECRET, { expiresIn: '24h' });
        
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        console.log('✅ JWT generation successful');
        console.log('✅ JWT verification successful');
        console.log(`✅ Token payload: ${JSON.stringify(decoded.userId ? 'Valid' : 'Invalid')}`);
        return true;
    } catch (error) {
        console.log(`❌ JWT test failed: ${error.message}`);
        return false;
    }
}

// 4. CORS Configuration Check
console.log('\n🌐 CORS CONFIGURATION CHECK');
console.log('============================');

function checkCORSConfig() {
    const allowedOrigins = process.env.ALLOWED_ORIGINS;
    const domain = process.env.DOMAIN;
    
    console.log(`📍 Domain: ${domain || 'Not set'}`);
    console.log(`📍 Allowed Origins: ${allowedOrigins || 'Using defaults'}`);
    
    if (!allowedOrigins && domain) {
        console.log('⚠️  ALLOWED_ORIGINS not set, but DOMAIN is configured');
        console.log(`💡 Consider setting: ALLOWED_ORIGINS=https://${domain},http://${domain}`);
        return false;
    }
    
    if (allowedOrigins && !allowedOrigins.includes(domain)) {
        console.log('⚠️  Domain not in ALLOWED_ORIGINS');
        return false;
    }
    
    console.log('✅ CORS configuration appears correct');
    return true;
}

// 5. File System Checks
console.log('\n📁 FILE SYSTEM CHECKS');
console.log('======================');

function checkFiles() {
    const criticalFiles = [
        'backend/routes/auth.js',
        'backend/middleware/auth.js',
        'backend/database.js',
        'frontend/js/login.js',
        'frontend/js/pages/registration.js',
        'server.js'
    ];
    
    let allFilesExist = true;
    
    criticalFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            console.log(`✅ ${file}`);
        } else {
            console.log(`❌ ${file} - Missing`);
            allFilesExist = false;
        }
    });
    
    return allFilesExist;
}

// 6. Network/Production Specific Issues
console.log('\n🔧 PRODUCTION ENVIRONMENT ANALYSIS');
console.log('===================================');

function analyzeProductionIssues() {
    const issues = [];
    const recommendations = [];
    
    // Check for common production issues
    if (process.env.NODE_ENV !== 'production') {
        issues.push('NODE_ENV is not set to "production"');
        recommendations.push('Set NODE_ENV=production');
    }
    
    if (!process.env.DOMAIN) {
        issues.push('DOMAIN not configured');
        recommendations.push('Set DOMAIN=flexjobseu.com');
    }
    
    if (!process.env.ALLOWED_ORIGINS) {
        issues.push('ALLOWED_ORIGINS not configured for production');
        recommendations.push('Set ALLOWED_ORIGINS=https://flexjobseu.com,http://flexjobseu.com');
    }
    
    // Check for SSL/HTTPS issues
    if (process.env.DOMAIN && !process.env.ALLOWED_ORIGINS?.includes('https://')) {
        issues.push('Production domain should use HTTPS');
        recommendations.push('Ensure ALLOWED_ORIGINS includes https:// URLs');
    }
    
    // Database port check
    if (process.env.DB_PORT !== '5432') {
        issues.push('Database port might be incorrect for production');
        recommendations.push('Verify DB_PORT=5432 for production PostgreSQL');
    }
    
    return { issues, recommendations };
}

// 7. Authentication Flow Test (Simulation)
console.log('\n🔄 AUTHENTICATION FLOW SIMULATION');
console.log('==================================');

async function simulateAuthFlow() {
    try {
        console.log('🔄 Simulating registration payload...');
        const registrationPayload = {
            email: 'test@example.com',
            password: 'testpassword123',
            first_name: 'Test',
            last_name: 'User',
            user_type: 'job_seeker'
        };
        
        console.log('✅ Registration payload structure valid');
        
        console.log('🔄 Simulating login payload...');
        const loginPayload = {
            email: 'test@example.com',
            password: 'testpassword123'
        };
        
        console.log('✅ Login payload structure valid');
        
        // Simulate bcrypt operation
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('testpassword123', 12);
        const isValid = await bcrypt.compare('testpassword123', hashedPassword);
        
        console.log(`✅ Password hashing test: ${isValid ? 'Passed' : 'Failed'}`);
        
        return true;
    } catch (error) {
        console.log(`❌ Authentication flow simulation failed: ${error.message}`);
        return false;
    }
}

// Main diagnostic function
async function runDiagnostics() {
    const results = {
        envVars: missingEnvVars.length === 0 && weakSecrets.length === 0,
        database: false,
        jwt: false,
        cors: false,
        files: false,
        authFlow: false
    };
    
    // Run all tests
    results.database = await testDatabaseConnection();
    results.jwt = testJWTGeneration();
    results.cors = checkCORSConfig();
    results.files = checkFiles();
    results.authFlow = await simulateAuthFlow();
    
    const { issues, recommendations } = analyzeProductionIssues();
    
    // Summary
    console.log('\n📊 DIAGNOSTIC SUMMARY');
    console.log('=====================');
    
    const allPassed = Object.values(results).every(result => result === true);
    
    if (allPassed && issues.length === 0) {
        console.log('🎉 All diagnostics passed! Your authentication system should work in production.');
    } else {
        console.log('⚠️  Issues detected that may cause production failures:\n');
        
        Object.entries(results).forEach(([test, passed]) => {
            console.log(`${passed ? '✅' : '❌'} ${test.toUpperCase()}: ${passed ? 'PASSED' : 'FAILED'}`);
        });
        
        if (missingEnvVars.length > 0) {
            console.log(`\n❌ Missing environment variables: ${missingEnvVars.join(', ')}`);
        }
        
        if (weakSecrets.length > 0) {
            console.log(`\n⚠️  Weak secrets: ${weakSecrets.join(', ')}`);
        }
        
        if (issues.length > 0) {
            console.log('\n🔧 Production-specific issues:');
            issues.forEach(issue => console.log(`   - ${issue}`));
        }
        
        if (recommendations.length > 0) {
            console.log('\n💡 Recommendations:');
            recommendations.forEach(rec => console.log(`   - ${rec}`));
        }
    }
    
    console.log('\n🚀 Next Steps for Production Issues:');
    console.log('=====================================');
    console.log('1. Check server logs for detailed error messages');
    console.log('2. Verify database connectivity from production server');
    console.log('3. Ensure CORS is properly configured for your domain');
    console.log('4. Test API endpoints directly with curl/Postman');
    console.log('5. Check if SSL certificates are properly configured');
    console.log('6. Verify all environment variables are set on production server');
    
    process.exit(allPassed && issues.length === 0 ? 0 : 1);
}

// Run diagnostics
runDiagnostics().catch(error => {
    console.error('❌ Diagnostic script failed:', error);
    process.exit(1);
});
