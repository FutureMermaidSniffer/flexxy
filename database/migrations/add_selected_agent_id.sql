-- Migration: Add selected_agent_id column to users table
-- Date: 2024-01-12
-- Description: Add foreign key column to track which recruiting consultant/agent a user selected

-- Add selected_agent_id column to users table
ALTER TABLE users 
ADD COLUMN selected_agent_id INTEGER;

-- Add foreign key constraint to agents table
ALTER TABLE users 
ADD CONSTRAINT fk_users_selected_agent 
FOREIGN KEY (selected_agent_id) REFERENCES agents(id) 
ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX idx_users_selected_agent_id ON users(selected_agent_id);

-- Add comment to document the column purpose
COMMENT ON COLUMN users.selected_agent_id IS 'ID of the recruiting consultant/agent selected by the user during profile creation';
