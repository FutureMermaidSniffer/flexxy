-- FlexJobs Dummy Data Creation Script
-- This script creates sample companies, job categories, and jobs for development/testing

-- First, let's ensure we have an admin user
INSERT INTO users (first_name, last_name, email, password, user_type, is_verified, created_at)
VALUES ('Admin', 'User', 'admin@flexjobs.com', '$2b$12$LQv3c1yqBwlSiV6ULEnbdO2eWjOuJNajLlmPsq0pK1FiFEBfgq3z6', 'admin', true, NOW())
ON CONFLICT (email) DO NOTHING;

-- Create job categories
INSERT INTO job_categories (name, description, created_at) VALUES
('Software Engineering', 'Software development and engineering roles', NOW()),
('Data Science', 'Data analysis, machine learning, and analytics roles', NOW()),
('Marketing', 'Digital marketing, content, and growth roles', NOW()),
('Transportation', 'Transportation and infrastructure roles', NOW()),
('DevOps', 'DevOps, infrastructure, and cloud engineering roles', NOW()),
('Project Management', 'Project and program management roles', NOW())
ON CONFLICT (name) DO NOTHING;

-- Create companies
INSERT INTO companies (
    name, description, website, logo_url, industry, size, founded_year, 
    location, is_remote_friendly, created_by, created_at
) VALUES
(
    'TechFlow Solutions',
    'Leading technology consulting firm specializing in digital transformation and cloud solutions.',
    'https://techflow.com',
    'https://via.placeholder.com/200x100/004f6e/ffffff?text=TechFlow',
    'Technology',
    '201-500 employees',
    2015,
    'San Francisco, CA',
    true,
    (SELECT id FROM users WHERE email = 'admin@flexjobs.com' LIMIT 1),
    NOW()
),
(
    'DataVision Analytics',
    'Advanced data analytics and business intelligence solutions for enterprise clients.',
    'https://datavision.com',
    'https://via.placeholder.com/200x100/0066cc/ffffff?text=DataVision',
    'Data Analytics',
    '51-200 employees',
    2018,
    'Austin, TX',
    true,
    (SELECT id FROM users WHERE email = 'admin@flexjobs.com' LIMIT 1),
    NOW()
),
(
    'Colorado Department of Transportation',
    'State agency responsible for transportation infrastructure and services across Colorado.',
    'https://www.codot.gov',
    'https://via.placeholder.com/200x100/003366/ffffff?text=CDOT',
    'Government',
    '1000+ employees',
    1917,
    'Denver, CO',
    false,
    (SELECT id FROM users WHERE email = 'admin@flexjobs.com' LIMIT 1),
    NOW()
),
(
    'CloudFirst Inc',
    'Cloud infrastructure and DevOps solutions for modern applications.',
    'https://cloudfirst.com',
    'https://via.placeholder.com/200x100/ff6b35/ffffff?text=CloudFirst',
    'Cloud Computing',
    '11-50 employees',
    2020,
    'Seattle, WA',
    true,
    (SELECT id FROM users WHERE email = 'admin@flexjobs.com' LIMIT 1),
    NOW()
),
(
    'Marketing Dynamics',
    'Full-service digital marketing agency helping brands grow their online presence.',
    'https://marketingdynamics.com',
    'https://via.placeholder.com/200x100/28a745/ffffff?text=Marketing+Dynamics',
    'Marketing',
    '11-50 employees',
    2019,
    'New York, NY',
    true,
    (SELECT id FROM users WHERE email = 'admin@flexjobs.com' LIMIT 1),
    NOW()
)
ON CONFLICT (name) DO NOTHING;

-- Create jobs (6 real job concepts + 4 CDOT jobs)
INSERT INTO jobs (
    title, description, company_id, location, remote_type, job_type,
    experience_level, salary_min, salary_max, currency, category_id,
    skills, benefits, application_url, is_featured, is_urgent,
    posted_by, is_active, created_at, expires_at
) VALUES

