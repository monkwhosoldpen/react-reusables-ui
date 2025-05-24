'use client';

import React, { useCallback, memo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Animated, SafeAreaView, ScrollView, useWindowDimensions, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { toast } from 'sonner';
import { FollowButton } from '~/components/common/FollowButton';
import { useAuth } from '~/lib/core/contexts/AuthContext';
import { Channel } from '~/lib/core/types/channel.types';
import { config } from '~/lib/core/config';
import { CommonHeader } from '~/components/common/CommonHeader';
import { useInAppDB } from '~/lib/core/providers/InAppDBProvider';
import { Skeleton } from '~/components/ui/skeleton';
import { indiaData } from '~/lib/in-app-db/states';

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
                  <Skeleton className="h-5 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </View>
              </View>
              <Skeleton className="h-9 w-full rounded-lg" />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
});

// Add Material Design tab indicator component
const TabIndicator = memo(({ width, position }: { width: Animated.Value; position: Animated.Value }) => {
  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: width,
        height: 2,
        backgroundColor: '#2196F3',
        transform: [{ translateX: position }],
      }}
    />
  );
});

export default function ExplorePage() {
  const { user, isFollowingChannel } = useAuth();
  const [channels, setChannels] = React.useState<Channel[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeState, setActiveState] = React.useState<string>('All');
  const router = useRouter();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();
  const cardWidth = (width - 32) / 2 - 8;
  const inAppDB = useInAppDB();
  const [tabLayouts, setTabLayouts] = React.useState<{ [key: string]: { width: number; x: number } }>({});
  const indicatorPosition = React.useRef(new Animated.Value(0)).current;
  const indicatorWidth = React.useRef(new Animated.Value(0)).current;
  const [showStateDropdown, setShowStateDropdown] = React.useState(false);

  // Initialize tab indicator position when layouts are available
  React.useEffect(() => {
    if (activeState === 'All' && tabLayouts['All']) {
      indicatorPosition.setValue(tabLayouts['All'].x);
      indicatorWidth.setValue(tabLayouts['All'].width);
    } else if (activeState !== 'All' && tabLayouts['By State']) {
      indicatorPosition.setValue(tabLayouts['By State'].x);
      indicatorWidth.setValue(tabLayouts['By State'].width);
    }
  }, [tabLayouts, activeState]);

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
          // Filter channels based on active state
          const stateChannels = activeState === 'All' 
            ? data 
            : data.filter(channel => channel.stateName === activeState);
          setChannels(stateChannels);
        } else if (data.success) {
          // Filter channels based on active state
          const stateChannels = activeState === 'All'
            ? data.channels
            : data.channels.filter(channel => channel.stateName === activeState);
          setChannels(stateChannels);
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
  }, [activeState]);

  // Function to handle tab press with animation
  const handleTabPress = (state: string) => {
    setActiveState(state);
    // Only animate indicator for "All" tab
    if (state === 'All') {
      Animated.parallel([
        Animated.timing(indicatorPosition, {
          toValue: tabLayouts['All']?.x || 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(indicatorWidth, {
          toValue: tabLayouts['All']?.width || 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      // For state selection, move indicator to "By State" tab
      Animated.parallel([
        Animated.timing(indicatorPosition, {
          toValue: tabLayouts['By State']?.x || 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(indicatorWidth, {
          toValue: tabLayouts['By State']?.width || 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }
  };

  // Function to measure tab layout
  const onTabLayout = (state: string, event: any) => {
    const { width, x } = event.nativeEvent.layout;
    setTabLayouts(prev => ({
      ...prev,
      [state]: { width, x }
    }));
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
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              onPress={() => {
                router.push(`/${item.username}`);
              }}
            >
              <View className="p-4">
                <View className="flex-row items-center mb-3">
                  <View className="w-10 h-10 rounded-full justify-center items-center mr-3 bg-gray-100 dark:bg-gray-700 shadow-sm overflow-hidden border border-gray-200 dark:border-gray-600">
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
                      className="text-base font-semibold text-gray-900 dark:text-white tracking-tight"
                      numberOfLines={1}
                    >
                      {item.username}
                    </Text>
                    <Text 
                      className="text-xs text-gray-500 dark:text-gray-400 mt-0.5"
                      numberOfLines={1}
                    >
                      {item.stateName || 'No state available'}
                    </Text>
                  </View>
                </View>
                
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
          <View className="p-6 rounded-xl bg-white dark:bg-gray-800 mt-6 shadow-sm">
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
        {/* Modified Tabs */}
        <View className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <View className="flex-row items-center px-4 py-3">
            <TouchableOpacity
              onLayout={(e) => onTabLayout('All', e)}
              className="px-4 py-2 mr-4"
              onPress={() => handleTabPress('All')}
            >
              <Text
                className={`text-sm font-medium ${
                  activeState === 'All'
                    ? 'text-blue-500 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                All
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onLayout={(e) => onTabLayout('By State', e)}
              className="px-4 py-2 flex-row items-center"
              onPress={() => setShowStateDropdown(true)}
            >
              <Text
                className={`text-sm font-medium ${
                  activeState !== 'All'
                    ? 'text-blue-500 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {activeState === 'All' ? 'By State' : activeState}
              </Text>
              <Text className="ml-1 text-gray-600 dark:text-gray-400">▼</Text>
            </TouchableOpacity>
          </View>
          <TabIndicator 
            width={indicatorWidth} 
            position={indicatorPosition} 
          />
        </View>

        {/* State Dropdown Modal */}
        <Modal
          visible={showStateDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowStateDropdown(false)}
        >
          <TouchableOpacity 
            className="flex-1 bg-black/50"
            activeOpacity={1}
            onPress={() => setShowStateDropdown(false)}
          >
            <View className="mt-16 mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <ScrollView className="max-h-96">
                {Object.keys(indiaData).map((state) => (
                  <TouchableOpacity
                    key={state}
                    className="px-4 py-3 border-b border-gray-200 dark:border-gray-700"
                    onPress={() => {
                      handleTabPress(state);
                      setShowStateDropdown(false);
                    }}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        activeState === state
                          ? 'text-blue-500 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {state}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        {isLoading ? (
          <ChannelGridSkeleton />
        ) : channels.length > 0 ? (
          <View className="pt-4">
            {renderChannelGrid()}
          </View>
        ) : (
          <View className="flex-1 justify-center px-6 mt-6">
            <View className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                No channels found
              </Text>
              <Text className="mt-3 text-base text-gray-600 dark:text-gray-300 leading-6">
                {activeState === 'All' 
                  ? 'There are currently no channels available. Please check back later.'
                  : `There are currently no channels available in ${activeState}. Please check back later.`
                }
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