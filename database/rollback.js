#!/usr/bin/env node

/**
 * FlexJobs Database Rollback Script for PostgreSQL
 * This script drops the FlexJobs database and all its data
 */

const { Client } = require('pg');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: 'postgres' // Connect to default database
};

const targetDatabase = process.env.DB_NAME || 'flexjobs_db';

console.log('🗑️  Starting FlexJobs PostgreSQL Rollback...\n');

async function runRollback() {
  let client;
  
  try {
    // Connect to PostgreSQL server
    console.log('📡 Connecting to PostgreSQL server...');
    client = new Client(dbConfig);
    await client.connect();
    console.log('✅ Connected to PostgreSQL server\n');

    // Check if database exists
    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [targetDatabase]
    );

    if (result.rows.length === 0) {
      console.log(`ℹ️  Database '${targetDatabase}' does not exist. Nothing to rollback.`);
      return;
    }

    // Terminate all connections to the target database
    console.log(`🔌 Terminating connections to '${targetDatabase}'...`);
    await client.query(`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = $1 AND pid <> pg_backend_pid()
    `, [targetDatabase]);

    // Drop the database
    console.log(`🗑️  Dropping database '${targetDatabase}'...`);
    await client.query(`DROP DATABASE ${targetDatabase}`);
    console.log(`✅ Database '${targetDatabase}' dropped successfully\n`);

    console.log('🎉 Rollback completed successfully!');
    console.log(`\n📊 Rollback Summary:`);
    console.log(`   • Database '${targetDatabase}' has been completely removed`);
    console.log(`   • All tables, data, and indexes have been deleted`);
    console.log(`\n💡 To recreate the database, run: npm run migrate`);

  } catch (error) {
    console.error('\n❌ Rollback failed:', error.message);
    console.error('\n🔧 Please check:');
    console.error('   • PostgreSQL is running');
    console.error('   • Database credentials are correct in .env file');
    console.error('   • User has permission to drop databases');
    console.error('   • No active connections to the database');
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

// Run the rollback
runRollback();
