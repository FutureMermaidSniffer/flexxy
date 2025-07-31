-- Add wizard and temporary account fields to users table

ALTER TABLE users 
ADD COLUMN is_temp_account BOOLEAN DEFAULT FALSE AFTER is_active,
ADD COLUMN created_via_wizard BOOLEAN DEFAULT FALSE AFTER is_temp_account,
ADD COLUMN preferences JSON AFTER created_via_wizard;
