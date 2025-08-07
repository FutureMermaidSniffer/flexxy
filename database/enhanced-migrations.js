#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class FlexJobsMigrationManager {
  constructor() {
    this.dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5433,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'flexjobs_db'
    };
    this.migrationsDir = path.join(__dirname, 'migrations');
  }

  async connect() {
    this.client = new Client(this.dbConfig);
    await this.client.connect();
  }

  async disconnect() {
    if (this.client) {
      await this.client.end();
    }
  }

  async ensureMigrationsTable() {
    await this.client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        batch INTEGER NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async getExecutedMigrations() {
    const result = await this.client.query(
      'SELECT filename FROM schema_migrations ORDER BY executed_at'
    );
    return result.rows.map(row => row.filename);
  }

  async getPendingMigrations() {
    const executed = await this.getExecutedMigrations();
    const executedSet = new Set(executed);
    
    if (!fs.existsSync(this.migrationsDir)) {
      return [];
    }
    
    const allMigrations = fs.readdirSync(this.migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    return allMigrations.filter(migration => !executedSet.has(migration));
  }

  async runPendingMigrations() {
    try {
      await this.connect();
      await this.ensureMigrationsTable();
      
      const pending = await this.getPendingMigrations();
      
      if (pending.length === 0) {
        console.log('✅ No pending migrations');
        return;
      }
      
      console.log(`📋 Found ${pending.length} pending migrations:`);
      pending.forEach(m => console.log(`   • ${m}`));
      
      const batch = await this.getNextBatch();
      
      for (const migration of pending) {
        await this.runMigration(migration, batch);
      }
      
      console.log(`🎉 Successfully executed ${pending.length} migrations`);
      
    } finally {
      await this.disconnect();
    }
  }

  async runMigration(filename, batch) {
    const filepath = path.join(this.migrationsDir, filename);
    const sql = fs.readFileSync(filepath, 'utf8');
    
    console.log(`⚡ Running: ${filename}`);
    
    await this.client.query('BEGIN');
    
    try {
      // Execute migration SQL
      await this.client.query(sql);
      
      // Record migration
      await this.client.query(
        'INSERT INTO schema_migrations (filename, batch) VALUES ($1, $2)',
        [filename, batch]
      );
      
      await this.client.query('COMMIT');
      console.log(`✅ Completed: ${filename}`);
      
    } catch (error) {
      await this.client.query('ROLLBACK');
      console.error(`❌ Failed: ${filename} - ${error.message}`);
      throw error;
    }
  }

  async getNextBatch() {
    const result = await this.client.query(
      'SELECT COALESCE(MAX(batch), 0) + 1 as next_batch FROM schema_migrations'
    );
    return result.rows[0].next_batch;
  }

  async getStatus() {
    try {
      await this.connect();
      await this.ensureMigrationsTable();
      
      const executed = await this.getExecutedMigrations();
      const pending = await this.getPendingMigrations();
      
      console.log('\n📊 Migration Status:');
      console.log(`   Executed: ${executed.length}`);
      console.log(`   Pending: ${pending.length}`);
      
      if (executed.length > 0) {
        console.log('\n✅ Executed:');
        executed.forEach(m => console.log(`   • ${m}`));
      }
      
      if (pending.length > 0) {
        console.log('\n⏳ Pending:');
        pending.forEach(m => console.log(`   • ${m}`));
      }
      
    } finally {
      await this.disconnect();
    }
  }
}

async function main() {
  const manager = new FlexJobsMigrationManager();
  const command = process.argv[2] || 'migrate';
  
  try {
    switch (command) {
      case 'migrate':
      case 'up':
        await manager.runPendingMigrations();
        break;
      case 'status':
        await manager.getStatus();
        break;
      default:
        console.log(`
FlexJobs Migration Manager

Usage:
  node enhanced-migrations.js migrate    # Run pending migrations
  node enhanced-migrations.js status     # Check migration status

Examples:
  node enhanced-migrations.js migrate
  node enhanced-migrations.js status
        `);
    }
  } catch (error) {
    console.error('❌ Command failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = FlexJobsMigrationManager;