-- Real Job 1: Senior Full Stack Developer
(
    'Senior Full Stack Developer - Remote',
    'We are seeking an experienced Full Stack Developer to join our growing team. You will be responsible for developing and maintaining web applications using modern technologies including React, Node.js, and cloud platforms.

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
• Excellent communication skills',
    (SELECT id FROM companies WHERE name = 'TechFlow Solutions' LIMIT 1),
    'Remote (US)',
    'fully_remote',
    'full_time',
    'senior',
    120000,
    160000,
    'USD',
    (SELECT id FROM job_categories WHERE name = 'Software Engineering' LIMIT 1),
    '["JavaScript", "React", "Node.js", "AWS", "PostgreSQL"]',
    '["Health Insurance", "Dental Insurance", "401k Match", "Flexible PTO", "Remote Work Stipend"]',
    'https://boards.greenhouse.io/company/jobs/1234567',
    true,
    false,
    (SELECT id FROM users WHERE email = 'admin@flexjobs.com' LIMIT 1),
    true,
    NOW(),
    NOW() + INTERVAL '30 days'
),

-- Real Job 2: Data Scientist
(
    'Data Scientist - Machine Learning',
    'Join our data science team to build and deploy machine learning models that drive business insights and product recommendations.

Key Responsibilities:
• Develop predictive models and algorithms
• Analyze large datasets to extract insights
• Collaborate with product and engineering teams
• Present findings to stakeholders
• Deploy models to production environments

Requirements:
• Master''s degree in Data Science, Statistics, or related field
• 3+ years of experience in data science
• Proficiency in Python, R, SQL
• Experience with ML frameworks (TensorFlow, PyTorch)
• Strong statistical analysis skills',
    (SELECT id FROM companies WHERE name = 'DataVision Analytics' LIMIT 1),
    'Austin, TX (Hybrid)',
    'hybrid',
    'full_time',
    'mid',
    100000,
    130000,
    'USD',
    (SELECT id FROM job_categories WHERE name = 'Data Science' LIMIT 1),
    '["Python", "R", "SQL", "TensorFlow", "Machine Learning"]',
    '["Health Insurance", "Stock Options", "Learning Budget", "Gym Membership"]',
    'https://apply.workable.com/datavision/j/ABC123/',
    true,
    true,
    (SELECT id FROM users WHERE email = 'admin@flexjobs.com' LIMIT 1),
    true,
    NOW(),
    NOW() + INTERVAL '25 days'
),

-- Real Job 3: Digital Marketing Manager
(
    'Digital Marketing Manager - Remote',
    'We''re looking for a creative and data-driven Digital Marketing Manager to lead our online marketing efforts and drive customer acquisition.

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
• Creative problem-solving abilities',
    (SELECT id FROM companies WHERE name = 'Marketing Dynamics' LIMIT 1),
    'Remote (US)',
    'fully_remote',
    'full_time',
    'mid',
    70000,
    90000,
    'USD',
    (SELECT id FROM job_categories WHERE name = 'Marketing' LIMIT 1),
    '["Google Ads", "Facebook Ads", "SEO", "Content Marketing", "Analytics"]',
    '["Health Insurance", "Flexible Hours", "Professional Development", "Remote Work"]',
    'https://jobs.lever.co/marketingdynamics/xyz789',
    false,
    false,
    (SELECT id FROM users WHERE email = 'admin@flexjobs.com' LIMIT 1),
    true,
    NOW(),
    NOW() + INTERVAL '20 days'
),

-- Real Job 4: DevOps Engineer
(
    'DevOps Engineer - Cloud Infrastructure',
    'Join our platform team to build and maintain scalable cloud infrastructure that supports millions of users worldwide.

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
• Strong scripting skills (Python, Bash)',
    (SELECT id FROM companies WHERE name = 'CloudFirst Inc' LIMIT 1),
    'Seattle, WA (Remote OK)',
    'hybrid',
    'full_time',
    'mid',
    110000,
    140000,
    'USD',
    (SELECT id FROM job_categories WHERE name = 'DevOps' LIMIT 1),
    '["Kubernetes", "Docker", "AWS", "Terraform", "Python"]',
    '["Health Insurance", "Stock Options", "Flexible PTO", "Tech Stipend"]',
    'https://cloudfirst.bamboohr.com/jobs/view.php?id=456',
    true,
    false,
    (SELECT id FROM users WHERE email = 'admin@flexjobs.com' LIMIT 1),
    true,
    NOW(),
    NOW() + INTERVAL '35 days'
),

