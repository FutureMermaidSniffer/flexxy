-- Direct SQL Script to Create Admin User
-- Replace the values below with your actual admin details
-- Run this directly in your database (MySQL/PostgreSQL)

-- For MySQL:
INSERT INTO users (
    first_name, 
    last_name, 
    email, 
    password, 
    user_type, 
    is_active, 
    is_verified, 
    created_at, 
    updated_at
) VALUES (
    'Admin',                                                -- Replace with first name
    'User',                                                 -- Replace with last name  
    'admin@yoursite.com',                                   -- Replace with admin email
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdB49sO4.8hKGAS', -- This is 'password123' hashed
    'admin', 
    1, 
    1, 
    NOW(), 
    NOW()
);

-- For PostgreSQL:
INSERT INTO users (
    first_name, 
    last_name, 
    email, 
    password, 
    user_type, 
    is_active, 
    is_verified, 
    created_at, 
    updated_at
) VALUES (
    'Admin',                                                -- Replace with first name
    'User',                                                 -- Replace with last name
    'admin@yoursite.com',                                   -- Replace with admin email
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdB49sO4.8hKGAS', -- This is 'password123' hashed
    'admin', 
    true, 
    true, 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP
);

-- To generate a new password hash, use this Node.js code:
-- const bcrypt = require('bcryptjs');
-- console.log(bcrypt.hashSync('your-password-here', 12));

-- SECURITY NOTES:
-- 1. Change the email to your actual admin email
-- 2. Generate a new password hash with your secure password
-- 3. Delete this file after creating the admin user
-- 4. Make sure to use a strong password
