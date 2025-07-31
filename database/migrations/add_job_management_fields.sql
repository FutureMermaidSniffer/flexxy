-- Migration: Add job management fields for admin interface
-- Created: 2025-01-XX
-- Description: Adds application_url, contact_email, status, salary_type, and tags fields to jobs table

-- Add new columns to jobs table
ALTER TABLE jobs 
ADD COLUMN application_url VARCHAR(500),
ADD COLUMN contact_email VARCHAR(255),
ADD COLUMN status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'pending', 'active', 'closed')),
ADD COLUMN salary_type VARCHAR(20) DEFAULT 'yearly' CHECK (salary_type IN ('yearly', 'monthly', 'hourly')),
ADD COLUMN tags TEXT;

-- Update existing jobs to have 'active' status
UPDATE jobs SET status = 'active' WHERE status IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_application_url ON jobs(application_url) WHERE application_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_contact_email ON jobs(contact_email) WHERE contact_email IS NOT NULL;

-- Update the jobs table comment
COMMENT ON TABLE jobs IS 'Job listings with full admin management capabilities';
COMMENT ON COLUMN jobs.application_url IS 'External URL where candidates can apply for the job (optional)';
COMMENT ON COLUMN jobs.contact_email IS 'Contact email for job inquiries (optional, defaults to company email if not provided)';
COMMENT ON COLUMN jobs.status IS 'Current status of the job posting (draft, pending, active, closed)';
COMMENT ON COLUMN jobs.salary_type IS 'Type of salary specification (yearly, monthly, hourly)';
COMMENT ON COLUMN jobs.tags IS 'Comma-separated tags for job categorization and search';
