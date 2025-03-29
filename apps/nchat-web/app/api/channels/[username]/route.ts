import { getChannelByUsername, getAllChannels, getPremiumDataByUsername } from '@/lib/constituency-utils';
import { NextResponse } from 'next/server';

// Define a more complete channel type
type EnhancedChannel = {
  username: string;
  stateName: string;
  assemblyName: string;
  role?: 'mp' | 'mla' | 'local';
  is_premium?: boolean;
  is_update_only?: boolean;
  is_public?: boolean;
  is_agent?: boolean;
  is_owner_db?: boolean;
  is_realtime?: boolean;
  related_channels?: any[];
  related_channels_count?: number;
  products?: any[];
  products_count?: number;
  owner_username?: string;
  onboardingConfig?: any;
  tenant_supabase_url?: string;
  tenant_supabase_anon_key?: string;
};

// Define a type for related channels
type RelatedChannel = {
  username: string;
  owner_username?: string;
  onboardingConfig?: any;
  is_premium?: boolean;
  is_update_only?: boolean;
  is_public?: boolean;
  is_agent?: boolean;
  is_owner_db?: boolean;
  is_realtime?: boolean;
  tenant_supabase_url?: string;
  tenant_supabase_anon_key?: string;
  [key: string]: any; // Allow for additional properties
};

export async function GET(
  request: Request, 
  { params }: any
) {
  try {
    const { username } = params;
    
    // Use local data source to find channel with enhanced premium data
    const channel = getChannelByUsername(username) as EnhancedChannel;

    if (!channel) {
      return NextResponse.json(
        { 
          error: 'Channel not found', 
          username 
        }, 
        { status: 404 }
      );
    }

    // Determine role based on username suffix if not already set
    const role = channel.role || 
                 (username.endsWith('_mp') ? 'mp' :
                 username.endsWith('_mla') ? 'mla' : 
                 'local');

    // Get premium data if available
    const premiumData = getPremiumDataByUsername(username);

    // Ensure related channels are consistently ordered
    const relatedChannels = channel.related_channels || premiumData.related_channels || [];
    
    // Ensure related channels use the owner's Supabase configuration
    const processedRelatedChannels = relatedChannels.map((relatedChannel: RelatedChannel) => {
      if (relatedChannel.owner_username) {
        // Get the owner's premium data
        const ownerPremiumData = getPremiumDataByUsername(relatedChannel.owner_username);
        
        // Apply owner's Supabase configuration to the related channel if available
        if (ownerPremiumData.tenant_supabase_url && ownerPremiumData.tenant_supabase_anon_key) {
          return {
            ...relatedChannel,
            tenant_supabase_url: ownerPremiumData.tenant_supabase_url,
            tenant_supabase_anon_key: ownerPremiumData.tenant_supabase_anon_key
          };
        }
        
        // If owner doesn't have Supabase config, try to get it from the main channel's premium data
        if (premiumData.tenant_supabase_url && premiumData.tenant_supabase_anon_key) {
          return {
            ...relatedChannel,
            tenant_supabase_url: premiumData.tenant_supabase_url,
            tenant_supabase_anon_key: premiumData.tenant_supabase_anon_key
          };
        }
      }
      return relatedChannel;
    });
    
    // Normalize the response with more comprehensive data in a consistent order
    return NextResponse.json({
      // Basic channel info
      username: channel.username,
      stateName: channel.stateName,
      assemblyName: channel.assemblyName,
      role: role,
      owner_username: channel.owner_username,
      
      // Premium status and properties
      is_premium: channel.is_premium || premiumData.is_premium || false,
      is_update_only: channel.is_update_only || premiumData.is_update_only || false,
      is_public: channel.is_public !== undefined ? channel.is_public : (premiumData.is_public !== undefined ? premiumData.is_public : true),
      is_agent: channel.is_agent || premiumData.is_agent || false,
      is_owner_db: channel.is_owner_db || premiumData.is_owner_db || false,
      is_realtime: channel.is_realtime || premiumData.is_realtime || false,
      
      // Tenant Supabase credentials for premium channels
      tenant_supabase_url: premiumData.tenant_supabase_url,
      tenant_supabase_anon_key: premiumData.tenant_supabase_anon_key,
      
      // Constituency info
      constituencyInfo: {
        state: channel.stateName,
        constituency: channel.assemblyName || 'Unknown',
        type: role === 'mp' ? 'Parliamentary' : 
              role === 'mla' ? 'Assembly' : 'Local'
      },
      
      // Related channels with owner's Supabase configuration
      related_channels: processedRelatedChannels,
      related_channels_count: processedRelatedChannels.length,
      
      // Products
      products: channel.products || premiumData.products || [],
      products_count: channel.products_count || premiumData.products?.length || 0,
      
      // Additional config
      onboardingConfig: channel.onboardingConfig || premiumData.onboardingConfig,
      
      // Custom properties
      custom_properties: {
        ...Object.entries(premiumData)
          .filter(([key]) => !['is_premium', 'is_update_only', 'is_public', 'is_agent', 'is_owner_db', 'is_realtime', 'related_channels', 'products', 'onboardingConfig', 'owner_username', 'tenant_supabase_url', 'tenant_supabase_anon_key'].includes(key))
          .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {})
      }
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to fetch channel',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

// Add an endpoint to get all channels
export async function HEAD() {
  try {
    const allChannels = getAllChannels();
    
    // Return just the count in headers
    return new NextResponse(null, {
      status: 200,
      headers: {
        'X-Total-Count': allChannels.length.toString()
      }
    });
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
} 