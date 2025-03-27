-- Drop tables in correct order (dependent tables first)
DROP TABLE IF EXISTS channel_access_requests;
DROP TABLE IF EXISTS tenant_user_details;
DROP TABLE IF EXISTS channels;

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