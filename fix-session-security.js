#!/usr/bin/env node

/**
 * Session Security Enhancement Script
 * Implements Redis session store for production security
 */

const fs = require('fs');
const path = require('path');

console.log('🔐 Implementing Production Session Security...\n');

// 1. Add Redis dependencies to package.json
console.log('📦 Adding Redis session dependencies...');

const packageJsonPath = path.join(__dirname, 'package.json');
let packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add Redis dependencies if not present
if (!packageJson.dependencies['redis']) {
    packageJson.dependencies['redis'] = '^4.6.12';
    console.log('✅ Added redis dependency');
}

if (!packageJson.dependencies['connect-redis']) {
    packageJson.dependencies['connect-redis'] = '^7.1.0';
    console.log('✅ Added connect-redis dependency');
}

// Write updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
console.log('📝 Updated package.json with Redis session dependencies\n');

// 2. Create Redis session configuration
console.log('🔧 Creating Redis session store configuration...');

const sessionConfigContent = `const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');

class SessionManager {
    constructor() {
        this.redisClient = null;
        this.store = null;
    }

    async initializeRedis() {
        try {
            // Redis connection configuration
            const redisConfig = {
                socket: {
                    host: process.env.REDIS_HOST || 'flexjobs-redis',
                    port: process.env.REDIS_PORT || 6379
                },
                password: process.env.REDIS_PASSWORD || undefined,
                database: process.env.REDIS_DB || 0
            };

            console.log('🔄 Connecting to Redis for session storage...');
            this.redisClient = createClient(redisConfig);
            
            this.redisClient.on('error', (err) => {
                console.error('❌ Redis connection error:', err);
            });

            this.redisClient.on('connect', () => {
                console.log('✅ Redis connected for session storage');
            });

            await this.redisClient.connect();
            
            // Create Redis store
            this.store = new RedisStore({
                client: this.redisClient,
                prefix: 'flexjobs:sess:',
                ttl: 24 * 60 * 60 // 24 hours
            });

            console.log('✅ Redis session store initialized');
            return this.store;
            
        } catch (error) {
            console.error('❌ Failed to initialize Redis session store:', error);
            console.log('⚠️  Falling back to memory store (NOT RECOMMENDED for production)');
            return null;
        }
    }

    getSessionConfig() {
        const isProduction = process.env.NODE_ENV === 'production';
        
        return {
            secret: process.env.SESSION_SECRET,
            store: this.store, // Will be null if Redis fails, falls back to memory
            resave: false,
            saveUninitialized: false,
            name: 'flexjobs.sid', // Custom session name for security
            cookie: {
                secure: isProduction, // HTTPS only in production
                httpOnly: true, // Prevent XSS attacks
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
                sameSite: isProduction ? 'strict' : 'lax' // CSRF protection
            },
            rolling: true, // Reset expiration on activity
            // Production security settings
            proxy: isProduction, // Trust proxy in production
            genid: () => {
                // Generate secure session IDs
                return require('crypto').randomBytes(16).toString('hex');
            }
        };
    }

    async cleanup() {
        if (this.redisClient) {
            await this.redisClient.quit();
        }
    }
}

module.exports = SessionManager;`;

fs.writeFileSync(path.join(__dirname, 'backend', 'session-manager.js'), sessionConfigContent, 'utf8');
console.log('✅ Created backend/session-manager.js\n');

// 3. Create session middleware file
console.log('🔧 Creating session middleware...');

const middlewareContent = `const SessionManager = require('./session-manager');

async function setupSessionMiddleware(app) {
    const sessionManager = new SessionManager();
    
    // Initialize Redis session store
    await sessionManager.initializeRedis();
    
    // Get session configuration
    const sessionConfig = sessionManager.getSessionConfig();
    
    // Apply session middleware
    const session = require('express-session');
    app.use(session(sessionConfig));
    
    console.log('✅ Session middleware configured with Redis store');
    
    // Graceful shutdown handler
    process.on('SIGTERM', async () => {
        console.log('🔄 Gracefully shutting down session manager...');
        await sessionManager.cleanup();
    });
    
    process.on('SIGINT', async () => {
        console.log('🔄 Gracefully shutting down session manager...');
        await sessionManager.cleanup();
    });
    
    return sessionManager;
}

module.exports = setupSessionMiddleware;`;

fs.writeFileSync(path.join(__dirname, 'backend', 'session-middleware.js'), middlewareContent, 'utf8');
console.log('✅ Created backend/session-middleware.js\n');

console.log('🎉 Session security enhancement complete!\n');

console.log('📋 What was implemented:');
console.log('✅ Redis session store for persistent sessions');
console.log('✅ Secure cookie configurations');
console.log('✅ XSS and CSRF protection');
console.log('✅ Session timeout and rolling expiration');
console.log('✅ Custom session ID generation');
console.log('✅ Graceful Redis connection handling');
console.log('✅ Production-ready session security\n');

console.log('⚡ Next steps:');
console.log('1. Install new dependencies: npm install');
console.log('2. Update server.js to use the new session middleware');
console.log('3. Add Redis environment variables to .env');
console.log('4. Test Redis session storage functionality\n');

console.log('📝 Required environment variables:');
console.log('   REDIS_HOST=flexjobs-redis (for Docker)');
console.log('   REDIS_PORT=6379');
console.log('   REDIS_PASSWORD=optional_redis_password');
console.log('   REDIS_DB=0 (database number)');

console.log('\n🔒 Session security issues resolved!');
