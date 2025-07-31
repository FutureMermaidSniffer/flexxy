-- Create sample jobs for FlexJobs database (corrected version)
-- Insert sample companies with correct column names

INSERT INTO companies (name, description, website, logo, industry, company_size, location, is_verified, created_at) VALUES 
('TechCorp Inc.', 'Leading technology company specializing in software development and cloud solutions', 'https://techcorp.com', 'images/logo.png', 'Technology', '201-500', 'San Francisco, CA', true, CURRENT_TIMESTAMP),
('Creative Digital Agency', 'Full-service digital marketing agency helping brands grow online', 'https://creativedigital.com', 'images/logo.png', 'Marketing', '51-200', 'New York, NY', true, CURRENT_TIMESTAMP),
('Business Solutions LLC', 'Business consulting and project management services', 'https://businesssolutions.com', 'images/logo.png', 'Consulting', '51-200', 'Chicago, IL', true, CURRENT_TIMESTAMP),
('Creative Studio', 'Design and UX consulting firm', 'https://creativestudio.com', 'images/f.png', 'Design', '11-50', 'Austin, TX', true, CURRENT_TIMESTAMP),
('FinTech Solutions', 'Financial technology and analytics company', 'https://fintech.com', 'images/logo.png', 'Finance', '501-1000', 'Boston, MA', true, CURRENT_TIMESTAMP),
('EduTech Learning', 'Online education and course development platform', 'https://edutech.com', 'images/logo.png', 'Education', '51-200', 'Seattle, WA', true, CURRENT_TIMESTAMP),
('DataFlow Systems', 'Data analytics and business intelligence solutions', 'https://dataflow.com', 'images/logo.png', 'Technology', '51-200', 'Denver, CO', true, CURRENT_TIMESTAMP),
('GreenTech Innovations', 'Sustainable technology and environmental solutions', 'https://greentech.com', 'images/logo.png', 'Technology', '51-200', 'Portland, OR', true, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- Create sample categories with correct column names
INSERT INTO categories (name, description, icon, created_at) VALUES 
('Technology', 'Software development, IT, and technical roles', 'fas fa-laptop-code', CURRENT_TIMESTAMP),
('Marketing', 'Digital marketing, content, and advertising roles', 'fas fa-bullhorn', CURRENT_TIMESTAMP),
('Design', 'UX/UI design, graphic design, and creative roles', 'fas fa-palette', CURRENT_TIMESTAMP),
('Finance', 'Financial analysis, accounting, and fintech roles', 'fas fa-chart-line', CURRENT_TIMESTAMP),
('Management', 'Project management, operations, and leadership roles', 'fas fa-users-cog', CURRENT_TIMESTAMP),
('Writing', 'Content writing, copywriting, and editorial roles', 'fas fa-pen-fancy', CURRENT_TIMESTAMP),
('Sales', 'Sales, business development, and customer success roles', 'fas fa-handshake', CURRENT_TIMESTAMP),
('Data', 'Data analysis, data science, and analytics roles', 'fas fa-database', CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- Now insert sample jobs
INSERT INTO jobs (
    title, description, requirements, responsibilities, company_id, category_id, 
    location, job_type, remote_type, experience_level, salary_min, salary_max, 
    salary_currency, benefits, application_deadline, is_active, is_featured, 
    views_count, applications_count, created_by, application_url, contact_email, status, salary_type, tags
) VALUES 

-- Job 1: Senior Software Developer (Featured)
(
    'Senior Software Developer',
    'Join our innovative team to build cutting-edge applications using React, Node.js, and cloud technologies. Perfect for experienced developers seeking flexible remote work.

We are looking for a passionate Senior Software Developer to join our growing engineering team. You will work on exciting projects that impact millions of users while enjoying the flexibility of remote work.',

    'Requirements:
• 5+ years of software development experience
• Strong proficiency in React and Node.js
• Experience with AWS cloud services
• Knowledge of Docker and containerization
• Experience with database design and optimization',

    'Responsibilities:
• Design and develop scalable web applications
• Collaborate with cross-functional teams on product features
• Write clean, maintainable, and well-tested code
• Participate in code reviews and technical discussions
• Mentor junior developers and contribute to team growth',

    (SELECT id FROM companies WHERE name = 'TechCorp Inc.' LIMIT 1),
    (SELECT id FROM categories WHERE name = 'Technology' LIMIT 1),
    'Remote (US)',
    'full-time',
    'remote',
    'senior',
    85000.00,
    120000.00,
    'USD',
    'Health insurance, Dental, Vision, 401k matching, Flexible PTO, Home office stipend',
    CURRENT_DATE + INTERVAL '30 days',
    true,
    true,
    245,
    12,
    1,
    'https://techcorp.com/careers/senior-developer',
    'careers@techcorp.com',
    'active',
    'yearly',
    'React,Node.js,AWS,Docker,JavaScript'
),

-- Job 2: Digital Marketing Manager
(
    'Digital Marketing Manager',
    'Lead digital marketing campaigns for top brands. Manage social media, content strategy, and analytics. Flexible schedule with 2 days remote work per week.',

    'Requirements:
• 3+ years of digital marketing experience
• Proficiency in Google Analytics, AdWords, and social media platforms
• Experience with marketing automation tools
• Strong analytical and reporting skills
• Excellent written and verbal communication',

    'Responsibilities:
• Plan and execute multi-channel digital marketing campaigns
• Manage social media accounts and content creation
• Analyze performance metrics and prepare detailed reports
• Coordinate with design and content teams
• Stay current with digital marketing trends and best practices',

    (SELECT id FROM companies WHERE name = 'Creative Digital Agency' LIMIT 1),
    (SELECT id FROM categories WHERE name = 'Marketing' LIMIT 1),
    'New York, NY (Hybrid)',
    'full-time',
    'hybrid',
    'mid',
    65000.00,
    85000.00,
    'USD',
    'Health insurance, Dental, Vision, Flexible PTO, Professional development',
    CURRENT_DATE + INTERVAL '25 days',
    true,
    false,
    189,
    8,
    1,
    'https://creativedigital.com/careers/marketing-manager',
    'jobs@creativedigital.com',
    'active',
    'yearly',
    'SEO,Social Media,Analytics,Google Ads,Marketing'
),

-- Job 3: Project Manager (Urgent)
(
    'Project Manager',
    'Manage multiple client projects remotely. Experience with Agile methodologies and team leadership required. Excellent work-life balance.',

    'Requirements:
• 4+ years of project management experience
• PMP or Agile certification preferred
• Experience with project management tools (Jira, Asana, Monday.com)
• Strong leadership and communication skills
• Experience managing remote teams',

    'Responsibilities:
• Lead project planning and execution from initiation to closure
• Manage project timelines, budgets, and resource allocation
• Facilitate team meetings and stakeholder communications
• Identify and mitigate project risks
• Ensure quality deliverables meet client expectations',

    (SELECT id FROM companies WHERE name = 'Business Solutions LLC' LIMIT 1),
    (SELECT id FROM categories WHERE name = 'Management' LIMIT 1),
    'Remote (US)',
    'contract',
    'remote',
    'mid',
    70000.00,
    95000.00,
    'USD',
    'Health stipend, Flexible schedule, Professional development, Equipment provided',
    CURRENT_DATE + INTERVAL '15 days',
    true,
    false,
    321,
    15,
    1,
    'https://businesssolutions.com/careers/project-manager',
    'hiring@businesssolutions.com',
    'active',
    'yearly',
    'Agile,Leadership,Scrum,Project Management,Jira'
),

-- Job 4: UX/UI Designer
(
    'UX/UI Designer',
    'Design beautiful, user-friendly interfaces for mobile and web applications. Portfolio review required. Flexible 20-30 hours per week.',

    'Requirements:
• 2+ years of UX/UI design experience
• Proficiency in Figma, Sketch, and prototyping tools
• Strong portfolio demonstrating mobile and web design
• Understanding of user-centered design principles
• Experience with design systems and style guides',

    'Responsibilities:
• Create user-friendly interfaces for web and mobile applications
• Develop wireframes, prototypes, and high-fidelity designs
• Conduct user research and usability testing
• Collaborate with developers to ensure design implementation
• Maintain and evolve design systems',

    (SELECT id FROM companies WHERE name = 'Creative Studio' LIMIT 1),
    (SELECT id FROM categories WHERE name = 'Design' LIMIT 1),
    'Remote (US)',
    'part-time',
    'remote',
    'entry',
    45000.00,
    60000.00,
    'USD',
    'Flexible schedule, Professional development, Design tool subscriptions',
    CURRENT_DATE + INTERVAL '20 days',
    true,
    false,
    156,
    6,
    1,
    'https://creativestudio.com/careers/ux-ui-designer',
    'design@creativestudio.com',
    'active',
    'yearly',
    'Figma,Sketch,Prototyping,UX Design,UI Design'
),

-- Job 5: Financial Analyst (Featured)
(
    'Financial Analyst',
    'Analyze financial data and create reports for investment decisions. Strong Excel and SQL skills required. Flexible hybrid schedule available.',

    'Requirements:
• 3+ years of financial analysis experience
• Advanced Excel and SQL skills
• Experience with financial modeling and forecasting
• Knowledge of investment principles and markets
• Strong analytical and problem-solving abilities',

    'Responsibilities:
• Analyze financial data and market trends
• Create comprehensive financial reports and presentations
• Build and maintain financial models and forecasts
• Support investment decision-making processes
• Monitor portfolio performance and risk metrics',

    (SELECT id FROM companies WHERE name = 'FinTech Solutions' LIMIT 1),
    (SELECT id FROM categories WHERE name = 'Finance' LIMIT 1),
    'Boston, MA (Hybrid)',
    'full-time',
    'hybrid',
    'mid',
    75000.00,
    100000.00,
    'USD',
    'Health insurance, Dental, Vision, 401k matching, Flexible PTO, Professional development',
    CURRENT_DATE + INTERVAL '35 days',
    true,
    true,
    298,
    18,
    1,
    'https://fintech.com/careers/financial-analyst',
    'careers@fintech.com',
    'active',
    'yearly',
    'Excel,SQL,Finance,Financial Modeling,Analytics'
),

-- Job 6: Content Writer
(
    'Content Writer',
    'Create engaging educational content for online courses. Experience in technical writing preferred. Work completely on your own schedule.',

    'Requirements:
• 2+ years of professional writing experience
• Strong research and technical writing skills
• Experience with educational or instructional content
• Ability to explain complex topics clearly
• Self-motivated and deadline-oriented',

    'Responsibilities:
• Research and write engaging educational content
• Develop course materials and learning resources
• Create blog posts and marketing content
• Collaborate with subject matter experts
• Edit and proofread content for accuracy and clarity',

    (SELECT id FROM companies WHERE name = 'EduTech Learning' LIMIT 1),
    (SELECT id FROM categories WHERE name = 'Writing' LIMIT 1),
    'Remote (Global)',
    'freelance',
    'remote',
    'entry',
    35.00,
    50.00,
    'USD',
    'Flexible schedule, Project bonuses, Professional development resources',
    CURRENT_DATE + INTERVAL '45 days',
    true,
    false,
    134,
    9,
    1,
    'https://edutech.com/careers/content-writer',
    'writers@edutech.com',
    'active',
    'hourly',
    'Writing,Education,Research,Content Creation,Technical Writing'
),

-- Job 7: Data Analyst
(
    'Data Analyst',
    'Transform raw data into actionable business insights. Work with modern data stack including Python, SQL, and Tableau. Remote-first company culture.',

    'Requirements:
• 2+ years of data analysis experience
• Proficiency in Python or R and SQL
• Experience with data visualization tools
• Strong statistical analysis skills
• Excellent communication and presentation abilities',

    'Responsibilities:
• Analyze large datasets to identify trends and patterns
• Create compelling data visualizations and dashboards
• Develop statistical models and perform hypothesis testing
• Present findings to stakeholders and leadership
• Collaborate with cross-functional teams on data projects',

    (SELECT id FROM companies WHERE name = 'DataFlow Systems' LIMIT 1),
    (SELECT id FROM categories WHERE name = 'Data' LIMIT 1),
    'Remote (US)',
    'full-time',
    'remote',
    'entry',
    58000.00,
    78000.00,
    'USD',
    'Health insurance, Dental, 401k matching, Flexible PTO, Learning budget',
    CURRENT_DATE + INTERVAL '28 days',
    true,
    false,
    167,
    7,
    1,
    'https://dataflow.com/careers/data-analyst',
    'data-jobs@dataflow.com',
    'active',
    'yearly',
    'Python,SQL,Tableau,Data Analysis,Statistics'
),

-- Job 8: Sales Development Representative
(
    'Sales Development Representative',
    'Drive new business growth through outbound prospecting and lead qualification. High-growth startup environment with excellent career advancement opportunities.',

    'Requirements:
• 1+ years of sales or customer-facing experience
• Strong communication and interpersonal skills
• Self-motivated and goal-oriented mindset
• Experience with CRM systems (Salesforce preferred)
• Comfortable with cold calling and email outreach',

    'Responsibilities:
• Generate qualified leads through outbound prospecting
• Conduct discovery calls and product demonstrations
• Maintain accurate records in CRM system
• Collaborate with marketing on lead generation campaigns
• Meet and exceed monthly and quarterly targets',

    (SELECT id FROM companies WHERE name = 'GreenTech Innovations' LIMIT 1),
    (SELECT id FROM categories WHERE name = 'Sales' LIMIT 1),
    'Remote (US)',
    'full-time',
    'remote',
    'entry',
    45000.00,
    65000.00,
    'USD',
    'Base salary + commission, Health insurance, 401k matching, Flexible PTO, Sales training',
    CURRENT_DATE + INTERVAL '40 days',
    true,
    false,
    203,
    11,
    1,
    'https://greentech.com/careers/sdr',
    'sales-jobs@greentech.com',
    'active',
    'yearly',
    'Sales,CRM,Lead Generation,Business Development,Communication'
);
