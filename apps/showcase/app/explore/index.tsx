'use client';

import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Animated, SafeAreaView, ScrollView, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { toast } from 'sonner';
import { FollowButton } from '~/components/common/FollowButton';
import { useAuth } from '~/lib/core/contexts/AuthContext';
import { Channel } from '~/lib/core/types/channel.types';
import { config } from '~/lib/core/config';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonHeader } from '~/components/common/CommonHeader';
import { MaterialIcons } from "@expo/vector-icons";

export default function ExplorePage() {
  const { user, isFollowingChannel } = useAuth();
  const [channels, setChannels] = React.useState<Channel[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [followingStatus, setFollowingStatus] = React.useState<Record<string, boolean>>({});
  const router = useRouter();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();
  const cardWidth = (width - 32) / 2 - 8; // Calculate card width (screen width minus padding, divided by 2, minus gap)

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
          if (user) {
            checkFollowStatus(data);
          }
        } else if (data.success) {
          setChannels(data.channels);
          if (user) {
            checkFollowStatus(data.channels);
          }
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
  }, [user]);

  // Check if user is following each channel
  const checkFollowStatus = async (channelList: Channel[]) => {
    if (!user) return;
    
    const statusMap: Record<string, boolean> = {};
    
    // Check following status for each channel
    for (const channel of channelList) {
      try {
        const isFollowed = await isFollowingChannel(channel.username);
        statusMap[channel.username] = isFollowed;
      } catch (err) {
        console.error(`Error checking follow status for ${channel.username}:`, err);
        statusMap[channel.username] = false;
      }
    }
    
    setFollowingStatus(statusMap);
  };

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
                  <View className="w-10 h-10 rounded-full justify-center items-center mr-3 bg-gray-100 dark:bg-gray-700 shadow-sm">
                    <Text className="text-base font-semibold text-blue-500">
                      {item.username?.[0]?.toUpperCase() || '#'}
                    </Text>
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
                  initialFollowing={followingStatus[item.username] || false}
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
          <View className="flex-1 justify-center px-6 mt-6">
            <View className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg">
              <ActivityIndicator size="large" className="text-blue-500" />
              <Text className="mt-6 text-2xl font-bold text-center text-gray-900 dark:text-white">Loading Channels</Text>
              <Text className="mt-3 text-base text-center text-gray-600 dark:text-gray-300">
                Please wait while we fetch available channels
              </Text>
            </View>
          </View>
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