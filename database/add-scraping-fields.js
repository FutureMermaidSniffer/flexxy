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
  database: process.env.DB_NAME || 'flexjobs_db'
};

async function addScrapingFields() {
  let client;
  
  try {
    console.log('🔧 Adding job scraping fields to FlexJobs database...\n');
    
    client = new Client(dbConfig);
    await client.connect();
    console.log('✅ Connected to database\n');

    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', 'add_job_scraping_fields.sql');
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('📄 Executing job scraping migration...');

    // Execute the migration
    await client.query(migrationSQL);
    
    console.log('✅ Job scraping fields added successfully!\n');
    
    // Verify the changes
    console.log('🔍 Verifying new columns...');
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'jobs' 
      AND column_name IN ('external_id', 'source', 'scraped_at', 'application_url')
      ORDER BY column_name
    `);
    
    if (result.rows.length > 0) {
      console.log('📊 New columns added:');
      result.rows.forEach(row => {
        console.log(`   • ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`);
      });
    }
    
    console.log('\n🎉 Migration completed! Your database is now ready for job scraping.');
    console.log('🚀 You can now run: npm run scrape:jobs');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('💡 The scraping fields may already exist. This is normal if you\'ve run this before.');
    } else {
      console.error('\n🔧 Please check:');
      console.error('   • Database is running and accessible');
      console.error('   • Your .env configuration is correct');
      console.error('   • You have sufficient database permissions');
      process.exit(1);
    }
  } finally {
    if (client) {
      await client.end();
    }
  }
}

if (require.main === module) {
  addScrapingFields();
}

module.exports = addScrapingFields;
