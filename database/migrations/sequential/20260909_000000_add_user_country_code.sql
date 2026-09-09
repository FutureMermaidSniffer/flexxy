-- Migration: Add country_code to users and profile_submissions
-- Created: 2026-09-09T00:00:00.000Z

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS country_code VARCHAR(8);

ALTER TABLE users
    ALTER COLUMN phone TYPE VARCHAR(32);

COMMENT ON COLUMN users.country_code IS 'International calling code submitted at signup, e.g. +44';

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'profile_submissions'
    ) THEN
        ALTER TABLE profile_submissions
            ADD COLUMN IF NOT EXISTS country_code VARCHAR(8);
        ALTER TABLE profile_submissions
            ALTER COLUMN phone TYPE VARCHAR(32);
        COMMENT ON COLUMN profile_submissions.country_code IS 'International calling code submitted with the phone number, e.g. +44';
    END IF;
END $$;
