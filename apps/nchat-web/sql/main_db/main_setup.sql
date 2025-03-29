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


-- Create channels_activity table for tracking channel last change
CREATE TABLE IF NOT EXISTS channels_activity (
    username TEXT PRIMARY KEY,
    last_updated_at TIMESTAMPTZ DEFAULT NOW(),
    message_count INTEGER,
    last_message JSONB
);

-- Function to update channel activity
CREATE OR REPLACE FUNCTION update_channel_activity(
    _username TEXT,
    _message_count INTEGER,
    _last_message JSONB DEFAULT NULL    
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO channels_activity (
        username, 
        last_updated_at,
        last_message,
        message_count
    )
    VALUES (
        _username, 
        NOW(),
        _last_message,
        _message_count
    )
    ON CONFLICT (username) DO UPDATE SET
        last_updated_at = NOW(),
        message_count = _message_count,
        last_message = COALESCE(_last_message, channels_activity.last_message);
END;
$$ LANGUAGE plpgsql;

-- Trigger function to update channel activity when a new message is inserted
CREATE OR REPLACE FUNCTION update_channel_activity_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Call the update_channel_activity function with the new row's username and message
    PERFORM update_channel_activity(
        NEW.username,
        NEW.message_count,
        jsonb_build_object(
            'id', NEW.id,
            'message_text', NEW.message_text,
            'created_at', NEW.created_at
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger to call the trigger function after insert
CREATE TRIGGER trigger_update_channel_activity
AFTER INSERT ON channels_messages
FOR EACH ROW
EXECUTE FUNCTION update_channel_activity_trigger();


-- Drop user_language table if it exists
DROP TABLE IF EXISTS user_language CASCADE;

-- Drop user_notifications table if it exists
DROP TABLE IF EXISTS user_notifications CASCADE;

-- Create user_language table to track user's language preference
CREATE TABLE IF NOT EXISTS user_language (
    user_id UUID PRIMARY KEY,                -- Unique identifier for each user
    language TEXT DEFAULT 'english',         -- Default language is English
    CONSTRAINT fk_user_language FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- Create user_location table to track user's location details
CREATE TABLE IF NOT EXISTS user_location (
    user_id UUID PRIMARY KEY,                -- Unique identifier for each user
    state TEXT,                              -- State name
    district TEXT,                           -- District name
    mp_constituency TEXT,                    -- MP Constituency
    assembly_constituency TEXT,              -- Assembly Constituency
    mandal TEXT,                             -- Mandal/Tehsil
    village TEXT,                            -- Village
    ward TEXT,                               -- Ward
    pincode TEXT,                            -- Postal PIN code
    latitude DECIMAL(10,8),                  -- Latitude coordinate
    longitude DECIMAL(11,8),                 -- Longitude coordinate
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,  -- Last update timestamp
    CONSTRAINT fk_user_location FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- Create user_notifications table to track user's notification preferences
CREATE TABLE IF NOT EXISTS user_notifications (
    user_id UUID PRIMARY KEY,                -- Unique identifier for each user
    notifications_enabled BOOLEAN DEFAULT TRUE, -- Default is notifications enabled (TRUE)
    CONSTRAINT fk_user_notifications FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- Create or replace the Supabase function that retrieves paginated messages from channels_messages table for a specific username
CREATE OR REPLACE FUNCTION get_channel_messages_paginated(
    channel_username TEXT,
    page_size INTEGER DEFAULT 20,
    last_message_timestamp TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    username TEXT,
    message_text TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    translations JSONB,
    is_translated BOOLEAN
) AS $$
BEGIN
    -- Query to fetch paginated messages for the given channel username
    RETURN QUERY
    SELECT
        cm.id,
        cm.username,
        cm.message_text,
        cm.created_at,
        cm.updated_at,
        cm.translations,
        cm.is_translated
    FROM
        channels_messages cm
    WHERE
        cm.username = channel_username
        AND (last_message_timestamp IS NULL OR cm.created_at < last_message_timestamp)
    ORDER BY
        cm.created_at DESC
    LIMIT
        page_size;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Create or replace function that retrieves both paginated messages and tenant access status
CREATE OR REPLACE FUNCTION get_channel_messages_with_access_status(
    p_channel_username TEXT,
    p_user_id TEXT,
    p_page_size INTEGER DEFAULT 20,
    p_last_message_timestamp TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    messages_result JSONB;
    access_status TEXT;
BEGIN
    -- Get the paginated messages
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', cm.id,
            'username', cm.channel_username,
            'message_text', cm.message_text,
            'created_at', cm.created_at,
            'updated_at', cm.updated_at,
            'translations', cm.translations,
            'is_translated', cm.is_translated
        )
    )
    INTO messages_result
    FROM (
        SELECT
            cm.id,
            cm.username AS channel_username,
            cm.message_text,
            cm.created_at,
            cm.updated_at,
            cm.translations,
            cm.is_translated
        FROM
            channels_messages cm
        WHERE
            cm.username = p_channel_username
            AND (p_last_message_timestamp IS NULL OR cm.created_at < p_last_message_timestamp)
        ORDER BY
            cm.created_at DESC
        LIMIT
            p_page_size
    ) cm;
    -- Return combined result with access status
    RETURN jsonb_build_object(
        'messages', COALESCE(messages_result, '[]'::jsonb),
        'user_id', p_user_id,
        'channel_username', p_channel_username,
        'access_status', '',
        'has_more', (SELECT COUNT(*) FROM channels_messages cm
                     WHERE cm.username = p_channel_username
                     AND (p_last_message_timestamp IS NULL OR cm.created_at < p_last_message_timestamp)) > p_page_size
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create tenant_requests table
DROP TABLE IF EXISTS tenant_requests CASCADE;

CREATE TABLE IF NOT EXISTS tenant_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requestInfo JSONB,
    type TEXT,
    uid TEXT,
    username TEXT UNIQUE,
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create push_subscriptions table to store browser push subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys TEXT NOT NULL,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  platform TEXT DEFAULT 'browser',
  device_id TEXT,
  app_version TEXT,
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT push_subscriptions_endpoint_key UNIQUE (endpoint)
);

-- Enable Row Level Security for push_subscriptions
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy allowing users to manage their own push subscriptions
CREATE POLICY "Users can manage their own push subscriptions"
  ON public.push_subscriptions
  FOR ALL
  USING (auth.uid() = user_id);

-- Create policy allowing service role to manage all push subscriptions
CREATE POLICY "Service role can manage all push subscriptions"
  ON public.push_subscriptions
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id 
  ON public.push_subscriptions(user_id);

-- Create index for by-user lookups used in the application
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_by_user 
  ON public.push_subscriptions(user_id);

-- Create UUID extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop the table if it exists
DROP TABLE IF EXISTS user_channel_last_viewed;

-- Create the user_channel_follow table with username field
CREATE TABLE user_channel_last_viewed (
    user_id UUID NOT NULL,
    username VARCHAR NOT NULL,
    last_viewed TIMESTAMPTZ DEFAULT NOW(),
    message_count INTEGER,
    PRIMARY KEY (user_id, username)
);

-- Create an index for faster lookups by username
CREATE INDEX idx_user_channel_last_viewed_username ON user_channel_last_viewed(username);

-- Create an index for faster lookups by user_id
CREATE INDEX idx_user_channel_last_viewed_user_id ON user_channel_last_viewed(user_id); 


-- Create UUID extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop the table if it exists
DROP TABLE IF EXISTS user_channel_follow;

-- Create the user_channel_follow table with username field
CREATE TABLE user_channel_follow (
    user_id UUID NOT NULL,
    username VARCHAR NOT NULL,
    followed_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, username)
);

-- Create an index for faster lookups by username
CREATE INDEX idx_user_channel_follow_username ON user_channel_follow(username);

-- Create an index for faster lookups by user_id
CREATE INDEX idx_user_channel_follow_user_id ON user_channel_follow(user_id); 