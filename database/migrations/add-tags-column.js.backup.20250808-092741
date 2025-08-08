const { Client } = require('pg');
require('dotenv').config();

async function addTagsColumn() {
    const connectionConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5433,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'flexjobs_db',
    };

    console.log('🚀 Adding tags column to jobs table...');
    console.log(`📌 Database: ${connectionConfig.database} on ${connectionConfig.host}:${connectionConfig.port}`);

    const client = new Client(connectionConfig);
    
    try {
        await client.connect();
        console.log('✅ Connected to database');
        
        // Check if column already exists
        const checkResult = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='jobs' AND column_name='tags'
        `);
        
        if (checkResult.rows.length > 0) {
            console.log('✅ tags column already exists in jobs table');
        } else {
            // Add the column
            await client.query(`
                ALTER TABLE jobs 
                ADD COLUMN tags TEXT[]
            `);
            console.log('✅ tags column added to jobs table');
            
            // Create an index on the tags column for better performance
            await client.query(`
                CREATE INDEX IF NOT EXISTS idx_jobs_tags ON jobs USING GIN(tags)
            `);
            console.log('✅ Created index on tags column');
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
    addTagsColumn()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('Migration failed:', error);
            process.exit(1);
        });
}

module.exports = { addTagsColumn };
