-- Create sample jobs for FlexJobs database
-- First, let's create some sample companies if they don't exist

-- Insert sample companies (only if they don't already exist)
INSERT INTO companies (name, description, website, industry, location, logo_url, is_verified, created_at) 
SELECT * FROM (VALUES 
('TechCorp Inc.', 'Leading technology company specializing in software development and cloud solutions', 'https://techcorp.com', 'Technology', 'San Francisco, CA', 'images/logo.png', true, CURRENT_TIMESTAMP),
('Creative Digital Agency', 'Full-service digital marketing agency helping brands grow online', 'https://creativedigital.com', 'Marketing', 'New York, NY', 'images/logo.png', true, CURRENT_TIMESTAMP),
('Business Solutions LLC', 'Business consulting and project management services', 'https://businesssolutions.com', 'Consulting', 'Chicago, IL', 'images/logo.png', true, CURRENT_TIMESTAMP),
('Creative Studio', 'Design and UX consulting firm', 'https://creativestudio.com', 'Design', 'Austin, TX', 'images/f.png', true, CURRENT_TIMESTAMP),
('FinTech Solutions', 'Financial technology and analytics company', 'https://fintech.com', 'Finance', 'Boston, MA', 'images/logo.png', true, CURRENT_TIMESTAMP),
('EduTech Learning', 'Online education and course development platform', 'https://edutech.com', 'Education', 'Seattle, WA', 'images/logo.png', true, CURRENT_TIMESTAMP),
('DataFlow Systems', 'Data analytics and business intelligence solutions', 'https://dataflow.com', 'Technology', 'Denver, CO', 'images/logo.png', true, CURRENT_TIMESTAMP),
('GreenTech Innovations', 'Sustainable technology and environmental solutions', 'https://greentech.com', 'Technology', 'Portland, OR', 'images/logo.png', true, CURRENT_TIMESTAMP)
) AS t(name, description, website, industry, location, logo_url, is_verified, created_at)
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE companies.name = t.name);

-- Create sample categories (only if they don't already exist)  
INSERT INTO categories (name, description, is_active, created_at)
SELECT * FROM (VALUES 
('Technology', 'Software development, IT, and technical roles', true, CURRENT_TIMESTAMP),
('Marketing', 'Digital marketing, content, and advertising roles', true, CURRENT_TIMESTAMP),
('Design', 'UX/UI design, graphic design, and creative roles', true, CURRENT_TIMESTAMP),
('Finance', 'Financial analysis, accounting, and fintech roles', true, CURRENT_TIMESTAMP),
('Management', 'Project management, operations, and leadership roles', true, CURRENT_TIMESTAMP),
('Writing', 'Content writing, copywriting, and editorial roles', true, CURRENT_TIMESTAMP),
('Sales', 'Sales, business development, and customer success roles', true, CURRENT_TIMESTAMP),
('Data', 'Data analysis, data science, and analytics roles', true, CURRENT_TIMESTAMP)
) AS t(name, description, is_active, created_at)
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE categories.name = t.name);

-- Now insert sample jobs based on the job preview examples
INSERT INTO jobs (
    title, description, requirements, responsibilities, company_id, category_id, 
    location, job_type, remote_type, experience_level, salary_min, salary_max, 
    salary_currency, benefits, application_deadline, is_active, is_featured, 
    views_count, applications_count, created_by, application_url, contact_email, status
) VALUES 

-- Job 1: Senior Software Developer (Featured)
(
    'Senior Software Developer',
    'Join our innovative team to build cutting-edge applications using React, Node.js, and cloud technologies. Perfect for experienced developers seeking flexible remote work.

We are looking for a passionate Senior Software Developer to join our growing engineering team. You will work on exciting projects that impact millions of users while enjoying the flexibility of remote work.

Key Technologies:
• React.js and modern JavaScript
• Node.js and Express
• AWS cloud services
• Docker and Kubernetes
• PostgreSQL and MongoDB

What We Offer:
• Competitive salary and equity
• Comprehensive health benefits
• Flexible work schedule
• Professional development budget
• Top-tier equipment provided',

    'Requirements:
• 5+ years of software development experience
• Strong proficiency in React and Node.js
• Experience with AWS cloud services
• Knowledge of Docker and containerization
• Experience with database design and optimization
• Excellent problem-solving and communication skills
• Bachelor''s degree in Computer Science or equivalent experience',

    'Responsibilities:
• Design and develop scalable web applications
• Collaborate with cross-functional teams on product features
• Write clean, maintainable, and well-tested code
• Participate in code reviews and technical discussions
• Mentor junior developers and contribute to team growth
• Stay current with emerging technologies and best practices',

    (SELECT id FROM companies WHERE name = 'TechCorp Inc.' LIMIT 1),
    (SELECT id FROM categories WHERE name = 'Technology' LIMIT 1),
    'Remote (US)',
    'full-time',
    'remote',
    'senior',
    85000.00,
    120000.00,
    'USD',
    'Health insurance, Dental, Vision, 401k matching, Flexible PTO, Home office stipend, Professional development budget',
    CURRENT_DATE + INTERVAL '30 days',
    true,
    true,
    245,
    12,
    1,
    'https://techcorp.com/careers/senior-developer',
    'careers@techcorp.com',
    'active'
),

