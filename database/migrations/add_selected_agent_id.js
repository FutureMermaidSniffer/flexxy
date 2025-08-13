/**
 * Migration: Add selected_agent_id column to users table
 * Date: 2024-01-12
 * Description: Add foreign key column to track which recruiting consultant/agent a user selected
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'flexjobs_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
    });

    try {
        await client.connect();
        console.log('Connected to database');

        // Check if column already exists
        const columnExists = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'selected_agent_id'
        `);

        if (columnExists.rows.length > 0) {
            console.log('Column selected_agent_id already exists in users table');
            return;
        }

        // Check if agents table exists
        const agentsTableExists = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name = 'agents'
        `);

        if (agentsTableExists.rows.length === 0) {
            console.log('ERROR: agents table does not exist. Please create agents table first.');
            return;
        }

        console.log('Running migration: Add selected_agent_id column...');

        // Add selected_agent_id column
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN selected_agent_id INTEGER
        `);
        console.log('✓ Added selected_agent_id column to users table');

        // Add foreign key constraint
        await client.query(`
            ALTER TABLE users 
            ADD CONSTRAINT fk_users_selected_agent 
            FOREIGN KEY (selected_agent_id) REFERENCES agents(id) 
            ON DELETE SET NULL
        `);
        console.log('✓ Added foreign key constraint');

        // Add index for performance
        await client.query(`
            CREATE INDEX idx_users_selected_agent_id ON users(selected_agent_id)
        `);
        console.log('✓ Added index for selected_agent_id');

        // Add comment to document the column purpose
        await client.query(`
            COMMENT ON COLUMN users.selected_agent_id IS 'ID of the recruiting consultant/agent selected by the user during profile creation'
        `);
        console.log('✓ Added column comment');

        console.log('Migration completed successfully!');

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

// Run migration if called directly
if (require.main === module) {
    runMigration();
}

module.exports = { runMigration };
