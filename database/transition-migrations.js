#!/usr/bin/env node

/**
 * Migration Transition Helper
 * 
 * This script helps transition from the old snapshot-based migration system
 * to the new sequential migration system.
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class MigrationTransition {
  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5433,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'flexjobs_db',
    });
  }

  async checkDatabaseExists() {
    try {
      const result = await this.pool.query("SELECT current_database()");
      console.log(`✅ Connected to database: ${result.rows[0].current_database}`);
      return true;
    } catch (error) {
      console.log(`⚠️  Database connection failed: ${error.message}`);
      return false;
    }
  }

  async checkTableExists(tableName) {
    try {
      const result = await this.pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `, [tableName]);
      
      return result.rows[0].exists;
    } catch (error) {
      console.error(`Error checking table ${tableName}:`, error);
      return false;
    }
  }

  async analyzeCurrentState() {
    console.log('🔍 Analyzing current database state...\n');
    
    const expectedTables = [
      'users', 'companies', 'categories', 'jobs', 'applications', 
      'saved_jobs', 'job_skills', 'agents', 'agent_reviews', 
      'agent_bookings', 'subscription_plans', 'user_subscriptions',
      'password_reset_tokens'
    ];

    const existingTables = [];
    const missingTables = [];

    for (const table of expectedTables) {
      const exists = await this.checkTableExists(table);
      if (exists) {
        existingTables.push(table);
      } else {
        missingTables.push(table);
      }
    }

    console.log(`✅ Existing tables (${existingTables.length}):`);
    existingTables.forEach(table => console.log(`   - ${table}`));
    
    if (missingTables.length > 0) {
      console.log(`\n❌ Missing tables (${missingTables.length}):`);
      missingTables.forEach(table => console.log(`   - ${table}`));
    }

    // Check if migration tracking table exists
    const hasMigrationTable = await this.checkTableExists('schema_migrations');
    console.log(`\n📋 Migration tracking table: ${hasMigrationTable ? '✅ EXISTS' : '❌ MISSING'}`);

    return {
      existingTables,
      missingTables,
      hasMigrationTable,
      totalTables: existingTables.length
    };
  }

  async createMigrationTrackingTable() {
    console.log('🏗️  Creating migration tracking table...');
    
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
      console.log('✅ Migration tracking table created');
    } catch (error) {
      console.error('❌ Failed to create migration tracking table:', error);
      throw error;
    }
  }

  async markExistingMigrationsAsCompleted() {
    console.log('📝 Marking existing migrations as completed...');
    
    const migrations = [
      { name: '20240101_000000_initial_schema.sql', description: 'Initial database schema setup' },
      { name: '20240102_000000_add_agents_system.sql', description: 'Add agents and subscription system' },
      { name: '20240103_000000_add_oauth_fields.sql', description: 'Add OAuth authentication fields' },
      { name: '20240104_000000_add_password_reset.sql', description: 'Add password reset system' }
    ];

    for (const migration of migrations) {
      try {
        // Check if this migration's tables exist
        let shouldMark = false;

        if (migration.name.includes('initial_schema')) {
          shouldMark = await this.checkTableExists('users');
        } else if (migration.name.includes('agents_system')) {
          shouldMark = await this.checkTableExists('agents');
        } else if (migration.name.includes('oauth_fields')) {
          // Check if oauth columns exist
          const result = await this.pool.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'google_id'
          `);
          shouldMark = result.rows.length > 0;
        } else if (migration.name.includes('password_reset')) {
          shouldMark = await this.checkTableExists('password_reset_tokens');
        }

        if (shouldMark) {
          await this.pool.query(`
            INSERT INTO schema_migrations (migration_name, execution_time_ms) 
            VALUES ($1, 0) 
            ON CONFLICT (migration_name) DO NOTHING
          `, [migration.name]);
          
          console.log(`   ✅ Marked as completed: ${migration.description}`);
        } else {
          console.log(`   ⏭️  Skipped (not present): ${migration.description}`);
        }
      } catch (error) {
        console.error(`   ❌ Error marking migration ${migration.name}:`, error);
      }
    }
  }

  async transition() {
    console.log('🚀 Starting migration system transition...\n');
    
    // Check database connection
    const connected = await this.checkDatabaseExists();
    if (!connected) {
      console.error('❌ Cannot proceed without database connection');
      process.exit(1);
    }

    // Analyze current state
    const state = await this.analyzeCurrentState();
    
    // Create migration tracking table
    if (!state.hasMigrationTable) {
      await this.createMigrationTrackingTable();
    }

    // Mark existing migrations as completed
    await this.markExistingMigrationsAsCompleted();

    console.log('\n🎉 Migration system transition completed!');
    console.log('\nNext steps:');
    console.log('1. Use: node migration-system.js status    - Check migration status');
    console.log('2. Use: node migration-system.js migrate   - Run any pending migrations');
    console.log('3. Use: node generate-migration.js "description" - Create new migrations');
    console.log('\n⚠️  The old migrate.js is now deprecated. Use the new migration-system.js instead.');
  }

  async close() {
    await this.pool.end();
  }
}

// CLI Interface
async function main() {
  const transition = new MigrationTransition();
  
  try {
    await transition.transition();
  } catch (error) {
    console.error('❌ Transition failed:', error);
    process.exit(1);
  } finally {
    await transition.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = MigrationTransition;
