import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAPI } from '~/lib/providers/api/APIProvider';
import { useApiData } from '~/lib/hooks/useApiData';
import { useAuth } from '~/lib/providers/auth/AuthProvider';
import { supabase } from '~/lib/supabase';
import type { Channel } from '~/lib/models/Channel';

type ChannelWithFollowing = Channel & { isFollowing: boolean };

export default function ChannelsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'my' | 'all' | 'premium'>('my');
  const api = useAPI();
  const { user } = useAuth();
  const { isLoading, data, refreshData } = useApiData<Channel[]>(api.getChannels);

  const handleBack = useCallback(() => {
    router.push("/(tabs)/feed");
  }, []);

  const handleFollowToggle = useCallback(async (username: string) => {
    try {
      if (!user) return;
      
      const currentMetadata = user.user_metadata || {};
      const followedGoats = currentMetadata.followedgoats || [];
      
      const isCurrentlyFollowing = followedGoats.includes(username);
      const newFollowedGoats = isCurrentlyFollowing
        ? followedGoats.filter((id: string) => id !== username)
        : [...followedGoats, username];

      const { error } = await supabase.auth.updateUser({
        data: {
          ...currentMetadata,
          followedgoats: newFollowedGoats
        }
      });

      if (error) {
        throw error;
      }

      refreshData();
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  }, [user, refreshData]);

  const followedGoats = useMemo(() => 
    (user?.user_metadata?.followedgoats || []) as string[],
    [user?.user_metadata?.followedgoats]
  );

  // Create mock channels for followed usernames
  const myChannels = useMemo(() => {
    return followedGoats.map(username => ({
      username,
      name: `@${username}`,
      description: undefined,
      avatar_url: undefined,
      premium: Math.random() > 0.5, // Random premium status for mock
      is_realtime: false,
      is_related_channel: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isFollowing: true
    } as ChannelWithFollowing));
  }, [followedGoats]);

  const filteredChannels = useMemo(() => {
    if (!data?.data && activeTab !== 'my') return [];
    
    let channels: ChannelWithFollowing[] = activeTab === 'my' 
      ? myChannels 
      : (data?.data?.map(channel => ({
          ...channel,
          isFollowing: followedGoats.includes(channel.username)
        })) || []);

    if (searchQuery) {
      channels = channels.filter(channel => 
        channel.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        channel.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeTab === 'premium') {
      channels = channels.filter(channel => channel.premium);
    }

    return channels;
  }, [data?.data, searchQuery, activeTab, followedGoats, myChannels]);

  const renderChannelItem = useCallback(({ item }: { item: ChannelWithFollowing }) => (
    <TouchableOpacity 
      style={styles.channelItem}
      onPress={() => router.push(`/${item.username}`)}
    >
      <Image source={{ uri: item.avatar_url || 'https://placehold.co/50x50' }} style={styles.channelAvatar} />
      <View style={styles.channelInfo}>
        <View style={styles.channelNameRow}>
          <Text style={styles.channelName}>{item.name}</Text>
          {item.premium && (
            <Ionicons name="star" size={16} color="#FFD700" style={styles.premiumBadge} />
          )}
        </View>
        {item.description && (
          <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        )}
      </View>
      <TouchableOpacity 
        style={[
          styles.followButton,
          item.isFollowing && styles.followingButton
        ]}
        onPress={(e) => {
          e.stopPropagation(); // Prevent triggering the parent onPress
          handleFollowToggle(item.username);
        }}
      >
        <Text style={[
          styles.followButtonText,
          item.isFollowing && styles.followingButtonText
        ]}>
          {item.isFollowing ? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  ), [handleFollowToggle]);

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Ionicons name="chatbubbles-outline" size={64} color="#667781" />
      <Text style={styles.emptyStateTitle}>No channels yet</Text>
      <Text style={styles.emptyStateDescription}>
        Follow channels to start conversations and stay updated with your favorite creators
      </Text>
      <TouchableOpacity 
        style={styles.discoverButton}
        onPress={() => setActiveTab('all')}
      >
        <Text style={styles.discoverButtonText}>Discover Channels</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#667781" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search channels"
            placeholderTextColor="#667781"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'my' && styles.activeTab]}
          onPress={() => setActiveTab('my')}
        >
          <Text style={[styles.tabText, activeTab === 'my' && styles.activeTabText]}>
            My
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'premium' && styles.activeTab]}
          onPress={() => setActiveTab('premium')}
        >
          <Text style={[styles.tabText, activeTab === 'premium' && styles.activeTabText]}>
            Premium
          </Text>
        </TouchableOpacity>
      </View>

      {/* Channel List */}
      <FlatList
        data={filteredChannels}
        renderItem={renderChannelItem}
        keyExtractor={item => item.username}
        style={styles.channelList}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={refreshData}
        ListEmptyComponent={activeTab === 'my' ? renderEmptyState : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
    marginLeft: 16,
  },
  searchContainer: {
    padding: 8,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 36,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#f0f2f5',
  },
  activeTab: {
    backgroundColor: '#e5f7ef',
  },
  tabText: {
    fontSize: 14,
    color: '#54656f',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#00A884',
    fontWeight: '600',
  },
  channelList: {
    flex: 1,
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  channelAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f2f5',
  },
  channelInfo: {
    flex: 1,
    marginLeft: 12,
  },
  channelNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  channelName: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 4,
  },
  description: {
    fontSize: 14,
    color: '#667781',
    marginTop: 2,
  },
  premiumBadge: {
    marginLeft: 4,
  },
  followButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#00A884',
  },
  followingButton: {
    backgroundColor: '#e5f7ef',
  },
  followButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  followingButtonText: {
    color: '#00A884',
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#54656f',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#667781',
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 300,
  },
  discoverButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#00A884',
  },
  discoverButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
}); 