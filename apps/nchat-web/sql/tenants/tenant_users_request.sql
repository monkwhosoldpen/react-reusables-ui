-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

CREATE OR REPLACE FUNCTION request_tenant_channel_access(userid text, channel_username text, config jsonb) 
RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
    new_request_id UUID;
    request_info JSONB;
    result_record JSONB;
BEGIN
    -- Create request_info with user ID, channel username and request timestamp
    request_info := jsonb_build_object(
        'userId', userid,
        'channelUsername', channel_username,
        'requestedAt', NOW()
    );
    
    -- Merge with any additional config parameters
    request_info := request_info || config;
    
    -- Upsert a record into tenant_requests
    -- If a record with the same username exists, update it; otherwise, insert a new one
    INSERT INTO tenant_requests (requestInfo, type, uid, username, status)
    VALUES (request_info, 'channel_access', userid, channel_username, 'PENDING')
    ON CONFLICT (username) 
    DO UPDATE SET 
        requestInfo = EXCLUDED.requestInfo,
        uid = EXCLUDED.uid,
        status = 'PENDING',
        updated_at = NOW()
    RETURNING id INTO new_request_id;
    
    -- Build the complete result record to return
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

    -- Determine access status from tenant_requests
    SELECT CASE
      WHEN status IS NULL THEN 'NONE'
      WHEN status = 'PENDING' THEN 'PENDING'
      WHEN status = 'APPROVED' THEN 'APPROVED'
      ELSE 'REJECTED'
    END INTO access_status
    FROM tenant_requests
    WHERE username = p_channel_username AND uid = p_user_id;

    -- Return combined result with access status
    RETURN jsonb_build_object(
        'messages', COALESCE(messages_result, '[]'::jsonb),
        'user_id', p_user_id,
        'channel_username', p_channel_username,
        'access_status', access_status,
        'has_more', (SELECT COUNT(*) FROM channels_messages cm
                     WHERE cm.username = p_channel_username
                     AND (p_last_message_timestamp IS NULL OR cm.created_at < p_last_message_timestamp)) > p_page_size
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;