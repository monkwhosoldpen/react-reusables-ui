import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with admin privileges
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * User Notification API Endpoint
 * 
 * GET: Retrieves the user's notification preference
 * POST: Updates the user's notification preference
 */

export async function GET(request: NextRequest) {
  try {
    // Get user ID from query parameter
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID is required' 
      }, { status: 400 });
    }

    // Fetch notification preference from the database
    const { data, error } = await supabaseAdmin
      .from('user_notifications')
      .select('notifications_enabled')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // Not found error
      console.error('[DEBUG] Error fetching notification preference:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }

    // Return the notification preference or default to true
    return NextResponse.json({
      success: true,
      notifications_enabled: data?.notifications_enabled !== false // Default to true if not set
    });
  } catch (error: any) {
    console.error('[DEBUG] Error in notification API:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { userId, notifications_enabled } = body;

    if (!userId || notifications_enabled === undefined) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID and notifications_enabled are required' 
      }, { status: 400 });
    }

    // Validate notifications_enabled is a boolean
    if (typeof notifications_enabled !== 'boolean') {
      return NextResponse.json({ 
        success: false, 
        error: 'notifications_enabled must be a boolean' 
      }, { status: 400 });
    }

    // Upsert notification preference in the database
    const { error } = await supabaseAdmin
      .from('user_notifications')
      .upsert({ 
        user_id: userId, 
        notifications_enabled 
      })
      .select();

    if (error) {
      console.error('[DEBUG] Error updating notification preference:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }

    // Return success
    return NextResponse.json({
      success: true,
      notifications_enabled
    });
  } catch (error: any) {
    console.error('[DEBUG] Error in notification API:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 