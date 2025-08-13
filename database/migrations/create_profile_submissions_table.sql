-- Migration: Create profile_submissions table
-- Date: 2024-01-12
-- Description: Create separate table for profile form submissions without authentication requirements

CREATE TABLE profile_submissions (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    location VARCHAR(255) NOT NULL,
    work_eligibility VARCHAR(100) NOT NULL,
    experience_level VARCHAR(50) NOT NULL,
    role_type VARCHAR(255),
    industry VARCHAR(100),
    employment_types JSONB,
    job_preference JSONB,
    bio TEXT,
    resume_path VARCHAR(500),
    selected_agent_id INTEGER,
    data_processing_consent BOOLEAN DEFAULT false,
    job_alerts_consent BOOLEAN DEFAULT false,
    marketing_consent BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'pending',
    reviewed_by INTEGER,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint to agents table (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agents') THEN
        ALTER TABLE profile_submissions 
        ADD CONSTRAINT fk_profile_submissions_agent 
        FOREIGN KEY (selected_agent_id) REFERENCES agents(id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- Add indexes for performance
CREATE INDEX idx_profile_submissions_email ON profile_submissions(email);
CREATE INDEX idx_profile_submissions_status ON profile_submissions(status);
CREATE INDEX idx_profile_submissions_created_at ON profile_submissions(created_at);
CREATE INDEX idx_profile_submissions_agent_id ON profile_submissions(selected_agent_id);

-- Add comments
COMMENT ON TABLE profile_submissions IS 'Stores profile form submissions from new users before they create accounts';
COMMENT ON COLUMN profile_submissions.status IS 'Submission status: pending, reviewed, approved, rejected';
COMMENT ON COLUMN profile_submissions.selected_agent_id IS 'ID of the recruiting consultant/agent selected by the user';
