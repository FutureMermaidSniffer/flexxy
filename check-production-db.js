#!/usr/bin/env node

/**
 * Production Database Setup Script for flexjob.uk
 * This script checks database status and runs necessary migrations
 */

const { Client } = require('pg');
require('dotenv').config();

async function checkDatabaseStatus() {
    const client = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
        console.log('🔍 Checking database connection...');
        await client.connect();
        console.log('✅ Database connection successful!');
        
        console.log('\n📊 Checking existing tables...');
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        
        console.log('\n📋 Existing tables:');
        tables.rows.forEach(row => {
            console.log(`  - ${row.table_name}`);
        });
        
        // Check specific tables we need
        const requiredTables = ['users', 'agents', 'profile_submissions', 'jobs', 'companies'];
        console.log('\n🔍 Checking required tables:');
        
        for (const tableName of requiredTables) {
            const exists = tables.rows.find(row => row.table_name === tableName);
            if (exists) {
                console.log(`  ✅ ${tableName} - exists`);
                
                // Check row count
                const count = await client.query(`SELECT COUNT(*) FROM ${tableName}`);
                console.log(`     (${count.rows[0].count} records)`);
            } else {
                console.log(`  ❌ ${tableName} - missing`);
            }
        }
        
        // Check if profile_submissions table has correct structure
        if (tables.rows.find(row => row.table_name === 'profile_submissions')) {
            console.log('\n🔍 Checking profile_submissions table structure...');
            const columns = await client.query(`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_name = 'profile_submissions'
                ORDER BY ordinal_position
            `);
            
            console.log('   Columns:');
            columns.rows.forEach(col => {
                console.log(`     - ${col.column_name} (${col.data_type})`);
            });
        }
        
        // Check if agents table exists and has data
        if (tables.rows.find(row => row.table_name === 'agents')) {
            console.log('\n🔍 Checking agents data...');
            const agentCount = await client.query('SELECT COUNT(*) FROM agents');
            console.log(`   Agents count: ${agentCount.rows[0].count}`);
            
            if (parseInt(agentCount.rows[0].count) > 0) {
                // First check what columns exist in the agents table
                const agentColumns = await client.query(`
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'agents'
                    ORDER BY ordinal_position
                `);
                
                const columnNames = agentColumns.rows.map(row => row.column_name);
                console.log(`   Agents table columns: ${columnNames.join(', ')}`);
                
                // Query using the correct column names
                let sampleQuery = 'SELECT ';
                if (columnNames.includes('name')) {
                    sampleQuery += 'name';
                } else if (columnNames.includes('agent_name')) {
                    sampleQuery += 'agent_name as name';
                } else {
                    sampleQuery += 'id';
                }
                
                if (columnNames.includes('specializations')) {
                    sampleQuery += ', specializations';
                } else if (columnNames.includes('specialization')) {
                    sampleQuery += ', specialization as specializations';
                }
                
                sampleQuery += ' FROM agents LIMIT 3';
                
                try {
                    const sampleAgents = await client.query(sampleQuery);
                    console.log('   Sample agents:');
                    sampleAgents.rows.forEach(agent => {
                        let specs = 'No specializations';
                        try {
                            if (agent.specializations) {
                                const parsedSpecs = JSON.parse(agent.specializations);
                                specs = Array.isArray(parsedSpecs) ? parsedSpecs.join(', ') : agent.specializations;
                            }
                        } catch (e) {
                            specs = agent.specializations || 'No specializations';
                        }
                        console.log(`     - ${agent.name || agent.id} (${specs})`);
                    });
                } catch (queryError) {
                    console.log(`   Could not query agent details: ${queryError.message}`);
                }
            }
        } else {
            console.log('\n❌ Agents table does not exist yet');
        }
        
        console.log('\n🎯 Migration recommendations:');
        
        if (!tables.rows.find(row => row.table_name === 'profile_submissions')) {
            console.log('  📋 Run: node database/migrations/create_profile_submissions_table.js');
        }
        
        if (!tables.rows.find(row => row.table_name === 'agents')) {
            console.log('  👥 Run: node database/migrations/add-recruiting-consultants.js');
        }
        
        const usersTable = tables.rows.find(row => row.table_name === 'users');
        if (usersTable) {
            const userColumns = await client.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'selected_agent_id'
            `);
            
            if (userColumns.rows.length === 0) {
                console.log('  🔗 Run: node database/migrations/add_selected_agent_id.js');
            }
        }
        
    } catch (error) {
        console.error('❌ Database check failed:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Suggestions:');
            console.log('  - Check if PostgreSQL is running');
            console.log('  - Verify DB_HOST and DB_PORT in .env');
            console.log('  - Check firewall settings');
        }
        
        if (error.code === '28P01') {
            console.log('\n💡 Suggestions:');
            console.log('  - Check DB_USER and DB_PASSWORD in .env');
            console.log('  - Verify user permissions');
        }
        
        if (error.code === '3D000') {
            console.log('\n💡 Suggestions:');
            console.log('  - Check if database exists');
            console.log('  - Verify DB_NAME in .env');
        }
    } finally {
        await client.end();
    }
}

// Run the check
console.log('🚀 FlexJob.UK Database Setup Checker\n');
checkDatabaseStatus();
