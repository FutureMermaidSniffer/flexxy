const { Client } = require('pg');
require('dotenv').config();

async function addVerificationColumn() {
    const connectionConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'flexjobs_db',
    };

    console.log('🚀 Adding is_verified column to users table...');
    console.log(`📌 Database: ${connectionConfig.database} on ${connectionConfig.host}:${connectionConfig.port}`);

    const client = new Client(connectionConfig);
    
    try {
        await client.connect();
        console.log('✅ Connected to database');
        
        // Check if column already exists
        const checkResult = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='is_verified'
        `);
        
        if (checkResult.rows.length > 0) {
            console.log('✅ is_verified column already exists in users table');
        } else {
            // Add the column
            await client.query(`
                ALTER TABLE users 
                ADD COLUMN is_verified BOOLEAN DEFAULT FALSE
            `);
            console.log('✅ is_verified column added to users table');
            
            // Update existing users based on email_verified
            await client.query(`
                UPDATE users SET is_verified = email_verified WHERE is_verified IS NULL
            `);
            console.log('✅ Updated existing users with is_verified value based on email_verified');
        }
        
        console.log('🎉 Migration completed successfully!');
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
        console.log('✅ Database connection closed');
    }
}

// Run the migration if this file is executed directly
if (require.main === module) {
    addVerificationColumn()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('Migration failed:', error);
            process.exit(1);
        });
}

module.exports = { addVerificationColumn };
