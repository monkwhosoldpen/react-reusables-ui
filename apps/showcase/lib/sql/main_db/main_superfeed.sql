-- SQL Definitions for NChat Application
-- Core database objects for the application

-- ======= SUPER FEED TABLES =======

-- Drop existing tables if they exist
DROP TABLE IF EXISTS superfeed_responses;
DROP TABLE IF EXISTS superfeed;
DROP TABLE IF EXISTS channels_activity;

-- Create channels_activity table for tracking channel last change
CREATE TABLE IF NOT EXISTS channels_activity (
    username TEXT PRIMARY KEY,
    last_updated_at TIMESTAMPTZ DEFAULT NOW(),
    message_count INTEGER,
    last_message JSONB
);

-- Create superfeed table
CREATE TABLE superfeed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('tweet', 'instagram', 'linkedin', 'whatsapp', 'poll', 'survey', 'quiz', 'all')),
    content TEXT NOT NULL,
    caption TEXT,
    message TEXT,
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
    expires_at TIMESTAMPTZ,
    channel_username TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create superfeed_responses table
CREATE TABLE superfeed_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feed_item_id UUID NOT NULL REFERENCES superfeed(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    response_type TEXT NOT NULL CHECK (response_type IN ('poll', 'quiz', 'survey')),
    response_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(feed_item_id, user_id)
);

-- Create essential indexes
CREATE INDEX IF NOT EXISTS idx_superfeed_channel_username ON superfeed(channel_username);
CREATE INDEX IF NOT EXISTS idx_superfeed_type ON superfeed(type);
CREATE INDEX IF NOT EXISTS idx_superfeed_created_at ON superfeed(created_at);
CREATE INDEX IF NOT EXISTS idx_superfeed_updated_at ON superfeed(updated_at);
CREATE INDEX IF NOT EXISTS idx_superfeed_responses_feed_item_id ON superfeed_responses(feed_item_id);
CREATE INDEX IF NOT EXISTS idx_superfeed_responses_user_id ON superfeed_responses(user_id);

-- Create timestamp update trigger function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_superfeed_timestamp
BEFORE UPDATE ON superfeed
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_superfeed_responses_timestamp
BEFORE UPDATE ON superfeed_responses
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();


CREATE OR REPLACE FUNCTION create_superfeed_response(
    p_feed_item_id UUID,
    p_user_id UUID,
    p_response_data JSONB
)
RETURNS UUID AS $$
DECLARE
    v_response_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM superfeed WHERE id = p_feed_item_id) THEN
        RAISE EXCEPTION 'Feed item not found: %', p_feed_item_id;
    END IF;

    INSERT INTO superfeed_responses (feed_item_id, user_id, response_data)
    VALUES (p_feed_item_id, p_user_id, p_response_data)
    ON CONFLICT (feed_item_id, user_id) 
    DO UPDATE SET 
        response_data = p_response_data,
        updated_at = NOW()
    RETURNING id INTO v_response_id;
    
    UPDATE superfeed
    SET stats = jsonb_set(
        stats,
        '{responses}',
        to_jsonb((SELECT COUNT(*) FROM superfeed_responses WHERE feed_item_id = p_feed_item_id))
    )
    WHERE id = p_feed_item_id;
    
    RETURN v_response_id;
END;
$$ LANGUAGE plpgsql;





CREATE OR REPLACE FUNCTION get_channel_superfeed_with_access_status(
    p_channel_username TEXT,
    p_user_id UUID,
    p_page_size INTEGER DEFAULT 20,
    p_last_message_timestamp TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    messages_result JSONB;
    access_status TEXT;
BEGIN
    SELECT jsonb_agg(to_jsonb(sf.*))
    INTO messages_result
    FROM (
        SELECT *
        FROM superfeed sf
        WHERE sf.channel_username = p_channel_username
        AND (p_last_message_timestamp IS NULL OR sf.created_at < p_last_message_timestamp)
        ORDER BY sf.created_at DESC
        LIMIT p_page_size
    ) sf;

    -- Handle access status check with proper null handling
    SELECT CASE
        WHEN p_user_id IS NULL THEN 'NONE'
        WHEN status IS NULL THEN 'NONE'
        WHEN status = 'PENDING' THEN 'PENDING'
        WHEN status = 'APPROVED' THEN 'APPROVED'
        ELSE 'REJECTED'
    END INTO access_status
    FROM tenant_requests
    WHERE username = p_channel_username 
    AND uid = p_user_id::text;  -- Convert UUID to text for comparison

    IF access_status IS NULL THEN
        access_status := 'NONE';
    END IF;

    -- Update user_channel_last_viewed table only if user_id is not null
    IF p_user_id IS NOT NULL THEN
        INSERT INTO user_channel_last_viewed (user_id, username, last_viewed, message_count)
        VALUES (p_user_id, p_channel_username, NOW(), 0)
        ON CONFLICT (user_id, username) DO UPDATE SET
            last_viewed = NOW(),
            message_count = user_channel_last_viewed.message_count + 1;
    END IF;

    RETURN jsonb_build_object(
        'messages', COALESCE(messages_result, '[]'::jsonb),
        'user_id', p_user_id,
        'channel_username', p_channel_username,
        'access_status', access_status,
        'has_more', (
            SELECT COUNT(*) > p_page_size
            FROM superfeed sf
            WHERE sf.channel_username = p_channel_username
            AND (p_last_message_timestamp IS NULL OR sf.created_at < p_last_message_timestamp)
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update channels_activity
CREATE OR REPLACE FUNCTION update_channel_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- For INSERT or UPDATE
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        INSERT INTO channels_activity (username, last_updated_at, message_count, last_message)
        VALUES (
            NEW.channel_username,
            NOW(),
            (SELECT COUNT(*) FROM superfeed WHERE channel_username = NEW.channel_username),
            row_to_json(NEW)
        )
        ON CONFLICT (username) DO UPDATE
        SET 
            last_updated_at = NOW(),
            message_count = (SELECT COUNT(*) FROM superfeed WHERE channel_username = NEW.channel_username),
            last_message = row_to_json(NEW);
    -- For DELETE
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE channels_activity
        SET 
            last_updated_at = NOW(),
            message_count = (SELECT COUNT(*) FROM superfeed WHERE channel_username = OLD.channel_username),
            last_message = (
                SELECT row_to_json(sf.*)
                FROM superfeed sf
                WHERE sf.channel_username = OLD.channel_username
                ORDER BY sf.created_at DESC
                LIMIT 1
            )
        WHERE username = OLD.channel_username;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for superfeed changes
CREATE TRIGGER trigger_superfeed_channel_activity_insert
AFTER INSERT ON superfeed
FOR EACH ROW
EXECUTE FUNCTION update_channel_activity();

CREATE TRIGGER trigger_superfeed_channel_activity_update
AFTER UPDATE ON superfeed
FOR EACH ROW
EXECUTE FUNCTION update_channel_activity();

CREATE TRIGGER trigger_superfeed_channel_activity_delete
AFTER DELETE ON superfeed
FOR EACH ROW
EXECUTE FUNCTION update_channel_activity();