-- Job 2: Digital Marketing Manager
(
    'Digital Marketing Manager',
    'Lead digital marketing campaigns for top brands. Manage social media, content strategy, and analytics. Flexible schedule with 2 days remote work per week.

We are seeking a creative and data-driven Digital Marketing Manager to develop and execute comprehensive digital marketing strategies for our diverse client portfolio.

What You''ll Do:
• Develop integrated marketing campaigns across multiple channels
• Manage social media presence and content calendars
• Analyze campaign performance and optimize for ROI
• Collaborate with creative teams on campaign assets
• Present results and insights to clients

Our Culture:
• Collaborative and creative environment
• Flexible hybrid work model
• Focus on work-life balance
• Continuous learning opportunities',

    'Requirements:
• 3+ years of digital marketing experience
• Proficiency in Google Analytics, AdWords, and social media platforms
• Experience with marketing automation tools
• Strong analytical and reporting skills
• Excellent written and verbal communication
• Bachelor''s degree in Marketing, Communications, or related field',

    'Responsibilities:
• Plan and execute multi-channel digital marketing campaigns
• Manage social media accounts and content creation
• Analyze performance metrics and prepare detailed reports
• Coordinate with design and content teams
• Stay current with digital marketing trends and best practices
• Manage client relationships and campaign budgets',

    (SELECT id FROM companies WHERE name = 'Creative Digital Agency' LIMIT 1),
    (SELECT id FROM categories WHERE name = 'Marketing' LIMIT 1),
    'New York, NY (Hybrid)',
    'full-time',
    'hybrid',
    'mid',
    65000.00,
    85000.00,
    'USD',
    'Health insurance, Dental, Vision, Flexible PTO, Professional development, Transit benefits',
    CURRENT_DATE + INTERVAL '25 days',
    true,
    false,
    189,
    8,
    1,
    'https://creativedigital.com/careers/marketing-manager',
    'jobs@creativedigital.com',
    'active'
),

-- Job 3: Project Manager (Urgent)
(
    'Project Manager',
    'Manage multiple client projects remotely. Experience with Agile methodologies and team leadership required. Excellent work-life balance.

Join our dynamic consulting team as a Project Manager where you''ll lead cross-functional teams and deliver exceptional results for our clients. This role offers complete remote flexibility.

Project Types:
• Software implementation projects
• Business process optimization
• Digital transformation initiatives
• Change management programs

Team Environment:
• Fully distributed team
• Collaborative culture
• Results-focused approach
• Strong emphasis on professional growth',

    'Requirements:
• 4+ years of project management experience
• PMP or Agile certification preferred
• Experience with project management tools (Jira, Asana, Monday.com)
• Strong leadership and communication skills
• Experience managing remote teams
• Bachelor''s degree in Business, Engineering, or related field',

    'Responsibilities:
• Lead project planning and execution from initiation to closure
• Manage project timelines, budgets, and resource allocation
• Facilitate team meetings and stakeholder communications
• Identify and mitigate project risks
• Ensure quality deliverables meet client expectations
• Mentor team members and promote best practices',

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
    'active'
),

