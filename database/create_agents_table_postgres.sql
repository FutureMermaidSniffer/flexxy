-- Agents table for PostgreSQL
-- This creates the agents table with PostgreSQL syntax

-- Create agents table if it doesn't exist
CREATE TABLE IF NOT EXISTS agents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    agent_name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    specializations TEXT, -- JSON array of specializations
    bio TEXT,
    avatar_url VARCHAR(255),
    experience_years INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    languages TEXT, -- JSON array of languages
    skills TEXT, -- JSON array of skills
    certifications TEXT, -- JSON array of certifications
    location VARCHAR(255),
    timezone VARCHAR(50),
    linkedin_url VARCHAR(255),
    portfolio_url VARCHAR(255),
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add a few sample agents for testing
INSERT INTO agents (agent_name, display_name, specializations, bio, experience_years, location, timezone) VALUES 
('John Smith', 'John S.', 'Technology,Remote Work', 'Experienced tech recruiter specializing in remote positions', 5, 'New York, NY', 'America/New_York'),
('Sarah Johnson', 'Sarah J.', 'Marketing,Sales', 'Marketing and sales recruitment specialist', 3, 'Los Angeles, CA', 'America/Los_Angeles'),
('Michael Brown', 'Mike B.', 'Finance,Accounting', 'Finance and accounting professional recruiter', 7, 'Chicago, IL', 'America/Chicago')
ON CONFLICT DO NOTHING;
