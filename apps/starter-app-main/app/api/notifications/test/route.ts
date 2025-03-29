import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

// Define subscription interface
interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Define database subscription interface
interface DbSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  device_type?: string;
  browser?: string;
  os?: string;
  platform?: string;
  device_id?: string;
  app_version?: string;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Define error interface
interface PushError {
  endpoint: string;
  error: string;
  statusCode?: number;
}

// Initialize Supabase client with admin privileges
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Initialize web-push with VAPID keys
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:test@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

/**
 * Test Notification API Endpoint
 * 
 * POST: Sends a test notification to a user's registered push subscriptions
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { userId, message, testId } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID is required' 
      }, { status: 400 });
    }

    // Log with more detailed information
    console.log('[TEST-NOTIFICATION] Starting notification test', {
      userId: userId.slice(0, 8) + '...',
      testId,
      timestamp: new Date().toISOString(),
      vapidKeys: {
        public: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ? 'Set' : 'Missing',
        private: process.env.VAPID_PRIVATE_KEY ? 'Set' : 'Missing',
        subject: process.env.VAPID_SUBJECT || 'Default: mailto:test@example.com'
      },
      supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        serviceRole: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing'
      }
    });

    // Get user's push subscriptions from the database
    // Don't filter by notifications_enabled initially, let's see all subscriptions
    const { data: allSubscriptions, error: fetchError } = await supabaseAdmin
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (fetchError) {
      console.error('[TEST-NOTIFICATION] Error fetching subscriptions:', fetchError);
      return NextResponse.json({ 
        success: false, 
        error: fetchError.message,
        message: 'Failed to fetch subscriptions' 
      }, { status: 500 });
    }

    // Log all subscriptions for debugging
    console.log(`[TEST-NOTIFICATION] Found ${allSubscriptions?.length || 0} total subscriptions for user ${userId.slice(0, 8)}...`);
    
    if (allSubscriptions && allSubscriptions.length > 0) {
      console.log('[TEST-NOTIFICATION] Sample subscription:', {
        endpoint: allSubscriptions[0].endpoint.slice(0, 30) + '...',
        hasKeys: !!allSubscriptions[0].keys,
        columns: Object.keys(allSubscriptions[0])
      });
    }

    // Filter for enabled subscriptions if the column exists
    let activeSubscriptions = allSubscriptions;
    if (allSubscriptions && allSubscriptions.length > 0 && 'notifications_enabled' in allSubscriptions[0]) {
      activeSubscriptions = allSubscriptions.filter(sub => sub.notifications_enabled === true);
      console.log(`[TEST-NOTIFICATION] Filtered to ${activeSubscriptions.length} active subscriptions`);
    }

    // Check if user has any subscriptions
    if (!activeSubscriptions || activeSubscriptions.length === 0) {
      console.log(`[TEST-NOTIFICATION] No active subscriptions found for user ${userId.slice(0, 8)}...`);
      return NextResponse.json({ 
        success: false, 
        message: 'No active subscriptions found for this user',
        subscriptionCount: allSubscriptions ? allSubscriptions.length : 0,
        activeCount: 0,
        allSubscriptions: allSubscriptions ? allSubscriptions.map(s => ({ 
          endpoint: s.endpoint.slice(0, 20) + '...',
          notifications_enabled: s.notifications_enabled,
          created_at: s.created_at
        })) : []
      }, { status: 404 });
    }

    // Track successful deliveries
    let successCount = 0;
    let errorCount = 0;
    const errors: PushError[] = [];

    // Prepare notification payload with simpler structure
    const notificationPayload = JSON.stringify({
      title: 'Test Notification',
      body: message || `Test notification sent at ${new Date().toLocaleTimeString()}`,
      icon: '/icons/icon-192x192.png',
      data: {
        url: '/testpage',
        userId,
        testId,
        timestamp: new Date().toISOString(),
        source: 'test-api'
      },
      actions: [
        {
          action: 'viewTest',
          title: 'View Test Page'
        }
      ]
    });

    console.log('[TEST-NOTIFICATION] Prepared payload:', notificationPayload);

    // Send the notification to each subscription
    const deliveryPromises = (activeSubscriptions as DbSubscription[]).map(async (subscription) => {
      try {
        // Extract the push subscription details
        const pushSubscription: webpush.PushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth
          }
        };

        console.log(`[TEST-NOTIFICATION] Sending to subscription ${subscription.endpoint.slice(-8)}...`);
        
        // Send the notification
        const pushResult = await webpush.sendNotification(
          pushSubscription,
          notificationPayload,
          {
            TTL: 60 * 60 // 1 hour in seconds
          }
        );
        
        successCount++;
        console.log(`[TEST-NOTIFICATION] Successfully sent to subscription ${subscription.endpoint.slice(-8)}`, {
          statusCode: pushResult.statusCode,
          headers: pushResult.headers ? 'Present' : 'None'
        });
        return { success: true, endpoint: subscription.endpoint };
      } catch (error: any) {
        errorCount++;
        console.error(`[TEST-NOTIFICATION] Error sending to subscription ${subscription.endpoint.slice(-8)}:`, {
          message: error.message,
          statusCode: error.statusCode,
          stack: error.stack
        });
        
        // Check if subscription is expired or invalid
        if (error.statusCode === 404 || error.statusCode === 410) {
          // Mark subscription as inactive if possible
          try {
            if ('notifications_enabled' in subscription) {
              await supabaseAdmin
                .from('push_subscriptions')
                .update({ notifications_enabled: false, updated_at: new Date().toISOString() })
                .eq('endpoint', subscription.endpoint);
                
              console.log(`[TEST-NOTIFICATION] Marked subscription ${subscription.endpoint.slice(-8)} as inactive`);
            } else {
              // If notifications_enabled column doesn't exist, remove the subscription
              // Use type assertion to fix TypeScript error
              const typedSubscription = subscription as { endpoint: string };
              await supabaseAdmin
                .from('push_subscriptions')
                .delete()
                .eq('endpoint', typedSubscription.endpoint);
                
              console.log(`[TEST-NOTIFICATION] Removed invalid subscription ${typedSubscription.endpoint.slice(-8)}`);
            }
          } catch (updateError) {
            console.error(`[TEST-NOTIFICATION] Error updating subscription:`, updateError);
          }
        }
        
        errors.push({
          endpoint: subscription.endpoint,
          error: error.message,
          statusCode: error.statusCode
        });
        
        return { success: false, endpoint: subscription.endpoint, error: error.message };
      }
    });

    // Wait for all notifications to be sent
    const results = await Promise.all(deliveryPromises);
    
    // Return the results
    return NextResponse.json({
      success: successCount > 0,
      message: `Sent ${successCount} notifications, ${errorCount} failures`,
      totalSubscriptions: activeSubscriptions.length,
      successCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined,
      testId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('[TEST-NOTIFICATION] Error in notification test API:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
} 