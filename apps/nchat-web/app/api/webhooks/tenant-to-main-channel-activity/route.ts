import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Interface for channel activity
interface ChannelActivity {
  username: string;
  last_updated_at?: string;
  last_message?: {
    id: string;
    message_text: string;
    created_at: string;
    [key: string]: any;
  };
  message_count: number;
  // Direct message fields
  id?: string;
  created_at?: string;
  updated_at?: string;
  message_text?: string;
  translations?: any;
  is_translated?: boolean;
}

// Test endpoint to check Supabase connection
export async function GET(request: NextRequest) {
  try {
    // Try to query the channels_activity table
    const { data, error } = await supabaseAdmin
      .from('channels_activity')
      .select('*')
      .limit(1);
      
    if (error) {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to connect to Supabase', 
        error 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Successfully connected to Supabase', 
      data 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      message: 'Error testing Supabase connection', 
      error: error.message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, table, record } = body;

    // Only process events from channels_activity table
    if (table !== 'channels_activity') {
      return NextResponse.json({ message: 'Ignored event for different table' });
    }

    // Only process INSERT or UPDATE events
    if (type !== 'INSERT' && type !== 'UPDATE') {
      return NextResponse.json({ message: 'Ignored non-insert/update event' });
    }

    const channelActivity = record as ChannelActivity;

    const { data: updatedActivity, error: updateError } = await supabaseAdmin
      .from('channels_activity')
      .upsert({
        ...channelActivity,
        last_updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ 
        error: 'Failed to update channels_activity', 
        details: updateError 
      }, { status: 500 });
    }
    return NextResponse.json({
      success: true,
      message: 'Channel activity updated successfully',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 