// Add application_url column to jobs table (PostgreSQL)
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres', 
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'flexjobs_db',
});

async function addApplicationUrlColumn() {
  try {
    console.log('🔄 Adding application_url column to jobs table...');
    
    // Check if column already exists
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'jobs' AND column_name = 'application_url';
    `;
    
    const checkResult = await pool.query(checkQuery);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ application_url column already exists');
    } else {
      // Add the column
      await pool.query('ALTER TABLE jobs ADD COLUMN application_url VARCHAR(500);');
      console.log('✅ application_url column added successfully');
    }
    
    // Update existing jobs with sample URLs
    console.log('🔄 Updating existing jobs with sample application URLs...');
    
    const updateQuery = `
      UPDATE jobs SET 
        application_url = CASE 
          WHEN id = 1 THEN 'https://careers.techcorp.com/jobs/senior-developer'
          WHEN id = 2 THEN 'https://jobs.designstudio.com/apply/ui-ux-designer'
          WHEN id = 3 THEN 'https://apply.marketingfirm.com/digital-marketing-specialist'
          WHEN id = 4 THEN 'https://careers.datacompany.com/data-scientist-position'
          WHEN id = 5 THEN 'https://jobs.projectmanager.com/apply/project-manager'
          WHEN id = 6 THEN 'https://apply.contentagency.com/content-writer'
          WHEN id = 7 THEN 'https://careers.salesforce.com/apply/sales-manager'
          WHEN id = 8 THEN 'https://jobs.hrfirm.com/hr-specialist-remote'
          ELSE 'https://example-company.com/apply/' || id::text
        END
      WHERE id IS NOT NULL;
    `;
    
    const result = await pool.query(updateQuery);
    console.log(`✅ Updated ${result.rowCount} jobs with application URLs`);
    
    // Verify the changes
    const verifyQuery = 'SELECT id, title, application_url FROM jobs LIMIT 5;';
    const verifyResult = await pool.query(verifyQuery);
    
    console.log('\n📋 Sample jobs with application URLs:');
    verifyResult.rows.forEach(job => {
      console.log(`  ${job.id}: ${job.title} -> ${job.application_url}`);
    });
    
    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await pool.end();
  }
}

addApplicationUrlColumn();
