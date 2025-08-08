const RedisStore = require('connect-redis').default;
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

module.exports = SessionManager;