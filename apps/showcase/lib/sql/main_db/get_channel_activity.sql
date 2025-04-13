-- Function to get raw channel activity records for signed-in users (Debug version)
CREATE OR REPLACE FUNCTION getchannelactivitysigneduser(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
        'channels_messages', (
          SELECT COALESCE(jsonb_agg(cm), '[]'::jsonb)
          FROM channels_messages cm
        ),
        'channels_activity', (
          SELECT COALESCE(jsonb_agg(ca), '[]'::jsonb)
          FROM channels_activity ca
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
        )
      ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;
