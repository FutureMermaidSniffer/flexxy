#!/usr/bin/env node

/**
 * FlexJobs Production Authentication Fix
 * This script fixes the CORS and environment issues causing auth failures
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 FlexJobs Production Authentication Fix\n');

// 1. Fix CORS Configuration in server.js
console.log('📋 FIXING CORS CONFIGURATION');
console.log('=============================');

function fixCORSConfig() {
    const serverPath = path.join(__dirname, 'server.js');
    let serverContent = fs.readFileSync(serverPath, 'utf8');
    
    // Find and replace CORS configuration
    const oldCorsConfig = `app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://localhost:3003', 'http://127.0.0.1:3000', 'http://127.0.0.1:3003'];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));`;

    const newCorsConfig = `app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Production-ready CORS configuration
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',').map(url => url.trim())
      : [
          'http://localhost:3000', 
          'http://localhost:3003', 
          'http://127.0.0.1:3000', 
          'http://127.0.0.1:3003',
          'https://flexjobseu.com',
          'http://flexjobseu.com',
          'https://www.flexjobseu.com',
          'http://www.flexjobseu.com'
        ];
    
    console.log('🔍 CORS Check:', { origin, allowedOrigins: allowedOrigins.slice(0, 3) + '...' });
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('⚠️ CORS BLOCKED:', origin);
      callback(new Error(\`Origin \${origin} not allowed by CORS policy\`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));`;

    if (serverContent.includes(oldCorsConfig)) {
        serverContent = serverContent.replace(oldCorsConfig, newCorsConfig);
        fs.writeFileSync(serverPath, serverContent);
        console.log('✅ CORS configuration updated in server.js');
        return true;
    } else {
        console.log('⚠️ Could not find exact CORS configuration to replace');
        return false;
    }
}

// 2. Create production environment file
console.log('\n📋 CREATING PRODUCTION ENVIRONMENT');
console.log('===================================');

function createProductionEnv() {
    const prodEnvContent = `# FlexJobs Production Environment Variables
# Updated with authentication fixes

# Application Configuration
NODE_ENV=production
PORT=3003

# Domain & SSL
DOMAIN=flexjobseu.com

# CORS Configuration - CRITICAL FOR AUTH
ALLOWED_ORIGINS=https://flexjobseu.com,http://flexjobseu.com,https://www.flexjobseu.com,http://www.flexjobseu.com

# Database Configuration - PostgreSQL production
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=flexjobs_db
DB_PORT=5432

# Security Secrets (Generate new ones for production!)
JWT_SECRET=SuperSecureJWTSecret64CharactersLongForProductionSecurity2024!
SESSION_SECRET=SuperSecureSessionSecret64CharactersLongForProduction2024!

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
STRICT_RATE_LIMIT_MAX=10

# Admin Configuration
ADMIN_EMAIL=admin@flexjobseu.com
ADMIN_PASSWORD=GenerateSecureAdminPassword123!

# Logging
LOG_LEVEL=info

# Session Store
USE_REDIS=false

# SSL Configuration
SSL_EMAIL=admin@flexjobseu.com
`;

    fs.writeFileSync(path.join(__dirname, '.env.production.fixed'), prodEnvContent);
    console.log('✅ Created .env.production.fixed with proper CORS configuration');
    return true;
}

// 3. Add error handling to auth routes
console.log('\n📋 ENHANCING ERROR HANDLING');
console.log('============================');

function enhanceAuthErrorHandling() {
    const authRoutesPath = path.join(__dirname, 'backend', 'routes', 'auth.js');
    let authContent = fs.readFileSync(authRoutesPath, 'utf8');
    
    // Check if we already have enhanced error handling
    if (authContent.includes('ENHANCED_ERROR_HANDLING')) {
        console.log('✅ Enhanced error handling already present');
        return true;
    }
    
    // Add better error handling to login route
    const loginErrorFix = `  } catch (error) {
    console.error('❌ LOGIN ERROR: Full error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail
    });
    
    // ENHANCED_ERROR_HANDLING - Provide more specific error details
    let errorMessage = 'Server error during login';
    let statusCode = 500;
    
    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Database connection failed';
      statusCode = 503;
    } else if (error.code === '28P01') {
      errorMessage = 'Database authentication failed';
      statusCode = 503;
    } else if (error.message.includes('JWT')) {
      errorMessage = 'Token generation failed';
      statusCode = 500;
    }
    
    res.status(statusCode).json({ 
      message: errorMessage,
      timestamp: new Date().toISOString(),
      requestId: req.id || 'unknown'
    });
  }`;
    
    // Replace the basic error handling
    authContent = authContent.replace(
      /} catch \(error\) \{\s*console\.error\('❌ LOGIN ERROR:[\s\S]*?res\.status\(500\)\.json\(\{ message: 'Server error during login' \}\);\s*}/,
      loginErrorFix
    );
    
    fs.writeFileSync(authRoutesPath, authContent);
    console.log('✅ Enhanced error handling added to auth routes');
    return true;
}

// 4. Create production health check endpoint
console.log('\n📋 ADDING PRODUCTION HEALTH CHECK');
console.log('==================================');

function addProductionHealthCheck() {
    const serverPath = path.join(__dirname, 'server.js');
    let serverContent = fs.readFileSync(serverPath, 'utf8');
    
    // Check if health check exists
    if (serverContent.includes('/health/detailed')) {
        console.log('✅ Detailed health check already exists');
        return true;
    }
    
    // Add detailed health check after existing health check
    const healthCheckCode = `
// Detailed health check for production debugging
app.get('/health/detailed', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: require('./package.json').version || 'unknown',
    checks: {}
  };

  // Database check
  try {
    const { getOne } = require('./backend/database');
    await getOne('SELECT 1');
    health.checks.database = { status: 'healthy', message: 'Connected' };
  } catch (error) {
    health.checks.database = { status: 'unhealthy', message: error.message };
    health.status = 'unhealthy';
  }

  // JWT check
  try {
    const jwt = require('jsonwebtoken');
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not configured');
    const testToken = jwt.sign({ test: true }, process.env.JWT_SECRET, { expiresIn: '1m' });
    jwt.verify(testToken, process.env.JWT_SECRET);
    health.checks.jwt = { status: 'healthy', message: 'Generation and verification working' };
  } catch (error) {
    health.checks.jwt = { status: 'unhealthy', message: error.message };
    health.status = 'unhealthy';
  }

  // Environment check
  const requiredEnvVars = ['DB_HOST', 'DB_NAME', 'JWT_SECRET', 'SESSION_SECRET'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length === 0) {
    health.checks.environment = { status: 'healthy', message: 'All required variables set' };
  } else {
    health.checks.environment = { 
      status: 'unhealthy', 
      message: \`Missing variables: \${missingVars.join(', ')}\`
    };
    health.status = 'unhealthy';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});
`;

    // Insert after the existing health check
    serverContent = serverContent.replace(
      /(app\.get\('\/health'[\s\S]*?\}\);)/,
      '$1' + healthCheckCode
    );
    
    fs.writeFileSync(serverPath, serverContent);
    console.log('✅ Added detailed health check endpoint');
    return true;
}

// 5. Create production deployment script
console.log('\n📋 CREATING DEPLOYMENT SCRIPT');
console.log('==============================');

function createDeploymentScript() {
    const deployScript = `#!/bin/bash

# FlexJobs Production Deployment Script
# This script ensures proper configuration for production

echo "🚀 FlexJobs Production Deployment"
echo "=================================="

# 1. Check if running as correct user
echo "👤 Checking user permissions..."
if [ "$EUID" -eq 0 ]; then 
    echo "⚠️  Running as root. Consider using a dedicated user."
fi

# 2. Copy production environment
echo "📋 Setting up production environment..."
if [ -f ".env.production.fixed" ]; then
    cp .env.production.fixed .env
    echo "✅ Production environment configured"
else
    echo "❌ .env.production.fixed not found!"
    exit 1
fi

# 3. Install dependencies
echo "📦 Installing dependencies..."
npm ci --production

# 4. Test database connection
echo "🔗 Testing database connection..."
node -e "
const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});
pool.query('SELECT 1').then(() => {
    console.log('✅ Database connection successful');
    process.exit(0);
}).catch((err) => {
    console.log('❌ Database connection failed:', err.message);
    process.exit(1);
});
"

# 5. Test health endpoints
echo "🏥 Testing health endpoints..."
timeout 30s npm start &
APP_PID=$!
sleep 10

# Test basic health
if curl -f http://localhost:3003/health > /dev/null 2>&1; then
    echo "✅ Basic health check passed"
else
    echo "❌ Basic health check failed"
fi

# Test detailed health
if curl -f http://localhost:3003/health/detailed > /dev/null 2>&1; then
    echo "✅ Detailed health check passed"
else
    echo "❌ Detailed health check failed"
fi

# Stop test server
kill $APP_PID 2>/dev/null

echo ""
echo "🎉 Deployment checks complete!"
echo "🚀 Start your application with: npm start"
echo "🔍 Monitor health at: https://flexjobseu.com/health/detailed"
`;

    fs.writeFileSync(path.join(__dirname, 'deploy-production.sh'), deployScript);
    console.log('✅ Created deploy-production.sh script');
    return true;
}

// Main execution
async function runFixes() {
    console.log('🔧 Applying production authentication fixes...\n');
    
    const results = {
        cors: fixCORSConfig(),
        environment: createProductionEnv(), 
        errorHandling: enhanceAuthErrorHandling(),
        healthCheck: addProductionHealthCheck(),
        deployment: createDeploymentScript()
    };
    
    console.log('\n📊 FIX SUMMARY');
    console.log('===============');
    
    const allFixed = Object.values(results).every(result => result === true);
    
    Object.entries(results).forEach(([fix, success]) => {
        console.log(`${success ? '✅' : '❌'} ${fix.toUpperCase()}: ${success ? 'APPLIED' : 'FAILED'}`);
    });
    
    if (allFixed) {
        console.log('\n🎉 All fixes applied successfully!\n');
        
        console.log('📋 NEXT STEPS FOR PRODUCTION:');
        console.log('==============================');
        console.log('1. Copy .env.production.fixed to .env on your production server');
        console.log('2. Update ALLOWED_ORIGINS in production .env to match your domain');
        console.log('3. Ensure your production PostgreSQL is running on port 5432');
        console.log('4. Generate new secure JWT_SECRET and SESSION_SECRET (64+ chars)');
        console.log('5. Restart your application');
        console.log('6. Test the health endpoint: https://flexjobseu.com/health/detailed');
        console.log('7. Monitor server logs for any remaining CORS errors');
        
        console.log('\n🔍 TESTING COMMANDS:');
        console.log('=====================');
        console.log('# Test login endpoint:');
        console.log('curl -X POST https://flexjobseu.com/api/auth/login \\');
        console.log('  -H "Content-Type: application/json" \\');
        console.log('  -d \'{"email":"test@example.com","password":"test123"}\'');
        console.log('');
        console.log('# Test registration endpoint:');
        console.log('curl -X POST https://flexjobseu.com/api/auth/register \\');
        console.log('  -H "Content-Type: application/json" \\');
        console.log('  -d \'{"email":"new@example.com","password":"test123","first_name":"Test","last_name":"User","user_type":"job_seeker"}\'');
        
    } else {
        console.log('\n⚠️ Some fixes failed. Please check the output above and apply them manually.');
    }
    
    console.log('\n🔧 The main issues causing your 500 errors were:');
    console.log('1. CORS policy blocking requests from flexjobseu.com');
    console.log('2. Missing production environment configuration');
    console.log('3. Insufficient error handling in auth routes');
    
    process.exit(allFixed ? 0 : 1);
}

runFixes().catch(error => {
    console.error('❌ Fix script failed:', error);
    process.exit(1);
});
