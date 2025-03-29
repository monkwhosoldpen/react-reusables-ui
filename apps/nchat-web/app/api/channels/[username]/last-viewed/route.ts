import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with admin privileges
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    const { user_id } = await request.json();

    if (!username || !user_id) {
      return NextResponse.json(
        { success: false, error: 'Username and user_id are required' },
        { status: 400 }
      );
    }

    // Log the update request
    console.log(`Updating last viewed for channel: ${username}, user: ${user_id}`);

    // First, get the current message count for this channel
    const { data: messageCountData, error: countError } = await supabaseAdmin
      .from('channels_messages')
      .select('id', { count: 'exact', head: false })
      .eq('username', username);

    if (countError) {
      console.error('Error getting message count:', countError);
      return NextResponse.json(
        { success: false, error: countError.message },
        { status: 500 }
      );
    }

    // Get the count from the response
    const messageCount = messageCountData?.length || 0;

    // Update or insert the last viewed record with message count
    const { data, error } = await supabaseAdmin
      .from('user_channel_last_viewed')
      .upsert(
        {
          user_id,
          username,
          last_viewed: new Date().toISOString(),
          message_count: messageCount
        },
        { onConflict: 'user_id,username' }
      );

    if (error) {
      console.error('Error updating last viewed:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message_count: messageCount 
    });
  } catch (error) {
    console.error('Error in last-viewed API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 