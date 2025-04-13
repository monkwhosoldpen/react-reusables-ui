-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS channels_messages CASCADE;

-- Create sequence for auto-incrementing message count
CREATE SEQUENCE IF NOT EXISTS channels_messages_count_seq;

-- Create channels_messages table with minimal fields
CREATE TABLE IF NOT EXISTS channels_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT NOT NULL,
    message_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    translations JSONB,
    is_translated BOOLEAN DEFAULT FALSE,
    message_count INTEGER DEFAULT nextval('channels_messages_count_seq')
);

-- Create index for channels_messages
CREATE INDEX IF NOT EXISTS idx_channels_messages_sender ON channels_messages(username);

-- Create or replace the Supabase function that retrieves all messages from channels_messages table for a specific username
CREATE OR REPLACE FUNCTION get_channel_messages(channel_username TEXT)
RETURNS TABLE (
    username TEXT,
    message_text TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    translations JSONB,
    is_translated BOOLEAN,
    message_count INTEGER
) AS $$
BEGIN
    -- Query to fetch all messages for the given channel username
    RETURN QUERY
    SELECT
        cm.username,         -- Explicitly referencing the table column
        cm.message_text,
        cm.created_at,
        cm.updated_at,
        cm.translations,
        cm.is_translated,
        cm.message_count
    FROM
        channels_messages cm
    WHERE
        cm.username = channel_username  -- Using the renamed parameter here
    ORDER BY
        cm.created_at DESC;  -- Optional: To get the messages sorted by creation time
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
