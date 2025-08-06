const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function fixSessionStore() {
    console.log('🚀 Implementing Redis session store for production...');
    
    const serverFilePath = path.join(process.cwd(), 'server.js');
    
    try {
        // Create package.json update script
        console.log('📦 Creating package.json update script...');
        
        const packageJsonContent = `
console.log('📦 Adding Redis session store dependencies...');
const fs = require('fs');
const path = require('path');

// Read package.json
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add redis and connect-redis dependencies if they don't exist
if (!packageJson.dependencies['redis']) {
    packageJson.dependencies['redis'] = '^4.6.7';
}

if (!packageJson.dependencies['connect-redis']) {
    packageJson.dependencies['connect-redis'] = '^7.1.0';
}

// Write updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('✅ Updated package.json with Redis dependencies');
console.log('⚠️ Don\\'t forget to run "npm install" to install the new dependencies!');
`;

        fs.writeFileSync(path.join(process.cwd(), 'add-redis-deps.js'), packageJsonContent);
        
        // Create Redis session store implementation
        console.log('🔄 Creating Redis session store implementation...');
        
        const redisConfigContent = `
// Redis session store configuration
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');

// Initialize Redis client
let redisClient;
let sessionStore;

// Configure Redis client and session store for production
if (process.env.NODE_ENV === 'production') {
  console.log('🔄 Initializing Redis session store for production...');
  
  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    legacyMode: false,
  });
  
  redisClient.on('error', (err) => {
    console.error('❌ Redis client error:', err);
  });
  
  redisClient.on('connect', () => {
    console.log('✅ Connected to Redis server');
  });
  
  // Connect to Redis server
  redisClient.connect().catch(console.error);
  
  // Create Redis session store
  sessionStore = new RedisStore({ 
    client: redisClient,
    prefix: 'flexjobs:sess:'
  });
  
  console.log('✅ Redis session store configured for production');
} else {
  console.log('⚠️ Using MemoryStore for development only');
  sessionStore = null; // Will default to MemoryStore in dev
}

module.exports = { sessionStore, redisClient };`;

        const redisConfigDir = path.join(process.cwd(), 'backend', 'config');
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(redisConfigDir)) {
            fs.mkdirSync(redisConfigDir, { recursive: true });
        }
        
        fs.writeFileSync(path.join(redisConfigDir, 'redis.js'), redisConfigContent);
        
        // Create session store update script
        console.log('🔄 Creating session store update script...');
        
        const updateSessionContent = `
const fs = require('fs');
const path = require('path');

// Read server.js
const serverFilePath = path.join(process.cwd(), 'server.js');
let serverContent = fs.readFileSync(serverFilePath, 'utf8');

// Check if Redis import already exists
if (!serverContent.includes('const { sessionStore }')) {
  // Add Redis import after session import
  serverContent = serverContent.replace(
    "const session = require('express-session');",
    "const session = require('express-session');\n// Import Redis session store (for production)\nconst { sessionStore } = require('./backend/config/redis');"
  );

  // Update session configuration to use Redis store in production
  serverContent = serverContent.replace(
    "app.use(session({",
    \`app.use(session({
  store: process.env.NODE_ENV === 'production' ? sessionStore : undefined, // Use Redis in production\`
  );
  
  // Write updated server.js
  fs.writeFileSync(serverFilePath, serverContent);
  console.log('✅ Updated server.js with Redis session store configuration');
} else {
  console.log('⚠️ Redis session store configuration already exists in server.js');
}
`;

        fs.writeFileSync(path.join(process.cwd(), 'update-session-store.js'), updateSessionContent);
        
        console.log('🎉 Session store fix preparation completed successfully!');
        console.log('\n📋 Instructions for your Linux server:');
        console.log('1. Upload these files to your server');
        console.log('2. Run: node add-redis-deps.js');
        console.log('3. Run: npm install');
        console.log('4. Run: node update-session-store.js');
        console.log('5. Ensure Redis is installed on your server');
        console.log('6. Add REDIS_URL to your .env file if needed');
        console.log('7. Restart your application');
    } catch (error) {
        console.error(`❌ Error preparing session store fix: ${error.message}`);
    }
}

// Run the fix if this file is executed directly
if (require.main === module) {
    fixSessionStore()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('Fix failed:', error);
            process.exit(1);
        });
}

module.exports = { fixSessionStore };
