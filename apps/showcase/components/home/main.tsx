// MainScreen.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Plus, Check } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { TenantRequest, useAuth } from '~/lib/core/contexts/AuthContext';
import { useInAppDB } from '~/lib/core/providers/InAppDBProvider';
import { MainScreenHeader } from './MainScreenHeader';

interface MainScreenProps {
  initialData?: {
    follows: any[];
    requests: TenantRequest[];
  };
}

export function MainScreen({ initialData }: MainScreenProps) {
  const { user } = useAuth();
  const router = useRouter();
  const inAppDB = useInAppDB();
  const [channelData, setChannelData] = useState({
    follows: initialData?.follows || [],
    requests: initialData?.requests || [],
  });
  const [activeTab, setActiveTab] = useState('All');

  // Use refs to keep selection state persistent even during re-renders or resizing
  const selectionStateRef = useRef({
    selectionMode: false,
    selectedItems: new Set<string>(),
  });

  // React state to trigger re-renders based on selection changes
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Sync React state from ref when selectionStateRef changes
  const syncSelectionState = useCallback(() => {
    setSelectionMode(selectionStateRef.current.selectionMode);
    setSelectedItems(new Set(selectionStateRef.current.selectedItems)); // create new Set to trigger React update
  }, []);

  const loadChannelData = useCallback(() => {
    if (!user?.id) return;
    const follows = inAppDB.getUserChannelFollow(user.id);
    const requests = inAppDB.getTenantRequests(user.id);
    const channelsActivity = Array.from(inAppDB.channels_activity.values());

    const withActivity = (list: any[], isPrivate = false) =>
      list.map(item => ({
        ...item,
        channelActivity: channelsActivity.filter(a => a.username === item.username),
        isPrivate,
        id: item.id || item.username,
      }));

    setChannelData({
      follows: withActivity(follows),
      requests: withActivity(requests, true),
    });
  }, [user?.id, inAppDB]);

  useFocusEffect(useCallback(() => {
    if (user?.id) loadChannelData();
  }, [user?.id, loadChannelData]));

  const sortedData = useMemo(() => {
    const all = [...channelData.requests, ...channelData.follows];
    return all.sort((a, b) => {
      const aTime = new Date(a.channelActivity?.[0]?.last_updated_at || 0).getTime();
      const bTime = new Date(b.channelActivity?.[0]?.last_updated_at || 0).getTime();
      return bTime - aTime;
    });
  }, [channelData]);

  const filteredData = useMemo(() => {
    if (activeTab === 'Unread') {
      return sortedData.filter(item => item.channelActivity?.[0]?.message_count > 0);
    }
    if (activeTab === 'Private') {
      return sortedData.filter(item => item.is_owner_db === true);
    }
    if (activeTab === 'Public') {
      return sortedData.filter(item => item.is_owner_db !== true);
    }
    return sortedData;
  }, [activeTab, sortedData]);

  // Handle long press to enter selection mode and select the item
  const handleLongPress = useCallback((id: string) => {
    if (selectionStateRef.current.selectionMode) return;

    selectionStateRef.current.selectionMode = true;
    selectionStateRef.current.selectedItems = new Set([id]);

    syncSelectionState();
  }, [syncSelectionState]);

  // Toggle select an item; exit selection mode if none selected
  const toggleSelect = useCallback((id: string) => {
    if (!selectionStateRef.current.selectionMode) return;

    const next = new Set(selectionStateRef.current.selectedItems);
    if (next.has(id)) {
      next.delete(id);
      if (next.size === 0) {
        // Exit selection mode
        selectionStateRef.current.selectionMode = false;
      }
    } else {
      next.add(id);
    }
    selectionStateRef.current.selectedItems = next;

    syncSelectionState();
  }, [syncSelectionState]);

  const cancelSelection = useCallback(() => {
    selectionStateRef.current.selectionMode = false;
    selectionStateRef.current.selectedItems = new Set();

    syncSelectionState();
  }, [syncSelectionState]);

  const handleItemPress = useCallback((item: any) => {
    if (selectionStateRef.current.selectionMode) {
      toggleSelect(item.id);
      return;
    }
    router.push(`/${item.username}`);
  }, [router, toggleSelect]);

  const renderItem = useCallback(({ item }: { item: any }) => {
    const isSelected = selectedItems.has(item.id);

    const activity = item.channelActivity?.[0];
    const formattedDate = activity?.last_updated_at
      ? new Date(activity.last_updated_at).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        })
      : '';

    return (
      <TouchableOpacity
        key={item.id}
        onLongPress={() => handleLongPress(item.id)}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
        style={{ pointerEvents: 'auto' }}
        className={`flex-row items-center px-4 py-3 border-b transition-colors duration-200 ${
          isSelected
            ? 'bg-[#E7F3FF] dark:bg-[#233834] border-[#00A884]'
            : 'bg-white dark:bg-[#111B21] border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#1E2B33]'
        }`}
      >
        <View
          className={`w-14 h-14 rounded-full justify-center items-center mr-4 border-2 transition-all duration-200 ${
            isSelected
              ? 'border-[#00A884] scale-105'
              : 'bg-gray-200 dark:bg-[#2A3F4A] border-transparent'
          } relative`}
        >
          <Text
            className={`text-xl font-semibold transition-colors duration-200 ${
              isSelected ? 'text-[#128C7E] dark:text-[#00A884]' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {item.username?.[0]?.toUpperCase() || '#'}
          </Text>
          {selectionMode && isSelected && (
            <View className="absolute bottom-0 right-0 bg-[#06D755] rounded-full p-0.5 border-2 border-white dark:border-[#111B21]">
              <Check size={14} color="white" />
            </View>
          )}
        </View>
        <View className="flex-1">
          <View className="flex-row justify-between mb-1">
            <Text
              className={`text-base font-semibold transition-colors duration-200 ${
                isSelected ? 'text-[#128C7E] dark:text-[#00A884]' : 'text-gray-900 dark:text-white'
              }`}
            >
              {item.username}
            </Text>
            <Text
              className={`text-xs transition-colors duration-200 ${
                isSelected ? 'text-[#128C7E] dark:text-[#00A884]' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {formattedDate}
            </Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text
              numberOfLines={1}
              className={`text-sm flex-1 mr-2 transition-colors duration-200 ${
                isSelected ? 'text-[#128C7E] dark:text-[#00A884]' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {activity?.last_message?.content || 'No messages yet'}
            </Text>
            {activity?.message_count > 0 && (
              <View
                className={`min-w-[20px] h-5 rounded-full transition-colors duration-200 ${
                  isSelected ? 'bg-[#128C7E] dark:bg-[#00A884]' : 'bg-[#06D755]'
                } justify-center items-center px-1`}
              >
                <Text className="text-xs font-semibold text-white">{activity.message_count}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [handleItemPress, handleLongPress, selectedItems, selectionMode]);

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900 justify-center items-center">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">Please Sign In</Text>
        <TouchableOpacity
          onPress={() => router.push('/login')}
          className="mt-6 py-3 px-6 bg-blue-500 rounded-xl"
        >
          <Text className="text-white font-semibold">Sign In</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#111B21]">
      <MainScreenHeader
        selectionMode={selectionMode}
        selectedCount={selectedItems.size}
        onCancelSelection={cancelSelection}
      />

      <FlashList
        data={filteredData}
        renderItem={renderItem}
        estimatedItemSize={76}
        contentContainerStyle={{ paddingBottom: 100 }}
        extraData={{ selectedItems, selectionMode }}
        ListHeaderComponent={() => (
          <View className="flex-row items-center px-4 py-2 bg-white dark:bg-[#111B21] border-b dark:border-gray-700">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['All', 'Unread', 'Public', 'Private'].map(tab => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full mr-2 ${
                    activeTab === tab ? 'bg-[#06D755]' : 'bg-gray-200 dark:bg-[#2A3F4A]'
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      activeTab === tab ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      />

      {!selectionMode && (
        <TouchableOpacity
          onPress={() => router.push('/explore')}
          className="absolute bottom-6 right-6 w-14 h-14 bg-blue-500 rounded-full justify-center items-center"
        >
          <Plus size={24} color="white" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