-- Real Job 5: Frontend Developer
(
    'Frontend Developer - React Specialist',
    'We''re seeking a talented Frontend Developer with React expertise to create exceptional user experiences for our web applications.

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
• Understanding of web accessibility standards',
    (SELECT id FROM companies WHERE name = 'TechFlow Solutions' LIMIT 1),
    'Remote (US)',
    'fully_remote',
    'full_time',
    'mid',
    85000,
    110000,
    'USD',
    (SELECT id FROM job_categories WHERE name = 'Software Engineering' LIMIT 1),
    '["React", "JavaScript", "Redux", "CSS", "Jest"]',
    '["Health Insurance", "Dental Insurance", "Vision Insurance", "Remote Work"]',
    'https://techflow.recruitee.com/o/frontend-developer-react',
    false,
    true,
    (SELECT id FROM users WHERE email = 'admin@flexjobs.com' LIMIT 1),
    true,
    NOW(),
    NOW() + INTERVAL '15 days'
),

-- Real Job 6: Content Marketing Specialist
(
    'Content Marketing Specialist - Remote',
    'Join our marketing team to create compelling content that drives engagement and conversions across multiple channels.

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
• Social media marketing experience',
    (SELECT id FROM companies WHERE name = 'Marketing Dynamics' LIMIT 1),
    'Remote (US)',
    'fully_remote',
    'full_time',
    'junior',
    55000,
    70000,
    'USD',
    (SELECT id FROM job_categories WHERE name = 'Marketing' LIMIT 1),
    '["Content Writing", "SEO", "WordPress", "Social Media", "Analytics"]',
    '["Health Insurance", "Flexible Hours", "Professional Development"]',
    'https://marketingdynamics.workday.com/job/content-specialist',
    false,
    false,
    (SELECT id FROM users WHERE email = 'admin@flexjobs.com' LIMIT 1),
    true,
    NOW(),
    NOW() + INTERVAL '28 days'
),

-- CDOT Job 1: Transportation Engineer
(
    'Transportation Engineer II',
    'The Colorado Department of Transportation is seeking a Transportation Engineer II to join our Engineering team in Denver. This position involves planning, designing, and overseeing transportation infrastructure projects.

Key Responsibilities:
• Design and analyze transportation systems and infrastructure
• Prepare engineering drawings and specifications
• Conduct traffic studies and impact analyses
• Review and approve contractor submittals
• Ensure compliance with state and federal regulations

Requirements:
• Bachelor''s degree in Civil/Transportation Engineering
• Professional Engineer license preferred
• 3+ years of transportation engineering experience
• Knowledge of CDOT design standards
• Strong project management skills',
    (SELECT id FROM companies WHERE name = 'Colorado Department of Transportation' LIMIT 1),
    'Denver, CO',
    'on_site',
    'full_time',
    'mid',
    75000,
    95000,
    'USD',
    (SELECT id FROM job_categories WHERE name = 'Transportation' LIMIT 1),
    '["Civil Engineering", "AutoCAD", "Transportation Planning", "Project Management"]',
    '["State Health Plan", "Pension", "Paid Time Off", "Professional Development"]',
    'https://www.governmentjobs.com/careers/colorado/jobs/3456789',
    false,
    false,
    (SELECT id FROM users WHERE email = 'admin@flexjobs.com' LIMIT 1),
    true,
    NOW(),
    NOW() + INTERVAL '45 days'
),

