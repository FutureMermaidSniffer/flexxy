-- Migration: Add agents and subscription system
-- Created: 2024-01-02T00:00:00.000Z

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    agent_name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    specializations TEXT, -- JSON array of specializations
    bio TEXT,
    avatar_url VARCHAR(255),
    experience_years INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    languages TEXT, -- JSON array of languages
    skills TEXT, -- JSON array of skills
    certifications TEXT, -- JSON array of certifications
    location VARCHAR(255),
    timezone VARCHAR(50),
    linkedin_url VARCHAR(255),
    portfolio_url VARCHAR(255),
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create agent reviews table
CREATE TABLE IF NOT EXISTS agent_reviews (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER NOT NULL,
    reviewer_id INTEGER NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (agent_id, reviewer_id)
);

-- Create agent bookings table
CREATE TABLE IF NOT EXISTS agent_bookings (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER NOT NULL,
    client_id INTEGER NOT NULL,
    consultation_type VARCHAR(50) DEFAULT 'general',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    scheduled_at TIMESTAMP,
    duration_minutes INTEGER DEFAULT 30,
    meeting_link VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    billing_period VARCHAR(20) DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'yearly')),
    features TEXT, -- JSON array of features
    max_job_applications INTEGER DEFAULT -1, -- -1 for unlimited
    max_agent_consultations INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create user subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    plan_id INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'paused')),
    starts_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    auto_renew BOOLEAN DEFAULT TRUE,
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agents_specializations ON agents USING GIN (to_tsvector('english', specializations));
CREATE INDEX IF NOT EXISTS idx_agents_rating ON agents(rating);
CREATE INDEX IF NOT EXISTS idx_agents_active ON agents(is_active);
CREATE INDEX IF NOT EXISTS idx_agents_featured ON agents(is_featured);
CREATE INDEX IF NOT EXISTS idx_agent_reviews_rating ON agent_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_agent_bookings_scheduled ON agent_bookings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_agent_bookings_status ON agent_bookings(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires ON user_subscriptions(expires_at);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, price, billing_period, features, max_job_applications, max_agent_consultations) 
VALUES 
    ('Free', 'Basic job search access', 0.00, 'monthly', '["Basic job search", "Save up to 10 jobs", "Basic filters"]', 10, 0),
    ('Professional', 'Enhanced job search with agent access', 19.99, 'monthly', '["Unlimited job search", "Save unlimited jobs", "Advanced filters", "1 agent consultation per month", "Resume templates"]', -1, 1),
    ('Premium', 'Full platform access with unlimited agent consultations', 39.99, 'monthly', '["All Professional features", "Unlimited agent consultations", "Priority support", "Career coaching resources", "Interview preparation"]', -1, -1)
ON CONFLICT (name) DO NOTHING;

-- Add table comments
COMMENT ON TABLE agents IS 'Career agents and recruiters available for consultations';
COMMENT ON TABLE agent_reviews IS 'Reviews and ratings for agents';
COMMENT ON TABLE agent_bookings IS 'Scheduled consultations between users and agents';
COMMENT ON TABLE subscription_plans IS 'Available subscription plans with features and pricing';
COMMENT ON TABLE user_subscriptions IS 'User subscription records and status';
