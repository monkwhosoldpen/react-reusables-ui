-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop functions if they exist
DROP FUNCTION IF EXISTS request_tenant_channel_access(text, text, jsonb);
DROP FUNCTION IF EXISTS get_channel_superfeed_with_access_status(text, text, integer, timestamptz);

-- Drop and recreate the tenant_requests table
DROP TABLE IF EXISTS tenant_requests CASCADE;

CREATE TABLE tenant_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requestInfo JSONB,
    type TEXT,
    uid TEXT,
    username TEXT UNIQUE,
    status TEXT CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_tenant_requests_username_uid ON tenant_requests (username, uid);

-- Function to upsert a channel access request
CREATE OR REPLACE FUNCTION request_tenant_channel_access(userid TEXT, channel_username TEXT, config JSONB) 
RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
    new_request_id UUID;
    request_info JSONB;
    result_record JSONB;
BEGIN
    request_info := jsonb_build_object(
        'userId', userid,
        'channelUsername', channel_username,
        'requestedAt', NOW()
    ) || config;

    INSERT INTO tenant_requests (requestInfo, type, uid, username, status)
    VALUES (request_info, 'channel_access', userid, channel_username, 'PENDING')
    ON CONFLICT (username) 
    DO UPDATE SET 
        requestInfo = EXCLUDED.requestInfo,
        uid = EXCLUDED.uid,
        status = 'PENDING',
        updated_at = NOW()
    RETURNING id INTO new_request_id;

    result_record := jsonb_build_object(
        'id', new_request_id,
        'requestInfo', request_info,
        'type', 'channel_access',
        'uid', userid,
        'username', channel_username,
        'status', 'PENDING'
    );

    RETURN result_record;
END;
$$;
