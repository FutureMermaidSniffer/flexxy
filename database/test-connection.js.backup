const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    console.log('🔍 Testing database connection...\n');
    
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        charset: 'utf8mb4'
    };
    
    console.log('📋 Connection Configuration:');
    console.log(`   Host: ${config.host}`);
    console.log(`   User: ${config.user}`);
    console.log(`   Password: ${config.password ? '[SET]' : '[EMPTY]'}`);
    console.log('');
    
    try {
        const connection = await mysql.createConnection(config);
        console.log('✅ Successfully connected to MySQL server!');
        
        // Test server version
        const [version] = await connection.execute('SELECT VERSION() as version');
        console.log(`📊 MySQL Version: ${version[0].version}`);
        
        // Test database listing permission
        const [databases] = await connection.execute('SHOW DATABASES');
        console.log(`📁 Available databases: ${databases.length} found`);
        
        await connection.end();
        console.log('✅ Connection test completed successfully!');
        
        console.log('\n🚀 Ready to run migration:');
        console.log('   node database/migrations/migrate.js');
        
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.error('');
        
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Solutions:');
            console.log('   1. Make sure MySQL server is installed and running');
            console.log('   2. Check if MySQL service is started');
            console.log('   3. Verify the host and port (default: localhost:3306)');
            console.log('');
            console.log('🔧 Common fixes:');
            console.log('   • Windows: Start "MySQL" service in Services app');
            console.log('   • XAMPP: Start MySQL in XAMPP Control Panel');
            console.log('   • WAMP: Start MySQL in WAMP server');
            console.log('   • Command line: net start mysql');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('💡 Solutions:');
            console.log('   1. Check username and password in .env file');
            console.log('   2. Make sure the MySQL user has proper permissions');
            console.log('   3. Try connecting with root user and empty password');
        }
        
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    testConnection();
}

module.exports = testConnection;
