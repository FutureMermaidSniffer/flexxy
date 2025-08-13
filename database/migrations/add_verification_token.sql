-- Migration: Add verification token field to users table
-- Run this SQL in your PostgreSQL database

-- Add verification token field if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token) WHERE verification_token IS NOT NULL;

-- Add comment to document the field
COMMENT ON COLUMN users.verification_token IS 'Token used for email verification';
