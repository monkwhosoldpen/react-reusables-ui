-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS channels_message_responses CASCADE;
DROP TABLE IF EXISTS channels_messages CASCADE;

-- Create sequence for auto-incrementing message count
CREATE SEQUENCE IF NOT EXISTS channels_messages_count_seq;

-- Create channels_messages table with enhanced features
CREATE TABLE IF NOT EXISTS channels_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'message' CHECK (type IN ('message', 'announcement', 'poll', 'survey', 'quiz')),
    message_text TEXT NOT NULL,
    caption TEXT,
    media JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{
        "isCollapsible": true, 
        "displayMode": "compact", 
        "maxHeight": 300,
        "visibility": {
            "stats": true,
            "shareButtons": true,
            "header": true,
            "footer": true
        },
        "mediaLayout": "grid"
    }'::jsonb,
    stats JSONB DEFAULT '{
        "views": 0,
        "likes": 0,
        "shares": 0,
        "responses": 0
    }'::jsonb,
    interactive_content JSONB DEFAULT '{}'::jsonb,
    fill_requirement TEXT DEFAULT 'partial' CHECK (fill_requirement IN ('partial', 'strict')),
    translations JSONB,
    is_translated BOOLEAN DEFAULT FALSE,
    message_count INTEGER DEFAULT nextval('channels_messages_count_seq'),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create channels_message_responses table
CREATE TABLE IF NOT EXISTS channels_message_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES channels_messages(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    response_type TEXT NOT NULL CHECK (response_type IN ('poll', 'quiz', 'survey')),
    response_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(message_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_channels_messages_username ON channels_messages(username);
CREATE INDEX IF NOT EXISTS idx_channels_messages_type ON channels_messages(type);
CREATE INDEX IF NOT EXISTS idx_channels_messages_created_at ON channels_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_channels_messages_updated_at ON channels_messages(updated_at);
CREATE INDEX IF NOT EXISTS idx_channels_messages_expires_at ON channels_messages(expires_at);
CREATE INDEX IF NOT EXISTS idx_channels_message_responses_message_id ON channels_message_responses(message_id);
CREATE INDEX IF NOT EXISTS idx_channels_message_responses_user_id ON channels_message_responses(user_id);

-- Create timestamp update trigger function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_channels_messages_timestamp
BEFORE UPDATE ON channels_messages
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_channels_message_responses_timestamp
BEFORE UPDATE ON channels_message_responses
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Create function to handle message responses
CREATE OR REPLACE FUNCTION create_message_response(
    p_message_id UUID,
    p_user_id TEXT,
    p_response_data JSONB
)
RETURNS UUID AS $$
DECLARE
    v_response_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM channels_messages WHERE id = p_message_id) THEN
        RAISE EXCEPTION 'Message not found: %', p_message_id;
    END IF;

    INSERT INTO channels_message_responses (message_id, user_id, response_data)
    VALUES (p_message_id, p_user_id, p_response_data)
    ON CONFLICT (message_id, user_id) 
    DO UPDATE SET 
        response_data = p_response_data,
        updated_at = NOW()
    RETURNING id INTO v_response_id;
    
    UPDATE channels_messages
    SET stats = jsonb_set(
        stats,
        '{responses}',
        to_jsonb((SELECT COUNT(*) FROM channels_message_responses WHERE message_id = p_message_id))
    )
    WHERE id = p_message_id;
    
    RETURN v_response_id;
END;
$$ LANGUAGE plpgsql;

-- Drop existing function before creating new one
DROP FUNCTION IF EXISTS get_channel_messages(text);

-- Create or replace the Supabase function that retrieves all messages
CREATE OR REPLACE FUNCTION get_channel_messages(channel_username TEXT)
RETURNS TABLE (
    id UUID,
    username TEXT,
    type TEXT,
    message_text TEXT,
    caption TEXT,
    media JSONB,
    metadata JSONB,
    stats JSONB,
    interactive_content JSONB,
    fill_requirement TEXT,
    translations JSONB,
    is_translated BOOLEAN,
    message_count INTEGER,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        cm.id,
        cm.username,
        cm.type,
        cm.message_text,
        cm.caption,
        cm.media,
        cm.metadata,
        cm.stats,
        cm.interactive_content,
        cm.fill_requirement,
        cm.translations,
        cm.is_translated,
        cm.message_count,
        cm.expires_at,
        cm.created_at,
        cm.updated_at
    FROM
        channels_messages cm
    WHERE
        cm.username = channel_username
    ORDER BY
        cm.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
