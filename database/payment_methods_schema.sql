-- User Payment Methods Table
-- This extends the existing database schema to support multiple payment methods per user

CREATE TABLE IF NOT EXISTS user_payment_methods (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    payment_type ENUM('credit_card', 'debit_card', 'paypal', 'bank_transfer') DEFAULT 'credit_card',
    card_brand VARCHAR(20), -- visa, mastercard, amex, etc.
    last_four_digits VARCHAR(4),
    cardholder_name VARCHAR(255),
    expiry_month INT,
    expiry_year INT,
    billing_address_line1 VARCHAR(255),
    billing_address_line2 VARCHAR(255),
    billing_city VARCHAR(100),
    billing_state VARCHAR(50),
    billing_postal_code VARCHAR(20),
    billing_country VARCHAR(3) DEFAULT 'USA',
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    stripe_payment_method_id VARCHAR(255), -- Stripe payment method ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_payment_methods_user (user_id),
    INDEX idx_user_payment_methods_default (user_id, is_default),
    INDEX idx_user_payment_methods_active (is_active)
);

-- Billing addresses table (for different billing addresses)
CREATE TABLE IF NOT EXISTS user_billing_addresses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    address_name VARCHAR(100), -- "Home", "Work", etc.
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(3) DEFAULT 'USA',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_billing_addresses_user (user_id)
);

-- Subscription billing history
CREATE TABLE IF NOT EXISTS subscription_billing_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    subscription_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    billing_date DATE NOT NULL,
    due_date DATE,
    paid_date DATE,
    status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    payment_method_id INT,
    stripe_invoice_id VARCHAR(255),
    stripe_payment_intent_id VARCHAR(255),
    failure_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_method_id) REFERENCES user_payment_methods(id) ON DELETE SET NULL,
    INDEX idx_billing_history_subscription (subscription_id),
    INDEX idx_billing_history_date (billing_date),
    INDEX idx_billing_history_status (status)
);
