// Import premium data
import { indiaData } from "@/app/api/in-app-db/states";
import { PREMIUM_CONFIGS } from "@/app/api/in-app-db/states/telangana/premium-data";

// Define types for related channels and premium configs
type RelatedChannel = {
  username: string;
  owner_username?: string;
  onboardingConfig?: any;
  is_premium?: boolean;
  is_update_only?: boolean;
  is_public?: boolean;
  is_agent?: boolean;
  is_direct?: boolean;
  is_owner_db?: boolean;
  is_realtime?: boolean;
  tenant_supabase_url?: string;
  tenant_supabase_anon_key?: string;
};

// Create a map of related channels to their parent channels
const relatedChannelMap = new Map<string, string>();

// Populate the related channel map
Object.entries(PREMIUM_CONFIGS).forEach(([parentUsername, config]) => {
  if (config.related_channels && Array.isArray(config.related_channels)) {
    config.related_channels.forEach((relatedChannel: any) => {
      if (relatedChannel.username) {
        relatedChannelMap.set(relatedChannel.username, parentUsername);
      }
    });
  }
});

export function getAllChannels() {
  const allChannels: Array<{
    username: string;
    stateName: string;
    assemblyName: string;
    role?: 'mp' | 'mla' | 'local';
    is_premium?: boolean;
    related_channels_count?: number;
    products_count?: number;
    owner_username?: string;
    is_realtime: boolean;
  }> = [];

  // First collect all channels from constituency data
  Object.entries(indiaData).forEach(([stateName, stateData]) => {
    const collectChannels = (node: any, currentAssemblyName = '') => {
      // Collect direct members of the node
      if (node.members) {
        node.members.forEach((member: any) => {
          // Determine role based on username suffix
          const role = member.username.endsWith('_mp') ? 'mp' :
                       member.username.endsWith('_mla') ? 'mla' : 
                       'local';

          allChannels.push({
            username: member.username,
            stateName,
            is_realtime: member.is_realtime || false,
            assemblyName: currentAssemblyName,
            role
          });
        });
      }

      // Recursively collect members from child nodes
      Object.entries(node)
        .filter(([key]) => key !== 'members' && typeof node[key] === 'object')
        .forEach(([key, childNode]) => {
          collectChannels(childNode, key);
        });
    };

    collectChannels(stateData);
  });

  // Now enhance channels with premium data
  const enhancedChannels = allChannels.map(channel => {
    // Check if this channel has premium data
    if (channel.username in PREMIUM_CONFIGS) {
      const premiumData = PREMIUM_CONFIGS[channel.username];
      return {
        ...channel,
        is_premium: premiumData.is_premium || false,
        related_channels_count: premiumData.related_channels ? premiumData.related_channels.length : 0,
        products_count: premiumData.products ? premiumData.products.length : 0
      };
    }
    return channel;
  });

  // Also add any premium users that might not be in the constituency data
  Object.keys(PREMIUM_CONFIGS).forEach(username => {
    // Check if this premium user is already in our list
    const existingChannel = enhancedChannels.find(channel => channel.username === username);
    if (!existingChannel) {
      // Add this premium user to the list
      enhancedChannels.push({
        username,
        stateName: 'Unknown', // Default values
        assemblyName: 'Unknown',
        role: 'local',
        is_realtime: PREMIUM_CONFIGS[username].is_realtime || false,
        is_premium: PREMIUM_CONFIGS[username].is_premium || false,
        related_channels_count: PREMIUM_CONFIGS[username].related_channels ? PREMIUM_CONFIGS[username].related_channels.length : 0,
        products_count: PREMIUM_CONFIGS[username].products ? PREMIUM_CONFIGS[username].products.length : 0
      });
    }
  });

  // Add all related channels that might not be in the constituency data
  Object.entries(PREMIUM_CONFIGS).forEach(([username, config]) => {
    if (config.related_channels && Array.isArray(config.related_channels)) {
      config.related_channels.forEach((relatedChannel: any) => {
        if (relatedChannel.username) {
          // Check if this related channel is already in our list
          const existingChannel = enhancedChannels.find(channel => channel.username === relatedChannel.username);
          if (!existingChannel) {
            // Add this related channel to the list
            enhancedChannels.push({
              username: relatedChannel.username,
              stateName: 'Unknown', // Default values
              assemblyName: 'Unknown',
              role: 'local',
              is_realtime: relatedChannel.is_realtime || false,
              owner_username: username
            });
          }
        }
      });
    }
  });

  return enhancedChannels;
}

