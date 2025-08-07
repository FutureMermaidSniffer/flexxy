-- Rollback: Add OAuth authentication fields
-- Created: 2024-01-03T00:00:00.000Z

-- Drop indexes
DROP INDEX IF EXISTS idx_users_apple_id;
DROP INDEX IF EXISTS idx_users_google_id;

-- Remove OAuth columns
ALTER TABLE users DROP COLUMN IF EXISTS avatar_url;
ALTER TABLE users DROP COLUMN IF EXISTS apple_id;
ALTER TABLE users DROP COLUMN IF EXISTS google_id;
