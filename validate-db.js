const { executeQuery } = require('./backend/database');

async function validateDatabase() {
  try {
    console.log('=== Job Data Completeness ===');
    const jobs = await executeQuery(`
      SELECT 
        j.id, j.title, j.company_id, c.name as company_name,
        j.salary_min, j.salary_max, j.remote_type, j.job_type,
        j.is_featured, j.is_active
      FROM jobs j 
      JOIN companies c ON j.company_id = c.id 
      WHERE j.is_active = true 
      ORDER BY j.id
      LIMIT 10
    `);
    console.table(jobs);
    
    console.log('\n=== Featured Jobs Count ===');
    const featuredCount = await executeQuery('SELECT COUNT(*) as featured_count FROM jobs WHERE is_featured = true AND is_active = true');
    console.log('Featured jobs:', featuredCount[0].featured_count);
    
    console.log('\n=== Job Skills Sample ===');
    const jobSkills = await executeQuery(`
      SELECT j.title, js.skill_name 
      FROM jobs j 
      LEFT JOIN job_skills js ON j.id = js.job_id 
      WHERE j.is_active = true 
      LIMIT 5
    `);
    console.table(jobSkills);
    
    process.exit(0);
  } catch (error) {
    console.error('Database validation error:', error);
    process.exit(1);
  }
}

validateDatabase();
