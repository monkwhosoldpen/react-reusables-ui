import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Webhook secret from environment variables
const WEBHOOK_SECRET = process.env.SUPABASE_WEBHOOK_SECRET;

// Interface for channel activity
interface ChannelActivity {
  username: string;
  last_updated_at: string;
  last_message: {
    id: string;
    message_text: string;
    created_at: string;
    [key: string]: any;
  };
}

export async function POST(request: NextRequest) {
  // Verify webhook signature if secret is set
  if (WEBHOOK_SECRET) {
    const signature = request.headers.get('x-supabase-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature header' }, { status: 401 });
    }

    const body = await request.json();
    const hmac = createHmac('sha256', WEBHOOK_SECRET);
    const computedSignature = hmac.update(JSON.stringify(body)).digest('hex');

    if (computedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    try {
      const { type, table, record, old_record } = body;

      // Only process events from channels_activity table
      if (table !== 'channels_activity') {
        return NextResponse.json({ message: 'Ignored event for different table' });
      }

      // Only process INSERT or UPDATE events
      if (type !== 'INSERT' && type !== 'UPDATE') {
        return NextResponse.json({ message: 'Ignored non-insert/update event' });
      }

      const channelActivity = record as ChannelActivity;

      // Skip if there's no last_message
      if (!channelActivity.last_message) {
        return NextResponse.json({ message: 'No last_message in record' });
      }

      // For updates, check if the message has actually changed
      if (type === 'UPDATE' && old_record) {
        const oldActivity = old_record as ChannelActivity;
        if (oldActivity.last_message?.id === channelActivity.last_message.id) {
          return NextResponse.json({ message: 'No change in message' });
        }
      }

      // Prepare notification data
      const title = `New message from @${channelActivity.username}`;
      const message = channelActivity.last_message.message_text;
      const channelUsername = channelActivity.username;

      // Find users who follow this channel AND have notifications enabled for it
      const { data: eligibleUsers, error: usersError } = await supabaseAdmin
        .from('user_channel_follow')
        .select(`
          user_id,
          channel_notification_preferences!inner(
            notifications_enabled
          )
        `)
        .eq('username', channelUsername)
        .eq('channel_notification_preferences.notifications_enabled', true);

      if (usersError) {
        console.error('Error fetching eligible users:', usersError);
        return NextResponse.json({ error: 'Failed to fetch eligible users' }, { status: 500 });
      }

      if (!eligibleUsers || eligibleUsers.length === 0) {
        return NextResponse.json({ 
          message: 'No users with notifications enabled for this channel',
          channelUsername
        });
      }

      console.log(`Sending notifications to ${eligibleUsers.length} users for channel @${channelUsername}`);

      // Send notifications to each eligible user
      const notificationResults = await Promise.all(
        eligibleUsers.map(async (user) => {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/push-notification`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                title,
                message,
                channelActivity,
                userId: user.user_id  // Send to specific user
              }),
            });
            
            const result = await response.json();
            return { 
              userId: user.user_id,
              success: result.success,
              sent: result.sent
            };
          } catch (error) {
            console.error(`Error sending notification to user ${user.user_id}:`, error);
            return { 
              userId: user.user_id,
              success: false,
              error: (error as Error).message
            };
          }
        })
      );

      return NextResponse.json({
        success: true,
        message: 'Webhook processed successfully',
        channel: channelUsername,
        eligibleUserCount: eligibleUsers.length,
        notificationResults
      });
    } catch (error: any) {
      console.error('Error processing webhook:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }
} 