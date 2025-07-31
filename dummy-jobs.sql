-- FlexJobs Dummy Data Script
-- Creates companies, categories, and jobs for testing

-- First, let's insert some companies
INSERT INTO companies (name, website, logo_url, description, created_at) VALUES
('Dropbox', 'https://dropbox.com', 'https://cdn.worldvectorlogo.com/logos/dropbox-1.svg', 'Cloud storage and collaboration platform', NOW()),
('Netflix', 'https://netflix.com', 'https://cdn.worldvectorlogo.com/logos/netflix-3.svg', 'Global streaming entertainment service', NOW()),
('Zillow', 'https://zillow.com', 'https://cdn.worldvectorlogo.com/logos/zillow-1.svg', 'Online real estate marketplace', NOW()),
('Colorado Department of Transportation', 'https://cdot.gov', NULL, 'State transportation agency', NOW()),
('Reddit', 'https://reddit.com', 'https://cdn.worldvectorlogo.com/logos/reddit-1.svg', 'Social news aggregation platform', NOW())
ON CONFLICT (name) DO NOTHING;

-- Insert job categories
INSERT INTO categories (name, description, created_at) VALUES
('Technology', 'Software development, IT, and technical roles', NOW()),
('Customer Service', 'Support and customer-facing positions', NOW()),
('Transportation', 'Transportation and logistics roles', NOW())
ON CONFLICT (name) DO NOTHING;

-- Insert 10 dummy jobs
INSERT INTO jobs (
    title, company_id, description, requirements, location, 
    job_type, remote_type, salary_min, salary_max, benefits,
    application_url, is_active, category_id, created_at
) VALUES

-- Real company jobs (6)
(
    'Senior Software Engineer - Remote',
    (SELECT id FROM companies WHERE name = 'Dropbox' LIMIT 1),
    'Join our engineering team to build scalable cloud storage solutions. Work with cutting-edge technologies in a fully remote environment.',
    'Bachelor''s degree in Computer Science, 5+ years of experience with Python and JavaScript, experience with cloud platforms.',
    'Remote - US',
    'full-time',
    'fully-remote',
    120000,
    180000,
    'Health insurance, 401k matching, unlimited PTO, home office stipend',
    'https://dropbox.com/careers/senior-software-engineer',
    true,
    (SELECT id FROM categories WHERE name = 'Technology' LIMIT 1),
    NOW()
),

(
    'Content Operations Specialist',
    (SELECT id FROM companies WHERE name = 'Netflix' LIMIT 1),
    'Help manage and optimize our global content library. Work with international teams to ensure seamless content delivery.',
    '3+ years experience in content management, excellent communication skills, experience with data analysis tools.',
    'Remote - Global',
    'full-time',
    'fully-remote',
    70000,
    95000,
    'Comprehensive health coverage, Netflix subscription, flexible working hours',
    'https://netflix.com/careers/content-operations',
    true,
    (SELECT id FROM categories WHERE name = 'Technology' LIMIT 1),
    NOW()
),

(
    'Real Estate Data Analyst',
    (SELECT id FROM companies WHERE name = 'Zillow' LIMIT 1),
    'Analyze market trends and property data to support our real estate platform. Remote position with occasional travel.',
    'Bachelor''s in Statistics, Economics, or related field. Proficiency in SQL, Python, and data visualization tools.',
    'Remote - US',
    'full-time',
    'hybrid',
    80000,
    120000,
    'Health, dental, vision insurance, equity package, professional development budget',
    'https://zillow.com/careers/data-analyst',
    true,
    (SELECT id FROM categories WHERE name = 'Technology' LIMIT 1),
    NOW()
),

(
    'Community Manager',
    (SELECT id FROM companies WHERE name = 'Reddit' LIMIT 1),
    'Engage with Reddit communities and help grow platform engagement. Flexible remote work with creative freedom.',
    '2+ years social media experience, excellent writing skills, understanding of online communities.',
    'Remote - US/Canada',
    'full-time',
    'fully-remote',
    60000,
    85000,
    'Health insurance, mental health support, unlimited PTO, learning stipend',
    'https://reddit.com/careers/community-manager',
    true,
    (SELECT id FROM categories WHERE name = 'Customer Service' LIMIT 1),
    NOW()
),

