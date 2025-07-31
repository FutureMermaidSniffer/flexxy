-- Agents table for the FlexJobs platform
-- This extends the existing database schema to support agents/recruiters

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    agent_name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    specializations TEXT, -- JSON array of specializations
    bio TEXT,
    avatar_url VARCHAR(255),
    experience_years INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Agent reviews table
CREATE TABLE IF NOT EXISTS agent_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    agent_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_review (agent_id, reviewer_id)
);

-- Agent bookings/consultations table
CREATE TABLE IF NOT EXISTS agent_bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    agent_id INT NOT NULL,
    client_id INT NOT NULL,
    booking_type ENUM('consultation', 'interview_prep', 'resume_review', 'career_coaching') DEFAULT 'consultation',
    scheduled_at DATETIME NOT NULL,
    duration_minutes INT DEFAULT 60,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    meeting_link VARCHAR(255),
    notes TEXT,
    price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    billing_period ENUM('monthly', 'yearly') DEFAULT 'monthly',
    features TEXT, -- JSON array of features
    max_job_applications INT DEFAULT -1, -- -1 for unlimited
    max_agent_consultations INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    plan_id INT NOT NULL,
    status ENUM('active', 'cancelled', 'expired', 'trial') DEFAULT 'trial',
    starts_at DATETIME NOT NULL,
    expires_at DATETIME NOT NULL,
    payment_method VARCHAR(50),
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, price, billing_period, features, max_job_applications, max_agent_consultations) VALUES
('Free', 'Basic job search access', 0.00, 'monthly', '["Basic job search", "Save up to 10 jobs", "Basic filters"]', 10, 0),
('Professional', 'Enhanced job search with agent access', 19.99, 'monthly', '["Unlimited job search", "Save unlimited jobs", "Advanced filters", "1 agent consultation per month", "Resume templates"]', -1, 1),
('Premium', 'Full platform access with unlimited agent consultations', 39.99, 'monthly', '["All Professional features", "Unlimited agent consultations", "Priority support", "Career coaching resources", "Interview preparation"]', -1, -1);

-- Create indexes for better performance
CREATE INDEX idx_agents_specializations ON agents(specializations(100));
CREATE INDEX idx_agents_rating ON agents(rating);
CREATE INDEX idx_agents_active ON agents(is_active);
CREATE INDEX idx_agents_featured ON agents(is_featured);
CREATE INDEX idx_agent_reviews_rating ON agent_reviews(rating);
CREATE INDEX idx_agent_bookings_scheduled ON agent_bookings(scheduled_at);
CREATE INDEX idx_agent_bookings_status ON agent_bookings(status);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_expires ON user_subscriptions(expires_at);
