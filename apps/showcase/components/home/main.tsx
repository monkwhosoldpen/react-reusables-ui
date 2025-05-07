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
import { TenantRequest, useAuth } from '~/lib/core/contexts/AuthContext';
import { LogIn, LogOut, Plus } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { indexedDB } from '~/lib/core/services/indexedDB';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { MaterialIcons } from "@expo/vector-icons";

interface MainScreenProps {
  initialData?: {
    follows: any[];
    requests: TenantRequest[];
  };
}

type TabType = 'private' | 'public';

export function MainScreen({ initialData }: MainScreenProps) {
  const { user, loading: authLoading, userInfo } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<TabType>('private');

  // Use a single data state to prevent multiple re-renders
  const [channelData, setChannelData] = useState<{
    follows: any[];
    requests: TenantRequest[];
  }>({
    follows: initialData?.follows || [],
    requests: initialData?.requests || []
  });
  
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [loadingState, setLoadingState] = useState({
    dbInit: !initialData,
    dataLoading: false
  });
  const [error, setError] = useState<string | null>(null);
  const dataLoadedRef = useRef(false);

  // Function to load channel data that can be reused
  const loadChannelData = useCallback(async () => {
    
    // Skip if there's no user
    if (!user?.id) {
      return;
    }

    setLoadingState(prev => ({ ...prev, dataLoading: true }));

    try {
      // Initialize DB if needed
      if (loadingState.dbInit) {
        await indexedDB.initialize();
        setLoadingState(prev => ({ ...prev, dbInit: false }));
      }

      // Load all data in parallel
      const [follows, requests, allChannelActivity] = await Promise.all([
        indexedDB.getAllFromIndex('user_channel_follow', 'by-user', user.id),
        indexedDB.getAllFromIndex('tenant_requests', 'by-user', user.id),
        indexedDB.getAll('channels_activity')
      ]);


      // Process follows and requests with activity data
      const followsWithActivity = (follows || []).map(follow => ({
        ...follow,
        channelActivity: allChannelActivity.filter(activity => activity.username === follow.username),
        isPrivate: false,
        id: follow.id || follow.username
      }));

      const requestsWithActivity = (requests || []).map(request => ({
        ...request,
        channelActivity: allChannelActivity.filter(activity => activity.username === request.username),
        isPrivate: true,
        id: request.id || request.username,
        username: request.username || request.tenant_name
      }));

      setChannelData({
        follows: followsWithActivity,
        requests: requestsWithActivity
      });
      
      dataLoadedRef.current = true;
    } catch (err) {
      console.error('[MainScreen] Error loading data:', err);
      setError('Failed to load data');
    } finally {
      setLoadingState(prev => ({ ...prev, dataLoading: false }));
    }
  }, [user?.id, loadingState.dbInit]);

  // Initial data loading
  useEffect(() => {
    let mounted = true;

    const initializeAndLoadData = async () => {
      
      // Skip if we've already loaded data or if there's no user
      if (dataLoadedRef.current || !user?.id) return;
      
      // Only proceed if component is still mounted
      if (!mounted) return;
      
      loadChannelData();
    };

    initializeAndLoadData();

    return () => {
      mounted = false;
    };
  }, [user?.id, loadChannelData]);

  // Use useFocusEffect to reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Only reload data if we already have a user and have loaded data before
      if (user?.id) {
        loadChannelData();
      }
      return () => {
        // Cleanup if needed
      };
    }, [user?.id, loadChannelData])
  );

  // Reset data loaded ref when user changes
  useEffect(() => {
    if (!user?.id) {
      dataLoadedRef.current = false;
    }
  }, [user?.id]);

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
    );
  }, [selectedItem, router]);

  const filteredData = useMemo(() => {
    const allData = [...channelData.requests, ...channelData.follows];
    
    if (activeTab === 'private') return allData.filter(item => item.isPrivate);
    if (activeTab === 'public') return allData.filter(item => !item.isPrivate);
    
    return allData;
  }, [channelData, activeTab]);

  const renderTabButton = (tab: TabType, label: string) => (
    <TouchableOpacity
      className={`flex-1 py-3 ${
        activeTab === tab 
          ? 'border-b-2 border-green-500' 
          : ''
      }`}
      onPress={() => setActiveTab(tab)}
    >
      <Text 
        className={`text-center text-sm font-medium ${
          activeTab === tab 
            ? 'text-green-500' 
            : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

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

  if (loadingState.dataLoading || loadingState.dbInit) {
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

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1">
        {/* Tab Pills */}
        <View className="px-4 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <View className="flex-row">
            {renderTabButton('private', 'Private')}
            {renderTabButton('public', 'Public')}
          </View>
        </View>

        {filteredData.length === 0 ? (
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
                data={filteredData}
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