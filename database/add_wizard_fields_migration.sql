-- Migration: Add wizard fields and temporary account support to users table
-- Run this in pgAdmin to add the necessary fields

-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_temp_account BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS created_via_wizard BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS work_type_preference JSONB,
ADD COLUMN IF NOT EXISTS salary_preference JSONB,
ADD COLUMN IF NOT EXISTS location_preference JSONB,
ADD COLUMN IF NOT EXISTS job_preference JSONB,
ADD COLUMN IF NOT EXISTS experience_level_preference VARCHAR(100),
ADD COLUMN IF NOT EXISTS education_level_preference VARCHAR(100),
ADD COLUMN IF NOT EXISTS benefit_preferences JSONB,
ADD COLUMN IF NOT EXISTS wizard_completed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS preferences_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create index for better query performance on temp accounts
CREATE INDEX IF NOT EXISTS idx_users_temp_account ON users(is_temp_account);
CREATE INDEX IF NOT EXISTS idx_users_wizard_created ON users(created_via_wizard);

-- Add comments to document the new fields
COMMENT ON COLUMN users.is_temp_account IS 'Indicates if this is a temporary account created through the wizard';
COMMENT ON COLUMN users.created_via_wizard IS 'Indicates if the account was created via the wizard flow';
COMMENT ON COLUMN users.work_type_preference IS 'JSON object storing work type preferences (remote, hybrid, etc.)';
COMMENT ON COLUMN users.salary_preference IS 'JSON object storing salary preferences (min, max, type)';
COMMENT ON COLUMN users.location_preference IS 'JSON object storing location preferences';
COMMENT ON COLUMN users.job_preference IS 'JSON object storing job title/category preferences';
COMMENT ON COLUMN users.experience_level_preference IS 'Experience level preference (entry, mid, senior, etc.)';
COMMENT ON COLUMN users.education_level_preference IS 'Education level preference';
COMMENT ON COLUMN users.benefit_preferences IS 'JSON object storing benefit preferences';
COMMENT ON COLUMN users.wizard_completed_at IS 'Timestamp when wizard was completed';
COMMENT ON COLUMN users.preferences_updated_at IS 'Timestamp when preferences were last updated';

-- Update the updated_at trigger to include preferences_updated_at
-- (assuming you have an updated_at trigger, if not, this is optional)
CREATE OR REPLACE FUNCTION update_preferences_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.preferences_updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for preferences updates
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON users;
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE OF work_type_preference, salary_preference, location_preference, 
                     job_preference, experience_level_preference, education_level_preference, 
                     benefit_preferences
    ON users
    FOR EACH ROW
    EXECUTE PROCEDURE update_preferences_updated_at_column();

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name IN (
    'is_temp_account', 
    'created_via_wizard', 
    'work_type_preference',
    'salary_preference',
    'location_preference', 
    'job_preference',
    'experience_level_preference',
    'education_level_preference',
    'benefit_preferences',
    'wizard_completed_at',
    'preferences_updated_at'
  )
ORDER BY column_name;

-- Example data structure comments for JSONB fields:
/*
work_type_preference example:
{
  "type": "100-remote",
  "flexibility": "high",
  "commute_preference": "none"
}

salary_preference example:
{
  "value": 65000,
  "type": "annually",
  "currency": "USD",
  "negotiable": true
}

location_preference example:
{
  "anywhere": true,
  "specific_locations": [],
  "timezone_preference": "EST",
  "travel_willingness": "minimal"
}

job_preference example:
{
  "title": "Software Developer",
  "category": "Technology",
  "keywords": ["javascript", "react", "node.js"],
  "industry_preference": "tech"
}

benefit_preferences example:
{
  "health_insurance": true,
  "retirement_plan": true,
  "flexible_schedule": true,
  "professional_development": false,
  "remote_work_stipend": true
}
*/
