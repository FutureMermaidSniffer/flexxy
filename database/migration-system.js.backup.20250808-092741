#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class MigrationSystem {
  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5433,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'flexjobs_db',
    });
    
    this.migrationsPath = path.join(__dirname, 'migrations', 'sequential');
  }

  async init() {
    // Create migrations table if it doesn't exist
    await this.createMigrationsTable();
  }

  async createMigrationsTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT NOW(),
        checksum VARCHAR(64),
        execution_time_ms INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_schema_migrations_name 
      ON schema_migrations(migration_name);
    `;
    
    try {
      await this.pool.query(query);
      console.log('✅ Migration tracking table ready');
    } catch (error) {
      console.error('❌ Failed to create migrations table:', error);
      throw error;
    }
  }

  async getExecutedMigrations() {
    const result = await this.pool.query(
      'SELECT migration_name FROM schema_migrations ORDER BY executed_at'
    );
    return result.rows.map(row => row.migration_name);
  }

  async getPendingMigrations() {
    const executedMigrations = await this.getExecutedMigrations();
    const allMigrations = this.getAllMigrationFiles();
    
    return allMigrations.filter(migration => 
      !executedMigrations.includes(migration)
    );
  }

  getAllMigrationFiles() {
    if (!fs.existsSync(this.migrationsPath)) {
      fs.mkdirSync(this.migrationsPath, { recursive: true });
      return [];
    }
    
    return fs.readdirSync(this.migrationsPath)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Alphabetical/timestamp sort
  }

  async runMigration(migrationName) {
    const migrationPath = path.join(this.migrationsPath, migrationName);
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log(`🔄 Running migration: ${migrationName}`);
    const startTime = Date.now();
    
    const client = await this.pool.connect();
    
    try {
      // Begin transaction
      await client.query('BEGIN');
      
      // Execute migration
      await client.query(migrationSQL);
      
      // Record migration
      await client.query(
        'INSERT INTO schema_migrations (migration_name, execution_time_ms) VALUES ($1, $2)',
        [migrationName, Date.now() - startTime]
      );
      
      // Commit transaction
      await client.query('COMMIT');
      
      console.log(`✅ Migration completed: ${migrationName} (${Date.now() - startTime}ms)`);
      
    } catch (error) {
      // Rollback on error
      await client.query('ROLLBACK');
      console.error(`❌ Migration failed: ${migrationName}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  async migrate() {
    console.log('🚀 Starting sequential migrations...\n');
    
    await this.init();
    const pendingMigrations = await this.getPendingMigrations();
    
    if (pendingMigrations.length === 0) {
      console.log('✅ No pending migrations');
      return;
    }
    
    console.log(`📋 Found ${pendingMigrations.length} pending migrations:`);
    pendingMigrations.forEach(migration => console.log(`  - ${migration}`));
    console.log();
    
    for (const migration of pendingMigrations) {
      await this.runMigration(migration);
    }
    
    console.log('\n🎉 All migrations completed successfully!');
  }

  async rollback(migrationName) {
    console.log(`🔄 Rolling back migration: ${migrationName}`);
    
    // Check if rollback file exists
    const rollbackPath = path.join(this.migrationsPath, 'rollbacks', `${migrationName}.rollback.sql`);
    
    if (!fs.existsSync(rollbackPath)) {
      throw new Error(`Rollback file not found: ${rollbackPath}`);
    }
    
    const rollbackSQL = fs.readFileSync(rollbackPath, 'utf8');
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Execute rollback
      await client.query(rollbackSQL);
      
      // Remove from migrations table
      await client.query(
        'DELETE FROM schema_migrations WHERE migration_name = $1',
        [migrationName]
      );
      
      await client.query('COMMIT');
      console.log(`✅ Rollback completed: ${migrationName}`);
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ Rollback failed: ${migrationName}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  async status() {
    await this.init();
    
    const executedMigrations = await this.getExecutedMigrations();
    const pendingMigrations = await this.getPendingMigrations();
    
    console.log('📊 Migration Status\n');
    console.log(`✅ Executed: ${executedMigrations.length}`);
    console.log(`⏳ Pending: ${pendingMigrations.length}\n`);
    
    if (executedMigrations.length > 0) {
      console.log('Executed Migrations:');
      executedMigrations.forEach(migration => console.log(`  ✅ ${migration}`));
      console.log();
    }
    
    if (pendingMigrations.length > 0) {
      console.log('Pending Migrations:');
      pendingMigrations.forEach(migration => console.log(`  ⏳ ${migration}`));
    }
  }

  async close() {
    await this.pool.end();
  }
}

// CLI Interface
async function main() {
  const migrationSystem = new MigrationSystem();
  const command = process.argv[2];
  const argument = process.argv[3];
  
  try {
    switch (command) {
      case 'migrate':
        await migrationSystem.migrate();
        break;
        
      case 'rollback':
        if (!argument) {
          console.error('❌ Please specify migration name to rollback');
          process.exit(1);
        }
        await migrationSystem.rollback(argument);
        break;
        
      case 'status':
        await migrationSystem.status();
        break;
        
      default:
        console.log('Usage:');
        console.log('  node migration-system.js migrate    - Run pending migrations');
        console.log('  node migration-system.js rollback <name>  - Rollback specific migration');
        console.log('  node migration-system.js status     - Show migration status');
        break;
    }
  } catch (error) {
    console.error('❌ Migration system error:', error);
    process.exit(1);
  } finally {
    await migrationSystem.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = MigrationSystem;
