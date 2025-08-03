require('dotenv').config();
const { Pool } = require('pg');


const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'flexjobs_db',
});

async function createDummyJobs() {
  const client = await pool.connect();
  
  try {
    
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'jobs'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('Jobs table does not exist. Please run the database schema first.');
      return;
    }

    
    const companyCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'companies'
      );
    `);

    let companyIds = [];
    
    if (companyCheck.rows[0].exists) {
      
      const existingCompanies = await client.query('SELECT id FROM companies LIMIT 5');
      
      if (existingCompanies.rows.length === 0) {
        
        const companies = [
          { name: 'Dropbox', website: 'https:
          { name: 'Netflix', website: 'https:
          { name: 'Zillow', website: 'https:
          { name: 'Colorado Department of Transportation', website: 'https:
          { name: 'Reddit', website: 'https:
        ];
        
        for (const company of companies) {
          const result = await client.query(
            'INSERT INTO companies (name, website, logo, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id',
            [company.name, company.website, company.logo]
          );
          companyIds.push(result.rows[0].id);
        }
      } else {
        companyIds = existingCompanies.rows.map(row => row.id);
      }
    } else {
      
      console.log('Companies table does not exist. Creating jobs without company association.');
      companyIds = [null, null, null, null, null];
    }

    
    let categoryIds = [];
    const categoryCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'categories'
      );
    `);

    if (categoryCheck.rows[0].exists) {
      const existingCategories = await client.query('SELECT id FROM categories LIMIT 3');
      if (existingCategories.rows.length === 0) {
        
        const categories = ['Technology', 'Customer Service', 'Transportation'];
        for (const category of categories) {
          const result = await client.query(
            'INSERT INTO categories (name, created_at) VALUES ($1, NOW()) RETURNING id',
            [category]
          );
          categoryIds.push(result.rows[0].id);
        }
      } else {
        categoryIds = existingCategories.rows.map(row => row.id);
      }
    }

    
    const jobs = [
      
      {
        title: 'Senior Software Engineer - Remote',
        company_id: companyIds[0], 
        description: 'Join our engineering team to build scalable cloud storage solutions. Work with cutting-edge technologies in a fully remote environment.',
        requirements: 'Bachelor\'s degree in Computer Science, 5+ years of experience with Python and JavaScript, experience with cloud platforms.',
        location: 'Remote - US',
        job_type: 'full-time',
        remote_type: 'fully-remote',
        salary_min: 120000,
        salary_max: 180000,
        benefits: 'Health insurance, 401k matching, unlimited PTO, home office stipend',
        application_url: 'https:
        is_active: true,
        category_id: categoryIds[0] || null
      },
      {
        title: 'Content Operations Specialist',
        company_id: companyIds[1], 
        description: 'Help manage and optimize our global content library. Work with international teams to ensure seamless content delivery.',
        requirements: '3+ years experience in content management, excellent communication skills, experience with data analysis tools.',
        location: 'Remote - Global',
        job_type: 'full-time',
        remote_type: 'fully-remote',
        salary_min: 70000,
        salary_max: 95000,
        benefits: 'Comprehensive health coverage, Netflix subscription, flexible working hours',
        application_url: 'https:
        is_active: true,
        category_id: categoryIds[0] || null
      },
      {
        title: 'Real Estate Data Analyst',
        company_id: companyIds[2], 
        description: 'Analyze market trends and property data to support our real estate platform. Remote position with occasional travel.',
        requirements: 'Bachelor\'s in Statistics, Economics, or related field. Proficiency in SQL, Python, and data visualization tools.',
        location: 'Remote - US',
        job_type: 'full-time',
        remote_type: 'hybrid',
        salary_min: 80000,
        salary_max: 120000,
        benefits: 'Health, dental, vision insurance, equity package, professional development budget',
        application_url: 'https:
        is_active: true,
        category_id: categoryIds[0] || null
      },
      {
        title: 'Community Manager',
        company_id: companyIds[4], 
        description: 'Engage with Reddit communities and help grow platform engagement. Flexible remote work with creative freedom.',
        requirements: '2+ years social media experience, excellent writing skills, understanding of online communities.',
        location: 'Remote - US/Canada',
        job_type: 'full-time',
        remote_type: 'fully-remote',
        salary_min: 60000,
        salary_max: 85000,
        benefits: 'Health insurance, mental health support, unlimited PTO, learning stipend',
        application_url: 'https:
        is_active: true,
        category_id: categoryIds[1] || null
      },
      {
        title: 'Customer Success Representative',
        company_id: companyIds[0], 
        description: 'Help our business customers succeed with Dropbox solutions. Provide technical support and account management.',
        requirements: '1-3 years customer service experience, technical aptitude, excellent problem-solving skills.',
        location: 'Remote - US',
        job_type: 'full-time',
        remote_type: 'fully-remote',
        salary_min: 45000,
        salary_max: 65000,
        benefits: 'Health insurance, professional development, stock options, flexible schedule',
        application_url: 'https:
        is_active: true,
        category_id: categoryIds[1] || null
      },
      {
        title: 'UX/UI Designer - Remote',
        company_id: companyIds[1], 
        description: 'Design intuitive user experiences for our streaming platform. Collaborate with global design teams remotely.',
        requirements: 'Bachelor\'s in Design or related field, 3+ years UX/UI experience, proficiency in Figma and Adobe Creative Suite.',
        location: 'Remote - Global',
        job_type: 'full-time',
        remote_type: 'fully-remote',
        salary_min: 85000,
        salary_max: 130000,
        benefits: 'Comprehensive benefits, design tool subscriptions, conference attendance budget',
        application_url: 'https:
        is_active: true,
        category_id: categoryIds[0] || null
      },
      
      
      {
        title: 'Transportation Planning Analyst',
        company_id: companyIds[3], 
        description: 'Analyze transportation data and develop planning strategies for Colorado\'s highway system. Hybrid remote work available.',
        requirements: 'Bachelor\'s degree in Civil Engineering, Urban Planning, or related field. GIS experience preferred.',
        location: 'Denver, CO - Hybrid',
        job_type: 'full-time',
        remote_type: 'hybrid',
        salary_min: 55000,
        salary_max: 75000,
        benefits: 'State benefits package, retirement plan, professional development opportunities',
        application_url: 'https:
        is_active: true,
        category_id: categoryIds[2] || null
      },
      {
        title: 'IT Systems Administrator',
        company_id: companyIds[3], 
        description: 'Maintain and support CDOT\'s IT infrastructure. Remote work options available with occasional on-site requirements.',
        requirements: '3+ years system administration experience, Windows/Linux expertise, networking knowledge.',
        location: 'Colorado Springs, CO - Remote',
        job_type: 'full-time',
        remote_type: 'mostly-remote',
        salary_min: 60000,
        salary_max: 80000,
        benefits: 'Health insurance, state retirement, flexible scheduling, training opportunities',
        application_url: 'https:
        is_active: true,
        category_id: categoryIds[0] || null
      },
      {
        title: 'Environmental Compliance Specialist',
        company_id: companyIds[3], 
        description: 'Ensure transportation projects comply with environmental regulations. Fieldwork and remote analysis combined.',
        requirements: 'Bachelor\'s in Environmental Science or related field, knowledge of NEPA processes, field work capability.',
        location: 'Grand Junction, CO - Hybrid',
        job_type: 'full-time',
        remote_type: 'hybrid',
        salary_min: 50000,
        salary_max: 70000,
        benefits: 'Government benefits, outdoor work opportunities, career advancement path',
        application_url: 'https:
        is_active: true,
        category_id: categoryIds[2] || null
      },
      {
        title: 'Traffic Data Coordinator',
        company_id: companyIds[3], 
        description: 'Collect and analyze traffic data to support highway planning and operations. Remote data analysis with occasional field visits.',
        requirements: 'Associate\'s degree preferred, data analysis skills, attention to detail, ability to work independently.',
        location: 'Statewide Colorado - Remote',
        job_type: 'full-time',
        remote_type: 'mostly-remote',
        salary_min: 40000,
        salary_max: 55000,
        benefits: 'State employee benefits, travel reimbursement, flexible schedule',
        application_url: 'https:
        is_active: true,
        category_id: categoryIds[2] || null
      }
    ];

    
    console.log('Creating 10 dummy jobs...');
    
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      
      const result = await client.query(`
        INSERT INTO jobs (
          title, company_id, description, requirements, location, 
          job_type, remote_type, salary_min, salary_max, benefits,
          is_active, category_id, created_by, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
        RETURNING id
      `, [
        job.title, job.company_id, job.description, job.requirements, job.location,
        job.job_type, job.remote_type, job.salary_min, job.salary_max, job.benefits,
        job.is_active, job.category_id, 1 
      ]);
      
      console.log(`✅ Created job ${i + 1}: ${job.title} (ID: ${result.rows[0].id})`);
    }

    console.log('\n🎉 Successfully created 10 dummy jobs!');
    console.log('6 jobs from real companies (Dropbox, Netflix, Zillow, Reddit)');
    console.log('4 jobs from Colorado Department of Transportation (CDOT)');
    
  } catch (error) {
    console.error('Error creating dummy jobs:', error);
  } finally {
    client.release();
    await pool.end();
  }
}


createDummyJobs().catch(console.error);