-- CDOT Job 2: GIS Analyst
(
    'GIS Analyst - Transportation Data',
    'CDOT is looking for a GIS Analyst to support transportation data management and analysis for statewide transportation planning initiatives.

Key Responsibilities:
• Maintain and update transportation GIS databases
• Create maps and spatial analyses for planning projects
• Support traffic counting and data collection efforts
• Collaborate with engineers and planners
• Develop GIS applications and tools

Requirements:
• Bachelor''s degree in Geography, GIS, or related field
• 2+ years of GIS experience
• Proficiency in ArcGIS and QGIS
• Experience with spatial databases
• Knowledge of transportation planning concepts',
    (SELECT id FROM companies WHERE name = 'Colorado Department of Transportation' LIMIT 1),
    'Denver, CO',
    'on_site',
    'full_time',
    'junior',
    55000,
    70000,
    'USD',
    (SELECT id FROM job_categories WHERE name = 'Transportation' LIMIT 1),
    '["GIS", "ArcGIS", "SQL", "Transportation Planning", "Data Analysis"]',
    '["State Health Plan", "Pension", "Flexible Schedule", "Training Opportunities"]',
    'https://www.governmentjobs.com/careers/colorado/jobs/3456790',
    false,
    true,
    (SELECT id FROM users WHERE email = 'admin@flexjobs.com' LIMIT 1),
    true,
    NOW(),
    NOW() + INTERVAL '40 days'
),

-- CDOT Job 3: Project Manager
(
    'Project Manager - Highway Construction',
    'CDOT seeks an experienced Project Manager to oversee highway construction and maintenance projects across Colorado.

Key Responsibilities:
• Manage construction projects from planning to completion
• Coordinate with contractors, consultants, and stakeholders
• Monitor project budgets and schedules
• Ensure quality control and safety compliance
• Prepare progress reports and documentation

Requirements:
• Bachelor''s degree in Engineering or Construction Management
• 5+ years of construction project management experience
• PMP certification preferred
• Knowledge of CDOT construction standards
• Strong leadership and communication skills',
    (SELECT id FROM companies WHERE name = 'Colorado Department of Transportation' LIMIT 1),
    'Denver, CO',
    'on_site',
    'full_time',
    'senior',
    85000,
    105000,
    'USD',
    (SELECT id FROM job_categories WHERE name = 'Project Management' LIMIT 1),
    '["Project Management", "Construction Management", "PMP", "Budgeting", "Quality Control"]',
    '["State Health Plan", "Pension", "Paid Time Off", "State Vehicle"]',
    'https://www.governmentjobs.com/careers/colorado/jobs/3456791',
    true,
    false,
    (SELECT id FROM users WHERE email = 'admin@flexjobs.com' LIMIT 1),
    true,
    NOW(),
    NOW() + INTERVAL '50 days'
),

-- CDOT Job 4: Traffic Operations Specialist
(
    'Traffic Operations Specialist',
    'Join CDOT''s Traffic Operations team to monitor and optimize traffic flow on Colorado''s highway system using advanced traffic management systems.

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
• Strong problem-solving skills',
    (SELECT id FROM companies WHERE name = 'Colorado Department of Transportation' LIMIT 1),
    'Denver, CO',
    'on_site',
    'full_time',
    'junior',
    45000,
    60000,
    'USD',
    (SELECT id FROM job_categories WHERE name = 'Transportation' LIMIT 1),
    '["Traffic Management", "ITS Systems", "Data Analysis", "Incident Response"]',
    '["State Health Plan", "Pension", "Shift Differential", "Overtime Pay"]',
    'https://www.governmentjobs.com/careers/colorado/jobs/3456792',
    false,
    false,
    (SELECT id FROM users WHERE email = 'admin@flexjobs.com' LIMIT 1),
    true,
    NOW(),
    NOW() + INTERVAL '60 days'
);

-- Display summary information
SELECT 'SUMMARY: Dummy data creation complete!' as status;
SELECT COUNT(*) as total_jobs FROM jobs WHERE is_active = true;
SELECT COUNT(*) as total_companies FROM companies;
SELECT COUNT(*) as total_categories FROM job_categories;
