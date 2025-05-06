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

-- Function to retrieve paginated messages and access status
CREATE OR REPLACE FUNCTION get_channel_superfeed_with_access_status(
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
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', sf.id,
            'username', sf.channel_username,
            'type', sf.type,
            'media', sf.media,
            'metadata', sf.metadata,
            'stats', sf.stats,
            'interactive_content', sf.interactive_content,
            'created_at', sf.created_at,
            'updated_at', sf.updated_at
        )
    )
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
        WHEN p_user_id IS NULL OR p_user_id = '' THEN 'NONE'
        WHEN status IS NULL THEN 'NONE'
        WHEN status = 'PENDING' THEN 'PENDING'
        WHEN status = 'APPROVED' THEN 'APPROVED'
        ELSE 'REJECTED'
    END INTO access_status
    FROM tenant_requests
    WHERE username = p_channel_username AND uid = p_user_id
    AND p_user_id IS NOT NULL AND p_user_id != '';

    IF access_status IS NULL THEN
        access_status := 'NONE';
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
