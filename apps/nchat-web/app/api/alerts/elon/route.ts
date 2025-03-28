import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

/**
 * Elon Musk Alerts API
 * 
 * This endpoint sends push notifications only to users who follow Elon Musk.
 * It can be triggered manually or scheduled to run via a cron job.
 * 
 * GET: Sends the notification with default message
 * POST: Sends the notification with custom options
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
  console.log('[DEBUG] VAPID keys configured successfully for Elon alerts');
} catch (error) {
  console.error('[DEBUG] Error configuring VAPID keys for Elon alerts:', error);
}

// The username to filter followers by
const ELON_USERNAME = 'elonmusk';

// GET handler for simple triggering
export async function GET(request: NextRequest) {
  console.log('[DEBUG] Elon alert GET request received');
  return sendElonAlert();
}

// POST handler for more customization options
export async function POST(request: NextRequest) {
  try {
    console.log('[DEBUG] Elon alert POST request received');
    
    // Extract optional custom message from request body
    const body = await request.json();
    const { title, message } = body;
    
    return sendElonAlert(title, message);
  } catch (error) {
    console.error('[DEBUG] Error parsing Elon alert POST request:', error);
    // If parsing fails, use default message
    return sendElonAlert();
  }
}

// Helper function to check if a user follows Elon Musk
async function userFollowsElon(userId: string): Promise<boolean> {
  try {
    // Check if the user follows Elon Musk
    const { data, error } = await supabaseAdmin
      .from('user_channel_follow')
      .select('username')
      .eq('user_id', userId)
      .eq('username', ELON_USERNAME)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No match found - user doesn't follow Elon
        return false;
      }
      console.error(`[DEBUG] Error checking if user ${userId.slice(0, 8)} follows Elon:`, error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error(`[DEBUG] Exception checking if user ${userId.slice(0, 8)} follows Elon:`, error);
    return false;
  }
}

// Helper function to send the alert
async function sendElonAlert(
  customTitle?: string, 
  customMessage?: string
) {
  try {
    // Default notification content
    const title = customTitle || 'Elon Musk Alert';
    const baseMessage = customMessage || 'New update from Elon Musk!';
    
    console.log(`[DEBUG] Sending Elon Alert: "${title}" - Base message: "${baseMessage}"`);

    // Get all active push subscriptions
    const { data: subscriptions, error } = await supabaseAdmin
      .from('push_subscriptions')
      .select('*');

    if (error) {
      console.error('[DEBUG] Error fetching subscriptions for Elon alerts:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('[DEBUG] No subscriptions found for Elon alerts');
      return NextResponse.json({ 
        success: false, 
        message: 'No active subscriptions found' 
      }, { status: 404 });
    }

    console.log(`[DEBUG] Found ${subscriptions.length} total subscriptions, filtering for Elon followers`);
    
    // Send push notifications only to Elon followers
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          // Skip if no user ID
          if (!sub.user_id) {
            console.log(`[DEBUG] Skipping subscription without user ID: ${sub.endpoint.substring(0, 30)}...`);
            return { 
              success: false, 
              error: 'No user ID associated with subscription',
              subscription: sub.endpoint 
            };
          }
          
          // Check if user follows Elon Musk
          const followsElon = await userFollowsElon(sub.user_id);
          
          // Skip users who don't follow Elon
          if (!followsElon) {
            console.log(`[DEBUG] User ${sub.user_id.slice(0, 8)} doesn't follow Elon, skipping`);
            return {
              success: false,
              userId: sub.user_id,
              reason: 'User does not follow Elon Musk',
              subscription: sub.endpoint
            };
          }
          
          console.log(`[DEBUG] User ${sub.user_id.slice(0, 8)} follows Elon, sending notification`);
          
          let parsedKeys;
          try {
            parsedKeys = JSON.parse(sub.keys);
          } catch (parseError) {
            console.error(`[DEBUG] Error parsing keys for user ${sub.user_id.slice(0, 8)}:`, parseError);
            return { 
              success: false, 
              userId: sub.user_id,
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
            message: baseMessage,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-192x192.png',
            data: {
              url: '/elonmusk', // Direct link to Elon's profile
              type: 'elon-alert',
              timestamp: new Date().toISOString(),
              userId: sub.user_id
            }
          });

          console.log(`[DEBUG] Sending Elon notification to endpoint: ${sub.endpoint.substring(0, 30)}... for user: ${sub.user_id.slice(0, 8)}`);
          await webpush.sendNotification(pushSubscription, payload);
          console.log(`[DEBUG] Successfully sent Elon notification to user: ${sub.user_id.slice(0, 8)}`);
          
          return { 
            success: true, 
            userId: sub.user_id,
            subscription: sub.endpoint
          };
        } catch (error: any) {
          console.error(`[DEBUG] Error sending Elon notification to user ${sub.user_id ? sub.user_id.slice(0, 8) : 'unknown'}:`, error);
          
          // If subscription is expired or invalid, delete it
          if (error.statusCode === 404 || error.statusCode === 410) {
            console.log(`[DEBUG] Subscription expired or invalid, deleting: ${sub.endpoint.substring(0, 30)}...`);
            await supabaseAdmin
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', sub.endpoint);
            
            console.log(`[DEBUG] Deleted invalid subscription for user: ${sub.user_id}`);
          }
          
          return { 
            success: false, 
            userId: sub.user_id,
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
    const skipped = results.filter(r => r.status === 'fulfilled' && !(r.value as any).success && (r.value as any).reason === 'User does not follow Elon Musk').length;
    
    console.log('[DEBUG] Elon Alerts summary', {
      timestamp: new Date().toISOString(),
      totalSubscriptions: subscriptions.length,
      elonFollowers: successful + failed - skipped,
      successfulNotifications: successful,
      failedNotifications: failed - skipped,
      skippedNotifications: skipped
    });

    return NextResponse.json({ 
      success: true, 
      title,
      baseMessage,
      total: subscriptions.length,
      elonFollowers: successful + failed - skipped,
      sent: successful,
      failed: failed - skipped,
      skipped,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[DEBUG] Error in sendElonAlert:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 