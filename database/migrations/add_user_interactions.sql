-- User Interactions Migration
-- Adds tables for tracking user interactions like newsletter subscriptions, tutorial views, etc.

-- Newsletter subscriptions table
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    user_id INT NULL, -- Nullable for non-registered users
    subscription_type ENUM('general', 'career_advice', 'job_alerts', 'tutorials') DEFAULT 'general',
    source_page VARCHAR(100), -- Page where subscription happened
    is_active BOOLEAN DEFAULT TRUE,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_email_type (email, subscription_type),
    INDEX idx_email (email),
    INDEX idx_active (is_active)
);

-- User interactions table for tracking various user activities
CREATE TABLE IF NOT EXISTS user_interactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL, -- Nullable for anonymous users
    session_id VARCHAR(255), -- For tracking anonymous users
    interaction_type ENUM('page_view', 'tutorial_view', 'button_click', 'form_submit', 'download') NOT NULL,
    page_name VARCHAR(100),
    element_name VARCHAR(100), -- Button name, form name, etc.
    metadata JSON, -- Additional data about the interaction
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_session_id (session_id),
    INDEX idx_interaction_type (interaction_type),
    INDEX idx_created_at (created_at)
);

-- Tutorial engagement table
CREATE TABLE IF NOT EXISTS tutorial_engagement (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    session_id VARCHAR(255),
    tutorial_name VARCHAR(255) NOT NULL,
    action_type ENUM('view', 'play', 'pause', 'complete', 'share') NOT NULL,
    watch_duration INT DEFAULT 0, -- In seconds
    total_duration INT DEFAULT 0, -- Total video duration in seconds
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_session_id (session_id),
    INDEX idx_tutorial_name (tutorial_name)
);