export function getChannelByUsername(username: string) {
  const allChannels = getAllChannels();
  const channel = allChannels.find(channel => channel.username === username);
  
  if (!channel) return null;
  
  // Check if this is a premium channel
  if (username in PREMIUM_CONFIGS) {
    const premiumData = PREMIUM_CONFIGS[username];
    
    // Ensure related channels are sorted by username for consistent order
    const sortedRelatedChannels = premiumData.related_channels ? 
      [...premiumData.related_channels].sort((a: RelatedChannel, b: RelatedChannel) => a.username.localeCompare(b.username)) : 
      [];
    
    // Add premium flag to related channels if they are premium
    const enhancedRelatedChannels = sortedRelatedChannels.map((relatedChannel: RelatedChannel) => {
      // Check if this related channel is premium
      const isPremium = relatedChannel.is_premium === true || 
                       (relatedChannel.username in PREMIUM_CONFIGS && 
                        PREMIUM_CONFIGS[relatedChannel.username].is_premium === true);
      
      // Ensure all related channel properties are included
      return {
        ...relatedChannel,
        is_premium: isPremium,
        is_update_only: relatedChannel.is_update_only || false,
        is_public: relatedChannel.is_public || false,
        is_agent: relatedChannel.is_agent || false,
        is_direct: relatedChannel.is_direct || false,
        is_owner_db: relatedChannel.is_owner_db || false,
        is_realtime: relatedChannel.is_realtime || false,
        tenant_supabase_url: relatedChannel.tenant_supabase_url || premiumData.tenant_supabase_url,
        tenant_supabase_anon_key: relatedChannel.tenant_supabase_anon_key || premiumData.tenant_supabase_anon_key
      };
    });
    
    return {
      ...channel,
      is_premium: premiumData.is_premium || false,
      is_update_only: premiumData.is_update_only || false,
      is_public: premiumData.is_public || false,
      is_agent: premiumData.is_agent || false,
      is_direct: premiumData.is_direct || false,
      
      is_owner_db: premiumData.is_owner_db || false,
      related_channels: enhancedRelatedChannels,
      related_channels_count: enhancedRelatedChannels.length,
      products: premiumData.products || [],
      products_count: premiumData.products ? premiumData.products.length : 0,
      tenant_supabase_url: premiumData.tenant_supabase_url,
      tenant_supabase_anon_key: premiumData.tenant_supabase_anon_key,
      onboardingConfig: premiumData.onboardingConfig
    };
  }
  
  // Check if this is a related channel
  if (relatedChannelMap.has(username)) {
    const parentUsername = relatedChannelMap.get(username);
    const parentConfig = PREMIUM_CONFIGS[parentUsername!];
    
    // Find this channel in the parent's related channels
    const relatedChannelInfo = parentConfig.related_channels?.find(
      (rc: any) => rc.username === username
    );
    
    // Find other related channels from the same parent and sort them
    const siblingChannels = parentConfig.related_channels ? 
      parentConfig.related_channels
        .filter((rc: any) => rc.username !== username)
        .sort((a: any, b: any) => a.username.localeCompare(b.username)) : 
      [];
    
    // Add premium flag to sibling channels if they are premium
    const enhancedSiblingChannels = siblingChannels.map((siblingChannel: RelatedChannel) => {
      // Check if this sibling channel is premium
      const isPremium = siblingChannel.is_premium === true || 
                       (siblingChannel.username in PREMIUM_CONFIGS && 
                        PREMIUM_CONFIGS[siblingChannel.username].is_premium === true);
      
      // Ensure all related channel properties are included
      return {
        ...siblingChannel,
        is_premium: isPremium,
        is_update_only: siblingChannel.is_update_only || false,
        is_public: siblingChannel.is_public || false,
        is_agent: siblingChannel.is_agent || false,
        is_direct: siblingChannel.is_direct || false,
        is_owner_db: siblingChannel.is_owner_db || false,
        is_realtime: siblingChannel.is_realtime || false,
        tenant_supabase_url: siblingChannel.tenant_supabase_url || parentConfig.tenant_supabase_url,
        tenant_supabase_anon_key: siblingChannel.tenant_supabase_anon_key || parentConfig.tenant_supabase_anon_key
      };
    });
        
    // Check if this related channel itself is premium
    const isChannelPremium = relatedChannelInfo?.is_premium === true || 
                            (username in PREMIUM_CONFIGS && 
                             PREMIUM_CONFIGS[username].is_premium === true);
    
    return {
      ...channel,
      owner_username: parentUsername,
      is_premium: isChannelPremium,
      is_update_only: relatedChannelInfo?.is_update_only || false,
      is_public: relatedChannelInfo?.is_public || false,
      is_agent: relatedChannelInfo?.is_agent || false,
      is_direct: relatedChannelInfo?.is_direct || false,
      is_owner_db: relatedChannelInfo?.is_owner_db || false,
      related_channels: enhancedSiblingChannels,
      related_channels_count: enhancedSiblingChannels.length,
      onboardingConfig: relatedChannelInfo?.onboardingConfig,
      tenant_supabase_url: parentConfig.tenant_supabase_url,
      tenant_supabase_anon_key: parentConfig.tenant_supabase_anon_key
    };
  }
  
  // For regular channels, provide default values for all properties
  return {
    ...channel,
    is_premium: false,
    is_update_only: false,
    is_public: true, // Default to public for regular channels
    is_agent: false,
    is_direct: false,
    is_owner_db: false,
    related_channels: [],
    related_channels_count: 0,
    products: [],
    products_count: 0
  };
}

