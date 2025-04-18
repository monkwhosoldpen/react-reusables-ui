-- SQL Definitions for NChat Application
-- Core database objects for the application

-- ======= SUPER FEED TABLES =======

-- Drop existing tables if they exist
DROP TABLE IF EXISTS superfeed_responses;
DROP TABLE IF EXISTS superfeed;

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

-- Create essential functions
CREATE OR REPLACE FUNCTION get_super_feed_items(
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_channel_username TEXT DEFAULT NULL,
  p_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  type TEXT,
  content TEXT,
  caption TEXT,
  message TEXT,
  media JSONB,
  metadata JSONB,
  stats JSONB,
  interactive_content JSONB,
  fill_requirement TEXT,
  expires_at TIMESTAMPTZ,
  channel_username TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  channel_name TEXT,
  channel_avatar_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.type,
    s.content,
    s.caption,
    s.message,
    s.media,
    s.metadata,
    s.stats,
    s.interactive_content,
    s.fill_requirement,
    s.expires_at,
    s.channel_username,
    s.created_at,
    s.updated_at,
    c.name AS channel_name,
    c.avatar_url AS channel_avatar_url
  FROM superfeed s
  LEFT JOIN channels c ON s.channel_username = c.username
  WHERE 
    (p_channel_username IS NULL OR s.channel_username = p_channel_username)
    AND (p_type IS NULL OR s.type = p_type)
    AND (s.expires_at IS NULL OR s.expires_at > NOW())
  ORDER BY s.updated_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_superfeed_response(
    p_feed_item_id UUID,
    p_user_id TEXT,
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
