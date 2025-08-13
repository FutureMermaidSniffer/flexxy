-- Migration: Add Recruiting Consultants
-- Date: 2025-08-11
-- Description: Add recruiting consultant profiles with enhanced agent table structure

-- First, ensure we have all necessary columns in the agents table
DO $$ 
BEGIN
    -- Add display_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agents' AND column_name = 'display_name') THEN
        ALTER TABLE agents ADD COLUMN display_name VARCHAR(255);
    END IF;
    
    -- Add location column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agents' AND column_name = 'location') THEN
        ALTER TABLE agents ADD COLUMN location VARCHAR(255);
    END IF;
    
    -- Add timezone column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agents' AND column_name = 'timezone') THEN
        ALTER TABLE agents ADD COLUMN timezone VARCHAR(100);
    END IF;
    
    -- Add languages column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agents' AND column_name = 'languages') THEN
        ALTER TABLE agents ADD COLUMN languages TEXT;
    END IF;
    
    -- Add certifications column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agents' AND column_name = 'certifications') THEN
        ALTER TABLE agents ADD COLUMN certifications TEXT;
    END IF;
    
    -- Add linkedin_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agents' AND column_name = 'linkedin_url') THEN
        ALTER TABLE agents ADD COLUMN linkedin_url VARCHAR(500);
    END IF;
    
    -- Add availability_schedule column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agents' AND column_name = 'availability_schedule') THEN
        ALTER TABLE agents ADD COLUMN availability_schedule JSONB;
    END IF;
    
    -- Add email column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agents' AND column_name = 'email') THEN
        ALTER TABLE agents ADD COLUMN email VARCHAR(255);
    END IF;
END $$;