export function getCompleteConstituencyInfo(parliamentaryName: string) {
  // Recursive function to find and extract complete constituency info
  const findConstituencyInfo = (data: any, targetName: string): any | null => {
    // Check if this is the target parliamentary constituency
    if (parliamentaryName === targetName) {
      return data;
    }

    // Recursively search child nodes
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'object' && key !== 'members') {
        const result = findConstituencyInfo(value, targetName);
        if (result) return result;
      }
    }

    return null;
  };

  // Collect complete info for a constituency
  const collectCompleteInfo = (constituencyData: any, depth: number = 0): any => {
    if (!constituencyData) return null;

    const completeInfo: any = {
      name: constituencyData.name || 'Unknown',
      depth,
      members: constituencyData.members || []
    };

    // Recursively collect child constituencies
    const childConstituencies: any = {};
    Object.entries(constituencyData)
      .filter(([key]) => key !== 'members' && typeof constituencyData[key] === 'object')
      .forEach(([key, childNode]) => {
        const childInfo = collectCompleteInfo(childNode, depth + 1);
        if (childInfo) {
          childConstituencies[key] = childInfo;
        }
      });

    if (Object.keys(childConstituencies).length > 0) {
      completeInfo.childConstituencies = childConstituencies;
    }

    return completeInfo;
  };

  // Search through all states
  for (const [stateName, stateData] of Object.entries(indiaData)) {
    const constituencyInfo = findConstituencyInfo(stateData, parliamentaryName);
    
    if (constituencyInfo) {
      return {
        stateName,
        ...collectCompleteInfo(constituencyInfo)
      };
    }
  }

  return null;
}

/**
 * Get premium data for a channel if available
 */
