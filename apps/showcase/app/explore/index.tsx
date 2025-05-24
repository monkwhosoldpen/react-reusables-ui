'use client';

import React, { useCallback, memo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Animated, SafeAreaView, ScrollView, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { toast } from 'sonner';
import { FollowButton } from '~/components/common/FollowButton';
import { useAuth } from '~/lib/core/contexts/AuthContext';
import { Channel } from '~/lib/core/types/channel.types';
import { config } from '~/lib/core/config';
import { CommonHeader } from '~/components/common/CommonHeader';
import { useInAppDB } from '~/lib/core/providers/InAppDBProvider';
import { Skeleton } from '~/components/ui/skeleton';

// Add URL constants for profile images
const SUPABASE_URL = 'https://ilzjdtlikhhavnfzfnvj.supabase.co';
const STORAGE_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/channels/assets/media/images`;
const IMAGE_SUFFIX = '_dp.png';

const ChannelGridSkeleton = memo(() => {
  const { width } = useWindowDimensions();
  const cardWidth = (width - 32) / 2 - 8;

  return (
    <View>
      <View className="px-4 py-3">
        <Skeleton className="h-4 w-32" />
      </View>
      <View className="flex-row flex-wrap justify-between px-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <View
            key={`skeleton-${i}`}
            style={{ width: cardWidth }}
            className="mb-4"
          >
            <View className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden p-4">
              <View className="flex-row items-center mb-3">
                <Skeleton className="w-10 h-10 rounded-full mr-3" />
                <View className="flex-1">
                  <Skeleton className="h-5 w-24" />
                </View>
              </View>
              <View className="mb-3">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </View>
              <Skeleton className="h-9 w-full rounded-lg" />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
});

export default function ExplorePage() {
  const { user, isFollowingChannel } = useAuth();
  const [channels, setChannels] = React.useState<Channel[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();
  const cardWidth = (width - 32) / 2 - 8;
  const inAppDB = useInAppDB();

  // Get following data from inAppDB
  const followingData = inAppDB.getUserChannelFollow(user?.id || '') || [];
  const followingUsernames = new Set(followingData.map(follow => follow.username));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  React.useEffect(() => {
    const fetchChannels = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(config.api.endpoints.channels.base);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch channels: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setChannels(data);
        } else if (data.success) {
          setChannels(data.channels);
        } else {
          throw new Error(data.error || 'Failed to fetch channels');
        }
      } catch (error) {
        setError('Failed to load channels. Please try again.');
        toast.error('Failed to load channels');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChannels();
  }, []);

  const renderChannelGrid = () => {
    return (
      <View className="flex-row flex-wrap justify-between px-4">
        {channels.map((item, index) => (
          <Animated.View
            key={`channel-${item.username}-${index}`}
            style={{
              width: cardWidth,
              marginBottom: 16,
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            }}
          >
            <TouchableOpacity
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
              onPress={() => {
                router.push(`/${item.username}`);
              }}
            >
              <View className="p-4">
                <View className="flex-row items-center mb-3">
                  <View className="w-10 h-10 rounded-full justify-center items-center mr-3 bg-gray-100 dark:bg-gray-700 shadow-sm overflow-hidden">
                    {item.username ? (
                      <img
                        src={`${STORAGE_PREFIX}/${item.username}${IMAGE_SUFFIX}`}
                        alt={`${item.username}'s profile`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement.innerHTML = `<Text className="text-base font-semibold text-blue-500">${item.username[0].toUpperCase()}</Text>`;
                        }}
                      />
                    ) : (
                      <Text className="text-base font-semibold text-blue-500">#</Text>
                    )}
                  </View>
                  <View className="flex-1">
                    <Text 
                      className="text-base font-semibold text-gray-900 dark:text-white"
                      numberOfLines={1}
                    >
                      {item.username}
                    </Text>
                  </View>
                </View>
                
                <Text 
                  className="text-sm text-gray-600 dark:text-gray-300 mb-3" 
                  numberOfLines={2}
                >
                  {item.stateName || 'No description available'}
                </Text>
                
                <FollowButton
                  username={item.username}
                  initialFollowing={followingUsernames.has(item.username)}
                />
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    );
  };

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <CommonHeader title="Explore" showBackButton={true} />
        <View className="flex-1 justify-center px-6">
          <View className="p-6 rounded-2xl bg-white dark:bg-gray-800 mt-6 shadow-lg">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">{error}</Text>
            <Text className="mt-3 text-base text-gray-600 dark:text-gray-300 leading-6">
              There was a problem loading the channels. This could be due to a network issue or the server might be unavailable.
            </Text>
            <TouchableOpacity 
              className="mt-6 py-3.5 px-6 rounded-xl bg-blue-500 flex-row items-center justify-center shadow-md"
              onPress={() => window.location.reload()}
            >
              <Text className="text-base font-semibold text-white">Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <CommonHeader title="Explore" showBackButton={true} />
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <ChannelGridSkeleton />
        ) : channels.length > 0 ? (
          <View>
            <View className="px-4 py-3">
              <Text className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                AVAILABLE CHANNELS
              </Text>
            </View>
            {renderChannelGrid()}
          </View>
        ) : (
          <View className="flex-1 justify-center px-6 mt-6">
            <View className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg">
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                No channels found
              </Text>
              <Text className="mt-3 text-base text-gray-600 dark:text-gray-300 leading-6">
                There are currently no channels available. Please check back later.
              </Text>
              <TouchableOpacity 
                className="mt-6 py-3.5 px-6 rounded-xl bg-blue-500 flex-row items-center justify-center shadow-md"
                onPress={() => window.location.reload()}
              >
                <Text className="text-base font-semibold text-white">Refresh</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
} 