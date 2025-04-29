import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Constants from "expo-constants";
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
import { TenantRequest, useAuth } from '~/lib/contexts/AuthContext';
import { LogIn, LogOut, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { indexedDB } from '@/lib/services/indexedDB';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { MaterialIcons } from "@expo/vector-icons";

interface MainScreenProps {
  initialData?: {
    follows: any[];
    requests: TenantRequest[];
  };
}

export function MainScreen({ initialData }: MainScreenProps) {
  const { user, loading: authLoading, userInfo } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [followedChannels, setFollowedChannels] = useState<any[]>(initialData?.follows || []);
  const [tenantRequests, setTenantRequests] = useState<TenantRequest[]>(initialData?.requests || []);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [dbInitialized, setDbInitialized] = useState(false);
  const initializationStarted = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize IndexedDB
  useEffect(() => {
    if (!initializationStarted.current) {
      initializationStarted.current = true;

      indexedDB.initialize()
        .then(() => {
          setDbInitialized(true);
        })
        .catch(err => {
          setError('Failed to initialize database');
        });
    }
  }, []);

  // Fetch followed channels
  const fetchUserFollows = async () => {
    if (!user?.id || !dbInitialized) {
      return [];
    }

    try {
      const follows = await indexedDB.getAllFromIndex('user_channel_follow', 'by-user', user.id);
      return follows || [];
    } catch (err) {
      return [];
    }
  };

  // Fetch tenant requests
  const fetchTenantRequests = async () => {
    if (!user?.id || !dbInitialized) {
      return [];
    }

    try {
      const requests = await indexedDB.getAllFromIndex('tenant_requests', 'by-user', user.id);
      return requests || [];
    } catch (err) {
      return [];
    }
  };

  // Load data when DB is initialized and user is available
  useEffect(() => {
    const loadData = async () => {
      if (dbInitialized && user?.id && !isDataLoaded) {
        setIsLoading(true);
        try {
          const [follows, requests] = await Promise.all([
            fetchUserFollows(),
            fetchTenantRequests()
          ]);

          // Get all channel activity records
          const allChannelActivity = await indexedDB.getAll('channels_activity');

          // Merge channel activity into follows
          const followsWithActivity = follows.map(follow => {
            const channelActivity = allChannelActivity.find(
              activity => activity.username === follow.username
            );
            return {
              ...follow,
              channelActivity: channelActivity ? [channelActivity] : [],
              isPrivate: false,
              id: follow.id || follow.username
            };
          });

          // Merge channel activity into tenant requests
          const requestsWithActivity = requests.map(request => {
            const channelActivity = allChannelActivity.find(
              activity => activity.username === request.username
            );
            return {
              ...request,
              channelActivity: channelActivity ? [channelActivity] : [],
              isPrivate: true,
              id: request.id || request.username,
              username: request.username || request.tenant_name
            };
          });

          setFollowedChannels(followsWithActivity);
          setTenantRequests(requestsWithActivity);
          setIsDataLoaded(true);
        } catch (error) {
          setError('Failed to load data');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadData();
  }, [dbInitialized, user?.id, isDataLoaded]);

  // Reset data loaded state when user or userInfo changes
  useEffect(() => {
    if (user?.id || userInfo) {
      setIsDataLoaded(false);
    }
  }, [user?.id, userInfo]);

  const renderItem = useCallback(({ item, index }: { item: any; index: number }) => {
    const isPrivateChannel = item.isPrivate;
    const isFirstPrivateChannel = isPrivateChannel && index === 0;
    const isFirstPublicChannel = !isPrivateChannel && index === tenantRequests.length;

    const channelActivity = item.channelActivity?.[0];
    const lastMessage = channelActivity?.last_message;
    const messageCount = channelActivity?.message_count || 0;
    const lastUpdated = channelActivity?.last_updated_at || item.updated_at || item.created_at;

    const formattedDate = lastUpdated ? new Date(lastUpdated).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    }) : '';

    return (
      <>
        {isFirstPrivateChannel && (
          <View className="py-3 px-4 mt-2 bg-transparent">
            <Text className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              PRIVATE CHANNELS
            </Text>
          </View>
        )}
        {isFirstPublicChannel && (
          <View className="py-3 px-4 mt-2 bg-transparent">
            <Text className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              PUBLIC CHANNELS
            </Text>
          </View>
        )}
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
          <View className="flex-1 mr-3">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-base font-semibold text-gray-900 dark:text-white" numberOfLines={1}>
                {item.username || 'Unknown'}
              </Text>
              <Text className="text-xs text-gray-400 dark:text-gray-500">{formattedDate}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-600 dark:text-gray-300" numberOfLines={1}>
                {lastMessage ? lastMessage.message_text : 'No messages yet'}
              </Text>
              {messageCount > 0 && (
                <View className="min-w-[24px] h-6 rounded-full justify-center items-center px-2 bg-blue-500">
                  <Text className="text-xs font-semibold text-white">{messageCount}</Text>
                </View>
              )}
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={24} className="text-gray-400 dark:text-gray-500 opacity-60" />
        </TouchableOpacity>
      </>
    );
  }, [selectedItem, router, tenantRequests]);

  if (authLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-1 justify-center px-6">
          <View className="p-6 rounded-2xl bg-white dark:bg-gray-800 mt-6 shadow-lg">
            <ActivityIndicator size="large" className="text-blue-500" />
            <Text className="mt-6 text-2xl font-bold text-center text-gray-900 dark:text-white">Loading...</Text>
            <Text className="mt-3 text-base text-center text-gray-600 dark:text-gray-300">
              Please wait while we initialize the app
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

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-1 justify-center px-6">
          <View className="p-6 rounded-2xl bg-white dark:bg-gray-800 mt-6 shadow-lg">
            <ActivityIndicator size="large" className="text-blue-500" />
            <Text className="mt-6 text-2xl font-bold text-center text-gray-900 dark:text-white">Loading Your Data</Text>
            <Text className="mt-3 text-base text-center text-gray-600 dark:text-gray-300">
              Please wait while we load your channels
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const data = [...tenantRequests, ...followedChannels];

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full">
          {data.length === 0 ? (
            <View className="flex-1 justify-center items-center p-6">
              <View className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg w-full max-w-md">
                <Text className="text-2xl font-bold text-center text-gray-900 dark:text-white">No Channels Yet</Text>
                <Text className="mt-3 text-base text-center text-gray-600 dark:text-gray-300">
                  Start by following some channels or creating new ones!
                </Text>
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
            <View className="p-4 bg-white dark:bg-gray-800 shadow-lg">
              <FlashList
                data={data}
                estimatedItemSize={76}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-blue-500 justify-center items-center shadow-lg"
        onPress={() => router.push('/explore')}
      >
        <Plus size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}