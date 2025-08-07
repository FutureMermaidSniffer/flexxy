-- Migration: Add OAuth authentication fields
-- Created: 2024-01-03T00:00:00.000Z

-- Add OAuth provider fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS apple_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create indexes for OAuth fields
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_apple_id ON users(apple_id) WHERE apple_id IS NOT NULL;

-- Update existing users to have email_verified = true (for migration of existing accounts)
UPDATE users SET email_verified = TRUE WHERE email_verified IS NULL OR email_verified = FALSE;

-- Add table comments
COMMENT ON COLUMN users.google_id IS 'Google OAuth unique identifier';
COMMENT ON COLUMN users.apple_id IS 'Apple OAuth unique identifier';
COMMENT ON COLUMN users.avatar_url IS 'User profile picture URL from OAuth or uploaded';
