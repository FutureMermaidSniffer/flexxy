const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'flexjobs_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function runJobManagementMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting job management fields migration...');
    
    
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'jobs' 
      AND column_name = 'application_url'
    `);
    
    if (checkColumn.rows.length > 0) {
      console.log('✅ Migration already applied - application_url column exists');
      return;
    }
    
    
    const fs = require('fs');
    const path = require('path');
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations', 'add_job_management_fields.sql'), 
      'utf8'
    );
    
    await client.query(migrationSQL);
    
    console.log('✅ Successfully added job management fields:');
    console.log('   - application_url (VARCHAR(500)) - External application URL');
    console.log('   - contact_email (VARCHAR(255)) - Contact email for inquiries');
    console.log('   - status (VARCHAR(20)) - Job status (draft, pending, active, closed)');
    console.log('   - salary_type (VARCHAR(20)) - Salary type (yearly, monthly, hourly)');
    console.log('   - tags (TEXT) - Comma-separated tags for categorization');
    
    
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'jobs' 
      AND column_name IN ('application_url', 'contact_email', 'status', 'salary_type', 'tags')
      ORDER BY column_name
    `);
    
    console.log('\n📋 Migration verification:');
    tableInfo.rows.forEach(row => {
      console.log(`   ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default || 'none'})`);
    });
    
  } catch (error) {
    console.error('❌ Error running job management migration:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}


if (require.main === module) {
  runJobManagementMigration().catch(console.error);
}

module.exports = { runJobManagementMigration };
