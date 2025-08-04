-- FlexJobs Database Data Snapshot
-- Generated: 2025-08-04T08:35:32.448Z

-- Data for table: agent_reviews
INSERT INTO agent_reviews (id, agent_id, reviewer_id, rating, review_text, is_anonymous, is_approved, created_at) VALUES (3, 5, 11, 5, 'Maria transformed our social media presence completely. Her strategic approach and cultural insights were invaluable for our international expansion.', false, true, '2025-07-30T06:23:30.827Z');
INSERT INTO agent_reviews (id, agent_id, reviewer_id, rating, review_text, is_anonymous, is_approved, created_at) VALUES (4, 6, 10, 5, 'Yuki created an incredible user experience for our app. Her attention to detail and understanding of global design principles is exceptional.', false, true, '2025-07-30T06:23:30.827Z');
INSERT INTO agent_reviews (id, agent_id, reviewer_id, rating, review_text, is_anonymous, is_approved, created_at) VALUES (5, 7, 9, 5, 'Ahmed helped us unlock insights from our data that we never knew existed. His analytical skills and clear communication made complex data accessible.', false, true, '2025-07-30T06:23:30.827Z');
INSERT INTO agent_reviews (id, agent_id, reviewer_id, rating, review_text, is_anonymous, is_approved, created_at) VALUES (6, 8, 6, 5, 'Sophie managed our distributed team flawlessly. Her Agile expertise and cross-timezone coordination skills are unmatched.', false, true, '2025-07-30T06:23:30.827Z');
INSERT INTO agent_reviews (id, agent_id, reviewer_id, rating, review_text, is_anonymous, is_approved, created_at) VALUES (7, 9, 8, 4, 'Raj built our platform efficiently and with great attention to scalability. His technical skills and remote collaboration are excellent.', false, true, '2025-07-30T06:23:30.827Z');
INSERT INTO agent_reviews (id, agent_id, reviewer_id, rating, review_text, is_anonymous, is_approved, created_at) VALUES (8, 10, 7, 5, 'Emma created content that perfectly captured our brand voice. Her writing quality and understanding of remote work culture is outstanding.', false, true, '2025-07-30T06:23:30.827Z');

