import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Helper function to extract user ID from various sources
async function getUserId(request: NextRequest): Promise<string | null> {
  try {
    // Method 0: Check URL parameters first
    const url = new URL(request.url);
    const urlUserId = url.searchParams.get('userId');
    if (urlUserId) {
      console.log('follow API - Found userId in URL parameters:', urlUserId);
      return urlUserId;
    }
    
    // Method 1: Check Authorization header (Bearer token)
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      console.log('follow API - Found Bearer token in Authorization header');
      
      // Create Supabase client
      const supabaseClient = createRouteHandlerClient({ cookies });
      
      // Verify the token and get user
      const { data, error } = await supabaseClient.auth.getUser(token);
      if (!error && data.user) {
        console.log('follow API - Valid token, user ID:', data.user.id);
        return data.user.id;
      }
      
      console.log('follow API - Invalid token or error:', error);
    }
    
    // Method 2: Check session cookie (fallback)
    const supabaseClient = createRouteHandlerClient({ cookies });
    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
    
    if (sessionError) {
      console.error('follow API - Error getting session:', sessionError);
      return null;
    }
    
    if (session) {
      console.log('follow API - Found user ID in session:', session.user.id);
      return session.user.id;
    }
    
    console.log('follow API - No valid authentication method found');
    return null;
  } catch (error) {
    console.error('follow API - Error in getUserId:', error);
    return null;
  }
}

// GET: Fetch followed channels for the current user
export async function GET(request: NextRequest) {
  try {
    console.log('follow API - GET request received');
    
    // Get user ID from request
    const userId = await getUserId(request);
    
    // Check if we have a valid user ID
    if (!userId) {
      console.log('follow API - No valid user ID found, returning 401');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('follow API - User authenticated:', userId);
    
    // Create a Supabase client
    const supabaseClient = createRouteHandlerClient({ cookies });
    
    // Get user's followed channels
    const { data, error } = await supabaseClient
      .from('user_channel_follow')
      .select('username')
      .eq('user_id', userId);
    
    if (error) {
      console.error('follow API - Error fetching followed channels:', error);
      return NextResponse.json(
        { error: 'Failed to fetch followed channels' },
        { status: 500 }
      );
    }
    
    console.log('follow API - Found', data?.length || 0, 'followed channels');
    
    // Return just the usernames as an array
    return NextResponse.json(data.map(item => item.username));
  } catch (error) {
    console.error('follow API - Error in GET route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Follow a channel
export async function POST(request: NextRequest) {
  try {
    console.log('follow API - POST request received');
    
    // Get the URL parameters first
    const url = new URL(request.url);
    const urlUsername = url.searchParams.get('username');
    const urlUserId = url.searchParams.get('userId');
    console.log('follow API - URL parameters:', Object.fromEntries(url.searchParams.entries()));
    
    // Create a Supabase client
    const supabaseClient = createRouteHandlerClient({ cookies });
    
    // Get the request body
    let body = {};
    try {
      // Try to parse the request body, but handle empty bodies gracefully
      const text = await request.text();
      if (text) {
        body = JSON.parse(text);
      }
      console.log('follow API - Request body:', body);
    } catch (parseError) {
      console.error('follow API - Error parsing request body:', parseError);
      // Continue with empty body
      body = {};
    }
    
    // Extract username from body or URL
    const { username: bodyUsername, userId: bodyUserId } = body as any;
    
    // Priority 1: Use username from URL params if provided
    let usernameToUse = urlUsername || bodyUsername;
    
    if (!usernameToUse) {
      console.log('follow API - No username provided');
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }
    
    // Priority 1: Use userId from URL params if provided
    let userIdToUse = urlUserId || bodyUserId;
    
    // Priority 2: If no userId in URL or body, try to get from auth methods
    if (!userIdToUse) {
      userIdToUse = await getUserId(request);
    }
    
    // Check if we have a valid user ID
    if (!userIdToUse) {
      console.log('follow API - No valid user ID found, returning 401');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('follow API - Using userId:', userIdToUse);
    console.log('follow API - Following channel:', usernameToUse);
    
    // Insert the follow relationship directly
    const { error } = await supabaseClient
      .from('user_channel_follow')
      .upsert({
        user_id: userIdToUse,
        username: usernameToUse
      }, {
        onConflict: 'user_id,username'
      });
    
    if (error) {
      console.error('follow API - Error following channel:', error);
      return NextResponse.json(
        { error: 'Failed to follow channel' },
        { status: 500 }
      );
    }
    
    console.log('follow API - Successfully followed channel');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('follow API - Error in POST route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Unfollow a channel
export async function DELETE(request: NextRequest) {
  try {
    console.log('follow API - DELETE request received');
    
    // Create a Supabase client
    const supabaseClient = createRouteHandlerClient({ cookies });
    
    // Get the username from the URL parameters
    const url = new URL(request.url);
    const username = url.searchParams.get('username');
    const urlUserId = url.searchParams.get('userId');
    console.log('follow API - URL parameters:', Object.fromEntries(url.searchParams.entries()));
    
    if (!username) {
      console.log('follow API - No username provided');
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }
    
    // Priority 1: Use userId from URL params if provided
    let userIdToUse = urlUserId;
    
    // Priority 2: If no userId in URL, try to get from auth methods
    if (!userIdToUse) {
      userIdToUse = await getUserId(request);
    }
    
    // Check if we have a valid user ID
    if (!userIdToUse) {
      console.log('follow API - No valid user ID found, returning 401');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('follow API - Using userId:', userIdToUse);
    console.log('follow API - Unfollowing channel:', username);
    
    // Delete the follow relationship directly
    const { error } = await supabaseClient
      .from('user_channel_follow')
      .delete()
      .eq('user_id', userIdToUse)
      .eq('username', username);
    
    if (error) {
      console.error('follow API - Error unfollowing channel:', error);
      return NextResponse.json(
        { error: 'Failed to unfollow channel' },
        { status: 500 }
      );
    }
    
    console.log('follow API - Successfully unfollowed channel');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('follow API - Error in DELETE route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 