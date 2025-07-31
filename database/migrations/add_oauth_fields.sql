-- Add google_id column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;

-- Add apple_id column if it doesn't exist  
ALTER TABLE users ADD COLUMN IF NOT EXISTS apple_id VARCHAR(255) UNIQUE;

-- Add avatar_url column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Update existing users to have email_verified = true (for existing accounts)
UPDATE users SET email_verified = TRUE WHERE email_verified IS NULL;
