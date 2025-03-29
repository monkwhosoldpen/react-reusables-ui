import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { goaData, telanganaData, indiaData } from '@/app/api/in-app-db/states';

// Define channel interface
interface Channel {
  username: string;
  stateName: string;
  assemblyName: string;
  role: 'mp' | 'mla' | 'local';
  is_premium: boolean;
  isFollowing?: boolean;
  // Add these fields to match what the frontend expects
  serialNumber?: number;
  type?: 'Parliamentary' | 'Assembly' | 'Local';
  owner_username?: string | null;
  related_channels_count?: number;
  products_count?: number;
  has_custom_properties?: boolean;
}

// Helper function to extract channels from state data
function extractChannelsFromState(stateData: any, stateName: string): Channel[] {
  const channels: Channel[] = [];
  let serialNumber = 1;
  
  // Process each region in the state
  for (const regionName in stateData) {
    const region = stateData[regionName];
    
    // Process region members (usually MPs)
    if (region.members && Array.isArray(region.members)) {
      for (const member of region.members) {
        channels.push({
          serialNumber: serialNumber++,
          username: member.username,
          stateName: stateName,
          assemblyName: regionName,
          role: member.role || 'mp',
          is_premium: member.is_premium || false,
          type: 'Parliamentary',
          owner_username: null,
          related_channels_count: 0,
          products_count: 0,
          has_custom_properties: false
        });
      }
    }
    
    // Process each constituency in the region
    for (const constituencyName in region) {
      if (constituencyName === 'members') continue; // Skip the members array we already processed
      
      const constituency = region[constituencyName];
      
      // Process each member in the constituency if it exists and has members
      if (constituency && constituency.members && Array.isArray(constituency.members)) {
        for (const member of constituency.members) {
          // Determine the role and type
          const role = member.username.includes('_mla') ? 'mla' : 
                      member.username.includes('_mp') ? 'mp' : 'local';
          const type = role === 'mp' ? 'Parliamentary' : 
                      role === 'mla' ? 'Assembly' : 'Local';
          
          channels.push({
            serialNumber: serialNumber++,
            username: member.username,
            stateName: stateName,
            assemblyName: constituencyName,
            role: role,
            is_premium: member.is_premium || false,
            type: type,
            owner_username: null,
            related_channels_count: Math.floor(Math.random() * 5), // Random number for demo
            products_count: Math.floor(Math.random() * 3), // Random number for demo
            has_custom_properties: false
          });
        }
      }
    }
  }
  
  return channels;
}

export async function GET() {
  try {
    console.log('channels API - Request received');
    
    // Initialize an array to store all channels
    let allChannels: Channel[] = [];
    
    // Extract channels from Telangana state
    const telanganaChannels = extractChannelsFromState(telanganaData, 'Telangana');
    console.log('channels API - Extracted channels from Telangana:', telanganaChannels.length);
    
    // Extract channels from Goa state
    const goaChannels = extractChannelsFromState(goaData, 'Goa');
    console.log('channels API - Extracted channels from Goa:', goaChannels.length);
    
    // Combine all channels
    allChannels = [...telanganaChannels, ...goaChannels];
    
    // If more states are added in the future, they can be added here
    
    console.log('channels API - Total channels extracted:', allChannels.length);
    
    // Get the current user's session to check for followed channels
    const supabaseClient = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    // If user is logged in, mark followed channels
    if (session) {
      console.log('channels API - User authenticated:', session.user.id);
      
      const { data: followData, error: followError } = await supabaseClient
        .from('user_channel_follow')
        .select('username')
        .eq('user_id', session.user.id);
      
      if (!followError && followData) {
        console.log('channels API - User follows', followData.length, 'channels');
        const followedUsernames = new Set(followData.map(f => f.username));
        
        // Mark channels as followed
        allChannels.forEach(channel => {
          channel.isFollowing = followedUsernames.has(channel.username);
        });
        
        const followedCount = allChannels.filter(c => c.isFollowing).length;
        console.log('channels API - Marked', followedCount, 'channels as followed');
      } else if (followError) {
        console.error('channels API - Error fetching followed channels:', followError);
      } else {
        console.log('channels API - User does not follow any channels');
      }
    } else {
      console.log('channels API - No user session found');
    }
    
    console.log('channels API - Returning', allChannels.length, 'channels');
    console.log('channels API - First channel sample:', allChannels.length > 0 ? JSON.stringify(allChannels[0]) : 'No channels');
    return NextResponse.json(allChannels);
  } catch (error) {
    console.error('channels API - Error fetching channels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch channels' },
      { status: 500 }
    );
  }
} 