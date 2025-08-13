const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'flexjobs_db',
    port: process.env.DB_PORT || 5432,
    password: process.env.DB_PASSWORD || 'postgres'
});

async function addAgentColumn() {
    try {
        // Check if selected_agent_id column exists
        const result = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'selected_agent_id'
        `);
        
        console.log('selected_agent_id column exists:', result.rows.length > 0);
        
        if (result.rows.length === 0) {
            console.log('Adding selected_agent_id column...');
            await pool.query('ALTER TABLE users ADD COLUMN selected_agent_id INTEGER REFERENCES agents(id)');
            console.log('✅ Column added successfully');
        } else {
            console.log('✅ Column already exists');
        }
        
        await pool.end();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

addAgentColumn();
