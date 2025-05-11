-- Function to get raw channel activity records for signed-in users (Debug version)
CREATE OR REPLACE FUNCTION getchannelactivitysigneduser(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
        'channels_activity', (
          SELECT COALESCE(jsonb_agg(ca), '[]'::jsonb)
          FROM channels_activity ca
          WHERE ca.username IN (
            -- Get usernames from followed channels
            SELECT username 
            FROM user_channel_follow 
            WHERE user_id = p_user_id
            UNION
            -- Get usernames from tenant requests
            SELECT username 
            FROM tenant_requests 
            WHERE uid = p_user_id::text
          )
        ),
        'user_language', (
          SELECT COALESCE(jsonb_agg(ul), '[]'::jsonb)
          FROM user_language ul
        ),
        'user_notifications', (
          SELECT COALESCE(jsonb_agg(un), '[]'::jsonb)
          FROM user_notifications un
        ),
        'push_subscriptions', (
          SELECT COALESCE(jsonb_agg(ps), '[]'::jsonb)
          FROM push_subscriptions ps
        ),
        'tenant_requests', (
          SELECT COALESCE(jsonb_agg(tr), '[]'::jsonb)
          FROM tenant_requests tr
        ),
        'user_location', (
          SELECT COALESCE(jsonb_agg(uloc), '[]'::jsonb)
          FROM user_location uloc
        ),
        'user_channel_last_viewed', (
          SELECT COALESCE(jsonb_agg(uclv), '[]'::jsonb)
          FROM user_channel_last_viewed uclv
        ),
        'user_channel_follow', (
          SELECT COALESCE(jsonb_agg(ucf), '[]'::jsonb)
          FROM user_channel_follow ucf
        ),
        'raw_records', (
          SELECT jsonb_build_object(
            'channels_activity', (
              SELECT COALESCE(jsonb_agg(ca), '[]'::jsonb)
              FROM channels_activity ca
              WHERE ca.username IN (
                -- Get usernames from followed channels
                SELECT username 
                FROM user_channel_follow 
                WHERE user_id = p_user_id
                UNION
                -- Get usernames from tenant requests
                SELECT username 
                FROM tenant_requests 
                WHERE uid = p_user_id::text
              )
            ),
            'user_language', (SELECT COALESCE(jsonb_agg(ul), '[]'::jsonb) FROM user_language ul),
            'user_notifications', (SELECT COALESCE(jsonb_agg(un), '[]'::jsonb) FROM user_notifications un),
            'push_subscriptions', (SELECT COALESCE(jsonb_agg(ps), '[]'::jsonb) FROM push_subscriptions ps),
            'tenant_requests', (SELECT COALESCE(jsonb_agg(tr), '[]'::jsonb) FROM tenant_requests tr),
            'user_location', (SELECT COALESCE(jsonb_agg(uloc), '[]'::jsonb) FROM user_location uloc),
            'user_channel_last_viewed', (SELECT COALESCE(jsonb_agg(uclv), '[]'::jsonb) FROM user_channel_last_viewed uclv),
            'user_channel_follow', (SELECT COALESCE(jsonb_agg(ucf), '[]'::jsonb) FROM user_channel_follow ucf)
          )
        )
      ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;
