import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

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
 * Simple Test Notification API Endpoint
 * 
 * POST: Sends a test notification to a user's registered push subscriptions
 * Use a minimal payload structure like the working elon-alerts implementation
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

    // Log the test request
    console.log('[SIMPLE-TEST] Starting notification test', {
      userId: userId.slice(0, 8) + '...',
      testId,
      timestamp: new Date().toISOString(),
    });

    // Get user's push subscriptions from the database
    const { data: subscriptions, error: fetchError } = await supabaseAdmin
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (fetchError) {
      console.error('[SIMPLE-TEST] Error fetching subscriptions:', fetchError);
      return NextResponse.json({ 
        success: false, 
        error: fetchError.message,
      }, { status: 500 });
    }

    // Check if user has any subscriptions
    if (!subscriptions || subscriptions.length === 0) {
      console.log(`[SIMPLE-TEST] No subscriptions found for user ${userId.slice(0, 8)}...`);
      return NextResponse.json({ 
        success: false, 
        message: 'No subscriptions found for this user'
      }, { status: 404 });
    }

    console.log(`[SIMPLE-TEST] Found ${subscriptions.length} subscriptions for user ${userId.slice(0, 8)}...`);

    // Track successful deliveries
    let successCount = 0;
    let errorCount = 0;

    // Create a simple notification title and message
    const title = `Test Notification ${new Date().toLocaleTimeString()}`;
    const notificationMessage = message || `This is a test notification sent at ${new Date().toLocaleTimeString()}`;
    
    // Prepare a very simple notification payload (using same structure as Elon alerts)
    const notificationPayload = JSON.stringify({
      title: title,
      body: notificationMessage,
      icon: '/icons/icon-192x192.png',
      data: {
        url: '/testpage',
        testId
      }
    });

    console.log('[SIMPLE-TEST] Sending with payload:', notificationPayload);

    // Send the notification to each subscription
    for (const subscription of subscriptions) {
      try {
        // Extract the push subscription details
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth
          }
        };

        console.log(`[SIMPLE-TEST] Sending to subscription ${subscription.endpoint.slice(-8)}...`);
        
        // Send the notification with simple structure
        await webpush.sendNotification(
          pushSubscription,
          notificationPayload,
          { TTL: 60 }
        );
        
        successCount++;
        console.log(`[SIMPLE-TEST] Successfully sent to subscription ${subscription.endpoint.slice(-8)}`);
      } catch (error: any) {
        errorCount++;
        console.error(`[SIMPLE-TEST] Error sending to subscription ${subscription.endpoint.slice(-8)}:`, error.message);
      }
    }
    
    // Return the results
    return NextResponse.json({
      success: successCount > 0,
      message: `Sent ${successCount} notifications, ${errorCount} failures`,
      totalSubscriptions: subscriptions.length,
      successCount,
      errorCount,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('[SIMPLE-TEST] Error in notification test API:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message
    }, { status: 500 });
  }
} 