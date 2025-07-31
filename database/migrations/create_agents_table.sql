-- Migration: Create agents table for PostgreSQL
-- Created: 2025-01-XX
-- Description: Creates agents table with all fields needed for admin management

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    agent_name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    bio TEXT,
    avatar_url VARCHAR(255),
    experience_years INTEGER DEFAULT 0,
    hourly_rate DECIMAL(10,2),
    location VARCHAR(255),
    timezone VARCHAR(50),
    
    -- Rating and review system
    rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    total_reviews INTEGER DEFAULT 0,
    
    -- Professional information
    specializations TEXT, -- JSON array of specializations
    skills TEXT, -- JSON array of skills
    languages TEXT, -- JSON array of languages
    certifications TEXT, -- JSON array of certifications
    
    -- Social and portfolio links
    linkedin_url VARCHAR(255),
    portfolio_url VARCHAR(255),
    website_url VARCHAR(255),
    
    -- Status and features
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
    is_verified BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_email ON agents(email);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_is_featured ON agents(is_featured);
CREATE INDEX IF NOT EXISTS idx_agents_is_verified ON agents(is_verified);
CREATE INDEX IF NOT EXISTS idx_agents_rating ON agents(rating);
CREATE INDEX IF NOT EXISTS idx_agents_location ON agents(location);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_agents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_agents_updated_at_trigger
    BEFORE UPDATE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION update_agents_updated_at();

-- Add comments for documentation
COMMENT ON TABLE agents IS 'Agents/recruiters table with full admin management capabilities';
COMMENT ON COLUMN agents.agent_name IS 'Full legal name of the agent';
COMMENT ON COLUMN agents.display_name IS 'Public display name shown to clients';
COMMENT ON COLUMN agents.email IS 'Agent contact email (unique)';
COMMENT ON COLUMN agents.bio IS 'Agent biography and description';
COMMENT ON COLUMN agents.experience_years IS 'Years of professional experience';
COMMENT ON COLUMN agents.hourly_rate IS 'Hourly rate in USD';
COMMENT ON COLUMN agents.rating IS 'Average rating from 0.00 to 5.00';
COMMENT ON COLUMN agents.specializations IS 'JSON array of agent specializations';
COMMENT ON COLUMN agents.skills IS 'JSON array of technical and soft skills';
COMMENT ON COLUMN agents.status IS 'Current status of the agent account';
COMMENT ON COLUMN agents.is_verified IS 'Whether the agent has been verified by admin';
COMMENT ON COLUMN agents.is_featured IS 'Whether the agent appears in featured listings';
COMMENT ON COLUMN agents.is_available IS 'Whether the agent is currently accepting new clients';
