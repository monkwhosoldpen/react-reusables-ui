import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Text,
  View,
  Platform,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { TenantRequest, useAuth } from '~/lib/core/contexts/AuthContext';
import { LogIn, LogOut, Plus } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useInAppDB } from '~/lib/core/providers/InAppDBProvider';
import { FlashList } from '@shopify/flash-list';

interface MainScreenProps {
  initialData?: {
    follows: any[];
    requests: TenantRequest[];
  };
}

export function MainScreen({ initialData }: MainScreenProps) {
  const { user, loading: authLoading, userInfo } = useAuth();
  const router = useRouter();
  const inAppDB = useInAppDB();

  const [channelData, setChannelData] = useState<{
    follows: any[];
    requests: TenantRequest[];
  }>({
    follows: initialData?.follows || [],
    requests: initialData?.requests || []
  });

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [loadingState, setLoadingState] = useState({
    dataLoading: false,
    storeInitialized: false
  });
  const [error, setError] = useState<string | null>(null);
  const dataLoadedRef = useRef(false);

  // Check if store is initialized with data
  useEffect(() => {
    if (user?.id) {
      const unsubscribe = useInAppDB.subscribe(
        (state) => ({
          hasData: state.user_language.size > 0 || 
                   state.user_notifications.size > 0 || 
                   state.push_subscriptions.size > 0
        }),
        (newState, prevState) => {
          if (newState.hasData && !prevState.hasData) {
            setLoadingState(prev => ({ ...prev, storeInitialized: true }));
            console.log('[MainScreen] Store initialized with data');
          }
        }
      );

      // Check initial state
      const initialState = useInAppDB.getState();
      const hasInitialData = initialState.user_language.size > 0 || 
                           initialState.user_notifications.size > 0 || 
                           initialState.push_subscriptions.size > 0;
      
      if (hasInitialData) {
        setLoadingState(prev => ({ ...prev, storeInitialized: true }));
        console.log('[MainScreen] Store already initialized with data');
      }

      return () => unsubscribe();
    }
  }, [user?.id]);

  const loadChannelData = useCallback(async () => {
    if (!user?.id || !loadingState.storeInitialized) {
      return;
    }

    setLoadingState(prev => ({ ...prev, dataLoading: true }));

    try {
      // Get data from InAppDB
      const follows = inAppDB.getUserChannelFollow(user.id);
      const requests = inAppDB.getTenantRequests(user.id);
      const channelsActivity = Array.from(inAppDB.channels_activity.values());

      const followsWithActivity = follows.map(follow => ({
        ...follow,
        channelActivity: channelsActivity.filter(activity => activity.username === follow.username),
        isPrivate: false,
        id: follow.username
      }));

      const requestsWithActivity = requests.map(request => ({
        ...request,
        channelActivity: channelsActivity.filter(activity => activity.username === request.username),
        isPrivate: true,
        id: request.id || request.username,
        username: request.username
      }));

      setChannelData({
        follows: followsWithActivity,
        requests: requestsWithActivity
      });

      dataLoadedRef.current = true;

    } catch (err) {
      setError('Failed to load data');
      console.error('[MainScreen] Error loading data:', err);
    } finally {
      setLoadingState(prev => ({ ...prev, dataLoading: false }));
    }
  }, [user?.id, loadingState.storeInitialized, inAppDB]);

  useEffect(() => {
    let mounted = true;

    const initializeAndLoadData = async () => {
      if (dataLoadedRef.current || !user?.id || !mounted) {
        return;
      }

      loadChannelData();
    };

    initializeAndLoadData();

    return () => {
      mounted = false;
    };
  }, [user?.id, loadChannelData]);

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        loadChannelData();
      }
    }, [user?.id, loadChannelData])
  );

  useEffect(() => {
    if (!user?.id) {
      dataLoadedRef.current = false;
    }
  }, [user?.id]);

  // Log Zustand store state when user is logged in
  useEffect(() => {
    if (user?.id) {
      const store = useInAppDB.getState();
      console.log('[MainScreen] Current Zustand Store State:', {
        users: Array.from(store.users.entries()),
        channels_messages: Array.from(store.channels_messages.entries()),
        channels_activity: Array.from(store.channels_activity.entries()),
        user_language: Array.from(store.user_language.entries()),
        user_notifications: Array.from(store.user_notifications.entries()),
        tenant_requests: Array.from(store.tenant_requests.entries()),
        user_location: Array.from(store.user_location.entries()),
        push_subscriptions: Array.from(store.push_subscriptions.entries()),
        user_channel_follow: Array.from(store.user_channel_follow.entries()),
        user_channel_last_viewed: Array.from(store.user_channel_last_viewed.entries())
      });
    }
  }, [user?.id, channelData]);

  const renderItem = useCallback(({ item, index }: { item: any; index: number }) => {
    const channelActivity = item.channelActivity?.[0];
    const lastMessage = channelActivity?.last_message;
    const messageCount = channelActivity?.message_count || 0;
    const lastUpdated = channelActivity?.last_updated_at || item.updated_at || item.created_at;
    const formattedDate = lastUpdated ? new Date(lastUpdated).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    }) : '';

    return (
      <TouchableOpacity
        key={item.id || index}
        className={`flex-row items-center p-4 bg-white dark:bg-gray-800 rounded-xl my-1 shadow-sm ${
          selectedItem?.id === item.id ? 'bg-gray-50 dark:bg-gray-700/50' : ''
        }`}
        onPress={() => {
          setSelectedItem(item);
          router.push(`/${item.username}` as any);
        }}
      >
        <View className="w-12 h-12 rounded-full justify-center items-center mr-3 bg-gray-100 dark:bg-gray-700 shadow-sm">
          <Text className="text-base font-semibold text-blue-500">
            {item.username?.[0]?.toUpperCase() || '#'}
          </Text>
        </View>
        <View className="flex-1">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-base font-semibold text-gray-900 dark:text-white" numberOfLines={1}>
              {item.username || 'Unknown'}
            </Text>
            <Text className="text-xs text-gray-400 dark:text-gray-500">{formattedDate}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-sm text-gray-600 dark:text-gray-300 flex-1 mr-2" numberOfLines={1}>
              {lastMessage ? lastMessage.content : 'No messages yet'}
            </Text>
            {messageCount > 0 && (
              <View className="min-w-[24px] h-6 rounded-full justify-center items-center px-2 bg-blue-500">
                <Text className="text-xs font-semibold text-white">{messageCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [selectedItem, router]);

  const sortedData = useMemo(() => {
    const allData = [...channelData.requests, ...channelData.follows];
    const sorted = allData.sort((a, b) => {
      const aDate = a.channelActivity?.[0]?.last_updated_at;
      const bDate = b.channelActivity?.[0]?.last_updated_at;
      if (aDate && bDate) {
        return new Date(bDate).getTime() - new Date(aDate).getTime();
      }
      if (aDate) return -1;
      if (bDate) return 1;
      return 0;
    });
    return sorted;
  }, [channelData]);

  if (authLoading || (user && loadingState.dataLoading)) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-1 justify-center px-6">
          <View className="p-6 rounded-2xl bg-white dark:bg-gray-800 mt-6 shadow-lg">
            <ActivityIndicator size="large" className="text-blue-500" />
            <Text className="mt-6 text-2xl font-bold text-center text-gray-900 dark:text-white">
              Loading Your Data
            </Text>
            <Text className="mt-3 text-base text-center text-gray-600 dark:text-gray-300">
              Please wait while we load your channels
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-1 justify-center px-6">
          <View className="p-6 rounded-2xl bg-white dark:bg-gray-800 mt-6 shadow-lg">
            <Text className="text-2xl font-bold text-center text-gray-900 dark:text-white">Welcome to NChat</Text>
            <Text className="mt-3 text-base text-center text-gray-600 dark:text-gray-300">
              Sign in to access your channels and manage your requests
            </Text>
            <TouchableOpacity
              className="mt-6 py-3.5 px-6 rounded-xl bg-blue-500 flex-row items-center justify-center shadow-md"
              onPress={() => router.push('/login')}
            >
              <LogIn size={20} color="white" className="mr-2" />
              <Text className="text-base font-semibold text-white">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1">
        {sortedData.length === 0 ? (
          <View className="flex-1 justify-center items-center p-6">
            <View className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg w-full max-w-md">
              <Text className="text-2xl font-bold text-center text-gray-900 dark:text-white">No Channels</Text>
              <TouchableOpacity
                className="mt-6 py-3.5 px-6 rounded-xl bg-blue-500 flex-row items-center justify-center shadow-md"
                onPress={() => router.push('/explore')}
              >
                <Plus size={20} color="white" className="mr-2" />
                <Text className="text-base font-semibold text-white">Explore Channels</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="p-4">
              <FlashList
                data={sortedData}
                estimatedItemSize={76}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </ScrollView>
        )}
      </View>
      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-blue-500 justify-center items-center shadow-lg"
        onPress={() => router.push('/explore')}
      >
        <Plus size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}