-- Job 4: UX/UI Designer
(
    'UX/UI Designer',
    'Design beautiful, user-friendly interfaces for mobile and web applications. Portfolio review required. Flexible 20-30 hours per week.

We are looking for a talented UX/UI Designer to join our creative team. This part-time position offers excellent flexibility while working on exciting design projects for innovative startups and established brands.

Design Focus Areas:
• Mobile app interfaces
• Web application design
• Design systems and component libraries
• User research and testing
• Prototyping and wireframing

Work Style:
• Flexible schedule (20-30 hours/week)
• Fully remote position
• Collaborative design process
• Direct client interaction opportunities',

    'Requirements:
• 2+ years of UX/UI design experience
• Proficiency in Figma, Sketch, and prototyping tools
• Strong portfolio demonstrating mobile and web design
• Understanding of user-centered design principles
• Experience with design systems and style guides
• Bachelor''s degree in Design or related field preferred',

    'Responsibilities:
• Create user-friendly interfaces for web and mobile applications
• Develop wireframes, prototypes, and high-fidelity designs
• Conduct user research and usability testing
• Collaborate with developers to ensure design implementation
• Maintain and evolve design systems
• Present design concepts to clients and stakeholders',

    (SELECT id FROM companies WHERE name = 'Creative Studio' LIMIT 1),
    (SELECT id FROM categories WHERE name = 'Design' LIMIT 1),
    'Remote (US)',
    'part-time',
    'remote',
    'entry',
    45000.00,
    60000.00,
    'USD',
    'Flexible schedule, Professional development, Design tool subscriptions, Portfolio development support',
    CURRENT_DATE + INTERVAL '20 days',
    true,
    false,
    156,
    6,
    1,
    'https://creativestudio.com/careers/ux-ui-designer',
    'design@creativestudio.com',
    'active'
),

-- Job 5: Financial Analyst (Featured)
(
    'Financial Analyst',
    'Analyze financial data and create reports for investment decisions. Strong Excel and SQL skills required. Flexible hybrid schedule available.

Join our FinTech team as a Financial Analyst where you''ll work with cutting-edge financial technology and help drive data-driven investment decisions. This role offers a perfect blend of remote and office collaboration.

Analysis Areas:
• Market trend analysis
• Investment portfolio performance
• Risk assessment and modeling
• Financial forecasting
• Regulatory compliance reporting

Technology Stack:
• Advanced Excel and VBA
• SQL and database management
• Python for financial modeling
• Tableau for data visualization
• Bloomberg Terminal access',

    'Requirements:
• 3+ years of financial analysis experience
• Advanced Excel and SQL skills
• Experience with financial modeling and forecasting
• Knowledge of investment principles and markets
• Strong analytical and problem-solving abilities
• Bachelor''s degree in Finance, Economics, or related field
• CFA Level 1 or equivalent certification preferred',

    'Responsibilities:
• Analyze financial data and market trends
• Create comprehensive financial reports and presentations
• Build and maintain financial models and forecasts
• Support investment decision-making processes
• Monitor portfolio performance and risk metrics
• Collaborate with investment teams and clients',

    (SELECT id FROM companies WHERE name = 'FinTech Solutions' LIMIT 1),
    (SELECT id FROM categories WHERE name = 'Finance' LIMIT 1),
    'Boston, MA (Hybrid)',
    'full-time',
    'hybrid',
    'mid',
    75000.00,
    100000.00,
    'USD',
    'Health insurance, Dental, Vision, 401k matching, Flexible PTO, Professional development, Gym membership',
    CURRENT_DATE + INTERVAL '35 days',
    true,
    true,
    298,
    18,
    1,
    'https://fintech.com/careers/financial-analyst',
    'careers@fintech.com',
    'active'
),

-- Job 6: Content Writer
(
    'Content Writer',
    'Create engaging educational content for online courses. Experience in technical writing preferred. Work completely on your own schedule.

We are seeking a skilled Content Writer to develop high-quality educational materials for our online learning platform. This fully remote freelance position offers complete schedule flexibility.

Content Types:
• Course modules and lessons
• Technical documentation
• Blog articles and guides
• Video scripts and presentations
• Assessment questions and quizzes

Subject Areas:
• Technology and programming
• Business and entrepreneurship
• Professional development
• Creative skills and design

Work Environment:
• 100% remote and flexible
• Project-based assignments
• Long-term partnership potential
• Creative freedom and autonomy',

    'Requirements:
• 2+ years of professional writing experience
• Strong research and technical writing skills
• Experience with educational or instructional content
• Ability to explain complex topics clearly
• Self-motivated and deadline-oriented
• Bachelor''s degree in English, Communications, or related field',

    'Responsibilities:
• Research and write engaging educational content
• Develop course materials and learning resources
• Create blog posts and marketing content
• Collaborate with subject matter experts
• Edit and proofread content for accuracy and clarity
• Adapt writing style for different audiences and formats',

    (SELECT id FROM companies WHERE name = 'EduTech Learning' LIMIT 1),
    (SELECT id FROM categories WHERE name = 'Writing' LIMIT 1),
    'Remote (Global)',
    'freelance',
    'remote',
    'entry',
    35.00,
    50.00,
    'USD',
    'Flexible schedule, Project bonuses, Professional development resources, Writing tool subscriptions',
    CURRENT_DATE + INTERVAL '45 days',
    true,
    false,
    134,
    9,
    1,
    'https://edutech.com/careers/content-writer',
    'writers@edutech.com',
    'active'
),

