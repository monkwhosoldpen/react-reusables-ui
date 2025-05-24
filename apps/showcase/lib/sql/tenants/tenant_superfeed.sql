-- SQL Definitions for NChat Application
-- Core database objects for the application
-- ======= SUPER FEED TABLES =======
-- Drop existing tables if they exist
drop table if exists superfeed_responses;

drop table if exists superfeed;

-- Create superfeed table
create table superfeed (
  id UUID primary key default uuid_generate_v4 (),
  type TEXT not null check (
    type in (
      'tweet',
      'instagram',
      'linkedin',
      'whatsapp',
      'poll',
      'survey',
      'quiz',
      'all'
    )
  ),
  content TEXT not null,
  caption TEXT,
  message TEXT,
  media JSONB default '[]'::jsonb,
  metadata JSONB default '{
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
  stats JSONB default '{
        "views": 0,
        "likes": 0,
        "shares": 0,
        "responses": 0
    }'::jsonb,
  interactive_content JSONB default '{}'::jsonb,
  fill_requirement TEXT default 'partial' check (fill_requirement in ('partial', 'strict')),
  expires_at TIMESTAMPTZ,
  channel_username TEXT,
  created_at TIMESTAMPTZ default now(),
  updated_at TIMESTAMPTZ default now()
);

-- Create superfeed_responses table
create table superfeed_responses (
  id UUID primary key default uuid_generate_v4 (),
  feed_item_id UUID not null references superfeed (id) on delete CASCADE,
  user_id UUID not null,
  response_type TEXT not null check (response_type in ('poll', 'quiz', 'survey')),
  response_data JSONB not null,
  created_at TIMESTAMPTZ default now(),
  updated_at TIMESTAMPTZ default now(),
  unique (feed_item_id, user_id)
);

-- Drop the table if it exists
drop table if exists user_channel_last_viewed;

-- Create the user_channel_follow table with username field
create table user_channel_last_viewed (
  user_id UUID not null,
  username VARCHAR not null,
  last_viewed TIMESTAMPTZ default NOW(),
  message_count INTEGER,
  primary key (user_id, username)
);

-- Create essential indexes
create index IF not exists idx_superfeed_channel_username on superfeed (channel_username);

create index IF not exists idx_superfeed_type on superfeed (type);

create index IF not exists idx_superfeed_created_at on superfeed (created_at);

create index IF not exists idx_superfeed_updated_at on superfeed (updated_at);

create index IF not exists idx_superfeed_responses_feed_item_id on superfeed_responses (feed_item_id);

create index IF not exists idx_superfeed_responses_user_id on superfeed_responses (user_id);

-- Create timestamp update trigger function
create or replace function update_timestamp () RETURNS TRIGGER as $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
create trigger trigger_update_superfeed_timestamp BEFORE
update on superfeed for EACH row
execute FUNCTION update_timestamp ();

create trigger trigger_update_superfeed_responses_timestamp BEFORE
update on superfeed_responses for EACH row
execute FUNCTION update_timestamp ();

create or replace function create_superfeed_response (
  p_feed_item_id UUID,
  p_user_id UUID,
  p_response_data JSONB
) RETURNS UUID as $$
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

create or replace function get_channel_superfeed_with_access_status (
  p_channel_username TEXT,
  p_user_id UUID,
  p_page_size INTEGER default 20,
  p_last_message_timestamp TIMESTAMPTZ default null
) RETURNS JSONB as $$
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

    SELECT CASE
        WHEN p_user_id IS NULL THEN 'NONE'
        WHEN status IS NULL THEN 'NONE'
        WHEN status = 'PENDING' THEN 'PENDING'
        WHEN status = 'APPROVED' THEN 'APPROVED'
        ELSE 'REJECTED'
    END INTO access_status
    FROM tenant_requests
    WHERE username = p_channel_username AND uid = p_user_id;

    IF access_status IS NULL THEN
        access_status := 'NONE';
    END IF;

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