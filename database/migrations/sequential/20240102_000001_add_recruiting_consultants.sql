-- Migration: Add Recruiting Consultants
-- Date: 2025-08-11

-- Extend user_type check constraint to include 'agent'
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_user_type_check;
ALTER TABLE users ADD CONSTRAINT users_user_type_check 
    CHECK (user_type IN ('job_seeker', 'employer', 'admin', 'agent'));

-- Ensure extra columns exist on agents table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agents' AND column_name = 'availability_schedule') THEN
        ALTER TABLE agents ADD COLUMN availability_schedule JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agents' AND column_name = 'email') THEN
        ALTER TABLE agents ADD COLUMN email VARCHAR(255);
    END IF;
END $$;

-- Create users for each recruiting consultant (if they don't exist)
INSERT INTO users (first_name, last_name, email, password, user_type, email_verified, created_at, updated_at)
VALUES 
    ('Sophie',  'Chen',       'sophie.chen@flexjobseu.com',       '$2b$10$rZ8K9mF6vL3pS4dE8nY7weuGK2pA1qB5vC3nT7mJ9sK8lX4pD6rF0a', 'agent', true, NOW(), NOW()),
    ('Olivia',  'Rodriguez',  'olivia.rodriguez@flexjobseu.com',  '$2b$10$sF9L2nK8vM5qT6eE9oZ8xfvGL3qB2rC6wD4nU8mK0tL9mY5qE7sG1b', 'agent', true, NOW(), NOW()),
    ('Daniel',  'Thompson',   'daniel.thompson@flexjobseu.com',   '$2b$10$tG0M3oL9wN6rU7fF0pA9ygwHM4rC3sD7xE5nV9nL1uM0nZ6rF8tH2c', 'agent', true, NOW(), NOW()),
    ('Naomi',   'Patel',      'naomi.patel@flexjobseu.com',       '$2b$10$uH1N4pM0xO7sV8gG1qB0zhxIN5sD4tE8yF6nW0oM2vN1oA7sG9uI3d', 'agent', true, NOW(), NOW()),
    ('Isha',    'Williams',   'isha.williams@flexjobseu.com',     '$2b$10$vI2O5qN1yP8tW9hH2rC1aiySO6tE5uF9zG7nX1pN3wO2pB8tH0vJ4e', 'agent', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert recruiting consultant profiles (guarded with WHERE NOT EXISTS to avoid duplicates)
DO $$
DECLARE v_uid INTEGER;
BEGIN
  SELECT id INTO v_uid FROM users WHERE email = 'sophie.chen@flexjobseu.com';
  IF v_uid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM agents WHERE user_id = v_uid) THEN
    INSERT INTO agents (user_id, agent_name, display_name, bio, avatar_url, specializations, experience_years, rating, total_reviews, is_active, is_featured, location, timezone, languages, certifications, linkedin_url, email, availability_schedule, created_at, updated_at)
    VALUES (v_uid, 'Sophie Chen', 'Senior Tech Recruiting Specialist', 'With over 8 years of experience in technology recruitment, Sophie specializes in connecting top-tier software engineers, data scientists, and product managers with innovative companies.', '/images/agents/Sophie.png', 'Software Engineering,Data Science,Product Management,DevOps,AI/ML,Cybersecurity', 8, 4.9, 127, true, true, 'San Francisco, CA', 'America/Los_Angeles', 'English,Mandarin,Spanish', 'Certified Professional Recruiter (CPR),SHRM-CP,LinkedIn Certified Professional', 'https://linkedin.com/in/sophie-chen-tech-recruiter', 'sophie.chen@flexjobseu.com', '{"monday":{"start":"09:00","end":"18:00"},"friday":{"start":"09:00","end":"17:00"},"timezone":"America/Los_Angeles"}', NOW(), NOW());
  END IF;

  SELECT id INTO v_uid FROM users WHERE email = 'olivia.rodriguez@flexjobseu.com';
  IF v_uid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM agents WHERE user_id = v_uid) THEN
    INSERT INTO agents (user_id, agent_name, display_name, bio, avatar_url, specializations, experience_years, rating, total_reviews, is_active, is_featured, location, timezone, languages, certifications, linkedin_url, email, availability_schedule, created_at, updated_at)
    VALUES (v_uid, 'Olivia Rodriguez', 'Healthcare & Life Sciences Recruiter', 'Olivia brings 6 years of specialized experience in healthcare and life sciences recruitment.', '/images/agents/Olivia.png', 'Healthcare,Clinical Research,Nursing,Medical Administration,Pharmaceutical,Biotech', 6, 4.8, 94, true, true, 'Boston, MA', 'America/New_York', 'English,Spanish,Portuguese', 'Healthcare Recruiter Certification,CPRP,Medical Staffing Professional', 'https://linkedin.com/in/olivia-rodriguez-healthcare', 'olivia.rodriguez@flexjobseu.com', '{"monday":{"start":"08:00","end":"17:00"},"friday":{"start":"08:00","end":"16:00"},"timezone":"America/New_York"}', NOW(), NOW());
  END IF;

  SELECT id INTO v_uid FROM users WHERE email = 'daniel.thompson@flexjobseu.com';
  IF v_uid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM agents WHERE user_id = v_uid) THEN
    INSERT INTO agents (user_id, agent_name, display_name, bio, avatar_url, specializations, experience_years, rating, total_reviews, is_active, is_featured, location, timezone, languages, certifications, linkedin_url, email, availability_schedule, created_at, updated_at)
    VALUES (v_uid, 'Daniel Thompson', 'Finance & Accounting Specialist', 'Daniel has 7 years of experience recruiting for finance and accounting positions across various industries.', '/images/agents/Daniel.jpg', 'Finance,Accounting,Financial Analysis,Compliance,Risk Management,Investment Banking', 7, 4.7, 156, true, false, 'New York, NY', 'America/New_York', 'English,French', 'Certified Talent Acquisition Professional,CPA Knowledge,Financial Recruiter Certification', 'https://linkedin.com/in/daniel-thompson-finance-recruiter', 'daniel.thompson@flexjobseu.com', '{"monday":{"start":"07:00","end":"19:00"},"friday":{"start":"07:00","end":"18:00"},"timezone":"America/New_York"}', NOW(), NOW());
  END IF;

  SELECT id INTO v_uid FROM users WHERE email = 'naomi.patel@flexjobseu.com';
  IF v_uid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM agents WHERE user_id = v_uid) THEN
    INSERT INTO agents (user_id, agent_name, display_name, bio, avatar_url, specializations, experience_years, rating, total_reviews, is_active, is_featured, location, timezone, languages, certifications, linkedin_url, email, availability_schedule, created_at, updated_at)
    VALUES (v_uid, 'Naomi Patel', 'Marketing & Creative Industries Expert', 'Naomi specializes in recruiting for marketing, advertising, and creative roles with 5 years of focused experience.', '/images/agents/Naomi.png', 'Digital Marketing,Content Creation,Brand Management,Advertising,Social Media,UX/UI Design', 5, 4.6, 78, true, false, 'Austin, TX', 'America/Chicago', 'English,Hindi,Gujarati', 'Digital Marketing Institute Certification,Google Ads Certified,Content Marketing Specialist', 'https://linkedin.com/in/naomi-patel-marketing-recruiter', 'naomi.patel@flexjobseu.com', '{"monday":{"start":"09:00","end":"18:00"},"friday":{"start":"09:00","end":"17:00"},"timezone":"America/Chicago"}', NOW(), NOW());
  END IF;

  SELECT id INTO v_uid FROM users WHERE email = 'isha.williams@flexjobseu.com';
  IF v_uid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM agents WHERE user_id = v_uid) THEN
    INSERT INTO agents (user_id, agent_name, display_name, bio, avatar_url, specializations, experience_years, rating, total_reviews, is_active, is_featured, location, timezone, languages, certifications, linkedin_url, email, availability_schedule, created_at, updated_at)
    VALUES (v_uid, 'Isha Williams', 'Operations & Supply Chain Recruiter', 'Isha has 4 years of experience in operations and supply chain recruitment.', '/images/agents/Isha.jpg', 'Operations Management,Supply Chain,Logistics,Manufacturing,Quality Assurance,Project Management', 4, 4.5, 52, true, false, 'Chicago, IL', 'America/Chicago', 'English,Swahili', 'Operations Management Certification,Supply Chain Professional (CSCP),Project Management Fundamentals', 'https://linkedin.com/in/isha-williams-operations', 'isha.williams@flexjobseu.com', '{"monday":{"start":"08:00","end":"17:00"},"friday":{"start":"08:00","end":"16:00"},"timezone":"America/Chicago"}', NOW(), NOW());
  END IF;
END $$;

