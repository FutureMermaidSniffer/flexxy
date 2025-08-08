const { Client } = require('pg');
require('dotenv').config();

async function addSalaryTypeColumn() {
    const connectionConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5433,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'flexjobs_db',
    };

    console.log('🚀 Adding salary_type column to jobs table...');
    console.log(`📌 Database: ${connectionConfig.database} on ${connectionConfig.host}:${connectionConfig.port}`);

    const client = new Client(connectionConfig);
    
    try {
        await client.connect();
        console.log('✅ Connected to database');
        
        // Check if column already exists
        const checkResult = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='jobs' AND column_name='salary_type'
        `);
        
        if (checkResult.rows.length > 0) {
            console.log('✅ salary_type column already exists in jobs table');
        } else {
            // Add the column
            await client.query(`
                ALTER TABLE jobs 
                ADD COLUMN salary_type VARCHAR(50) DEFAULT 'fixed' 
                CHECK (salary_type IN ('fixed', 'range', 'hourly', 'negotiable', 'competitive'))
            `);
            console.log('✅ salary_type column added to jobs table');
            
            // Update existing jobs to have a default value
            await client.query(`
                UPDATE jobs SET salary_type = 'fixed' WHERE salary_type IS NULL
            `);
            console.log('✅ Updated existing jobs with default salary_type');
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
    addSalaryTypeColumn()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('Migration failed:', error);
            process.exit(1);
        });
}

module.exports = { addSalaryTypeColumn };
