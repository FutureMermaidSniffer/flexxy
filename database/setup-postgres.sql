-- FlexJobs Database Setup Script
-- Run this after PostgreSQL installation

-- Connect as postgres superuser first, then run these commands:

-- 1. Create the database
CREATE DATABASE flexjobs;

-- 2. Create a dedicated user for the application
CREATE USER flexjobs_user WITH PASSWORD 'your_secure_password_here';

-- 3. Grant privileges to the user
GRANT ALL PRIVILEGES ON DATABASE flexjobs TO flexjobs_user;

-- 4. Connect to the flexjobs database
\c flexjobs

-- 5. Grant schema privileges
GRANT ALL ON SCHEMA public TO flexjobs_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO flexjobs_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO flexjobs_user;

-- 6. Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO flexjobs_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO flexjobs_user;

-- Verify the setup
\l  -- List all databases
\du -- List all users

-- Exit psql
\q
