const { Pool } = require('pg');
require('dotenv').config();

async function testConnection() {
    console.log('🔍 Testing PostgreSQL database connection...\n');
    
    const config = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'flexjobs_db'
    };
    
    console.log('📋 Connection Configuration:');
    console.log(`   Host: ${config.host}`);
    console.log(`   Port: ${config.port}`);
    console.log(`   User: ${config.user}`);
    console.log(`   Database: ${config.database}`);
    console.log(`   Password: ${config.password ? '[SET]' : '[EMPTY]'}`);
    console.log('');
    
    const pool = new Pool(config);
    
    try {
        const client = await pool.connect();
        console.log('✅ Successfully connected to PostgreSQL server!');
        
        const versionResult = await client.query('SELECT version()');
        console.log(`📊 PostgreSQL Version: ${versionResult.rows[0].version.split(' ')[1]}`);
        
        // Test if our database exists
        const dbResult = await client.query(
            "SELECT datname FROM pg_catalog.pg_database WHERE datname = $1",
            [config.database]
        );
        
        if (dbResult.rows.length > 0) {
            console.log(`✅ Database '${config.database}' exists`);
            
            // Test tables in our database
            const tablesResult = await client.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name
            `);
            
            console.log(`📁 Tables in ${config.database}: ${tablesResult.rows.length} found`);
            if (tablesResult.rows.length > 0) {
                tablesResult.rows.forEach(row => {
                    console.log(`   - ${row.table_name}`);
                });
                
                // Check specifically for required tables
                const requiredTables = ['users', 'agents'];
                const existingTables = tablesResult.rows.map(row => row.table_name);
                
                console.log('\n🔍 Required Table Check:');
                requiredTables.forEach(table => {
                    if (existingTables.includes(table)) {
                        console.log(`   ✅ ${table} table exists`);
                    } else {
                        console.log(`   ❌ ${table} table missing`);
                    }
                });
                
                // Check agents table specifically
                if (existingTables.includes('agents')) {
                    const agentCount = await client.query('SELECT COUNT(*) FROM agents');
                    console.log(`   📊 Agents in database: ${agentCount.rows[0].count}`);
                }
                
                // Check users table for wizard fields
                if (existingTables.includes('users')) {
                    const userColumnsResult = await client.query(`
                        SELECT column_name 
                        FROM information_schema.columns 
                        WHERE table_name = 'users' 
                        AND column_name IN ('is_temp_account', 'created_via_wizard', 'work_type_preference')
                    `);
                    
                    if (userColumnsResult.rows.length >= 3) {
                        console.log('   ✅ Users table has wizard fields');
                    } else {
                        console.log('   ⚠️  Users table missing some wizard fields');
                    }
                }
            } else {
                console.log('   ⚠️  No tables found - database needs to be migrated');
            }
        } else {
            console.log(`❌ Database '${config.database}' does not exist`);
        }
        
        client.release();
        console.log('\n🎉 Database connection test completed successfully!');
        
    } catch (error) {
        console.error('❌ Connection failed!');
        console.error('Error details:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Troubleshooting tips:');
            console.log('   - Is PostgreSQL running?');
            console.log('   - Check if PostgreSQL is listening on the correct port');
            console.log('   - Verify host and port in .env file');
        } else if (error.code === '28P01') {
            console.log('\n💡 Authentication failed:');
            console.log('   - Check username and password in .env file');
            console.log('   - Verify PostgreSQL user permissions');
        } else if (error.code === '3D000') {
            console.log('\n💡 Database does not exist:');
            console.log('   - Run database migration script first');
            console.log('   - Create database manually if needed');
        }
        
        process.exit(1);
    } finally {
        await pool.end();
    }
}

if (require.main === module) {
    testConnection().catch(console.error);
}

module.exports = testConnection;


if (require.main === module) {
    testConnection().catch(console.error);
}

module.exports = testConnection;
