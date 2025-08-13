#!/usr/bin/env node

/**
 * Production Migration Runner for flexjob.uk
 * Runs essential migrations in correct order
 */

const { Client } = require('pg');
require('dotenv').config();

const ESSENTIAL_MIGRATIONS = [
    {
        name: 'Add Recruiting Consultants (Agents)',
        file: 'add-recruiting-consultants.js',
        description: 'Creates agents table and populates with consultant data'
    },
    {
        name: 'Add Selected Agent ID to Users',
        file: 'add_selected_agent_id.js', 
        description: 'Adds selected_agent_id column to users table'
    },
    {
        name: 'Create Profile Submissions Table',
        file: 'create_profile_submissions_table.js',
        description: 'Creates separate table for profile form submissions'
    }
];

async function runProductionMigrations() {
    console.log('🚀 FlexJob.UK Production Migration Runner\n');
    
    const client = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5433,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
        await client.connect();
        console.log('✅ Connected to database\n');
        
        // Check which migrations are needed
        console.log('🔍 Checking migration status...\n');
        
        // Check agents table
        const agentsExists = await client.query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_name = 'agents'
        `);
        
        // Check selected_agent_id column
        const selectedAgentIdExists = await client.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'selected_agent_id'
        `);
        
        // Check profile_submissions table
        const profileSubmissionsExists = await client.query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_name = 'profile_submissions'
        `);
        
        const migrationStatus = {
            'add-recruiting-consultants.js': agentsExists.rows.length > 0,
            'add_selected_agent_id.js': selectedAgentIdExists.rows.length > 0,
            'create_profile_submissions_table.js': profileSubmissionsExists.rows.length > 0
        };
        
        console.log('📋 Migration Status:');
        ESSENTIAL_MIGRATIONS.forEach(migration => {
            const status = migrationStatus[migration.file] ? '✅ Applied' : '❌ Needed';
            console.log(`  ${status} - ${migration.name}`);
        });
        
        console.log('\n🎯 Running needed migrations...\n');
        
        for (const migration of ESSENTIAL_MIGRATIONS) {
            if (!migrationStatus[migration.file]) {
                console.log(`📦 Running: ${migration.name}`);
                console.log(`   Description: ${migration.description}`);
                
                try {
                    // Import and run the migration
                    const migrationModule = require(`./database/migrations/${migration.file}`);
                    
                    if (typeof migrationModule.runMigration === 'function') {
                        await migrationModule.runMigration();
                        console.log(`   ✅ ${migration.name} completed\n`);
                    } else {
                        console.log(`   ⚠️  ${migration.name} - no runMigration function found\n`);
                    }
                } catch (error) {
                    console.error(`   ❌ ${migration.name} failed:`, error.message);
                    console.log('   Continuing with next migration...\n');
                }
            } else {
                console.log(`⏭️  Skipping: ${migration.name} (already applied)\n`);
            }
        }
        
        console.log('🎉 Migration process completed!');
        
        // Final status check
        console.log('\n📊 Final Database Status:');
        const finalTables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        
        const requiredTables = ['users', 'agents', 'profile_submissions', 'jobs', 'companies'];
        requiredTables.forEach(tableName => {
            const exists = finalTables.rows.find(row => row.table_name === tableName);
            console.log(`  ${exists ? '✅' : '❌'} ${tableName}`);
        });
        
    } catch (error) {
        console.error('❌ Migration process failed:', error);
    } finally {
        await client.end();
    }
}

// Run if called directly
if (require.main === module) {
    runProductionMigrations();
}

module.exports = { runProductionMigrations };
