-- Persist a visitor snapshot on chat conversations so admin can see
-- location / device even before the first message.

ALTER TABLE chat_conversations
    ADD COLUMN IF NOT EXISTS visitor_ip VARCHAR(45),
    ADD COLUMN IF NOT EXISTS visitor_country VARCHAR(100),
    ADD COLUMN IF NOT EXISTS visitor_region VARCHAR(100),
    ADD COLUMN IF NOT EXISTS visitor_city VARCHAR(100),
    ADD COLUMN IF NOT EXISTS visitor_lat DECIMAL(10, 7),
    ADD COLUMN IF NOT EXISTS visitor_lng DECIMAL(10, 7),
    ADD COLUMN IF NOT EXISTS visitor_device_type VARCHAR(50),
    ADD COLUMN IF NOT EXISTS visitor_os VARCHAR(100),
    ADD COLUMN IF NOT EXISTS visitor_browser VARCHAR(100),
    ADD COLUMN IF NOT EXISTS visitor_user_agent TEXT,
    ADD COLUMN IF NOT EXISTS visitor_metadata JSONB;
