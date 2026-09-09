-- Rollback: Add country_code to users and profile_submissions
-- Created: 2026-09-09T00:00:00.000Z

ALTER TABLE users DROP COLUMN IF EXISTS country_code;
ALTER TABLE profile_submissions DROP COLUMN IF EXISTS country_code;
