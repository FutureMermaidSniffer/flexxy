-- Create sample jobs using existing companies and categories
INSERT INTO jobs (
    title, description, requirements, responsibilities, company_id, category_id, 
    location, job_type, remote_type, experience_level, salary_min, salary_max, 
    salary_currency, benefits, application_deadline, is_active, is_featured, 
    views_count, applications_count, created_by, application_url, contact_email, status, salary_type, tags
) VALUES 

-- Job 1: Senior Software Developer at Dropbox (Featured)
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

    1, -- Dropbox
    1, -- Technology
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
    'https://dropbox.com/careers/senior-developer',
    'careers@dropbox.com',
    'active',
    'yearly',
    'React,Node.js,AWS,Docker,JavaScript'
),

-- Job 2: Digital Marketing Manager at Netflix
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

    2, -- Netflix
    2, -- Marketing
    'Los Angeles, CA (Hybrid)',
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
    'https://netflix.com/careers/marketing-manager',
    'jobs@netflix.com',
    'active',
    'yearly',
    'SEO,Social Media,Analytics,Google Ads,Marketing'
),

-- Job 3: Project Manager at Zillow
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

    3, -- Zillow
    1, -- Technology
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
    'https://zillow.com/careers/project-manager',
    'hiring@zillow.com',
    'active',
    'yearly',
    'Agile,Leadership,Scrum,Project Management,Jira'
),

-- Job 4: UX/UI Designer at Reddit
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

    5, -- Reddit
    3, -- Design
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
    'https://reddit.com/careers/ux-ui-designer',
    'design@reddit.com',
    'active',
    'yearly',
    'Figma,Sketch,Prototyping,UX Design,UI Design'
),

-- Job 5: Financial Analyst at Netflix (Featured)
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

    2, -- Netflix
    6, -- Finance
    'Los Angeles, CA (Hybrid)',
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
    'https://netflix.com/careers/financial-analyst',
    'careers@netflix.com',
    'active',
    'yearly',
    'Excel,SQL,Finance,Financial Modeling,Analytics'
),

-- Job 6: Content Writer at Dropbox
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

    1, -- Dropbox
    7, -- Writing
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
    'https://dropbox.com/careers/content-writer',
    'writers@dropbox.com',
    'active',
    'hourly',
    'Writing,Education,Research,Content Creation,Technical Writing'
),

-- Job 7: Data Analyst at Zillow
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

    3, -- Zillow
    1, -- Technology
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
    'https://zillow.com/careers/data-analyst',
    'data-jobs@zillow.com',
    'active',
    'yearly',
    'Python,SQL,Tableau,Data Analysis,Statistics'
),

-- Job 8: Sales Development Representative at Reddit
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

    5, -- Reddit
    4, -- Sales
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
    'https://reddit.com/careers/sdr',
    'sales-jobs@reddit.com',
    'active',
    'yearly',
    'Sales,CRM,Lead Generation,Business Development,Communication'
);