export function getPremiumDataByUsername(username: string) {
  // Check if the username exists in premium configs
  if (username in PREMIUM_CONFIGS) {
    const premiumData = PREMIUM_CONFIGS[username];
    
    // Ensure related channels are sorted by username for consistent order
    const sortedRelatedChannels = premiumData.related_channels ? 
      [...premiumData.related_channels].sort((a: RelatedChannel, b: RelatedChannel) => a.username.localeCompare(b.username)) : 
      [];
    
    // Add premium flag to related channels if they are premium
    // Also ensure they have the owner's Supabase configuration
    const enhancedRelatedChannels = sortedRelatedChannels.map((relatedChannel: RelatedChannel) => {
      // Check if this related channel is premium
      const isPremium = relatedChannel.is_premium === true || 
                       (relatedChannel.username in PREMIUM_CONFIGS && 
                        PREMIUM_CONFIGS[relatedChannel.username].is_premium === true);
      
      // Ensure all related channel properties are included
      return {
        ...relatedChannel,
        is_premium: isPremium,
        is_update_only: relatedChannel.is_update_only || false,
        is_public: relatedChannel.is_public || false,
        is_agent: relatedChannel.is_agent || false,
        is_direct: relatedChannel.is_direct || false,
        is_owner_db: relatedChannel.is_owner_db || false,
        is_realtime: relatedChannel.is_realtime || false,
        tenant_supabase_url: relatedChannel.tenant_supabase_url || premiumData.tenant_supabase_url,
        tenant_supabase_anon_key: relatedChannel.tenant_supabase_anon_key || premiumData.tenant_supabase_anon_key
      };
    });
    
    return {
      ...premiumData,
      is_premium: premiumData.is_premium || false,
      is_update_only: premiumData.is_update_only || false,
      is_public: premiumData.is_public || false,
      is_agent: premiumData.is_agent || false,
      is_direct: premiumData.is_direct || false,
      is_owner_db: premiumData.is_owner_db || false,
      is_realtime: premiumData.is_realtime || false,
      related_channels: enhancedRelatedChannels,
      // Include tenant Supabase credentials for premium chat
      tenant_supabase_url: premiumData.tenant_supabase_url,
      tenant_supabase_anon_key: premiumData.tenant_supabase_anon_key,
      // Don't expose other sensitive keys in the API
      openai_api_key: undefined,
      onesignal_app_id: undefined,
      onesignal_api_key: undefined,
    };
  }
  
  // Check if this is a related channel
  if (relatedChannelMap.has(username)) {
    const parentUsername = relatedChannelMap.get(username);
    const parentConfig = PREMIUM_CONFIGS[parentUsername!];
    
    // Find this channel in the parent's related channels
    const relatedChannelInfo = parentConfig.related_channels?.find(
      (rc: any) => rc.username === username
    );
    
    // Find other related channels from the same parent and sort them
    const siblingChannels = parentConfig.related_channels ? 
      parentConfig.related_channels
        .filter((rc: any) => rc.username !== username)
        .sort((a: any, b: any) => a.username.localeCompare(b.username)) : 
      [];
    
    // Add premium flag to sibling channels if they are premium
    // Also ensure they have the parent's Supabase configuration
    const enhancedSiblingChannels = siblingChannels.map((siblingChannel: RelatedChannel) => {
      // Check if this sibling channel is premium
      const isPremium = siblingChannel.is_premium === true || 
                       (siblingChannel.username in PREMIUM_CONFIGS && 
                        PREMIUM_CONFIGS[siblingChannel.username].is_premium === true);
      
      // Ensure all related channel properties are included
      return {
        ...siblingChannel,
        is_premium: isPremium,
        is_update_only: siblingChannel.is_update_only || false,
        is_public: siblingChannel.is_public || false,
        is_agent: siblingChannel.is_agent || false,
        is_direct: siblingChannel.is_direct || false,
        is_owner_db: siblingChannel.is_owner_db || false,
        is_realtime: siblingChannel.is_realtime || false,
        tenant_supabase_url: siblingChannel.tenant_supabase_url || parentConfig.tenant_supabase_url,
        tenant_supabase_anon_key: siblingChannel.tenant_supabase_anon_key || parentConfig.tenant_supabase_anon_key
      };
    });
    
    // Check if this related channel itself is premium
    const isChannelPremium = relatedChannelInfo?.is_premium === true || 
                            (username in PREMIUM_CONFIGS && 
                             PREMIUM_CONFIGS[username].is_premium === true);
    
    return {
      is_premium: isChannelPremium,
      is_update_only: relatedChannelInfo?.is_update_only || false,
      is_public: relatedChannelInfo?.is_public || false,
      is_direct: relatedChannelInfo?.is_direct || false,
      is_agent: relatedChannelInfo?.is_agent || false,
      is_owner_db: relatedChannelInfo?.is_owner_db || false,
      is_realtime: relatedChannelInfo?.is_realtime || false,
      owner_username: parentUsername,
      related_channels: enhancedSiblingChannels,
      onboardingConfig: relatedChannelInfo?.onboardingConfig,
      tenant_supabase_url: parentConfig.tenant_supabase_url,
      tenant_supabase_anon_key: parentConfig.tenant_supabase_anon_key,
      products: []
    };
  }
  
  // For regular channels, provide default values for all properties
  return {
    is_premium: false,
    is_update_only: false,
    is_public: true, // Default to public for regular channels
    is_agent: false,
    is_owner_db: false,
    is_realtime: false,
    related_channels: [],
    products: []
  };
} 