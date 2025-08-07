-- Rollback: Initial database schema setup
-- Created: 2024-01-01T00:00:00.000Z

-- Drop indexes first
DROP INDEX IF EXISTS idx_applications_job;
DROP INDEX IF EXISTS idx_applications_user;
DROP INDEX IF EXISTS idx_applications_status;
DROP INDEX IF EXISTS idx_jobs_featured;
DROP INDEX IF EXISTS idx_jobs_active;
DROP INDEX IF EXISTS idx_jobs_created_at;
DROP INDEX IF EXISTS idx_jobs_remote_type;
DROP INDEX IF EXISTS idx_jobs_type;
DROP INDEX IF EXISTS idx_jobs_location;
DROP INDEX IF EXISTS idx_users_type;
DROP INDEX IF EXISTS idx_users_email;

-- Drop tables in reverse order (respecting foreign key constraints)
DROP TABLE IF EXISTS job_skills;
DROP TABLE IF EXISTS saved_jobs;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS users;
