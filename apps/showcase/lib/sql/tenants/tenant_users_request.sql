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
    uid UUID NOT NULL,
    username TEXT NOT NULL,
    status TEXT CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(username, uid)
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
    -- Validate UUID format
    IF NOT (userid ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$') THEN
        RAISE EXCEPTION 'Invalid UUID format: %', userid;
    END IF;

    request_info := jsonb_build_object(
        'userId', userid,
        'channelUsername', channel_username,
        'requestedAt', NOW()
    ) || config;

    INSERT INTO tenant_requests (requestInfo, type, uid, username, status)
    VALUES (
        request_info, 
        'channel_access', 
        userid::uuid,  -- Cast to UUID
        channel_username, 
        'PENDING'
    )
    ON CONFLICT (username, uid) 
    DO UPDATE SET 
        requestInfo = EXCLUDED.requestInfo,
        status = 'PENDING',
        updated_at = NOW()
    RETURNING id INTO new_request_id;

    -- Get the complete record for return
    SELECT jsonb_build_object(
        'id', tr.id,
        'requestInfo', tr.requestInfo,
        'type', tr.type,
        'uid', tr.uid,
        'username', tr.username,
        'status', tr.status,
        'created_at', tr.created_at,
        'updated_at', tr.updated_at
    )
    INTO result_record
    FROM tenant_requests tr
    WHERE tr.id = new_request_id;

    RETURN result_record;
END;
$$;
