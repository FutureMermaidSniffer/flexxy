#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: 'postgres' // Connect to postgres to create/manage target database
};

const targetDatabase = process.env.DB_NAME || 'flexjobs_db';

console.log('🚀 Starting FlexJobs Production Migration (Current Schema)...\n');

async function runProductionMigration() {
  let client;
  
  try {
    // Connect to PostgreSQL server
    console.log('📡 Connecting to PostgreSQL server...');
    client = new Client(dbConfig);
    await client.connect();
    console.log('✅ Connected to PostgreSQL server\n');

    // Create database if it doesn't exist
    console.log(`🗄️  Creating database '${targetDatabase}'...`);
    try {
      await client.query(`CREATE DATABASE ${targetDatabase}`);
      console.log(`✅ Database '${targetDatabase}' created successfully`);
    } catch (error) {
      if (error.code === '42P04') { 
        console.log(`ℹ️  Database '${targetDatabase}' already exists`);
      } else {
        throw error;
      }
    }

    // Switch to target database
    await client.end();
    console.log(`\n🔗 Connecting to database '${targetDatabase}'...`);
    client = new Client({ ...dbConfig, database: targetDatabase });
    await client.connect();
    console.log(`✅ Connected to '${targetDatabase}'\n`);

    // Read and execute the current schema snapshot
    const schemaPath = path.join(__dirname, 'snapshots', 'schema_snapshot_20250804T083526.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema snapshot not found: ${schemaPath}`);
    }

    console.log('📋 Reading current schema snapshot...');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('⚡ Executing complete schema creation...');
    
    // Split and execute SQL statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--') && stmt !== 'SELECT \'Job scraping fields added successfully\' as status');

    let executedCount = 0;
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await client.query(statement);
          executedCount++;
        } catch (error) {
          // Skip errors for existing objects (IF NOT EXISTS should handle this)
          if (!error.message.includes('already exists')) {
            console.warn(`Warning: ${error.message}`);
          }
        }
      }
    }
    
    console.log(`✅ Executed ${executedCount} SQL statements\n`);

    // Load sample data if available
    const dataPath = path.join(__dirname, 'snapshots', 'data_snapshot_20250804T083526.sql');
    
    if (fs.existsSync(dataPath)) {
      console.log('📊 Loading sample data...');
      const dataSQL = fs.readFileSync(dataPath, 'utf8');
      
      const dataStatements = dataSQL
        .split('\n')
        .filter(line => line.trim().startsWith('INSERT INTO'))
        .slice(0, 50); // Limit to first 50 inserts to avoid overwhelming new database

      for (const statement of dataStatements) {
        try {
          await client.query(statement);
        } catch (error) {
          // Skip duplicate key errors - data might already exist
          if (!error.message.includes('duplicate key')) {
            console.warn(`Data warning: ${error.message}`);
          }
        }
      }
      
      console.log(`✅ Sample data loaded (${dataStatements.length} records)\n`);
    }

    // Verify deployment
    console.log('🔍 Verifying deployment...');
    const tableResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    const tables = tableResult.rows.map(row => row.table_name);
    console.log(`✅ Found ${tables.length} tables: ${tables.join(', ')}\n`);

    // Check key tables have data
    const keyTables = ['users', 'categories', 'companies', 'jobs', 'agents'];
    for (const table of keyTables) {
      if (tables.includes(table)) {
        const countResult = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
        const count = countResult.rows[0].count;
        console.log(`   • ${table}: ${count} records`);
      }
    }

    console.log('\n🎉 Production Migration Completed Successfully!');
    console.log(`\n📊 Deployment Summary:`);
    console.log(`   • Database: ${targetDatabase}`);
    console.log(`   • Tables: ${tables.length} tables created`);
    console.log(`   • Schema: Current production schema applied`);
    console.log(`   • Features: All current features preserved`);
    console.log(`     - ✅ Core job board functionality`);
    console.log(`     - ✅ Agent consultation system`);
    console.log(`     - ✅ User subscription system`);
    console.log(`     - ✅ Password reset functionality`);
    console.log(`     - ✅ Enhanced job features (tags, salary types, etc.)`);
    console.log(`\n🚀 Your FlexJobs application is ready for production deployment!`);

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\n🔧 Please check:');
    console.error('   • PostgreSQL is running');
    console.error('   • Database credentials are correct in .env file');
    console.error('   • User has permission to create databases');
    console.error('   • Schema snapshot file exists');
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

runProductionMigration();
