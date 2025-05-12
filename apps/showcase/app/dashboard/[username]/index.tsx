import { View, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Text } from '~/components/ui/text';
import CreateMessageScreen from '~/components/dashboard/create-message';
import { useAuth } from '~/lib/core/contexts/AuthContext';
import { PREMIUM_CONFIGS } from '~/lib/in-app-db/states/telangana/premium-data';
import * as React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { DashboardScreen } from '~/components/dashboard/dashboard-screen';

export default function DashboardRoute({ username }: { username: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [selectedChannel, setSelectedChannel] = React.useState(username);

  // Find the channel in all configs to get owner
  const findChannelOwner = () => {
    // First check if current channel is an owner channel
    const currentChannelConfig = PREMIUM_CONFIGS[username];
    if (currentChannelConfig) {
      return {
        ownerUsername: username,
        channel: { username, is_owner_db: true },
        config: currentChannelConfig
      };
    }

    // If not, search in related channels
    for (const [ownerUsername, config] of Object.entries(PREMIUM_CONFIGS)) {
      const channel = config?.related_channels?.find(ch => ch.username === selectedChannel);
      if (channel) {
        return {
          ownerUsername,
          channel,
          config
        };
      }
    }
    return null;
  };

  const channelInfo = findChannelOwner();
  const premiumConfig = channelInfo?.config || PREMIUM_CONFIGS[selectedChannel];
  const relatedChannels = premiumConfig?.related_channels || [];

  // Get owner channel data
  const ownerChannel = React.useMemo(() => {
    if (!channelInfo?.ownerUsername) return null;

    // Check if current channel is the owner
    const isCurrentChannelOwner = username === channelInfo.ownerUsername;
    
    return {
      username: channelInfo.ownerUsername,
      display_name: isCurrentChannelOwner ? 'Owner Channel (Current)' : 'Owner Channel',
      is_owner_db: true,
      is_current_owner: isCurrentChannelOwner
    };
  }, [channelInfo?.ownerUsername, username]);

  // Determine auth type
  const getAuthType = () => {
    if (!user) return 'guest';
    if (user.email) return 'email';
    if (user.id) return 'anonymous';
    return 'unknown';
  };

  // Handle channel navigation
  const handleChannelNavigation = React.useCallback((channel: any) => {
    console.log('[ChatTab] Channel Navigation:', {
      from: selectedChannel,
      to: channel.username,
      route: `/dashboard/${channel.username}`,
      isActive: channel.username === selectedChannel,
      channel
    });

    setSelectedChannel(channel.username);
    router.push({
      pathname: '/dashboard/[username]',
      params: { username: channel.username }
    });
  }, [selectedChannel, router]);

  const renderChannelItem = ({ item, index }: { item: any; index: number }) => {
    const isActive = item.username === selectedChannel;
    const isOwner = item.is_owner_db;
    const isCurrentOwner = item.is_current_owner;
    
    return (
      <TouchableOpacity
        key={item.id || index}
        className={`flex-row items-center p-3 rounded-lg my-1 ${
          isActive ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
        } ${isOwner ? 'border-l-4 border-blue-500' : ''} ${
          isCurrentOwner ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
        }`}
        onPress={() => handleChannelNavigation(item)}
      >
        <View className={`w-10 h-10 rounded-full justify-center items-center mr-3 ${
          isOwner ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700'
        }`}>
          <Text className={`text-base font-semibold ${
            isOwner ? 'text-blue-600 dark:text-blue-400' : 'text-blue-500'
          }`}>
            {item.username?.[0]?.toUpperCase() || '#'}
          </Text>
        </View>
        <View className="flex-1">
          <Text 
            className={`text-sm font-medium ${
              isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
            }`}
            numberOfLines={1}
          >
            {item.username || 'Unknown'}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
            {item.display_name || item.username}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Update selected channel when URL params change
  React.useEffect(() => {
    if (params.username && params.username !== selectedChannel) {
      setSelectedChannel(params.username as string);
    }
  }, [params.username]);

  React.useEffect(() => {
    // Log related channels details
    console.log('[ChatTab] Related Channels:', {
      currentChannel: selectedChannel,
      ownerChannel: channelInfo?.ownerUsername,
      isCurrentChannelOwner: username === channelInfo?.ownerUsername,
      relatedChannels: premiumConfig?.related_channels?.map(ch => ({
        username: ch.username,
        is_owner_db: ch.is_owner_db,
        is_public: ch.is_public,
        is_premium: ch.is_premium,
        display_name: ch.display_name
      })) || [],
      totalRelatedChannels: premiumConfig?.related_channels?.length || 0
    });

    // Log general channel and user info
    console.log('[ChatTab] Channel Info:', {
      username: selectedChannel,
      clientType: premiumConfig?.client_type || 'public',
      relatedChannelsCount: premiumConfig?.related_channels?.length || 0,
      currentUser: {
        id: user?.id,
        email: user?.email,
        authType: getAuthType()
      },
      channelInfo: channelInfo ? {
        ownerUsername: channelInfo.ownerUsername,
        isOwnerChannel: channelInfo.channel.is_owner_db,
        isPublic: channelInfo.channel.is_public,
        isPremium: channelInfo.channel.is_premium
      } : null
    });

    // Log routing information
    console.log('[ChatTab] Routing State:', {
      currentPath: `/dashboard/${selectedChannel}`,
      isDesktop,
      windowWidth: width,
      params
    });
  }, [selectedChannel, premiumConfig, user, channelInfo, width, isDesktop, params, username]);

  // Combine owner channel with related channels
  const allChannels = React.useMemo(() => {
    const channels = [...relatedChannels];
    if (ownerChannel) {
      channels.unshift(ownerChannel);
    }
    return channels;
  }, [relatedChannels, ownerChannel]);

  return (
    <View className="flex-1 flex-row">
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="flex-1">
          <DashboardScreen username={selectedChannel as string} tabname={'overview'} />
        </View>
      </View>
    </View>
  );
} 