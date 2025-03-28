import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

/**
 * Push Notifications API
 * 
 * This endpoint sends push notifications to all subscribed users or a specific user.
 * It requires a title and message in the request body.
 * 
 * POST: Sends push notifications
 */

// Initialize Supabase client with admin privileges
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Configure web-push with VAPID keys
try {
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL || 'example@example.com'}`,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
    process.env.VAPID_PRIVATE_KEY || ''
  );
  console.log('[DEBUG] VAPID keys configured successfully for push notifications');
} catch (error) {
  console.error('[DEBUG] Error configuring VAPID keys for push notifications:', error);
}

export async function POST(request: NextRequest) {
  try {
    console.log('[DEBUG] Push notification request received');
    
    // Extract notification data from request body
    const body = await request.json();
    const { title, message, userId, channelActivity } = body;

    if (!title || !message) {
      console.log('[DEBUG] Missing required fields in push notification request');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Query to get subscriptions
    let query = supabaseAdmin.from('push_subscriptions').select('*');
    
    // If userId is provided, only send to that user
    if (userId) {
      console.log(`[DEBUG] Filtering push notifications for user: ${userId.slice(0, 8)}`);
      query = query.eq('user_id', userId);
    } else {
      console.log('[DEBUG] Sending push notifications to all subscribed users');
    }

    const { data: subscriptions, error } = await query;

    if (error) {
      console.error('[DEBUG] Error fetching subscriptions:', error);
      throw error;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('[DEBUG] No subscriptions found for push notifications');
      return NextResponse.json({ error: 'No subscriptions found' }, { status: 404 });
    }

    console.log(`[DEBUG] Found ${subscriptions.length} subscriptions for push notifications`);

    // Send push notifications to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          let parsedKeys;
          try {
            parsedKeys = JSON.parse(sub.keys);
          } catch (parseError) {
            console.error(`[DEBUG] Error parsing keys for subscription:`, parseError);
            return { 
              success: false, 
              error: 'Invalid subscription keys format',
              subscription: sub.endpoint 
            };
          }
          
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: parsedKeys
          };

          const payload = JSON.stringify({
            title,
            message,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-192x192.png',
            data: {
              url: '/',
              channelActivity,
              timestamp: new Date().toISOString(),
              type: 'general-notification'
            }
          });

          console.log(`[DEBUG] Sending push notification to endpoint: ${sub.endpoint.substring(0, 30)}...`);
          await webpush.sendNotification(pushSubscription, payload);
          console.log(`[DEBUG] Successfully sent push notification to endpoint: ${sub.endpoint.substring(0, 30)}...`);
          
          return { success: true, subscription: sub.endpoint };
        } catch (error: any) {
          console.error(`[DEBUG] Error sending push notification:`, error);
          
          // If subscription is expired or invalid, delete it
          if (error.statusCode === 404 || error.statusCode === 410) {
            console.log(`[DEBUG] Subscription expired or invalid, deleting: ${sub.endpoint.substring(0, 30)}...`);
            await supabaseAdmin
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', sub.endpoint);
          }
          
          return { 
            success: false, 
            error: error.message, 
            statusCode: error.statusCode,
            subscription: sub.endpoint 
          };
        }
      })
    );

    // Count successful and failed notifications
    const successful = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length;
    const failed = results.filter(r => r.status === 'rejected' || !(r.value as any).success).length;

    console.log('[DEBUG] Push notifications summary', {
      timestamp: new Date().toISOString(),
      totalSubscriptions: subscriptions.length,
      successfulNotifications: successful,
      failedNotifications: failed
    });

    return NextResponse.json({ 
      success: true, 
      sent: successful,
      failed: failed,
      total: subscriptions.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error sending push notifications:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 