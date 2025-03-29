import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with admin privileges
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function handleGuestUser(userId: string, followedUsernames: string[]) {
  try {
    // Get channel activity for guest user
    const { data: channelActivity, error: channelError } = await supabaseAdmin.rpc(
      'getchannelactivityguestuser',
      {
        p_usernames: followedUsernames
      }
    );

    if (channelError) {
      console.error('Error fetching guest channel activity:', channelError);
    }

    // Default structure that EXACTLY matches SQL function output structure
    const guestUserPreferences = channelActivity || {
      channels_messages: [],
      channels_activity: [],
      user_language: [],
      user_notifications: [],
      push_subscriptions: [],
      tenant_requests: [],
      user_location: [],
      user_channel_last_viewed: [],
      user_channel_follow: []
    };

    const response = {
      success: true,
      user: {
        id: userId,
        email: '',
        phone: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {},
      },
      userPreferences: guestUserPreferences,
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to process guest user request'
    }, { status: 500 });
  }
}

async function handleRegularUser(userId: string) {
  try {
    // Fetch user data from Supabase
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (userError) {
      return NextResponse.json({
        success: false,
        error: userError.message
      }, { status: 500 });
    }

    if (!userData || !userData.user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Get channel activity and other user data
    const { data, error } = await supabaseAdmin.rpc(
      'getchannelactivitysigneduser',
      {
        p_user_id: userId
      }
    );

    if (error) {
      console.error('Error fetching channel activity:', error);
    }

    // Default structure that EXACTLY matches SQL function output structure
    const fallbackData = {
      channels_messages: [],
      channels_activity: [],
      user_language: [],
      user_notifications: [],
      push_subscriptions: [],
      tenant_requests: [],
      user_location: [],
      user_channel_last_viewed: [],
      user_channel_follow: []
    };

    return NextResponse.json({
      success: true,
      user: {
        id: userData.user.id,
        email: userData.user.email,
        phone: userData.user.phone,
        created_at: userData.user.created_at,
        updated_at: userData.user.updated_at,
        last_sign_in_at: userData.user.last_sign_in_at,
        app_metadata: userData.user.app_metadata,
        user_metadata: userData.user.user_metadata,
      },
      userPreferences: data || fallbackData,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to process regular user request'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const isGuest = body.isGuest || false;
    const followedUsernames = body.followedUsernames || [];

    // Handle guest users
    if (isGuest) {
      return handleGuestUser(userId, followedUsernames);
    }

    return handleRegularUser(userId);
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
} 