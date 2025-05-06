-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create channels_activity table for tracking channel last change
CREATE TABLE IF NOT EXISTS channels_activity (
    username TEXT PRIMARY KEY,
    last_updated_at TIMESTAMPTZ DEFAULT NOW(),
    message_count INTEGER,
    last_message JSONB
);


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