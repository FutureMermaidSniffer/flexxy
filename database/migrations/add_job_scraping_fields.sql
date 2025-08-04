-- Add job scraping fields to existing schema
-- Run this after your main migration

-- Add scraping-specific fields to jobs table
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS external_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS source VARCHAR(100),
ADD COLUMN IF NOT EXISTS scraped_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS application_url VARCHAR(500);

-- Create indexes for scraping performance
CREATE INDEX IF NOT EXISTS idx_jobs_external_id ON jobs(external_id);
CREATE INDEX IF NOT EXISTS idx_jobs_source ON jobs(source);
CREATE INDEX IF NOT EXISTS idx_jobs_scraped_at ON jobs(scraped_at);

-- Add unique constraint to prevent duplicate scraped jobs
CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_unique_external 
ON jobs(external_id, source) 
WHERE external_id IS NOT NULL AND source IS NOT NULL;

-- Update any existing jobs to mark them as manually created
UPDATE jobs 
SET source = 'manual', scraped_at = created_at 
WHERE source IS NULL;

SELECT 'Job scraping fields added successfully' as status;
