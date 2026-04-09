-- Debug script for users table issue
-- Run this with: psql -U postgres -d flexjobs_db -f debug-users-table.sql

\echo '========================================='
\echo 'Debugging Users Table'
\echo '========================================='
\echo ''

-- 1. Check table structure
\echo '1. Table structure:'
\d users
\echo ''

-- 2. Count total users
\echo '2. Total user count:'
SELECT COUNT(*) as total_users FROM users;
\echo ''

-- 3. Check for any users at all
\echo '3. Sample of all users (limited to 10):'
SELECT id, email, role, created_at FROM users LIMIT 10;
\echo ''

-- 4. Check users by role
\echo '4. Users by role:'
SELECT role, COUNT(*) as count FROM users GROUP BY role;
\echo ''

-- 5. Check table permissions
\echo '5. Table permissions:'
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name='users';
\echo ''

-- 6. Check if there are any recent users
\echo '6. Most recent users (last 5):'
SELECT id, email, role, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 5;
\echo ''

-- 7. Check table owner
\echo '7. Table owner:'
SELECT tableowner FROM pg_tables WHERE tablename = 'users';
\echo ''

\echo '========================================='
\echo 'Debug Complete'
\echo '========================================='
