import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getChannelByUsername } from '@/lib/constituency-utils';

// Define a type for the channel
type Channel = {
  username: string;
  tenant_supabase_url?: string;
  tenant_supabase_anon_key?: string;
  is_owner_db?: boolean;
};

export async function POST(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    const requestData = await request.json();
    
    // Get the user_id and username from the request body
    const { user_id, config } = requestData;
    
    if (!user_id || !username) {
      return NextResponse.json({ 
        error: 'Both user_id and username are required' 
      }, { status: 400 });
    }
    
    // Get channel details
    const channel = getChannelByUsername(username) as Channel;
    
    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }
    
    // Determine which Supabase credentials to use
    const useChannelCredentials = channel.is_owner_db && 
                                 channel.tenant_supabase_url && 
                                 channel.tenant_supabase_anon_key;
    
    // If the channel doesn't have its own database, return an error
    if (!useChannelCredentials) {
      return NextResponse.json({ error: 'Channel does not support access requests' }, { status: 400 });
    }
    
    const supabaseUrl = channel.tenant_supabase_url || '';
    const supabaseKey = channel.tenant_supabase_anon_key || '';
    
    const supabaseClient = createClient(supabaseUrl, supabaseKey);
    
    // Call the RPC function to request tenant channel access
    const { data, error } = await supabaseClient.rpc(
      'request_tenant_channel_access',
      {
        userid: user_id,
        channel_username: username,
        config: config || {
          channel: username,
          user: username,
          user_id: user_id,
          timestamp: new Date().toISOString(),
          onboarding_completed: true
        }
      }
    );
    
    if (error) {
      console.error('Error requesting access:', error);
      return NextResponse.json({ error: 'Failed to request access' }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in request access API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 