-- Data for table: agents
INSERT INTO agents (id, user_id, agent_name, display_name, specializations, bio, avatar_url, experience_years, rating, total_reviews, currency, languages, skills, certifications, location, timezone, linkedin_url, portfolio_url, is_featured, is_active, created_at, updated_at) VALUES (5, 6, 'Maria Rodriguez', 'Digital Marketing Strategist', '["Digital Marketing", "Content Strategy", "Social Media Management", "SEO/SEM"]', 'Passionate digital marketing strategist with 8 years of experience helping remote teams build strong online presence. Specializes in content marketing, social media strategy, and conversion optimization for international markets.', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400', 8, '5.00', 1, 'USD', '["Spanish", "English", "Portuguese"]', '["Google Analytics", "Facebook Ads", "Content Marketing", "Email Marketing", "HubSpot", "Canva", "Adobe Creative Suite"]', '["Google Ads Certified", "HubSpot Content Marketing", "Facebook Blueprint"]', 'Mexico City, Mexico', 'America/Mexico_City', 'https://linkedin.com/in/maria-rodriguez-marketing', 'https://mariamarketing.portfolio.com', true, true, '2025-07-30T06:23:30.179Z', '2025-07-30T06:23:30.179Z');
INSERT INTO agents (id, user_id, agent_name, display_name, specializations, bio, avatar_url, experience_years, rating, total_reviews, currency, languages, skills, certifications, location, timezone, linkedin_url, portfolio_url, is_featured, is_active, created_at, updated_at) VALUES (6, 7, 'Yuki Tanaka', 'Senior UX/UI Designer', '["UX Design", "UI Design", "User Research", "Prototyping"]', 'Senior UX/UI designer with 6 years of experience creating intuitive digital experiences. Expert in user-centered design methodology, with a focus on accessibility and cross-cultural usability for global remote teams.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', 6, '5.00', 1, 'USD', '["Japanese", "English"]', '["Figma", "Adobe XD", "Sketch", "Principle", "InVision", "User Research", "Wireframing", "Prototyping"]', '["Google UX Design Certificate", "Adobe Certified Expert"]', 'Tokyo, Japan', 'Asia/Tokyo', 'https://linkedin.com/in/yuki-tanaka-ux', 'https://yukidesign.behance.net', true, true, '2025-07-30T06:23:30.179Z', '2025-07-30T06:23:30.179Z');
INSERT INTO agents (id, user_id, agent_name, display_name, specializations, bio, avatar_url, experience_years, rating, total_reviews, currency, languages, skills, certifications, location, timezone, linkedin_url, portfolio_url, is_featured, is_active, created_at, updated_at) VALUES (7, 8, 'Ahmed Hassan', 'Senior Data Analyst', '["Data Analysis", "Business Intelligence", "Data Visualization", "Statistical Analysis"]', 'Experienced data analyst with 7 years of expertise in transforming complex data into actionable business insights. Specializes in predictive analytics, dashboard creation, and helping remote teams make data-driven decisions.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 7, '5.00', 1, 'USD', '["Arabic", "English", "French"]', '["Python", "R", "SQL", "Tableau", "Power BI", "Excel", "Google Analytics", "Machine Learning"]', '["Microsoft Power BI Certified", "Tableau Desktop Specialist", "Google Analytics Certified"]', 'Cairo, Egypt', 'Africa/Cairo', 'https://linkedin.com/in/ahmed-hassan-data', 'https://ahmeddata.github.io', false, true, '2025-07-30T06:23:30.179Z', '2025-07-30T06:23:30.179Z');
INSERT INTO agents (id, user_id, agent_name, display_name, specializations, bio, avatar_url, experience_years, rating, total_reviews, currency, languages, skills, certifications, location, timezone, linkedin_url, portfolio_url, is_featured, is_active, created_at, updated_at) VALUES (8, 9, 'Sophie Dubois', 'Agile Project Manager', '["Project Management", "Agile/Scrum", "Team Leadership", "Process Optimization"]', 'Certified Agile project manager with 9 years of experience leading distributed teams across multiple time zones. Expert in Scrum methodology, stakeholder management, and optimizing workflows for maximum remote team productivity.', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', 9, '5.00', 1, 'EUR', '["French", "English", "German"]', '["Scrum", "Kanban", "Jira", "Asana", "Microsoft Project", "Slack", "Zoom", "Confluence"]', '["PMP Certified", "Certified ScrumMaster", "SAFe Agilist"]', 'Lyon, France', 'Europe/Paris', 'https://linkedin.com/in/sophie-dubois-pm', 'https://sophiepm.portfolio.dev', true, true, '2025-07-30T06:23:30.179Z', '2025-07-30T06:23:30.179Z');
INSERT INTO agents (id, user_id, agent_name, display_name, specializations, bio, avatar_url, experience_years, rating, total_reviews, currency, languages, skills, certifications, location, timezone, linkedin_url, portfolio_url, is_featured, is_active, created_at, updated_at) VALUES (9, 10, 'Raj Patel', 'Full-Stack Developer', '["Full-Stack Development", "React", "Node.js", "Cloud Architecture"]', 'Full-stack developer with 5 years of experience building scalable web applications for global remote teams. Passionate about clean code, modern frameworks, and helping startups transform their digital presence.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f9?w=400', 5, '4.00', 1, 'USD', '["Hindi", "English", "Gujarati"]', '["JavaScript", "React", "Node.js", "Python", "AWS", "Docker", "MongoDB", "PostgreSQL", "Git"]', '["AWS Solutions Architect", "MongoDB Certified Developer"]', 'Bangalore, India', 'Asia/Kolkata', 'https://linkedin.com/in/raj-patel-dev', 'https://rajpatel.dev', false, true, '2025-07-30T06:23:30.179Z', '2025-07-30T06:23:30.179Z');
INSERT INTO agents (id, user_id, agent_name, display_name, specializations, bio, avatar_url, experience_years, rating, total_reviews, currency, languages, skills, certifications, location, timezone, linkedin_url, portfolio_url, is_featured, is_active, created_at, updated_at) VALUES (10, 11, 'Emma Johnson', 'Content Strategist & Writer', '["Content Writing", "Content Strategy", "Copywriting", "Technical Writing"]', 'Creative content strategist and writer with 4 years of experience crafting compelling content for remote-first companies. Specializes in B2B content marketing, technical documentation, and helping distributed teams tell their stories effectively.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', 4, '5.00', 1, 'CAD', '["English", "French"]', '["Content Marketing", "SEO Writing", "Technical Writing", "WordPress", "Google Docs", "Grammarly", "Hemingway Editor"]', '["HubSpot Content Marketing", "Google Analytics Certified"]', 'Toronto, Canada', 'America/Toronto', 'https://linkedin.com/in/emma-johnson-writer', 'https://emmajohnson.contently.com', false, true, '2025-07-30T06:23:30.179Z', '2025-07-30T06:23:30.179Z');
INSERT INTO agents (id, user_id, agent_name, display_name, specializations, bio, avatar_url, experience_years, rating, total_reviews, currency, languages, skills, certifications, location, timezone, linkedin_url, portfolio_url, is_featured, is_active, created_at, updated_at) VALUES (14, NULL, 'John Smith', 'John S.', 'Technology,Remote Work', 'Experienced tech recruiter specializing in remote positions', NULL, 5, '0.00', 0, 'USD', NULL, NULL, NULL, 'New York, NY', 'America/New_York', NULL, NULL, false, true, '2025-07-30T13:07:28.706Z', '2025-07-30T13:07:28.706Z');
INSERT INTO agents (id, user_id, agent_name, display_name, specializations, bio, avatar_url, experience_years, rating, total_reviews, currency, languages, skills, certifications, location, timezone, linkedin_url, portfolio_url, is_featured, is_active, created_at, updated_at) VALUES (15, NULL, 'Sarah Johnson', 'Sarah J.', 'Marketing,Sales', 'Marketing and sales recruitment specialist', NULL, 3, '0.00', 0, 'USD', NULL, NULL, NULL, 'Los Angeles, CA', 'America/Los_Angeles', NULL, NULL, false, true, '2025-07-30T13:07:28.706Z', '2025-07-30T13:07:28.706Z');
INSERT INTO agents (id, user_id, agent_name, display_name, specializations, bio, avatar_url, experience_years, rating, total_reviews, currency, languages, skills, certifications, location, timezone, linkedin_url, portfolio_url, is_featured, is_active, created_at, updated_at) VALUES (16, NULL, 'Michael Brown', 'Mike B.', 'Finance,Accounting', 'Finance and accounting professional recruiter', NULL, 7, '0.00', 0, 'USD', NULL, NULL, NULL, 'Chicago, IL', 'America/Chicago', NULL, NULL, false, true, '2025-07-30T13:07:28.706Z', '2025-07-30T13:07:28.706Z');

-- Data for table: categories
INSERT INTO categories (id, name, description, icon, created_at, is_active) VALUES (1, 'Technology', 'Software development, IT, and tech-related jobs', 'fa-laptop-code', '2025-07-24T12:53:53.186Z', NULL);
INSERT INTO categories (id, name, description, icon, created_at, is_active) VALUES (2, 'Marketing', 'Digital marketing, content, and advertising roles', 'fa-bullhorn', '2025-07-24T12:53:53.186Z', NULL);
INSERT INTO categories (id, name, description, icon, created_at, is_active) VALUES (3, 'Design', 'UI/UX, graphic design, and creative positions', 'fa-paint-brush', '2025-07-24T12:53:53.186Z', NULL);
INSERT INTO categories (id, name, description, icon, created_at, is_active) VALUES (4, 'Sales', 'Sales representatives, account managers, and business development', 'fa-chart-line', '2025-07-24T12:53:53.186Z', NULL);
INSERT INTO categories (id, name, description, icon, created_at, is_active) VALUES (5, 'Customer Service', 'Support, customer success, and service roles', 'fa-headset', '2025-07-24T12:53:53.186Z', NULL);
INSERT INTO categories (id, name, description, icon, created_at, is_active) VALUES (6, 'Finance', 'Accounting, financial analysis, and bookkeeping', 'fa-calculator', '2025-07-24T12:53:53.186Z', NULL);
INSERT INTO categories (id, name, description, icon, created_at, is_active) VALUES (7, 'Writing', 'Content writing, copywriting, and editorial roles', 'fa-pen', '2025-07-24T12:53:53.186Z', NULL);
INSERT INTO categories (id, name, description, icon, created_at, is_active) VALUES (8, 'Education', 'Teaching, training, and educational content creation', 'fa-graduation-cap', '2025-07-24T12:53:53.186Z', NULL);
INSERT INTO categories (id, name, description, icon, created_at, is_active) VALUES (9, 'Healthcare', 'Medical, nursing, and healthcare administration', 'fa-stethoscope', '2025-07-24T12:53:53.186Z', NULL);
INSERT INTO categories (id, name, description, icon, created_at, is_active) VALUES (10, 'Project Management', 'Project managers, coordinators, and operations', 'fa-tasks', '2025-07-24T12:53:53.186Z', NULL);
INSERT INTO categories (id, name, description, icon, created_at, is_active) VALUES (27, 'Management', 'Project management, operations, and leadership roles', 'fas fa-users-cog', '2025-07-31T03:59:12.180Z', NULL);
INSERT INTO categories (id, name, description, icon, created_at, is_active) VALUES (30, 'Data', 'Data analysis, data science, and analytics roles', 'fas fa-database', '2025-07-31T03:59:12.180Z', NULL);

-- Data for table: companies
INSERT INTO companies (id, name, description, website, logo, industry, company_size, location, founded_year, user_id, is_verified, created_at, updated_at, logo_url) VALUES (1, 'Dropbox', NULL, 'https://dropbox.com', 'https://cdn.worldvectorlogo.com/logos/dropbox-1.svg', NULL, '1-10', NULL, NULL, NULL, false, '2025-07-30T11:25:13.033Z', '2025-07-30T11:25:13.033Z', NULL);
INSERT INTO companies (id, name, description, website, logo, industry, company_size, location, founded_year, user_id, is_verified, created_at, updated_at, logo_url) VALUES (2, 'Netflix', NULL, 'https://netflix.com', 'https://cdn.worldvectorlogo.com/logos/netflix-3.svg', NULL, '1-10', NULL, NULL, NULL, false, '2025-07-30T11:25:13.100Z', '2025-07-30T11:25:13.100Z', NULL);
INSERT INTO companies (id, name, description, website, logo, industry, company_size, location, founded_year, user_id, is_verified, created_at, updated_at, logo_url) VALUES (3, 'Zillow', NULL, 'https://zillow.com', 'https://cdn.worldvectorlogo.com/logos/zillow-1.svg', NULL, '1-10', NULL, NULL, NULL, false, '2025-07-30T11:25:13.102Z', '2025-07-30T11:25:13.102Z', NULL);
INSERT INTO companies (id, name, description, website, logo, industry, company_size, location, founded_year, user_id, is_verified, created_at, updated_at, logo_url) VALUES (4, 'Colorado Department of Transportation', NULL, 'https://cdot.gov', NULL, NULL, '1-10', NULL, NULL, NULL, false, '2025-07-30T11:25:13.104Z', '2025-07-30T11:25:13.104Z', NULL);
INSERT INTO companies (id, name, description, website, logo, industry, company_size, location, founded_year, user_id, is_verified, created_at, updated_at, logo_url) VALUES (5, 'Reddit', NULL, 'https://reddit.com', 'https://cdn.worldvectorlogo.com/logos/reddit-1.svg', NULL, '1-10', NULL, NULL, NULL, false, '2025-07-30T11:25:13.105Z', '2025-07-30T11:25:13.105Z', NULL);
INSERT INTO companies (id, name, description, website, logo, industry, company_size, location, founded_year, user_id, is_verified, created_at, updated_at, logo_url) VALUES (22, 'Creative Digital Agency', 'Full-service digital marketing agency helping brands grow online', 'https://creativedigital.com', NULL, 'Marketing', '1-10', 'New York, NY', NULL, NULL, true, '2025-07-31T04:27:05.627Z', '2025-07-31T04:27:05.627Z', 'images/logo.png');
INSERT INTO companies (id, name, description, website, logo, industry, company_size, location, founded_year, user_id, is_verified, created_at, updated_at, logo_url) VALUES (23, 'Business Solutions LLC', 'Business consulting and project management services', 'https://businesssolutions.com', NULL, 'Consulting', '1-10', 'Chicago, IL', NULL, NULL, true, '2025-07-31T04:27:05.627Z', '2025-07-31T04:27:05.627Z', 'images/logo.png');
INSERT INTO companies (id, name, description, website, logo, industry, company_size, location, founded_year, user_id, is_verified, created_at, updated_at, logo_url) VALUES (24, 'DataFlow Systems', 'Data analytics and business intelligence solutions', 'https://dataflow.com', NULL, 'Technology', '1-10', 'Denver, CO', NULL, NULL, true, '2025-07-31T04:27:05.627Z', '2025-07-31T04:27:05.627Z', 'images/logo.png');
INSERT INTO companies (id, name, description, website, logo, industry, company_size, location, founded_year, user_id, is_verified, created_at, updated_at, logo_url) VALUES (25, 'FinTech Solutions', 'Financial technology and analytics company', 'https://fintech.com', NULL, 'Finance', '1-10', 'Boston, MA', NULL, NULL, true, '2025-07-31T04:27:05.627Z', '2025-07-31T04:27:05.627Z', 'images/logo.png');
INSERT INTO companies (id, name, description, website, logo, industry, company_size, location, founded_year, user_id, is_verified, created_at, updated_at, logo_url) VALUES (26, 'Creative Studio', 'Design and UX consulting firm', 'https://creativestudio.com', NULL, 'Design', '1-10', 'Austin, TX', NULL, NULL, true, '2025-07-31T04:27:05.627Z', '2025-07-31T04:27:05.627Z', 'images/f.png');
INSERT INTO companies (id, name, description, website, logo, industry, company_size, location, founded_year, user_id, is_verified, created_at, updated_at, logo_url) VALUES (27, 'TechCorp Inc.', 'Leading technology company specializing in software development and cloud solutions', 'https://techcorp.com', NULL, 'Technology', '1-10', 'San Francisco, CA', NULL, NULL, true, '2025-07-31T04:27:05.627Z', '2025-07-31T04:27:05.627Z', 'images/logo.png');
INSERT INTO companies (id, name, description, website, logo, industry, company_size, location, founded_year, user_id, is_verified, created_at, updated_at, logo_url) VALUES (28, 'GreenTech Innovations', 'Sustainable technology and environmental solutions', 'https://greentech.com', NULL, 'Technology', '1-10', 'Portland, OR', NULL, NULL, true, '2025-07-31T04:27:05.627Z', '2025-07-31T04:27:05.627Z', 'images/logo.png');
INSERT INTO companies (id, name, description, website, logo, industry, company_size, location, founded_year, user_id, is_verified, created_at, updated_at, logo_url) VALUES (29, 'EduTech Learning', 'Online education and course development platform', 'https://edutech.com', NULL, 'Education', '1-10', 'Seattle, WA', NULL, NULL, true, '2025-07-31T04:27:05.627Z', '2025-07-31T04:27:05.627Z', 'images/logo.png');

-- Data for table: jobs
INSERT INTO jobs (id, title, description, requirements, responsibilities, company_id, category_id, location, job_type, remote_type, experience_level, salary_min, salary_max, salary_currency, benefits, application_deadline, is_active, is_featured, views_count, applications_count, created_by, created_at, updated_at, application_url, contact_email, status, salary_type, tags) VALUES (3, 'Senior Software Developer', 'Join our innovative team to build cutting-edge applications using React, Node.js, and cloud technologies. Perfect for experienced developers seeking flexible remote work.

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
• Top-tier equipment provided', 'Requirements:
• 5+ years of software development experience
• Strong proficiency in React and Node.js
• Experience with AWS cloud services
• Knowledge of Docker and containerization
• Experience with database design and optimization
• Excellent problem-solving and communication skills
• Bachelor''s degree in Computer Science or equivalent experience', 'Responsibilities:
• Design and develop scalable web applications
• Collaborate with cross-functional teams on product features
• Write clean, maintainable, and well-tested code
• Participate in code reviews and technical discussions
• Mentor junior developers and contribute to team growth
• Stay current with emerging technologies and best practices', 27, 1, 'Remote (US)', 'full-time', 'remote', 'senior', '85000.00', '120000.00', 'USD', 'Health insurance, Dental, Vision, 401k matching, Flexible PTO, Home office stipend, Professional development budget', '2025-08-29T23:00:00.000Z', true, true, 251, 12, 1, '2025-07-31T04:27:05.627Z', '2025-07-31T21:13:36.391Z', 'https://apply.marketingfirm.com/digital-marketing-specialist', 'careers@techcorp.com', 'active', 'yearly', NULL);
INSERT INTO jobs (id, title, description, requirements, responsibilities, company_id, category_id, location, job_type, remote_type, experience_level, salary_min, salary_max, salary_currency, benefits, application_deadline, is_active, is_featured, views_count, applications_count, created_by, created_at, updated_at, application_url, contact_email, status, salary_type, tags) VALUES (4, 'Digital Marketing Manager', 'Lead digital marketing campaigns for top brands. Manage social media, content strategy, and analytics. Flexible schedule with 2 days remote work per week.

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
• Continuous learning opportunities', 'Requirements:
• 3+ years of digital marketing experience
• Proficiency in Google Analytics, AdWords, and social media platforms
• Experience with marketing automation tools
• Strong analytical and reporting skills
• Excellent written and verbal communication
• Bachelor''s degree in Marketing, Communications, or related field', 'Responsibilities:
• Plan and execute multi-channel digital marketing campaigns
• Manage social media accounts and content creation
• Analyze performance metrics and prepare detailed reports
• Coordinate with design and content teams
• Stay current with digital marketing trends and best practices
• Manage client relationships and campaign budgets', 22, 2, 'New York, NY (Hybrid)', 'full-time', 'hybrid', 'mid', '65000.00', '85000.00', 'USD', 'Health insurance, Dental, Vision, Flexible PTO, Professional development, Transit benefits', '2025-08-24T23:00:00.000Z', true, false, 189, 8, 1, '2025-07-31T04:27:05.627Z', '2025-07-31T19:18:05.509Z', 'https://careers.datacompany.com/data-scientist-position', 'jobs@creativedigital.com', 'active', 'yearly', NULL);
INSERT INTO jobs (id, title, description, requirements, responsibilities, company_id, category_id, location, job_type, remote_type, experience_level, salary_min, salary_max, salary_currency, benefits, application_deadline, is_active, is_featured, views_count, applications_count, created_by, created_at, updated_at, application_url, contact_email, status, salary_type, tags) VALUES (5, 'Project Manager', 'Manage multiple client projects remotely. Experience with Agile methodologies and team leadership required. Excellent work-life balance.

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
• Strong emphasis on professional growth', 'Requirements:
• 4+ years of project management experience
• PMP or Agile certification preferred
• Experience with project management tools (Jira, Asana, Monday.com)
• Strong leadership and communication skills
• Experience managing remote teams
• Bachelor''s degree in Business, Engineering, or related field', 'Responsibilities:
• Lead project planning and execution from initiation to closure
• Manage project timelines, budgets, and resource allocation
• Facilitate team meetings and stakeholder communications
• Identify and mitigate project risks
• Ensure quality deliverables meet client expectations
• Mentor team members and promote best practices', 23, 27, 'Remote (US)', 'contract', 'remote', 'mid', '70000.00', '95000.00', 'USD', 'Health stipend, Flexible schedule, Professional development, Equipment provided', '2025-08-14T23:00:00.000Z', true, false, 321, 15, 1, '2025-07-31T04:27:05.627Z', '2025-07-31T19:18:05.509Z', 'https://jobs.projectmanager.com/apply/project-manager', 'hiring@businesssolutions.com', 'active', 'yearly', NULL);
INSERT INTO jobs (id, title, description, requirements, responsibilities, company_id, category_id, location, job_type, remote_type, experience_level, salary_min, salary_max, salary_currency, benefits, application_deadline, is_active, is_featured, views_count, applications_count, created_by, created_at, updated_at, application_url, contact_email, status, salary_type, tags) VALUES (6, 'UX/UI Designer', 'Design beautiful, user-friendly interfaces for mobile and web applications. Portfolio review required. Flexible 20-30 hours per week.

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
• Direct client interaction opportunities', 'Requirements:
• 2+ years of UX/UI design experience
• Proficiency in Figma, Sketch, and prototyping tools
• Strong portfolio demonstrating mobile and web design
• Understanding of user-centered design principles
• Experience with design systems and style guides
• Bachelor''s degree in Design or related field preferred', 'Responsibilities:
• Create user-friendly interfaces for web and mobile applications
• Develop wireframes, prototypes, and high-fidelity designs
• Conduct user research and usability testing
• Collaborate with developers to ensure design implementation
• Maintain and evolve design systems
• Present design concepts to clients and stakeholders', 26, 3, 'Remote (US)', 'part-time', 'remote', 'entry', '45000.00', '60000.00', 'USD', 'Flexible schedule, Professional development, Design tool subscriptions, Portfolio development support', '2025-08-19T23:00:00.000Z', true, false, 160, 6, 1, '2025-07-31T04:27:05.627Z', '2025-07-31T21:39:29.341Z', 'https://apply.contentagency.com/content-writer', 'design@creativestudio.com', 'active', 'yearly', NULL);
INSERT INTO jobs (id, title, description, requirements, responsibilities, company_id, category_id, location, job_type, remote_type, experience_level, salary_min, salary_max, salary_currency, benefits, application_deadline, is_active, is_featured, views_count, applications_count, created_by, created_at, updated_at, application_url, contact_email, status, salary_type, tags) VALUES (7, 'Financial Analyst', 'Analyze financial data and create reports for investment decisions. Strong Excel and SQL skills required. Flexible hybrid schedule available.

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
• Bloomberg Terminal access', 'Requirements:
• 3+ years of financial analysis experience
• Advanced Excel and SQL skills
• Experience with financial modeling and forecasting
• Knowledge of investment principles and markets
• Strong analytical and problem-solving abilities
• Bachelor''s degree in Finance, Economics, or related field
• CFA Level 1 or equivalent certification preferred', 'Responsibilities:
• Analyze financial data and market trends
• Create comprehensive financial reports and presentations
• Build and maintain financial models and forecasts
• Support investment decision-making processes
• Monitor portfolio performance and risk metrics
• Collaborate with investment teams and clients', 25, 6, 'Boston, MA (Hybrid)', 'full-time', 'hybrid', 'mid', '75000.00', '100000.00', 'USD', 'Health insurance, Dental, Vision, 401k matching, Flexible PTO, Professional development, Gym membership', '2025-09-03T23:00:00.000Z', true, true, 309, 18, 1, '2025-07-31T04:27:05.627Z', '2025-07-31T20:31:07.170Z', 'https://careers.salesforce.com/apply/sales-manager', 'careers@fintech.com', 'active', 'yearly', NULL);
INSERT INTO jobs (id, title, description, requirements, responsibilities, company_id, category_id, location, job_type, remote_type, experience_level, salary_min, salary_max, salary_currency, benefits, application_deadline, is_active, is_featured, views_count, applications_count, created_by, created_at, updated_at, application_url, contact_email, status, salary_type, tags) VALUES (8, 'Content Writer', 'Create engaging educational content for online courses. Experience in technical writing preferred. Work completely on your own schedule.

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
• Creative freedom and autonomy', 'Requirements:
• 2+ years of professional writing experience
• Strong research and technical writing skills
• Experience with educational or instructional content
• Ability to explain complex topics clearly
• Self-motivated and deadline-oriented
• Bachelor''s degree in English, Communications, or related field', 'Responsibilities:
• Research and write engaging educational content
• Develop course materials and learning resources
• Create blog posts and marketing content
• Collaborate with subject matter experts
• Edit and proofread content for accuracy and clarity
• Adapt writing style for different audiences and formats', 29, 7, 'Remote (Global)', 'freelance', 'remote', 'entry', '35.00', '50.00', 'USD', 'Flexible schedule, Project bonuses, Professional development resources, Writing tool subscriptions', '2025-09-13T23:00:00.000Z', true, false, 134, 9, 1, '2025-07-31T04:27:05.627Z', '2025-07-31T19:18:05.509Z', 'https://jobs.hrfirm.com/hr-specialist-remote', 'writers@edutech.com', 'active', 'yearly', NULL);
INSERT INTO jobs (id, title, description, requirements, responsibilities, company_id, category_id, location, job_type, remote_type, experience_level, salary_min, salary_max, salary_currency, benefits, application_deadline, is_active, is_featured, views_count, applications_count, created_by, created_at, updated_at, application_url, contact_email, status, salary_type, tags) VALUES (9, 'Data Analyst', 'Transform raw data into actionable business insights. Work with modern data stack including Python, SQL, and Tableau. Remote-first company culture.

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
• Git for version control', 'Requirements:
• 2+ years of data analysis experience
• Proficiency in Python or R and SQL
• Experience with data visualization tools
• Strong statistical analysis skills
• Excellent communication and presentation abilities
• Bachelor''s degree in Statistics, Mathematics, or related field', 'Responsibilities:
• Analyze large datasets to identify trends and patterns
• Create compelling data visualizations and dashboards
• Develop statistical models and perform hypothesis testing
• Present findings to stakeholders and leadership
• Collaborate with cross-functional teams on data projects
• Maintain data quality and documentation standards', 24, 30, 'Remote (US)', 'full-time', 'remote', 'entry', '58000.00', '78000.00', 'USD', 'Health insurance, Dental, 401k matching, Flexible PTO, Learning budget, Home office setup', '2025-08-27T23:00:00.000Z', true, false, 167, 7, 1, '2025-07-31T04:27:05.627Z', '2025-07-31T19:18:05.509Z', 'https://example-company.com/apply/9', 'data-jobs@dataflow.com', 'active', 'yearly', NULL);
INSERT INTO jobs (id, title, description, requirements, responsibilities, company_id, category_id, location, job_type, remote_type, experience_level, salary_min, salary_max, salary_currency, benefits, application_deadline, is_active, is_featured, views_count, applications_count, created_by, created_at, updated_at, application_url, contact_email, status, salary_type, tags) VALUES (10, 'Sales Development Representative', 'Drive new business growth through outbound prospecting and lead qualification. High-growth startup environment with excellent career advancement opportunities.

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
• International expansion opportunities', 'Requirements:
• 1+ years of sales or customer-facing experience
• Strong communication and interpersonal skills
• Self-motivated and goal-oriented mindset
• Experience with CRM systems (Salesforce preferred)
• Comfortable with cold calling and email outreach
• Bachelor''s degree preferred but not required', 'Responsibilities:
• Generate qualified leads through outbound prospecting
• Conduct discovery calls and product demonstrations
• Maintain accurate records in CRM system
• Collaborate with marketing on lead generation campaigns
• Meet and exceed monthly and quarterly targets
• Continuously improve sales processes and techniques', 28, 4, 'Remote (US)', 'full-time', 'remote', 'entry', '45000.00', '65000.00', 'USD', 'Base salary + commission, Health insurance, 401k matching, Flexible PTO, Sales training, Career development', '2025-09-08T23:00:00.000Z', true, false, 203, 11, 1, '2025-07-31T04:27:05.627Z', '2025-07-31T19:18:05.509Z', 'https://example-company.com/apply/10', 'sales-jobs@greentech.com', 'active', 'yearly', NULL);

-- Data for table: users
INSERT INTO users (id, email, password, first_name, last_name, user_type, phone, bio, skills, experience_level, location, profile_image, linkedin_url, portfolio_url, is_active, email_verified, created_at, updated_at, google_id, apple_id, avatar_url, is_temp_account, created_via_wizard, work_type_preference, salary_preference, location_preference, job_preference, experience_level_preference, education_level_preference, benefit_preferences, wizard_completed_at, preferences_updated_at) VALUES (1, 'test@example.com', '$2b$12$gfe/o9wZmx97c5jslzcnA.kfiQ.9lqUPGXKmazL2OGEVh5W36rCkG', 'Test', 'User', 'job_seeker', NULL, NULL, NULL, 'entry', NULL, NULL, NULL, NULL, true, true, '2025-07-29T02:54:58.085Z', '2025-07-29T02:54:58.085Z', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-31T20:50:27.278Z');
INSERT INTO users (id, email, password, first_name, last_name, user_type, phone, bio, skills, experience_level, location, profile_image, linkedin_url, portfolio_url, is_active, email_verified, created_at, updated_at, google_id, apple_id, avatar_url, is_temp_account, created_via_wizard, work_type_preference, salary_preference, location_preference, job_preference, experience_level_preference, education_level_preference, benefit_preferences, wizard_completed_at, preferences_updated_at) VALUES (3, 'proton@ert.com', '$2b$12$UiLt8bjIBvJLYiVkbXc7aemTGebxl74TVP4NInJZYohG9HHExXxte', 'yrtrt', 'iuiuoi', 'job_seeker', NULL, NULL, NULL, 'entry', NULL, NULL, NULL, NULL, true, false, '2025-07-29T15:23:52.425Z', '2025-07-29T15:23:52.425Z', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-31T20:50:27.278Z');
INSERT INTO users (id, email, password, first_name, last_name, user_type, phone, bio, skills, experience_level, location, profile_image, linkedin_url, portfolio_url, is_active, email_verified, created_at, updated_at, google_id, apple_id, avatar_url, is_temp_account, created_via_wizard, work_type_preference, salary_preference, location_preference, job_preference, experience_level_preference, education_level_preference, benefit_preferences, wizard_completed_at, preferences_updated_at) VALUES (4, 'admin@flexjobs.com', '$2b$12$zpQwvYBskk6KVes/ISbnN..QHUv2NeM7A2U6nUu3ZEbFQW3aJdImK', 'Admin', 'User', 'admin', NULL, NULL, NULL, 'entry', NULL, NULL, NULL, NULL, true, true, '2025-07-30T01:56:15.016Z', '2025-07-30T01:56:15.016Z', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-31T20:50:27.278Z');
INSERT INTO users (id, email, password, first_name, last_name, user_type, phone, bio, skills, experience_level, location, profile_image, linkedin_url, portfolio_url, is_active, email_verified, created_at, updated_at, google_id, apple_id, avatar_url, is_temp_account, created_via_wizard, work_type_preference, salary_preference, location_preference, job_preference, experience_level_preference, education_level_preference, benefit_preferences, wizard_completed_at, preferences_updated_at) VALUES (6, 'maria.rodriguez@email.com', '$2b$12$LQv3c1yqBwlFHG1e7Q5D4.H9z7W8gJ5K9zD3R5Y4W8nF2J6sC1mT.', 'Maria', 'Rodriguez', 'employer', NULL, NULL, NULL, 'entry', NULL, NULL, NULL, NULL, true, true, '2025-07-30T06:23:30.170Z', '2025-07-30T06:23:30.170Z', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-31T20:50:27.278Z');
INSERT INTO users (id, email, password, first_name, last_name, user_type, phone, bio, skills, experience_level, location, profile_image, linkedin_url, portfolio_url, is_active, email_verified, created_at, updated_at, google_id, apple_id, avatar_url, is_temp_account, created_via_wizard, work_type_preference, salary_preference, location_preference, job_preference, experience_level_preference, education_level_preference, benefit_preferences, wizard_completed_at, preferences_updated_at) VALUES (7, 'yuki.tanaka@email.com', '$2b$12$LQv3c1yqBwlFHG1e7Q5D4.H9z7W8gJ5K9zD3R5Y4W8nF2J6sC1mT.', 'Yuki', 'Tanaka', 'employer', NULL, NULL, NULL, 'entry', NULL, NULL, NULL, NULL, true, true, '2025-07-30T06:23:30.170Z', '2025-07-30T06:23:30.170Z', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-31T20:50:27.278Z');
INSERT INTO users (id, email, password, first_name, last_name, user_type, phone, bio, skills, experience_level, location, profile_image, linkedin_url, portfolio_url, is_active, email_verified, created_at, updated_at, google_id, apple_id, avatar_url, is_temp_account, created_via_wizard, work_type_preference, salary_preference, location_preference, job_preference, experience_level_preference, education_level_preference, benefit_preferences, wizard_completed_at, preferences_updated_at) VALUES (8, 'ahmed.hassan@email.com', '$2b$12$LQv3c1yqBwlFHG1e7Q5D4.H9z7W8gJ5K9zD3R5Y4W8nF2J6sC1mT.', 'Ahmed', 'Hassan', 'employer', NULL, NULL, NULL, 'entry', NULL, NULL, NULL, NULL, true, true, '2025-07-30T06:23:30.170Z', '2025-07-30T06:23:30.170Z', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-31T20:50:27.278Z');
INSERT INTO users (id, email, password, first_name, last_name, user_type, phone, bio, skills, experience_level, location, profile_image, linkedin_url, portfolio_url, is_active, email_verified, created_at, updated_at, google_id, apple_id, avatar_url, is_temp_account, created_via_wizard, work_type_preference, salary_preference, location_preference, job_preference, experience_level_preference, education_level_preference, benefit_preferences, wizard_completed_at, preferences_updated_at) VALUES (9, 'sophie.dubois@email.com', '$2b$12$LQv3c1yqBwlFHG1e7Q5D4.H9z7W8gJ5K9zD3R5Y4W8nF2J6sC1mT.', 'Sophie', 'Dubois', 'employer', NULL, NULL, NULL, 'entry', NULL, NULL, NULL, NULL, true, true, '2025-07-30T06:23:30.170Z', '2025-07-30T06:23:30.170Z', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-31T20:50:27.278Z');
INSERT INTO users (id, email, password, first_name, last_name, user_type, phone, bio, skills, experience_level, location, profile_image, linkedin_url, portfolio_url, is_active, email_verified, created_at, updated_at, google_id, apple_id, avatar_url, is_temp_account, created_via_wizard, work_type_preference, salary_preference, location_preference, job_preference, experience_level_preference, education_level_preference, benefit_preferences, wizard_completed_at, preferences_updated_at) VALUES (10, 'raj.patel@email.com', '$2b$12$LQv3c1yqBwlFHG1e7Q5D4.H9z7W8gJ5K9zD3R5Y4W8nF2J6sC1mT.', 'Raj', 'Patel', 'employer', NULL, NULL, NULL, 'entry', NULL, NULL, NULL, NULL, true, true, '2025-07-30T06:23:30.170Z', '2025-07-30T06:23:30.170Z', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-31T20:50:27.278Z');
INSERT INTO users (id, email, password, first_name, last_name, user_type, phone, bio, skills, experience_level, location, profile_image, linkedin_url, portfolio_url, is_active, email_verified, created_at, updated_at, google_id, apple_id, avatar_url, is_temp_account, created_via_wizard, work_type_preference, salary_preference, location_preference, job_preference, experience_level_preference, education_level_preference, benefit_preferences, wizard_completed_at, preferences_updated_at) VALUES (11, 'emma.johnson@email.com', '$2b$12$LQv3c1yqBwlFHG1e7Q5D4.H9z7W8gJ5K9zD3R5Y4W8nF2J6sC1mT.', 'Emma', 'Johnson', 'employer', NULL, NULL, NULL, 'entry', NULL, NULL, NULL, NULL, true, true, '2025-07-30T06:23:30.170Z', '2025-07-30T06:23:30.170Z', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-31T20:50:27.278Z');
INSERT INTO users (id, email, password, first_name, last_name, user_type, phone, bio, skills, experience_level, location, profile_image, linkedin_url, portfolio_url, is_active, email_verified, created_at, updated_at, google_id, apple_id, avatar_url, is_temp_account, created_via_wizard, work_type_preference, salary_preference, location_preference, job_preference, experience_level_preference, education_level_preference, benefit_preferences, wizard_completed_at, preferences_updated_at) VALUES (12, 'proton@rt.com', '$2b$12$to5Aqc.9QUXkE3JptOIcje/b9v4lSgXCrhXM.PaCNl2.DO7iD2dSy', 'Vitron', 'V6', 'job_seeker', NULL, NULL, NULL, 'entry', NULL, NULL, NULL, NULL, true, false, '2025-07-31T20:09:14.624Z', '2025-07-31T20:09:14.624Z', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-31T20:50:27.278Z');
INSERT INTO users (id, email, password, first_name, last_name, user_type, phone, bio, skills, experience_level, location, profile_image, linkedin_url, portfolio_url, is_active, email_verified, created_at, updated_at, google_id, apple_id, avatar_url, is_temp_account, created_via_wizard, work_type_preference, salary_preference, location_preference, job_preference, experience_level_preference, education_level_preference, benefit_preferences, wizard_completed_at, preferences_updated_at) VALUES (13, 'protn@et.com', '$2b$12$AMRFWRC9T3Mzpia97QTuMu7TUIHCAG/Bv6whAxRjHVuKSgwVz0FES', 'Flash', 'Gordon', 'job_seeker', NULL, NULL, NULL, 'entry', NULL, NULL, NULL, NULL, true, false, '2025-07-31T21:44:02.239Z', '2025-07-31T21:44:02.239Z', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-31T21:44:02.239Z');

