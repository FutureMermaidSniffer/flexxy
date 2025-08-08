const session = require('express-session');

async function setupSessionMiddleware(app) {
    console.log('🔄 Setting up session middleware with memory store...');
    
    // Simple session configuration without Redis
    const sessionConfig = {
        secret: process.env.SESSION_SECRET || 'fallback-session-secret-change-this',
        resave: false,
        saveUninitialized: false,
        name: 'flexjobs.sid',
        cookie: {
            secure: false, // Set to true only if using HTTPS
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            sameSite: 'lax'
        },
        rolling: true,
        genid: () => {
            return require('crypto').randomBytes(16).toString('hex');
        }
    };
    
    // Apply session middleware
    app.use(session(sessionConfig));
    
    console.log('✅ Session middleware configured with memory store');
    
    return { sessionConfig };
}

module.exports = setupSessionMiddleware;

module.exports = setupSessionMiddleware;