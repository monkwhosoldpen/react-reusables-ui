-- SQL Definitions for NChat Application
-- Comprehensive SQL file containing all database objects for the application

-- ======= SUPER FEED TABLES =======

-- Super Feed Table - stores all feed content
CREATE TABLE IF NOT EXISTS superfeed (
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

-- Super Feed Responses Table - for tracking user interactions with feed items
CREATE TABLE IF NOT EXISTS superfeed_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feed_item_id UUID NOT NULL REFERENCES superfeed(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    response_type TEXT NOT NULL CHECK (response_type IN ('poll', 'quiz', 'survey')),
    response_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(feed_item_id, user_id)
);

-- ======= SUPER FEED FUNCTIONS =======

-- Function to get super feed items with pagination and filtering
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

-- Function to get response statistics for a specific feed item
CREATE OR REPLACE FUNCTION get_superfeed_response_stats(p_feed_item_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  WITH response_counts AS (
    SELECT 
      COUNT(DISTINCT user_id) as total_respondents,
      COUNT(*) as total_responses
    FROM superfeed_responses
    WHERE feed_item_id = p_feed_item_id
  )
  SELECT 
    jsonb_build_object(
      'total_respondents', total_respondents,
      'total_responses', total_responses,
      'response_breakdown', COALESCE(
        (SELECT jsonb_object_agg(key, count)
         FROM (
           SELECT 
             key, 
             COUNT(*) as count
           FROM 
             superfeed_responses,
             jsonb_each(response_data)
           WHERE 
             feed_item_id = p_feed_item_id
           GROUP BY 
             key
         ) as breakdown
        ), '{}'::jsonb
      )
    ) INTO v_result
  FROM response_counts;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;


-- Function to get feed items by channel with user response status
CREATE OR REPLACE FUNCTION get_channel_feed_with_response_status(
  p_channel_username TEXT,
  p_user_id TEXT,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
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
  has_responded BOOLEAN
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
    EXISTS (
      SELECT 1 FROM superfeed_responses sr 
      WHERE sr.feed_item_id = s.id AND sr.user_id = p_user_id
    ) as has_responded
  FROM superfeed s
  WHERE 
    s.channel_username = p_channel_username
    AND (s.expires_at IS NULL OR s.expires_at > NOW())
  ORDER BY s.updated_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Function to create a response to a super feed item
CREATE OR REPLACE FUNCTION create_superfeed_response(
  p_feed_item_id UUID,
  p_user_id TEXT,
  p_response_data JSONB
)
RETURNS UUID AS $$
DECLARE
  v_response_id UUID;
  v_current_responses INTEGER;
BEGIN
  -- Insert or update response
  INSERT INTO superfeed_responses (feed_item_id, user_id, response_data)
  VALUES (p_feed_item_id, p_user_id, p_response_data)
  ON CONFLICT (feed_item_id, user_id) 
  DO UPDATE SET 
    response_data = p_response_data,
    updated_at = NOW()
  RETURNING id INTO v_response_id;
  
  -- Update the stats on the superfeed item
  SELECT COALESCE((stats->>'responses')::INTEGER, 0) INTO v_current_responses 
  FROM superfeed WHERE id = p_feed_item_id;
  
  -- Execute the update stats function
  PERFORM update_superfeed_stats(
    p_feed_item_id, 
    NULL, NULL, NULL, 
    (SELECT COUNT(*) FROM superfeed_responses WHERE feed_item_id = p_feed_item_id)
  );
  
  RETURN v_response_id;
END;
$$ LANGUAGE plpgsql;

-- Create indexes to optimize queries
CREATE INDEX IF NOT EXISTS idx_superfeed_channel_username ON superfeed(channel_username);
CREATE INDEX IF NOT EXISTS idx_superfeed_type ON superfeed(type);
CREATE INDEX IF NOT EXISTS idx_superfeed_created_at ON superfeed(created_at);
CREATE INDEX IF NOT EXISTS idx_superfeed_updated_at ON superfeed(updated_at);
CREATE INDEX IF NOT EXISTS idx_superfeed_responses_feed_item_id ON superfeed_responses(feed_item_id);
CREATE INDEX IF NOT EXISTS idx_superfeed_responses_user_id ON superfeed_responses(user_id);

-- ======= TRIGGERS =======

-- Trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remove foreign key constraint
ALTER TABLE superfeed DROP CONSTRAINT IF EXISTS superfeed_channel_username_fkey;
