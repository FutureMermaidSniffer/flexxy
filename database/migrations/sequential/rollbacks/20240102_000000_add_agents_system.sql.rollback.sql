-- Rollback: Add agents and subscription system
-- Created: 2024-01-02T00:00:00.000Z

-- Drop indexes
DROP INDEX IF EXISTS idx_user_subscriptions_expires;
DROP INDEX IF EXISTS idx_user_subscriptions_status;
DROP INDEX IF EXISTS idx_agent_bookings_status;
DROP INDEX IF EXISTS idx_agent_bookings_scheduled;
DROP INDEX IF EXISTS idx_agent_reviews_rating;
DROP INDEX IF EXISTS idx_agents_featured;
DROP INDEX IF EXISTS idx_agents_active;
DROP INDEX IF EXISTS idx_agents_rating;
DROP INDEX IF EXISTS idx_agents_specializations;

-- Drop tables in reverse order
DROP TABLE IF EXISTS user_subscriptions;
DROP TABLE IF EXISTS subscription_plans;
DROP TABLE IF EXISTS agent_bookings;
DROP TABLE IF EXISTS agent_reviews;
DROP TABLE IF EXISTS agents;
