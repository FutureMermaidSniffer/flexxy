-- Create sample agents for FlexJobs database
-- First, let's create some sample users for agents if they don't exist

-- Insert sample users for agents (only if they don't already exist)
INSERT INTO users (email, first_name, last_name, user_type, password_hash, is_active, email_verified, created_at) 
SELECT * FROM (VALUES 
('sarah.johnson@example.com', 'Sarah', 'Johnson', 'agent', '$2b$10$dummy_hash_1', true, true, CURRENT_TIMESTAMP),
('michael.chen@example.com', 'Michael', 'Chen', 'agent', '$2b$10$dummy_hash_2', true, true, CURRENT_TIMESTAMP),
('jessica.rodriguez@example.com', 'Jessica', 'Rodriguez', 'agent', '$2b$10$dummy_hash_3', true, true, CURRENT_TIMESTAMP),
('david.thompson@example.com', 'David', 'Thompson', 'agent', '$2b$10$dummy_hash_4', true, true, CURRENT_TIMESTAMP),
('emily.parker@example.com', 'Emily', 'Parker', 'agent', '$2b$10$dummy_hash_5', true, true, CURRENT_TIMESTAMP),
('robert.williams@example.com', 'Robert', 'Williams', 'agent', '$2b$10$dummy_hash_6', true, true, CURRENT_TIMESTAMP)
) AS t(email, first_name, last_name, user_type, password_hash, is_active, email_verified, created_at)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE users.email = t.email);

-- Now insert sample agents based on the users we just created
INSERT INTO agents (
    user_id, agent_name, display_name, bio, avatar_url, experience_years, 
    rating, total_reviews, currency, languages, skills, certifications,
    location, timezone, linkedin_url, portfolio_url, specializations,
    is_featured, is_active, created_at, updated_at
) 
SELECT u.id, 
       CONCAT(u.first_name, ' ', u.last_name),
       CONCAT(u.first_name, ' ', u.last_name),
       v.bio,
       v.avatar_url,
       v.experience_years,
       v.rating,
       v.total_reviews,
       v.currency,
       v.languages,
       v.skills,
       v.certifications,
       v.location,
       v.timezone,
       v.linkedin_url,
       v.portfolio_url,
       v.specializations,
       v.is_featured,
       v.is_active,
       CURRENT_TIMESTAMP,
       CURRENT_TIMESTAMP
FROM users u
CROSS JOIN (VALUES
    -- Agent 1: Sarah Johnson - Resume Writing Expert
    ('Experienced resume writer with 8+ years helping professionals craft compelling resumes that get noticed. Specialized in executive-level resumes and career pivots.', 'images/avatars/sarah.jpg', 8, 4.9, 127, 'USD', '["English", "Spanish"]', '["Resume Writing", "Cover Letters", "LinkedIn Optimization", "ATS Optimization"]', '["Certified Professional Resume Writer (CPRW)", "LinkedIn Certified Professional"]', 'San Francisco, CA', 'America/Los_Angeles', 'https://linkedin.com/in/sarahjohnson', 'https://sarahresumes.com', '["Resume Writing", "Career Transition", "Executive Coaching"]', true, true),
    
    -- Agent 2: Michael Chen - Interview Coach
    ('Senior interview coach and former Google recruiter. I help candidates master behavioral interviews, technical interviews, and salary negotiations.', 'images/avatars/michael.jpg', 12, 4.8, 89, 'USD', '["English", "Mandarin"]', '["Interview Coaching", "Behavioral Interviews", "Technical Interviews", "Salary Negotiation"]', '["Certified Interview Coach", "Former Google Recruiter"]', 'Seattle, WA', 'America/Los_Angeles', 'https://linkedin.com/in/michaelchen', 'https://interviewpro.com', '["Interview Coaching", "Salary Negotiation", "Tech Career"]', true, true),
    
    -- Agent 3: Jessica Rodriguez - Career Transition Specialist
    ('Career transition expert helping professionals pivot to new industries. 10+ years experience in career counseling and strategic career planning.', 'images/avatars/jessica.jpg', 10, 4.7, 156, 'USD', '["English", "Spanish", "Portuguese"]', '["Career Planning", "Industry Transition", "Skills Assessment", "Networking Strategy"]', '["Master Career Counselor (MCC)", "Certified Career Development Facilitator"]', 'Austin, TX', 'America/Chicago', 'https://linkedin.com/in/jessicarodriguez', 'https://careerpivot.com', '["Career Transition", "Career Planning", "Industry Pivot"]', false, true),
    
    -- Agent 4: David Thompson - LinkedIn Optimization Expert
    ('LinkedIn optimization specialist and personal branding expert. I help professionals build powerful LinkedIn profiles that attract recruiters and opportunities.', 'images/avatars/david.jpg', 6, 4.6, 201, 'USD', '["English"]', '["LinkedIn Optimization", "Personal Branding", "Social Media Strategy", "Content Creation"]', '["LinkedIn Certified Marketing Professional", "Personal Brand Strategist"]', 'New York, NY', 'America/New_York', 'https://linkedin.com/in/davidthompson', 'https://linkedinpro.com', '["LinkedIn Optimization", "Personal Branding", "Social Media"]', false, true),
    
    -- Agent 5: Emily Parker - Executive Leadership Coach
    ('Executive coach specializing in leadership development and C-level career advancement. Former Fortune 500 executive with 15+ years of leadership experience.', 'images/avatars/emily.jpg', 15, 4.9, 67, 'USD', '["English"]', '["Executive Coaching", "Leadership Development", "Strategic Planning", "Team Management"]', '["Certified Executive Coach (CEC)", "MBA", "Former VP at Fortune 500"]', 'Chicago, IL', 'America/Chicago', 'https://linkedin.com/in/emilyparker', 'https://execleadership.com', '["Executive Coaching", "Leadership Development", "C-Suite Transition"]', true, true),
    
    -- Agent 6: Robert Williams - Remote Work Specialist
    ('Remote work consultant helping professionals transition to and excel in remote careers. Expert in virtual collaboration and digital nomad lifestyle.', 'images/avatars/robert.jpg', 7, 4.5, 143, 'USD', '["English"]', '["Remote Work Strategy", "Virtual Collaboration", "Digital Nomad Lifestyle", "Work-Life Balance"]', '["Certified Remote Work Professional", "Digital Nomad Consultant"]', 'Denver, CO', 'America/Denver', 'https://linkedin.com/in/robertwilliams', 'https://remoteworkpro.com', '["Remote Work", "Digital Nomad", "Work-Life Balance"]', false, true)
    
) AS v(bio, avatar_url, experience_years, rating, total_reviews, currency, languages, skills, certifications, location, timezone, linkedin_url, portfolio_url, specializations, is_featured, is_active)
WHERE u.email IN (
    'sarah.johnson@example.com',
    'michael.chen@example.com', 
    'jessica.rodriguez@example.com',
    'david.thompson@example.com',
    'emily.parker@example.com',
    'robert.williams@example.com'
)
AND NOT EXISTS (
    SELECT 1 FROM agents a WHERE a.user_id = u.id
)
ORDER BY u.email;
