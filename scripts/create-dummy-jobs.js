const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();


const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});


async function insertOne(table, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING id`;
    
    const result = await pool.query(query, values);
    return result.rows[0].id;
}


const companies = [
    {
        name: 'TechFlow Solutions',
        description: 'Leading technology consulting firm specializing in digital transformation and cloud solutions.',
        website: 'https:
        logo_url: 'https:
        industry: 'Technology',
        size: '201-500 employees',
        founded_year: 2015,
        location: 'San Francisco, CA',
        is_remote_friendly: true
    },
    {
        name: 'DataVision Analytics',
        description: 'Advanced data analytics and business intelligence solutions for enterprise clients.',
        website: 'https:
        logo_url: 'https:
        industry: 'Data Analytics',
        size: '51-200 employees',
        founded_year: 2018,
        location: 'Austin, TX',
        is_remote_friendly: true
    },
    {
        name: 'Colorado Department of Transportation',
        description: 'State agency responsible for transportation infrastructure and services across Colorado.',
        website: 'https:
        logo_url: 'https:
        industry: 'Government',
        size: '1000+ employees',
        founded_year: 1917,
        location: 'Denver, CO',
        is_remote_friendly: false
    },
    {
        name: 'CloudFirst Inc',
        description: 'Cloud infrastructure and DevOps solutions for modern applications.',
        website: 'https:
        logo_url: 'https:
        industry: 'Cloud Computing',
        size: '11-50 employees',
        founded_year: 2020,
        location: 'Seattle, WA',
        is_remote_friendly: true
    },
    {
        name: 'Marketing Dynamics',
        description: 'Full-service digital marketing agency helping brands grow their online presence.',
        website: 'https:
        logo_url: 'https:
        industry: 'Marketing',
        size: '11-50 employees',
        founded_year: 2019,
        location: 'New York, NY',
        is_remote_friendly: true
    }
];


const categories = [
    { name: 'Software Engineering', description: 'Software development and engineering roles' },
    { name: 'Data Science', description: 'Data analysis, machine learning, and analytics roles' },
    { name: 'Marketing', description: 'Digital marketing, content, and growth roles' },
    { name: 'Transportation', description: 'Transportation and infrastructure roles' },
    { name: 'DevOps', description: 'DevOps, infrastructure, and cloud engineering roles' },
    { name: 'Project Management', description: 'Project and program management roles' }
];


const jobs = [
    
    {
        title: 'Senior Full Stack Developer - Remote',
        description: `We are seeking an experienced Full Stack Developer to join our growing team. You will be responsible for developing and maintaining web applications using modern technologies including React, Node.js, and cloud platforms.

Key Responsibilities:
• Design and develop scalable web applications
• Collaborate with cross-functional teams
• Write clean, maintainable code
• Participate in code reviews and technical discussions
• Troubleshoot and debug applications

Requirements:
• 5+ years of experience in full stack development
• Proficiency in JavaScript, React, Node.js
• Experience with cloud platforms (AWS, Azure, or GCP)
• Strong understanding of database design
• Excellent communication skills`,
        company_name: 'TechFlow Solutions',
        location: 'Remote (US)',
        remote_type: 'fully_remote',
        job_type: 'full_time',
        experience_level: 'senior',
        salary_min: 120000,
        salary_max: 160000,
        currency: 'USD',
        category_name: 'Software Engineering',
        skills: ['JavaScript', 'React', 'Node.js', 'AWS', 'PostgreSQL'],
        benefits: ['Health Insurance', 'Dental Insurance', '401k Match', 'Flexible PTO', 'Remote Work Stipend'],
        application_url: 'https:
        is_featured: true,
        is_urgent: false
    },
    {
        title: 'Data Scientist - Machine Learning',
        description: `Join our data science team to build and deploy machine learning models that drive business insights and product recommendations.

Key Responsibilities:
• Develop predictive models and algorithms
• Analyze large datasets to extract insights
• Collaborate with product and engineering teams
• Present findings to stakeholders
• Deploy models to production environments

Requirements:
• Master's degree in Data Science, Statistics, or related field
• 3+ years of experience in data science
• Proficiency in Python, R, SQL
• Experience with ML frameworks (TensorFlow, PyTorch)
• Strong statistical analysis skills`,
        company_name: 'DataVision Analytics',
        location: 'Austin, TX (Hybrid)',
        remote_type: 'hybrid',
        job_type: 'full_time',
        experience_level: 'mid',
        salary_min: 100000,
        salary_max: 130000,
        currency: 'USD',
        category_name: 'Data Science',
        skills: ['Python', 'R', 'SQL', 'TensorFlow', 'Machine Learning'],
        benefits: ['Health Insurance', 'Stock Options', 'Learning Budget', 'Gym Membership'],
        application_url: 'https:
        is_featured: true,
        is_urgent: true
    },
    {
        title: 'Digital Marketing Manager - Remote',
        description: `We're looking for a creative and data-driven Digital Marketing Manager to lead our online marketing efforts and drive customer acquisition.

Key Responsibilities:
• Develop and execute digital marketing strategies
• Manage social media campaigns and content
• Analyze marketing performance and ROI
• Collaborate with design and content teams
• Optimize conversion funnels

Requirements:
• 4+ years of digital marketing experience
• Experience with Google Ads, Facebook Ads
• Proficiency in analytics tools (Google Analytics, etc.)
• Strong writing and communication skills
• Creative problem-solving abilities`,
        company_name: 'Marketing Dynamics',
        location: 'Remote (US)',
        remote_type: 'fully_remote',
        job_type: 'full_time',
        experience_level: 'mid',
        salary_min: 70000,
        salary_max: 90000,
        currency: 'USD',
        category_name: 'Marketing',
        skills: ['Google Ads', 'Facebook Ads', 'SEO', 'Content Marketing', 'Analytics'],
        benefits: ['Health Insurance', 'Flexible Hours', 'Professional Development', 'Remote Work'],
        application_url: 'https:
        is_featured: false,
        is_urgent: false
    },
    {
        title: 'DevOps Engineer - Cloud Infrastructure',
        description: `Join our platform team to build and maintain scalable cloud infrastructure that supports millions of users worldwide.

Key Responsibilities:
• Design and implement CI/CD pipelines
• Manage Kubernetes clusters and containerized applications
• Monitor system performance and reliability
• Automate infrastructure provisioning
• Collaborate with development teams

Requirements:
• 3+ years of DevOps/Infrastructure experience
• Experience with Kubernetes, Docker
• Proficiency in AWS or Azure
• Knowledge of Infrastructure as Code (Terraform)
• Strong scripting skills (Python, Bash)`,
        company_name: 'CloudFirst Inc',
        location: 'Seattle, WA (Remote OK)',
        remote_type: 'hybrid',
        job_type: 'full_time',
        experience_level: 'mid',
        salary_min: 110000,
        salary_max: 140000,
        currency: 'USD',
        category_name: 'DevOps',
        skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'Python'],
        benefits: ['Health Insurance', 'Stock Options', 'Flexible PTO', 'Tech Stipend'],
        application_url: 'https:
        is_featured: true,
        is_urgent: false
    },
    {
        title: 'Frontend Developer - React Specialist',
        description: `We're seeking a talented Frontend Developer with React expertise to create exceptional user experiences for our web applications.

Key Responsibilities:
• Build responsive web applications using React
• Collaborate with UX/UI designers
• Optimize applications for performance
• Write unit and integration tests
• Participate in agile development process

Requirements:
• 3+ years of React development experience
• Proficiency in modern JavaScript (ES6+)
• Experience with state management (Redux, Context API)
• Knowledge of CSS frameworks and preprocessors
• Understanding of web accessibility standards`,
        company_name: 'TechFlow Solutions',
        location: 'Remote (US)',
        remote_type: 'fully_remote',
        job_type: 'full_time',
        experience_level: 'mid',
        salary_min: 85000,
        salary_max: 110000,
        currency: 'USD',
        category_name: 'Software Engineering',
        skills: ['React', 'JavaScript', 'Redux', 'CSS', 'Jest'],
        benefits: ['Health Insurance', 'Dental Insurance', 'Vision Insurance', 'Remote Work'],
        application_url: 'https:
        is_featured: false,
        is_urgent: true
    },
    {
        title: 'Content Marketing Specialist - Remote',
        description: `Join our marketing team to create compelling content that drives engagement and conversions across multiple channels.

Key Responsibilities:
• Create blog posts, whitepapers, and case studies
• Develop content strategies for different audiences
• Collaborate with subject matter experts
• Optimize content for SEO
• Track and analyze content performance

Requirements:
• 2+ years of content marketing experience
• Excellent writing and editing skills
• Experience with CMS platforms
• Knowledge of SEO best practices
• Social media marketing experience`,
        company_name: 'Marketing Dynamics',
        location: 'Remote (US)',
        remote_type: 'fully_remote',
        job_type: 'full_time',
        experience_level: 'junior',
        salary_min: 55000,
        salary_max: 70000,
        currency: 'USD',
        category_name: 'Marketing',
        skills: ['Content Writing', 'SEO', 'WordPress', 'Social Media', 'Analytics'],
        benefits: ['Health Insurance', 'Flexible Hours', 'Professional Development'],
        application_url: 'https:
        is_featured: false,
        is_urgent: false
    },

    
    {
        title: 'Transportation Engineer II',
        description: `The Colorado Department of Transportation is seeking a Transportation Engineer II to join our Engineering team in Denver. This position involves planning, designing, and overseeing transportation infrastructure projects.

Key Responsibilities:
• Design and analyze transportation systems and infrastructure
• Prepare engineering drawings and specifications
• Conduct traffic studies and impact analyses
• Review and approve contractor submittals
• Ensure compliance with state and federal regulations

Requirements:
• Bachelor's degree in Civil/Transportation Engineering
• Professional Engineer license preferred
• 3+ years of transportation engineering experience
• Knowledge of CDOT design standards
• Strong project management skills`,
        company_name: 'Colorado Department of Transportation',
        location: 'Denver, CO',
        remote_type: 'on_site',
        job_type: 'full_time',
        experience_level: 'mid',
        salary_min: 75000,
        salary_max: 95000,
        currency: 'USD',
        category_name: 'Transportation',
        skills: ['Civil Engineering', 'AutoCAD', 'Transportation Planning', 'Project Management'],
        benefits: ['State Health Plan', 'Pension', 'Paid Time Off', 'Professional Development'],
        application_url: 'https:
        is_featured: false,
        is_urgent: false
    },
    {
        title: 'GIS Analyst - Transportation Data',
        description: `CDOT is looking for a GIS Analyst to support transportation data management and analysis for statewide transportation planning initiatives.

Key Responsibilities:
• Maintain and update transportation GIS databases
• Create maps and spatial analyses for planning projects
• Support traffic counting and data collection efforts
• Collaborate with engineers and planners
• Develop GIS applications and tools

Requirements:
• Bachelor's degree in Geography, GIS, or related field
• 2+ years of GIS experience
• Proficiency in ArcGIS and QGIS
• Experience with spatial databases
• Knowledge of transportation planning concepts`,
        company_name: 'Colorado Department of Transportation',
        location: 'Denver, CO',
        remote_type: 'on_site',
        job_type: 'full_time',
        experience_level: 'junior',
        salary_min: 55000,
        salary_max: 70000,
        currency: 'USD',
        category_name: 'Transportation',
        skills: ['GIS', 'ArcGIS', 'SQL', 'Transportation Planning', 'Data Analysis'],
        benefits: ['State Health Plan', 'Pension', 'Flexible Schedule', 'Training Opportunities'],
        application_url: 'https:
        is_featured: false,
        is_urgent: true
    },
    {
        title: 'Project Manager - Highway Construction',
        description: `CDOT seeks an experienced Project Manager to oversee highway construction and maintenance projects across Colorado.

Key Responsibilities:
• Manage construction projects from planning to completion
• Coordinate with contractors, consultants, and stakeholders
• Monitor project budgets and schedules
• Ensure quality control and safety compliance
• Prepare progress reports and documentation

Requirements:
• Bachelor's degree in Engineering or Construction Management
• 5+ years of construction project management experience
• PMP certification preferred
• Knowledge of CDOT construction standards
• Strong leadership and communication skills`,
        company_name: 'Colorado Department of Transportation',
        location: 'Denver, CO',
        remote_type: 'on_site',
        job_type: 'full_time',
        experience_level: 'senior',
        salary_min: 85000,
        salary_max: 105000,
        currency: 'USD',
        category_name: 'Project Management',
        skills: ['Project Management', 'Construction Management', 'PMP', 'Budgeting', 'Quality Control'],
        benefits: ['State Health Plan', 'Pension', 'Paid Time Off', 'State Vehicle'],
        application_url: 'https:
        is_featured: true,
        is_urgent: false
    },
    {
        title: 'Traffic Operations Specialist',
        description: `Join CDOT's Traffic Operations team to monitor and optimize traffic flow on Colorado's highway system using advanced traffic management systems.

Key Responsibilities:
• Monitor traffic conditions using ITS systems
• Coordinate incident response and traffic management
• Analyze traffic data and prepare reports
• Maintain traffic signal timing and operations
• Support special events and construction activities

Requirements:
• Associate degree in related field or equivalent experience
• 2+ years of traffic operations experience
• Knowledge of traffic management systems
• Ability to work flexible shifts including weekends
• Strong problem-solving skills`,
        company_name: 'Colorado Department of Transportation',
        location: 'Denver, CO',
        remote_type: 'on_site',
        job_type: 'full_time',
        experience_level: 'junior',
        salary_min: 45000,
        salary_max: 60000,
        currency: 'USD',
        category_name: 'Transportation',
        skills: ['Traffic Management', 'ITS Systems', 'Data Analysis', 'Incident Response'],
        benefits: ['State Health Plan', 'Pension', 'Shift Differential', 'Overtime Pay'],
        application_url: 'https:
        is_featured: false,
        is_urgent: false
    }
];

async function createDummyJobs() {
    console.log('🚀 Starting to create dummy jobs...');
    
    try {
        
        await pool.query('BEGIN');

        
        const adminUser = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@flexjobs.com']);
        let adminUserId;
        
        if (adminUser.rows.length === 0) {
            // SECURITY: Use environment variable for admin password
            const adminPassword = process.env.ADMIN_PASSWORD || 'change-me-in-production';
            const hashedPassword = await bcrypt.hash(adminPassword, 12);
            const newAdmin = await pool.query(
                'INSERT INTO users (first_name, last_name, email, password, user_type, is_verified) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
                ['Admin', 'User', 'admin@flexjobs.com', hashedPassword, 'admin', true]
            );
            adminUserId = newAdmin.rows[0].id;
            console.log('✅ Created admin user');
        } else {
            adminUserId = adminUser.rows[0].id;
            console.log('✅ Admin user already exists');
        }

        
        console.log('📂 Creating job categories...');
        const categoryIds = {};
        for (const category of categories) {
            const existingCategory = await pool.query('SELECT id FROM job_categories WHERE name = $1', [category.name]);
            
            if (existingCategory.rows.length === 0) {
                const result = await pool.query(
                    'INSERT INTO job_categories (name, description) VALUES ($1, $2) RETURNING id',
                    [category.name, category.description]
                );
                categoryIds[category.name] = result.rows[0].id;
            } else {
                categoryIds[category.name] = existingCategory.rows[0].id;
            }
        }
        console.log('✅ Job categories created');

        
        console.log('🏢 Creating companies...');
        const companyIds = {};
        for (const company of companies) {
            const existingCompany = await pool.query('SELECT id FROM companies WHERE name = $1', [company.name]);
            
            if (existingCompany.rows.length === 0) {
                const result = await pool.query(`
                    INSERT INTO companies (
                        name, description, website, logo_url, industry, 
                        size, founded_year, location, is_remote_friendly, created_by
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id
                `, [
                    company.name, company.description, company.website, company.logo_url,
                    company.industry, company.size, company.founded_year, company.location,
                    company.is_remote_friendly, adminUserId
                ]);
                companyIds[company.name] = result.rows[0].id;
            } else {
                companyIds[company.name] = existingCompany.rows[0].id;
            }
        }
        console.log('✅ Companies created');

        
        console.log('💼 Creating jobs...');
        for (let i = 0; i < jobs.length; i++) {
            const job = jobs[i];
            const companyId = companyIds[job.company_name];
            const categoryId = categoryIds[job.category_name];

            
            const existingJob = await pool.query(
                'SELECT id FROM jobs WHERE title = $1 AND company_id = $2',
                [job.title, companyId]
            );

            if (existingJob.rows.length === 0) {
                const result = await pool.query(`
                    INSERT INTO jobs (
                        title, description, company_id, location, remote_type, job_type,
                        experience_level, salary_min, salary_max, currency, category_id,
                        skills, benefits, application_url, is_featured, is_urgent,
                        posted_by, is_active
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
                    ) RETURNING id
                `, [
                    job.title, job.description, companyId, job.location, job.remote_type,
                    job.job_type, job.experience_level, job.salary_min, job.salary_max,
                    job.currency, categoryId, JSON.stringify(job.skills), JSON.stringify(job.benefits),
                    job.application_url, job.is_featured, job.is_urgent, adminUserId, true
                ]);

                console.log(`✅ Created job: ${job.title} (ID: ${result.rows[0].id})`);
            } else {
                console.log(`⚠️  Job already exists: ${job.title}`);
            }
        }

        
        await pool.query('COMMIT');
        console.log('🎉 All dummy jobs created successfully!');
        
        
        const jobCount = await pool.query('SELECT COUNT(*) FROM jobs WHERE is_active = true');
        const companyCount = await pool.query('SELECT COUNT(*) FROM companies');
        const categoryCount = await pool.query('SELECT COUNT(*) FROM job_categories');
        
        console.log('\n📊 Database Summary:');
        console.log(`   • Jobs: ${jobCount.rows[0].count}`);
        console.log(`   • Companies: ${companyCount.rows[0].count}`);
        console.log(`   • Categories: ${categoryCount.rows[0].count}`);

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('❌ Error creating dummy jobs:', error);
        throw error;
    } finally {
        await pool.end();
    }
}


if (require.main === module) {
    createDummyJobs()
        .then(() => {
            console.log('✅ Script completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Script failed:', error);
            process.exit(1);
        });
}

module.exports = { createDummyJobs };
