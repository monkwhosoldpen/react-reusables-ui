DROP FUNCTION IF EXISTS get_channel_data(TEXT);

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

