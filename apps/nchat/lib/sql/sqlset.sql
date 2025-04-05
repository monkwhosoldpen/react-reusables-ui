-- SQL Definitions for NChat Application
-- Comprehensive SQL file containing all database objects for the application

-- ======= DATABASE SETUP =======

-- Drop tables in correct order (dependent tables first) if needed
-- DROP TABLE IF EXISTS superfeed_responses;
-- DROP TABLE IF EXISTS superfeed;
-- DROP TABLE IF EXISTS channel_access_requests;
-- DROP TABLE IF EXISTS tenant_user_details;
-- DROP TABLE IF EXISTS channels;

-- ======= CHANNEL TABLES =======

-- Create the channels table
CREATE TABLE IF NOT EXISTS channels (
    username TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    avatar_url TEXT,
    owner_username TEXT,
    is_related_channel BOOLEAN DEFAULT false,
    category TEXT,
    premium BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_realtime BOOLEAN DEFAULT false,
    last_message TEXT,
    related_channels TEXT[],
    is_auto_approve BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create the channel access requests table
CREATE TABLE IF NOT EXISTS channel_access_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_username TEXT NOT NULL REFERENCES channels(username),
    user_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
    user_details JSONB DEFAULT '{}'::jsonb,
    requested_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create the tenant user details table
CREATE TABLE IF NOT EXISTS tenant_user_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    channel_username TEXT NOT NULL REFERENCES channels(username),
    user_details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, channel_username)
);

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
    channel_username TEXT REFERENCES channels(username),
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

-- ======= CHANNEL FUNCTIONS =======

-- Function to get channel data including related channels
CREATE OR REPLACE FUNCTION get_channel_data(p_username TEXT)
RETURNS JSONB AS $$
DECLARE
    v_owner_username TEXT;
    v_is_related BOOLEAN;
    v_username_to_query TEXT;
    v_debug_info JSONB;
BEGIN
    -- First get the channel info to determine if it's related
    SELECT 
        owner_username,
        is_related_channel,
        jsonb_build_object(
            'found_channel', TRUE,
            'username', username,
            'owner', owner_username,
            'is_related', is_related_channel
        )
    INTO v_owner_username, v_is_related, v_debug_info
    FROM channels
    WHERE username = p_username;

    -- If channel not found, return debug info
    IF v_owner_username IS NULL THEN
        RETURN jsonb_build_object(
            'error', 'Channel not found',
            'requested_username', p_username
        );
    END IF;

    -- Decide which username to use for querying channels
    IF v_is_related THEN
        v_username_to_query := v_owner_username;
    ELSE
        v_username_to_query := p_username;
    END IF;

    -- Return the main channel and all related channels for the determined username
    RETURN (
        SELECT jsonb_build_object(
            'debug', v_debug_info,
            'username', c.username,
            'name', c.name,
            'description', c.description,
            'avatar_url', c.avatar_url,
            'owner_username', c.owner_username,
            'is_related_channel', c.is_related_channel,
            'category', c.category,
            'premium', c.premium,
            'metadata', c.metadata,
            'is_realtime', c.is_realtime,
            'last_message', c.last_message,
            'created_at', c.created_at,
            'updated_at', c.updated_at,
            'related_channels', COALESCE((
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'username', rc.username,
                        'name', rc.name,
                        'description', rc.description,
                        'avatar_url', rc.avatar_url,
                        'owner_username', rc.owner_username,
                        'is_related_channel', rc.is_related_channel,
                        'category', rc.category,
                        'premium', rc.premium,
                        'metadata', rc.metadata,
                        'is_realtime', rc.is_realtime,
                        'last_message', rc.last_message,
                        'created_at', rc.created_at,
                        'updated_at', rc.updated_at
                    )
                )
                FROM channels rc
                WHERE rc.owner_username = v_username_to_query
                AND rc.username != p_username  -- Exclude the current channel
                AND rc.is_related_channel = true
            ), '[]'::jsonb)
        )
        FROM channels c
        WHERE c.username = v_username_to_query  -- Changed from owner_username to username
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql;

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

-- Function to update superfeed stats (views, likes, shares)
CREATE OR REPLACE FUNCTION update_superfeed_stats(
  p_feed_item_id UUID,
  p_views INTEGER DEFAULT NULL,
  p_likes INTEGER DEFAULT NULL,
  p_shares INTEGER DEFAULT NULL,
  p_responses INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_stats JSONB;
BEGIN
  -- Get current stats
  SELECT stats INTO v_stats FROM superfeed WHERE id = p_feed_item_id;
  
  -- Update stats
  IF p_views IS NOT NULL THEN
    v_stats = jsonb_set(v_stats, '{views}', to_jsonb(p_views));
  END IF;
  
  IF p_likes IS NOT NULL THEN
    v_stats = jsonb_set(v_stats, '{likes}', to_jsonb(p_likes));
  END IF;
  
  IF p_shares IS NOT NULL THEN
    v_stats = jsonb_set(v_stats, '{shares}', to_jsonb(p_shares));
  END IF;
  
  IF p_responses IS NOT NULL THEN
    v_stats = jsonb_set(v_stats, '{responses}', to_jsonb(p_responses));
  END IF;
  
  -- Update the record
  UPDATE superfeed
  SET stats = v_stats, updated_at = NOW()
  WHERE id = p_feed_item_id;
  
  RETURN FOUND;
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

-- Function to get trending feed items based on activity
CREATE OR REPLACE FUNCTION get_trending_feed_items(
  p_limit INTEGER DEFAULT 10
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
  channel_username TEXT,
  created_at TIMESTAMPTZ,
  channel_name TEXT,
  score FLOAT
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
    s.channel_username,
    s.created_at,
    c.name AS channel_name,
    -- Calculate a score based on views, likes, responses, and recency
    (COALESCE((s.stats->>'views')::INTEGER, 0) * 0.3 + 
     COALESCE((s.stats->>'likes')::INTEGER, 0) * 0.4 + 
     COALESCE((s.stats->>'responses')::INTEGER, 0) * 0.5) *
     (1.0 / (EXTRACT(EPOCH FROM (NOW() - s.created_at))/86400.0 + 2.0)^1.5) AS score
  FROM 
    superfeed s
  JOIN 
    channels c ON s.channel_username = c.username
  WHERE 
    s.created_at > NOW() - INTERVAL '30 days'
  ORDER BY 
    score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ======= INDEXES FOR PERFORMANCE =======

-- Create indexes to optimize queries
CREATE INDEX IF NOT EXISTS idx_channels_owner_username ON channels(owner_username);
CREATE INDEX IF NOT EXISTS idx_channels_is_related ON channels(is_related_channel);

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

-- Apply trigger to tables
DROP TRIGGER IF EXISTS trigger_update_channels_timestamp ON channels;
CREATE TRIGGER trigger_update_channels_timestamp
BEFORE UPDATE ON channels
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trigger_update_superfeed_timestamp ON superfeed;
CREATE TRIGGER trigger_update_superfeed_timestamp
BEFORE UPDATE ON superfeed
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trigger_update_superfeed_responses_timestamp ON superfeed_responses;
CREATE TRIGGER trigger_update_superfeed_responses_timestamp
BEFORE UPDATE ON superfeed_responses
FOR EACH ROW
EXECUTE FUNCTION update_timestamp(); 