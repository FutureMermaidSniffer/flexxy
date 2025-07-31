-- Sample Agent Data with Mixed Nationalities
-- This script populates the database with 6 diverse agents

-- Insert sample users first (these will be the agent accounts)
INSERT INTO users (first_name, last_name, email, password, user_type, is_active, email_verified) VALUES
('Maria', 'Rodriguez', 'maria.rodriguez@email.com', '$2b$12$LQv3c1yqBwlFHG1e7Q5D4.H9z7W8gJ5K9zD3R5Y4W8nF2J6sC1mT.', 'employer', TRUE, TRUE),
('Yuki', 'Tanaka', 'yuki.tanaka@email.com', '$2b$12$LQv3c1yqBwlFHG1e7Q5D4.H9z7W8gJ5K9zD3R5Y4W8nF2J6sC1mT.', 'employer', TRUE, TRUE),
('Ahmed', 'Hassan', 'ahmed.hassan@email.com', '$2b$12$LQv3c1yqBwlFHG1e7Q5D4.H9z7W8gJ5K9zD3R5Y4W8nF2J6sC1mT.', 'employer', TRUE, TRUE),
('Sophie', 'Dubois', 'sophie.dubois@email.com', '$2b$12$LQv3c1yqBwlFHG1e7Q5D4.H9z7W8gJ5K9zD3R5Y4W8nF2J6sC1mT.', 'employer', TRUE, TRUE),
('Raj', 'Patel', 'raj.patel@email.com', '$2b$12$LQv3c1yqBwlFHG1e7Q5D4.H9z7W8gJ5K9zD3R5Y4W8nF2J6sC1mT.', 'employer', TRUE, TRUE),
('Emma', 'Johnson', 'emma.johnson@email.com', '$2b$12$LQv3c1yqBwlFHG1e7Q5D4.H9z7W8gJ5K9zD3R5Y4W8nF2J6sC1mT.', 'employer', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

-- Insert agent profiles
INSERT INTO agents (
    user_id, 
    agent_name, 
    display_name, 
    specializations, 
    bio, 
    avatar_url,
    experience_years, 
    rating, 
    total_reviews, 
    currency,
    languages, 
    skills, 
    certifications,
    location, 
    timezone, 
    linkedin_url, 
    portfolio_url,
    is_featured, 
    is_active
) VALUES
-- Maria Rodriguez (Spanish/Mexican - Marketing Specialist)
(
    (SELECT id FROM users WHERE email = 'maria.rodriguez@email.com'),
    'Maria Rodriguez',
    'Digital Marketing Strategist',
    '["Digital Marketing", "Content Strategy", "Social Media Management", "SEO/SEM"]',
    'Passionate digital marketing strategist with 8 years of experience helping remote teams build strong online presence. Specializes in content marketing, social media strategy, and conversion optimization for international markets.',
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
    8,
    4.9,
    47,
    'USD',
    '["Spanish", "English", "Portuguese"]',
    '["Google Analytics", "Facebook Ads", "Content Marketing", "Email Marketing", "HubSpot", "Canva", "Adobe Creative Suite"]',
    '["Google Ads Certified", "HubSpot Content Marketing", "Facebook Blueprint"]',
    'Mexico City, Mexico',
    'America/Mexico_City',
    'https://linkedin.com/in/maria-rodriguez-marketing',
    'https://mariamarketing.portfolio.com',
    TRUE,
    TRUE
),

-- Yuki Tanaka (Japanese - UX/UI Designer)
(
    (SELECT id FROM users WHERE email = 'yuki.tanaka@email.com'),
    'Yuki Tanaka',
    'Senior UX/UI Designer',
    '["UX Design", "UI Design", "User Research", "Prototyping"]',
    'Senior UX/UI designer with 6 years of experience creating intuitive digital experiences. Expert in user-centered design methodology, with a focus on accessibility and cross-cultural usability for global remote teams.',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    6,
    4.8,
    32,
    'USD',
    '["Japanese", "English"]',
    '["Figma", "Adobe XD", "Sketch", "Principle", "InVision", "User Research", "Wireframing", "Prototyping"]',
    '["Google UX Design Certificate", "Adobe Certified Expert"]',
    'Tokyo, Japan',
    'Asia/Tokyo',
    'https://linkedin.com/in/yuki-tanaka-ux',
    'https://yukidesign.behance.net',
    TRUE,
    TRUE
),

-- Ahmed Hassan (Egyptian - Data Analyst)
(
    (SELECT id FROM users WHERE email = 'ahmed.hassan@email.com'),
    'Ahmed Hassan',
    'Senior Data Analyst',
    '["Data Analysis", "Business Intelligence", "Data Visualization", "Statistical Analysis"]',
    'Experienced data analyst with 7 years of expertise in transforming complex data into actionable business insights. Specializes in predictive analytics, dashboard creation, and helping remote teams make data-driven decisions.',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    7,
    4.7,
    38,
    'USD',
    '["Arabic", "English", "French"]',
    '["Python", "R", "SQL", "Tableau", "Power BI", "Excel", "Google Analytics", "Machine Learning"]',
    '["Microsoft Power BI Certified", "Tableau Desktop Specialist", "Google Analytics Certified"]',
    'Cairo, Egypt',
    'Africa/Cairo',
    'https://linkedin.com/in/ahmed-hassan-data',
    'https://ahmeddata.github.io',
    FALSE,
    TRUE
),

-- Sophie Dubois (French - Project Manager)
(
    (SELECT id FROM users WHERE email = 'sophie.dubois@email.com'),
    'Sophie Dubois',
    'Agile Project Manager',
    '["Project Management", "Agile/Scrum", "Team Leadership", "Process Optimization"]',
    'Certified Agile project manager with 9 years of experience leading distributed teams across multiple time zones. Expert in Scrum methodology, stakeholder management, and optimizing workflows for maximum remote team productivity.',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    9,
    4.9,
    56,
    'EUR',
    '["French", "English", "German"]',
    '["Scrum", "Kanban", "Jira", "Asana", "Microsoft Project", "Slack", "Zoom", "Confluence"]',
    '["PMP Certified", "Certified ScrumMaster", "SAFe Agilist"]',
    'Lyon, France',
    'Europe/Paris',
    'https://linkedin.com/in/sophie-dubois-pm',
    'https://sophiepm.portfolio.dev',
    TRUE,
    TRUE
),

-- Raj Patel (Indian - Software Developer)
(
    (SELECT id FROM users WHERE email = 'raj.patel@email.com'),
    'Raj Patel',
    'Full-Stack Developer',
    '["Full-Stack Development", "React", "Node.js", "Cloud Architecture"]',
    'Full-stack developer with 5 years of experience building scalable web applications for global remote teams. Passionate about clean code, modern frameworks, and helping startups transform their digital presence.',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f9?w=400',
    5,
    4.6,
    28,
    'USD',
    '["Hindi", "English", "Gujarati"]',
    '["JavaScript", "React", "Node.js", "Python", "AWS", "Docker", "MongoDB", "PostgreSQL", "Git"]',
    '["AWS Solutions Architect", "MongoDB Certified Developer"]',
    'Bangalore, India',
    'Asia/Kolkata',
    'https://linkedin.com/in/raj-patel-dev',
    'https://rajpatel.dev',
    FALSE,
    TRUE
),

-- Emma Johnson (Canadian - Content Writer)
(
    (SELECT id FROM users WHERE email = 'emma.johnson@email.com'),
    'Emma Johnson',
    'Content Strategist & Writer',
    '["Content Writing", "Content Strategy", "Copywriting", "Technical Writing"]',
    'Creative content strategist and writer with 4 years of experience crafting compelling content for remote-first companies. Specializes in B2B content marketing, technical documentation, and helping distributed teams tell their stories effectively.',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    4,
    4.8,
    22,
    'CAD',
    '["English", "French"]',
    '["Content Marketing", "SEO Writing", "Technical Writing", "WordPress", "Google Docs", "Grammarly", "Hemingway Editor"]',
    '["HubSpot Content Marketing", "Google Analytics Certified"]',
    'Toronto, Canada',
    'America/Toronto',
    'https://linkedin.com/in/emma-johnson-writer',
    'https://emmajohnson.contently.com',
    FALSE,
    TRUE
);

-- Add some sample reviews for the agents
INSERT INTO agent_reviews (agent_id, reviewer_id, rating, review_text, is_anonymous) VALUES
-- Reviews for Maria Rodriguez
((SELECT id FROM agents WHERE agent_name = 'Maria Rodriguez'), 
 (SELECT id FROM users WHERE email = 'emma.johnson@email.com'), 
 5, 'Maria transformed our social media presence completely. Her strategic approach and cultural insights were invaluable for our international expansion.', FALSE),

-- Reviews for Yuki Tanaka  
((SELECT id FROM agents WHERE agent_name = 'Yuki Tanaka'), 
 (SELECT id FROM users WHERE email = 'raj.patel@email.com'), 
 5, 'Yuki created an incredible user experience for our app. Her attention to detail and understanding of global design principles is exceptional.', FALSE),

-- Reviews for Ahmed Hassan
((SELECT id FROM agents WHERE agent_name = 'Ahmed Hassan'), 
 (SELECT id FROM users WHERE email = 'sophie.dubois@email.com'), 
 5, 'Ahmed helped us unlock insights from our data that we never knew existed. His analytical skills and clear communication made complex data accessible.', FALSE),

-- Reviews for Sophie Dubois
((SELECT id FROM agents WHERE agent_name = 'Sophie Dubois'), 
 (SELECT id FROM users WHERE email = 'maria.rodriguez@email.com'), 
 5, 'Sophie managed our distributed team flawlessly. Her Agile expertise and cross-timezone coordination skills are unmatched.', FALSE),

-- Reviews for Raj Patel
((SELECT id FROM agents WHERE agent_name = 'Raj Patel'), 
 (SELECT id FROM users WHERE email = 'ahmed.hassan@email.com'), 
 4, 'Raj built our platform efficiently and with great attention to scalability. His technical skills and remote collaboration are excellent.', FALSE),

-- Reviews for Emma Johnson
((SELECT id FROM agents WHERE agent_name = 'Emma Johnson'), 
 (SELECT id FROM users WHERE email = 'yuki.tanaka@email.com'), 
 5, 'Emma created content that perfectly captured our brand voice. Her writing quality and understanding of remote work culture is outstanding.', FALSE);
('Pierre', 'Dubois', 'pierre.dubois@flexjobs.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'agent', TRUE, NOW()),
('Priya', 'Sharma', 'priya.sharma@flexjobs.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'agent', TRUE, NOW()),
('Lars', 'Anderson', 'lars.anderson@flexjobs.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'agent', TRUE, NOW());

-- Now insert the agent profiles
INSERT INTO agents (
    user_id, 
    agent_name, 
    display_name, 
    specializations, 
    bio, 
    avatar_url, 
    experience_years, 
    rating, 
    total_reviews, 
    currency, 
    languages, 
    skills, 
    certifications, 
    location, 
    timezone, 
    linkedin_url, 
    portfolio_url, 
    is_featured, 
    is_active
) VALUES
-- Maria Rodriguez - Spanish Tech Specialist
(
    (SELECT id FROM users WHERE email = 'maria.rodriguez@flexjobs.com'),
    'Maria Rodriguez',
    'Tech Career Specialist - Remote Work Expert',
    '["Technology", "Software Development", "Remote Work", "Startups"]',
    'Passionate about connecting talented developers with innovative companies. With 8 years of experience in tech recruitment, I specialize in remote opportunities for software engineers, data scientists, and product managers. Fluent in Spanish and English, I help bridge the gap between international talent and global companies.',
    'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=400&fit=crop&crop=face',
    8,
    4.7,
    45,
    'USD',
    '["Spanish", "English", "Portuguese"]',
    '["Tech Recruitment", "Remote Work Consulting", "Career Coaching", "Interview Preparation", "Salary Negotiation"]',
    '["Certified Professional Recruiter (CPR)", "Remote Work Association Certified"]',
    'Barcelona, Spain',
    'Europe/Madrid',
    'https://linkedin.com/in/maria-rodriguez-tech',
    'https://mariatech.portfolio.com',
    TRUE,
    TRUE
),

-- Hiroshi Tanaka - Japanese Finance Expert
(
    (SELECT id FROM users WHERE email = 'hiroshi.tanaka@flexjobs.com'),
    'Hiroshi Tanaka',
    'Senior Finance & Banking Recruiter',
    '["Finance", "Banking", "FinTech", "Investment"]',
    'Senior recruitment specialist with 12 years of experience in financial services. I have deep connections in both traditional banking and emerging FinTech companies across Asia-Pacific. My expertise includes placing candidates in investment banking, corporate finance, risk management, and quantitative analysis roles.',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    12,
    4.9,
    78,
    'USD',
    '["Japanese", "English", "Mandarin"]',
    '["Financial Services Recruitment", "Executive Search", "Market Analysis", "Regulatory Compliance", "Cross-cultural Communication"]',
    '["CFA Institute Member", "Certified Executive Recruiter", "APAC Finance Specialist"]',
    'Tokyo, Japan',
    'Asia/Tokyo',
    'https://linkedin.com/in/hiroshi-tanaka-finance',
    'https://hiro-finance.career.com',
    TRUE,
    TRUE
),

-- Amara Johnson - American Healthcare Leader
(
    (SELECT id FROM users WHERE email = 'amara.johnson@flexjobs.com'),
    'Amara Johnson',
    'Healthcare & Life Sciences Recruiter',
    '["Healthcare", "Life Sciences", "Medical Devices", "Pharmaceuticals"]',
    'Dedicated healthcare recruitment professional with a passion for improving lives through better career matches. I work exclusively with healthcare organizations, from innovative startups developing cutting-edge medical technologies to established pharmaceutical companies. My network spans nurses, doctors, researchers, and healthcare administrators.',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
    9,
    4.6,
    62,
    'USD',
    '["English"]',
    '["Healthcare Recruitment", "Medical Staffing", "Regulatory Knowledge", "Clinical Research", "Telemedicine"]',
    '["Healthcare Recruiter Certification", "HIPAA Compliance Training", "Medical Staffing Professional"]',
    'Chicago, IL, USA',
    'America/Chicago',
    'https://linkedin.com/in/amara-johnson-healthcare',
    'https://amarahealth.recruiting.com',
    FALSE,
    TRUE
),

-- Pierre Dubois - French Creative Industries Expert
(
    (SELECT id FROM users WHERE email = 'pierre.dubois@flexjobs.com'),
    'Pierre Dubois',
    'Creative & Marketing Talent Specialist',
    '["Marketing", "Creative", "Design", "Digital Media"]',
    'Creative industries recruitment specialist with an eye for exceptional talent. Based in Paris, I work with advertising agencies, design studios, and marketing departments across Europe. My specialties include placing creative directors, digital marketers, UX/UI designers, and brand strategists. I understand the unique needs of creative professionals seeking flexible work arrangements.',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    7,
    4.5,
    38,
    'EUR',
    '["French", "English", "German"]',
    '["Creative Recruitment", "Brand Strategy", "Digital Marketing", "Portfolio Review", "Freelance Consulting"]',
    '["European Marketing Association Member", "Creative Industries Recruiter Certified"]',
    'Paris, France',
    'Europe/Paris',
    'https://linkedin.com/in/pierre-dubois-creative',
    'https://pierre-creative.portfolio.fr',
    FALSE,
    TRUE
),

-- Priya Sharma - Indian Data & AI Expert
(
    (SELECT id FROM users WHERE email = 'priya.sharma@flexjobs.com'),
    'Priya Sharma',
    'AI & Data Science Career Consultant',
    '["Data Science", "Artificial Intelligence", "Machine Learning", "Analytics"]',
    'AI and Data Science recruitment expert helping shape the future of technology careers. With a strong background in both technical recruiting and data science, I understand what companies are looking for in AI/ML engineers, data scientists, and analytics professionals. I specialize in remote opportunities and have placed candidates with leading tech companies globally.',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
    6,
    4.8,
    52,
    'USD',
    '["Hindi", "English", "Tamil"]',
    '["Data Science Recruitment", "AI/ML Consulting", "Technical Assessment", "Remote Team Building", "Diversity Hiring"]',
    '["Data Science Professional Certification", "AI Ethics Certified", "Remote Work Specialist"]',
    'Bangalore, India',
    'Asia/Kolkata',
    'https://linkedin.com/in/priya-sharma-datascience',
    'https://priya-ai.consulting.in',
    TRUE,
    TRUE
),

-- Lars Anderson - Swedish Sustainability Expert
(
    (SELECT id FROM users WHERE email = 'lars.anderson@flexjobs.com'),
    'Lars Anderson',
    'Sustainability & Green Tech Recruiter',
    '["Sustainability", "Green Technology", "Renewable Energy", "Environmental"]',
    'Passionate about connecting sustainability professionals with organizations making a positive environmental impact. I specialize in renewable energy, cleantech, and corporate sustainability roles. With the growing focus on ESG and climate action, I help both candidates and companies navigate this rapidly evolving sector while promoting remote work as a sustainable career choice.',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
    10,
    4.4,
    33,
    'SEK',
    '["Swedish", "English", "Norwegian", "Danish"]',
    '["Sustainability Recruiting", "Environmental Consulting", "Green Technology", "ESG Advisory", "Carbon Footprint Analysis"]',
    '["Sustainability Professional Certified", "Green Building Council Member", "Renewable Energy Specialist"]',
    'Stockholm, Sweden',
    'Europe/Stockholm',
    'https://linkedin.com/in/lars-anderson-sustainability',
    'https://lars-green.consulting.se',
    FALSE,
    TRUE
);

-- Insert some sample reviews for the agents
INSERT INTO agent_reviews (
    agent_id,
    reviewer_id,
    rating,
    review_text,
    is_anonymous,
    created_at
) VALUES
-- Reviews for Maria Rodriguez
((SELECT id FROM agents WHERE user_id = (SELECT id FROM users WHERE email = 'maria.rodriguez@flexjobs.com')), 
 (SELECT id FROM users WHERE email = 'maria.rodriguez@flexjobs.com'), 
 5, 
 'Maria helped me land my dream remote developer job! Her knowledge of the tech industry and understanding of remote work culture made all the difference.', 
 TRUE, 
 DATE_SUB(NOW(), INTERVAL 15 DAY)),

-- Reviews for Hiroshi Tanaka
((SELECT id FROM agents WHERE user_id = (SELECT id FROM users WHERE email = 'hiroshi.tanaka@flexjobs.com')), 
 (SELECT id FROM users WHERE email = 'hiroshi.tanaka@flexjobs.com'), 
 5, 
 'Hiroshi\'s expertise in finance recruitment is unmatched. He understood exactly what I was looking for and connected me with the perfect FinTech role.', 
 TRUE, 
 DATE_SUB(NOW(), INTERVAL 8 DAY)),

-- Reviews for Priya Sharma
((SELECT id FROM agents WHERE user_id = (SELECT id FROM users WHERE email = 'priya.sharma@flexjobs.com')), 
 (SELECT id FROM users WHERE email = 'priya.sharma@flexjobs.com'), 
 5, 
 'Priya\'s deep understanding of the AI/ML landscape helped me transition from traditional software development to machine learning. Highly recommended!', 
 TRUE, 
 DATE_SUB(NOW(), INTERVAL 5 DAY));

-- Update agent statistics based on reviews
UPDATE agents SET 
    rating = (
        SELECT AVG(rating) 
        FROM agent_reviews 
        WHERE agent_id = agents.id
    ),
    total_reviews = (
        SELECT COUNT(*) 
        FROM agent_reviews 
        WHERE agent_id = agents.id
    )
WHERE id IN (
    SELECT DISTINCT agent_id FROM agent_reviews
);
