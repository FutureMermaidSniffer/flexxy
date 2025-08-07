-- Rollback: Add password reset system
-- Created: 2024-01-04T00:00:00.000Z

-- Drop indexes
DROP INDEX IF EXISTS idx_password_reset_tokens_expires_at;
DROP INDEX IF EXISTS idx_password_reset_tokens_user_id;
DROP INDEX IF EXISTS idx_password_reset_tokens_token;

-- Drop table
DROP TABLE IF EXISTS password_reset_tokens;
