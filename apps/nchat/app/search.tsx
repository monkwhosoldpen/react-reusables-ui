import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, TextInput, FlatList, Image, StyleSheet } from 'react-native';
import { Text } from '~/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '~/lib/providers/auth/AuthProvider';
import { useGlobalSupabase } from '~/lib/hooks/useGlobalSupabase';
import type { Channel } from '~/lib/models/Channel';

type ExtendedChannel = Omit<Channel, 'is_realtime' | 'is_related_channel'> & {
  display_name?: string;
  verified?: boolean;
  country?: string;
  is_realtime: boolean;
  is_related_channel: boolean;
};

// Loading skeleton component
const SearchSkeleton = () => (
  <View className="p-4">
    {[...Array(8)].map((_, index) => (
      <View key={index} className="flex-row items-center p-3 mb-4">
        <View className="w-11 h-11 rounded-full bg-muted" />
        <View className="flex-1 ml-3">
          <View className="h-4 w-32 bg-muted rounded mb-2" />
          <View className="h-3 w-24 bg-muted rounded" />
        </View>
      </View>
    ))}
  </View>
);

export default function SearchScreen() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ExtendedChannel[]>([]);
  const [suggestedChannels, setSuggestedChannels] = useState<ExtendedChannel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { globalSupabase, isLoading: isLoadingClient } = useGlobalSupabase();

  // Load suggested channels on mount
  useEffect(() => {
    loadSuggestedChannels();
  }, []);

  const loadSuggestedChannels = async () => {
    try {
      const { data, error } = await globalSupabase
        .from('channels')
        .select('*')
        .limit(10);

      if (error) throw error;
      
      const channels = (data || []).map(channel => ({
        ...channel,
        is_realtime: channel.is_realtime || false,
        is_related_channel: channel.is_related_channel || false
      })) as ExtendedChannel[];
      
      setSuggestedChannels(channels);
    } catch (error) {
      console.error('Error loading suggested channels:', error);
    } finally {
      setIsInitialLoad(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (!text.trim()) {
      setResults([]);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await globalSupabase
        .from('channels')
        .select('*')
        .or(`username.ilike.%${text}%,name.ilike.%${text}%`)
        .limit(20);

      if (error) throw error;
      
      const channels = (data || []).map(channel => ({
        ...channel,
        is_realtime: channel.is_realtime || false,
        is_related_channel: channel.is_related_channel || false
      })) as ExtendedChannel[];
      
      setResults(channels);
    } catch (error) {
      console.error('Error searching channels:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Search header */}
      <View className="flex-row items-center p-4 border-b border-border">
        <TouchableOpacity onPress={handleBack} className="mr-3">
          <Ionicons name="arrow-back" size={24} className="text-foreground" />
        </TouchableOpacity>
        <TextInput
          placeholder="Search channels..."
          value={query}
          onChangeText={handleSearch}
          className="flex-1 h-10 px-4 rounded-full bg-muted text-foreground"
          placeholderTextColor="text-muted-foreground"
        />
      </View>

      {/* Loading state */}
      {(isLoading || isLoadingClient || isInitialLoad) && <SearchSkeleton />}

      {/* Results */}
      {!isLoading && !isLoadingClient && !isInitialLoad && (
        <FlatList
          data={query ? results : suggestedChannels}
          keyExtractor={(item) => item.username}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/${item.username}`)}
              className="flex-row items-center p-4 border-b border-border"
            >
              <Image
                source={{ uri: item.avatar_url || `https://ui-avatars.com/api/?name=${item.name}` }}
                className="w-11 h-11 rounded-full bg-muted"
              />
              <View className="flex-1 ml-3">
                <Text className="font-medium text-foreground">{item.name}</Text>
                <Text className="text-sm text-muted-foreground">@{item.username}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="p-4">
              <Text className="text-center text-muted-foreground">
                {query ? 'No channels found' : 'No suggested channels'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    flexGrow: 1,
    paddingVertical: 8,
  },
}); 