(
    'Customer Success Representative',
    (SELECT id FROM companies WHERE name = 'Dropbox' LIMIT 1),
    'Help our business customers succeed with Dropbox solutions. Provide technical support and account management.',
    '1-3 years customer service experience, technical aptitude, excellent problem-solving skills.',
    'Remote - US',
    'full-time',
    'fully-remote',
    45000,
    65000,
    'Health insurance, professional development, stock options, flexible schedule',
    'https://dropbox.com/careers/customer-success',
    true,
    (SELECT id FROM categories WHERE name = 'Customer Service' LIMIT 1),
    NOW()
),

(
    'UX/UI Designer - Remote',
    (SELECT id FROM companies WHERE name = 'Netflix' LIMIT 1),
    'Design intuitive user experiences for our streaming platform. Collaborate with global design teams remotely.',
    'Bachelor''s in Design or related field, 3+ years UX/UI experience, proficiency in Figma and Adobe Creative Suite.',
    'Remote - Global',
    'full-time',
    'fully-remote',
    85000,
    130000,
    'Comprehensive benefits, design tool subscriptions, conference attendance budget',
    'https://netflix.com/careers/ux-designer',
    true,
    (SELECT id FROM categories WHERE name = 'Technology' LIMIT 1),
    NOW()
),

-- CDOT jobs (4)
(
    'Transportation Planning Analyst',
    (SELECT id FROM companies WHERE name = 'Colorado Department of Transportation' LIMIT 1),
    'Analyze transportation data and develop planning strategies for Colorado''s highway system. Hybrid remote work available.',
    'Bachelor''s degree in Civil Engineering, Urban Planning, or related field. GIS experience preferred.',
    'Denver, CO - Hybrid',
    'full-time',
    'hybrid',
    55000,
    75000,
    'State benefits package, retirement plan, professional development opportunities',
    'https://cdot.gov/careers/transportation-analyst',
    true,
    (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1),
    NOW()
),

(
    'IT Systems Administrator',
    (SELECT id FROM companies WHERE name = 'Colorado Department of Transportation' LIMIT 1),
    'Maintain and support CDOT''s IT infrastructure. Remote work options available with occasional on-site requirements.',
    '3+ years system administration experience, Windows/Linux expertise, networking knowledge.',
    'Colorado Springs, CO - Remote',
    'full-time',
    'mostly-remote',
    60000,
    80000,
    'Health insurance, state retirement, flexible scheduling, training opportunities',
    'https://cdot.gov/careers/it-systems-admin',
    true,
    (SELECT id FROM categories WHERE name = 'Technology' LIMIT 1),
    NOW()
),

(
    'Environmental Compliance Specialist',
    (SELECT id FROM companies WHERE name = 'Colorado Department of Transportation' LIMIT 1),
    'Ensure transportation projects comply with environmental regulations. Fieldwork and remote analysis combined.',
    'Bachelor''s in Environmental Science or related field, knowledge of NEPA processes, field work capability.',
    'Grand Junction, CO - Hybrid',
    'full-time',
    'hybrid',
    50000,
    70000,
    'Government benefits, outdoor work opportunities, career advancement path',
    'https://cdot.gov/careers/environmental-specialist',
    true,
    (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1),
    NOW()
),

(
    'Traffic Data Coordinator',
    (SELECT id FROM companies WHERE name = 'Colorado Department of Transportation' LIMIT 1),
    'Collect and analyze traffic data to support highway planning and operations. Remote data analysis with occasional field visits.',
    'Associate''s degree preferred, data analysis skills, attention to detail, ability to work independently.',
    'Statewide Colorado - Remote',
    'full-time',
    'mostly-remote',
    40000,
    55000,
    'State employee benefits, travel reimbursement, flexible schedule',
    'https://cdot.gov/careers/traffic-data-coordinator',
    true,
    (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1),
    NOW()
);

-- Display summary
SELECT 'COMPANIES CREATED:' as summary;
SELECT name, website FROM companies ORDER BY created_at DESC LIMIT 5;

SELECT 'CATEGORIES CREATED:' as summary;
SELECT name, description FROM categories ORDER BY created_at DESC LIMIT 3;

SELECT 'JOBS CREATED:' as summary;
SELECT 
    j.title, 
    c.name as company_name, 
    j.location, 
    j.remote_type,
    j.salary_min,
    j.salary_max
FROM jobs j 
JOIN companies c ON j.company_id = c.id 
ORDER BY j.created_at DESC 
LIMIT 10;
