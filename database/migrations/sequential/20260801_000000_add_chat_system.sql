-- Chat system: upgrade/replace unfinished chat tables with full admin↔client schema

-- Drop prototype tables if present (low row counts; schema incompatible)
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_conversations CASCADE;

CREATE TABLE chat_conversations (
    id SERIAL PRIMARY KEY,
    participant_user_id INTEGER NULL REFERENCES users(id) ON DELETE CASCADE,
    guest_token VARCHAR(64) NULL UNIQUE,
    guest_display_name VARCHAR(100) NULL,
    subject VARCHAR(255) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'closed', 'pending')),
    last_message_at TIMESTAMP NULL,
    last_message_preview VARCHAR(255) NULL,
    admin_unread_count INTEGER NOT NULL DEFAULT 0,
    user_unread_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chat_conversations_participant_check CHECK (
        (participant_user_id IS NOT NULL AND guest_token IS NULL)
        OR (participant_user_id IS NULL AND guest_token IS NOT NULL)
    )
);

CREATE INDEX idx_chat_conversations_status_last
    ON chat_conversations (status, last_message_at DESC NULLS LAST);

CREATE INDEX idx_chat_conversations_user
    ON chat_conversations (participant_user_id)
    WHERE participant_user_id IS NOT NULL;

CREATE INDEX idx_chat_conversations_guest
    ON chat_conversations (guest_token)
    WHERE guest_token IS NOT NULL;

CREATE UNIQUE INDEX idx_chat_conversations_one_open_per_user
    ON chat_conversations (participant_user_id)
    WHERE participant_user_id IS NOT NULL AND status = 'open';

CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL
        CHECK (sender_type IN ('user', 'admin', 'guest', 'system')),
    sender_user_id INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
    body TEXT NOT NULL,
    ip_address VARCHAR(45) NULL,
    location_country VARCHAR(100) NULL,
    location_region VARCHAR(100) NULL,
    location_city VARCHAR(100) NULL,
    location_lat DECIMAL(10, 7) NULL,
    location_lng DECIMAL(10, 7) NULL,
    device_type VARCHAR(50) NULL,
    device_os VARCHAR(100) NULL,
    device_browser VARCHAR(100) NULL,
    user_agent TEXT NULL,
    client_metadata JSONB NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_messages_conversation_created
    ON chat_messages (conversation_id, created_at);

CREATE INDEX idx_chat_messages_unread
    ON chat_messages (conversation_id)
    WHERE is_read = FALSE;
