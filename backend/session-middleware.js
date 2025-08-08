const SessionManager = require('./session-manager');

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

module.exports = setupSessionMiddleware;