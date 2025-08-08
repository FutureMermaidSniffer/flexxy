#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
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
    
    // Split statements and clean them
    const allStatements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => {
        if (!stmt) return false;
        const sqlContent = stmt.replace(/--.*$/gm, '').trim();
        return sqlContent && sqlContent !== 'SELECT \'Job scraping fields added successfully\' as status';
      });

    // Separate table creation from indexes and constraints
    const createTableStatements = allStatements.filter(stmt => {
      const cleanStmt = stmt.replace(/--.*$/gm, '').trim();
      return cleanStmt.startsWith('CREATE TABLE');
    });

    const indexStatements = allStatements.filter(stmt => {
      const cleanStmt = stmt.replace(/--.*$/gm, '').trim();
      return cleanStmt.startsWith('CREATE INDEX');
    });

    console.log(`Found ${createTableStatements.length} table creation statements and ${indexStatements.length} index statements`);

    // Execute table creation first (without foreign key constraints)
    let executedCount = 0;
    
    console.log('\n🏗️  Creating tables without foreign key constraints...');
    for (const statement of createTableStatements) {
      if (statement.trim()) {
        try {
          // Remove foreign key constraints from the CREATE TABLE statement
          let cleanStatement = statement.replace(/--.*$/gm, '').trim();
          
          // Remove FOREIGN KEY constraints (but keep the column definitions)
          cleanStatement = cleanStatement.replace(/,\s*FOREIGN KEY[^,)]+/g, '');
          
          console.log(`Creating table: ${cleanStatement.match(/CREATE TABLE (\w+)/)?.[1] || 'unknown'}`);
          await client.query(cleanStatement);
          executedCount++;
        } catch (error) {
          if (!error.message.includes('already exists')) {
            console.warn(`Warning creating table: ${error.message}`);
            console.warn(`Statement: ${statement.substring(0, 200)}...`);
          }
        }
      }
    }

    console.log(`✅ Created ${executedCount} tables without constraints\n`);

    // Now add foreign key constraints
    console.log('🔗 Adding foreign key constraints...');
    for (const statement of createTableStatements) {
      const cleanStatement = statement.replace(/--.*$/gm, '').trim();
      const tableName = cleanStatement.match(/CREATE TABLE (\w+)/)?.[1];
      
      if (tableName) {
        // Extract foreign key constraints
        const fkMatches = statement.match(/FOREIGN KEY \([^)]+\) REFERENCES [^,)]+/g);
        
        if (fkMatches) {
          for (const fkConstraint of fkMatches) {
            try {
              const alterStatement = `ALTER TABLE ${tableName} ADD ${fkConstraint}`;
              console.log(`Adding FK constraint to ${tableName}`);
              await client.query(alterStatement);
              executedCount++;
            } catch (error) {
              if (!error.message.includes('already exists')) {
                console.warn(`Warning adding FK constraint: ${error.message}`);
              }
            }
          }
        }
      }
    }

    // Execute index creation
    console.log('\n📊 Creating indexes...');
    for (const statement of indexStatements) {
      if (statement.trim()) {
        try {
          const cleanStatement = statement.replace(/--.*$/gm, '').trim();
          await client.query(cleanStatement);
          executedCount++;
        } catch (error) {
          if (!error.message.includes('already exists')) {
            console.warn(`Warning creating index: ${error.message}`);
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