-- Job 7: Data Analyst
(
    'Data Analyst',
    'Transform raw data into actionable business insights. Work with modern data stack including Python, SQL, and Tableau. Remote-first company culture.

Join our data team and help businesses make better decisions through data-driven insights. You''ll work with diverse datasets and cutting-edge analytics tools in a fully remote environment.

Data Focus:
• Customer behavior analysis
• Business performance metrics
• Market research and trends
• Predictive modeling
• A/B testing and experimentation

Tech Environment:
• Python and R for analysis
• SQL and NoSQL databases
• Tableau and PowerBI
• Cloud platforms (AWS, GCP)
• Git for version control',

    'Requirements:
• 2+ years of data analysis experience
• Proficiency in Python or R and SQL
• Experience with data visualization tools
• Strong statistical analysis skills
• Excellent communication and presentation abilities
• Bachelor''s degree in Statistics, Mathematics, or related field',

    'Responsibilities:
• Analyze large datasets to identify trends and patterns
• Create compelling data visualizations and dashboards
• Develop statistical models and perform hypothesis testing
• Present findings to stakeholders and leadership
• Collaborate with cross-functional teams on data projects
• Maintain data quality and documentation standards',

    (SELECT id FROM companies WHERE name = 'DataFlow Systems' LIMIT 1),
    (SELECT id FROM categories WHERE name = 'Data' LIMIT 1),
    'Remote (US)',
    'full-time',
    'remote',
    'entry',
    58000.00,
    78000.00,
    'USD',
    'Health insurance, Dental, 401k matching, Flexible PTO, Learning budget, Home office setup',
    CURRENT_DATE + INTERVAL '28 days',
    true,
    false,
    167,
    7,
    1,
    'https://dataflow.com/careers/data-analyst',
    'data-jobs@dataflow.com',
    'active'
),

-- Job 8: Sales Development Representative
(
    'Sales Development Representative',
    'Drive new business growth through outbound prospecting and lead qualification. High-growth startup environment with excellent career advancement opportunities.

Join our fast-growing sales team and play a key role in expanding our customer base. This remote position offers competitive compensation with uncapped commission potential.

Sales Process:
• Outbound prospecting and cold outreach
• Lead qualification and discovery calls
• CRM management and pipeline tracking
• Collaboration with Account Executives
• Territory and account planning

Growth Opportunities:
• Clear path to Account Executive role
• Comprehensive sales training program
• Mentorship from senior sales leaders
• Performance-based promotions
• International expansion opportunities',

    'Requirements:
• 1+ years of sales or customer-facing experience
• Strong communication and interpersonal skills
• Self-motivated and goal-oriented mindset
• Experience with CRM systems (Salesforce preferred)
• Comfortable with cold calling and email outreach
• Bachelor''s degree preferred but not required',

    'Responsibilities:
• Generate qualified leads through outbound prospecting
• Conduct discovery calls and product demonstrations
• Maintain accurate records in CRM system
• Collaborate with marketing on lead generation campaigns
• Meet and exceed monthly and quarterly targets
• Continuously improve sales processes and techniques',

    (SELECT id FROM companies WHERE name = 'GreenTech Innovations' LIMIT 1),
    (SELECT id FROM categories WHERE name = 'Sales' LIMIT 1),
    'Remote (US)',
    'full-time',
    'remote',
    'entry',
    45000.00,
    65000.00,
    'USD',
    'Base salary + commission, Health insurance, 401k matching, Flexible PTO, Sales training, Career development',
    CURRENT_DATE + INTERVAL '40 days',
    true,
    false,
    203,
    11,
    1,
    'https://greentech.com/careers/sdr',
    'sales-jobs@greentech.com',
    'active'
);

-- Update the tags field for existing jobs (if tags column exists)
-- Note: This assumes a tags column exists. If not, this will be handled by the job creation process.
