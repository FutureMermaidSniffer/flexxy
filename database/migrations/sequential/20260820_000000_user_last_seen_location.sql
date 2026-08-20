-- Persist last-seen browser/IP location on users for the admin panel.

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS last_ip VARCHAR(45),
    ADD COLUMN IF NOT EXISTS last_country VARCHAR(100),
    ADD COLUMN IF NOT EXISTS last_region VARCHAR(100),
    ADD COLUMN IF NOT EXISTS last_city VARCHAR(100),
    ADD COLUMN IF NOT EXISTS last_lat DECIMAL(10, 7),
    ADD COLUMN IF NOT EXISTS last_lng DECIMAL(10, 7),
    ADD COLUMN IF NOT EXISTS last_device_type VARCHAR(50),
    ADD COLUMN IF NOT EXISTS last_os VARCHAR(100),
    ADD COLUMN IF NOT EXISTS last_browser VARCHAR(100),
    ADD COLUMN IF NOT EXISTS last_user_agent TEXT,
    ADD COLUMN IF NOT EXISTS last_client_metadata JSONB,
    ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_users_last_country
    ON users (last_country);

CREATE INDEX IF NOT EXISTS idx_users_last_seen_at
    ON users (last_seen_at DESC NULLS LAST);
