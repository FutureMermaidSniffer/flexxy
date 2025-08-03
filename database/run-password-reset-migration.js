/**
 * Password Reset Migration Script
 * Run this to add password reset functionality to the database
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'flexjobs_db',
};

const pool = new Pool(dbConfig);

async function runPasswordResetMigration() {
  try {
    console.log('🔄 Running password reset migration...');

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'migrations', 'add_password_reset_tokens.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Execute the migration
    await pool.query(migrationSQL);

    console.log('✅ Password reset migration completed successfully!');
    console.log('📝 Added password_reset_tokens table');
    console.log('🔍 Added database indexes for performance');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migration if called directly
if (require.main === module) {
  runPasswordResetMigration()
    .then(() => {
      console.log('🎉 Migration complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { runPasswordResetMigration };
