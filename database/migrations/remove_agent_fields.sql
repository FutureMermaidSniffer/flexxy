-- Migration to remove hourly_rate, availability_status, and is_verified fields from agents table
-- Execute this script on existing databases to update the schema

-- First, check if the columns exist before dropping them
SET @db_name = DATABASE();

-- Drop indexes if they exist
DROP INDEX IF EXISTS idx_agents_verified ON agents;
DROP INDEX IF EXISTS idx_agents_availability ON agents;

-- Drop columns if they exist
SET @sql = CONCAT('ALTER TABLE agents DROP COLUMN IF EXISTS hourly_rate');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = CONCAT('ALTER TABLE agents DROP COLUMN IF EXISTS availability_status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = CONCAT('ALTER TABLE agents DROP COLUMN IF EXISTS is_verified');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add any new indexes if needed (none required for this migration)

-- Update any dependent tables or constraints if necessary (none for this migration)

-- Log the migration
INSERT INTO schema_migrations (version, description, executed_at) VALUES 
('2024_01_15_remove_agent_fields', 'Remove hourly_rate, availability_status, and is_verified from agents table', NOW())
ON DUPLICATE KEY UPDATE executed_at = NOW();