-- Create users for each recruiting consultant (if they don't exist)
INSERT INTO users (first_name, last_name, email, password_hash, user_type, is_verified, created_at, updated_at)
VALUES 
    ('Sophie', 'Chen', 'sophie.chen@flexjobseu.com', '$2b$10$rZ8K9mF6vL3pS4dE8nY7weuGK2pA1qB5vC3nT7mJ9sK8lX4pD6rF0a', 'agent', true, NOW(), NOW()),
    ('Olivia', 'Rodriguez', 'olivia.rodriguez@flexjobseu.com', '$2b$10$sF9L2nK8vM5qT6eE9oZ8xfvGL3qB2rC6wD4nU8mK0tL9mY5qE7sG1b', 'agent', true, NOW(), NOW()),
    ('Daniel', 'Thompson', 'daniel.thompson@flexjobseu.com', '$2b$10$tG0M3oL9wN6rU7fF0pA9ygwHM4rC3sD7xE5nV9nL1uM0nZ6rF8tH2c', 'agent', true, NOW(), NOW()),
    ('Naomi', 'Patel', 'naomi.patel@flexjobseu.com', '$2b$10$uH1N4pM0xO7sV8gG1qB0zhxIN5sD4tE8yF6nW0oM2vN1oA7sG9uI3d', 'agent', true, NOW(), NOW()),
    ('Isha', 'Williams', 'isha.williams@flexjobseu.com', '$2b$10$vI2O5qN1yP8tW9hH2rC1aiySO6tE5uF9zG7nX1pN3wO2pB8tH0vJ4e', 'agent', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert recruiting consultant profiles
INSERT INTO agents (
    user_id, 
    name, 
    display_name,
    bio, 
    avatar, 
    specializations, 
    experience_years, 
    hourly_rate, 
    rating, 
    total_reviews, 
    is_active, 
    is_verified, 
    is_featured,
    location,
    timezone,
    languages,
    certifications,
    linkedin_url,
    email,
    availability_schedule,
    created_at, 
    updated_at
) VALUES
(
    (SELECT id FROM users WHERE email = 'sophie.chen@flexjobseu.com'),
    'Sophie Chen',
    'Senior Tech Recruiting Specialist',
    'With over 8 years of experience in technology recruitment, Sophie specializes in connecting top-tier software engineers, data scientists, and product managers with innovative companies. Her expertise spans across startups, scale-ups, and Fortune 500 companies, with a particular focus on remote and hybrid work arrangements.',
    '/images/agents/Sophie.png',
    'Software Engineering,Data Science,Product Management,DevOps,AI/ML,Cybersecurity',
    8,
    150.00,
    4.9,
    127,
    true,
    true,
    true,
    'San Francisco, CA',
    'America/Los_Angeles',
    'English,Mandarin,Spanish',
    'Certified Professional Recruiter (CPR),SHRM-CP,LinkedIn Certified Professional',
    'https://linkedin.com/in/sophie-chen-tech-recruiter',
    'sophie.chen@flexjobseu.com',
    '{"monday": {"start": "09:00", "end": "18:00"}, "tuesday": {"start": "09:00", "end": "18:00"}, "wednesday": {"start": "09:00", "end": "18:00"}, "thursday": {"start": "09:00", "end": "18:00"}, "friday": {"start": "09:00", "end": "17:00"}, "timezone": "America/Los_Angeles"}',
    NOW(),
    NOW()
),
(
    (SELECT id FROM users WHERE email = 'olivia.rodriguez@flexjobseu.com'),
    'Olivia Rodriguez',
    'Healthcare & Life Sciences Recruiter',
    'Olivia brings 6 years of specialized experience in healthcare and life sciences recruitment. She has successfully placed professionals in roles ranging from clinical research to healthcare administration, with a deep understanding of regulatory requirements and industry-specific qualifications.',
    '/images/agents/Olivia.png',
    'Healthcare,Clinical Research,Nursing,Medical Administration,Pharmaceutical,Biotech',
    6,
    125.00,
    4.8,
    94,
    true,
    true,
    true,
    'Boston, MA',
    'America/New_York',
    'English,Spanish,Portuguese',
    'Healthcare Recruiter Certification,CPRP,Medical Staffing Professional',
    'https://linkedin.com/in/olivia-rodriguez-healthcare',
    'olivia.rodriguez@flexjobseu.com',
    '{"monday": {"start": "08:00", "end": "17:00"}, "tuesday": {"start": "08:00", "end": "17:00"}, "wednesday": {"start": "08:00", "end": "17:00"}, "thursday": {"start": "08:00", "end": "17:00"}, "friday": {"start": "08:00", "end": "16:00"}, "timezone": "America/New_York"}',
    NOW(),
    NOW()
),
(
    (SELECT id FROM users WHERE email = 'daniel.thompson@flexjobseu.com'),
    'Daniel Thompson',
    'Finance & Accounting Specialist',
    'Daniel has 7 years of experience recruiting for finance and accounting positions across various industries. His expertise includes executive finance roles, accounting professionals, financial analysts, and compliance specialists. He understands the nuances of financial regulations and industry certifications.',
    '/images/agents/Daniel.jpg',
    'Finance,Accounting,Financial Analysis,Compliance,Risk Management,Investment Banking',
    7,
    135.00,
    4.7,
    156,
    true,
    true,
    false,
    'New York, NY',
    'America/New_York',
    'English,French',
    'Certified Talent Acquisition Professional,CPA Knowledge,Financial Recruiter Certification',
    'https://linkedin.com/in/daniel-thompson-finance-recruiter',
    'daniel.thompson@flexjobseu.com',
    '{"monday": {"start": "07:00", "end": "19:00"}, "tuesday": {"start": "07:00", "end": "19:00"}, "wednesday": {"start": "07:00", "end": "19:00"}, "thursday": {"start": "07:00", "end": "19:00"}, "friday": {"start": "07:00", "end": "18:00"}, "timezone": "America/New_York"}',
    NOW(),
    NOW()
),
(
    (SELECT id FROM users WHERE email = 'naomi.patel@flexjobseu.com'),
    'Naomi Patel',
    'Marketing & Creative Industries Expert',
    'Naomi specializes in recruiting for marketing, advertising, and creative roles with 5 years of focused experience. She has a keen eye for creative talent and understands the evolving landscape of digital marketing, content creation, and brand management in the modern marketplace.',
    '/images/agents/Naomi.png',
    'Digital Marketing,Content Creation,Brand Management,Advertising,Social Media,UX/UI Design',
    5,
    110.00,
    4.6,
    78,
    true,
    true,
    false,
    'Austin, TX',
    'America/Chicago',
    'English,Hindi,Gujarati',
    'Digital Marketing Institute Certification,Google Ads Certified,Content Marketing Specialist',
    'https://linkedin.com/in/naomi-patel-marketing-recruiter',
    'naomi.patel@flexjobseu.com',
    '{"monday": {"start": "09:00", "end": "18:00"}, "tuesday": {"start": "09:00", "end": "18:00"}, "wednesday": {"start": "09:00", "end": "18:00"}, "thursday": {"start": "09:00", "end": "18:00"}, "friday": {"start": "09:00", "end": "17:00"}, "timezone": "America/Chicago"}',
    NOW(),
    NOW()
),
(
    (SELECT id FROM users WHERE email = 'isha.williams@flexjobseu.com'),
    'Isha Williams',
    'Operations & Supply Chain Recruiter',
    'Isha has 4 years of experience in operations and supply chain recruitment, helping companies find talent for logistics, operations management, and supply chain optimization roles. She understands the complexities of global supply chains and the skills needed for operational excellence.',
    '/images/agents/Isha.jpg',
    'Operations Management,Supply Chain,Logistics,Manufacturing,Quality Assurance,Project Management',
    4,
    100.00,
    4.5,
    52,
    true,
    true,
    false,
    'Chicago, IL',
    'America/Chicago',
    'English,Swahili',
    'Operations Management Certification,Supply Chain Professional (CSCP),Project Management Fundamentals',
    'https://linkedin.com/in/isha-williams-operations',
    'isha.williams@flexjobseu.com',
    '{"monday": {"start": "08:00", "end": "17:00"}, "tuesday": {"start": "08:00", "end": "17:00"}, "wednesday": {"start": "08:00", "end": "17:00"}, "thursday": {"start": "08:00", "end": "17:00"}, "friday": {"start": "08:00", "end": "16:00"}, "timezone": "America/Chicago"}',
    NOW(),
    NOW()
)
ON CONFLICT (user_id) DO NOTHING;

-- Create migration log entry
INSERT INTO migration_log (filename, executed_at, success) 
VALUES ('001_add_recruiting_consultants.sql', NOW(), true)
ON CONFLICT (filename) DO NOTHING;
