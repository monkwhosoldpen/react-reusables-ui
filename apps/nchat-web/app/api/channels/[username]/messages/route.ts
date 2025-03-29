import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getChannelByUsername } from '@/lib/constituency-utils';
import crypto from 'crypto';

// Define a type for the channel
type Channel = {
  username: string;
  tenant_supabase_url?: string;
  tenant_supabase_anon_key?: string;
  is_owner_db?: boolean;
};

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    const { searchParams } = new URL(request.url);

    // Get query parameters
    const userId = searchParams.get('user_id') || '';
    const pageSize = parseInt(searchParams.get('page_size') || '20', 10);
    const lastMessageTimestamp = searchParams.get('last_message_timestamp') || null;

    // Get channel details
    const channel = getChannelByUsername(username) as Channel;

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    const is_owner_db = channel.is_owner_db;

    const DEMO_TENANT_SUPABASE_URL = 'https://risbemjewosmlvzntjkd.supabase.co'
    const DEMO_TENANT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpc2JlbWpld29zbWx2em50amtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxMzIxNDIsImV4cCI6MjA1NTcwODE0Mn0._5wXtDjCr9ZnYatWD7RO5DNhx_YxUjqCcdc6qhZpwGM'


    const NEXT_PUBLIC_SUPABASE_URL = 'https://ilzjdtlikhhavnfzfnvj.supabase.co'
    const NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsempkdGxpa2hoYXZuZnpmbnZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwODAzODksImV4cCI6MjA1NTY1NjM4OX0.dweaUpbV3YQvQK4VFCQYAeTSLW_FRVKeeLyZbJ8x5oQ'

    const supabaseUrl = is_owner_db ? DEMO_TENANT_SUPABASE_URL : NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = is_owner_db ? DEMO_TENANT_SUPABASE_ANON_KEY : NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Call the RPC function to get messages with access status
    const { data, error } = await supabaseClient.rpc(
      'get_channel_messages_with_access_status',
      {
        p_channel_username: username,
        p_user_id: userId,
        p_page_size: pageSize,
        p_last_message_timestamp: lastMessageTimestamp
      }
    );

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    // Add user_id to the response for client-side validation
    const responseData = {
      ...data,
      user_id: userId
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error in messages API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    const body = await request.json();
    const { message_text, user_id } = body;

    if (!message_text) {
      return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
    }

    // Get channel details
    const channel = getChannelByUsername(username) as Channel;

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    // Initialize Supabase client
    const supabaseUrl = 'https://risbemjewosmlvzntjkd.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpc2JlbWpld29zbWx2em50amtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxMzIxNDIsImV4cCI6MjA1NTcwODE0Mn0._5wXtDjCr9ZnYatWD7RO5DNhx_YxUjqCcdc6qhZpwGM';
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Create a new message
    const messageId = crypto.randomUUID();
    const now = new Date().toISOString();

    // Insert the message into channels_messages
    const { data: savedMessage, error: insertError } = await supabaseClient
      .from('channels_messages')
      .insert({
        id: messageId,
        username: username,
        message_text: message_text,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting message:', insertError);
      return NextResponse.json({ error: 'Failed to insert message' }, { status: 500 });
    }

    // Update the channels_activity table
    const { data: updatedActivity, error: updateError } = await supabaseClient
      .from('channels_activity')
      .upsert({
        username: username,
        last_updated_at: now,
        last_message: {
          id: messageId,
          message_text: message_text,
          created_at: now
        }
      })
      .select()
      .single();

    if (updateError) {
      console.error('Error updating channel activity:', updateError);
      // Continue even if updating activity fails
    }

    // Return the saved message
    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      data: savedMessage,
      activity: updateError ? null : updatedActivity
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 