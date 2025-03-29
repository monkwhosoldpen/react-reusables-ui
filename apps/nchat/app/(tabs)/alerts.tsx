import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, RefreshControl, Platform, FlatList } from 'react-native';
import { Text } from '~/components/ui/text';
import { FeedItem } from '~/components/feed/FeedItem';
import { supabase } from '~/lib/supabase';
import type { FormDataType, Stats, Metadata, InteractiveContent, FillRequirement } from '~/lib/enhanced-chat/types/superfeed';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DEFAULT_METADATA: Metadata = {
  maxHeight: 300,
  isCollapsible: true,
  displayMode: 'compact' as const,
  visibility: {
    stats: true,
    shareButtons: true,
    header: true,
    footer: true
  },
  mediaLayout: 'grid' as const,
  requireAuth: false,
  allowResubmit: false,
};

export default function AlertsScreen() {
  const [feedItems, setFeedItems] = useState<FormDataType[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const insets = useSafeAreaInsets();

  // Fetch all feed items
  const fetchFeedItems = useCallback(async () => {
    try {
      setIsFetching(true);
      const { data, error } = await supabase
        .from('superfeed')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        // Transform the raw data to match FormDataType
        const transformedData = data.map((item: any) => ({
          type: (item.type as FormDataType['type']) || 'all',
          content: item.content?.toString() || '',
          media: Array.isArray(item.media) ? item.media : [],
          caption: item.caption?.toString(),
          message: item.message?.toString(),
          metadata: {
            ...DEFAULT_METADATA,
            ...(item.metadata as Metadata || {})
          },
          stats: {
            ...(item.stats as Stats || {}),
            views: (item.stats as Stats)?.views ?? 0,
            likes: (item.stats as Stats)?.likes ?? 0,
            shares: (item.stats as Stats)?.shares ?? 0,
            responses: (item.stats as Stats)?.responses ?? 0,
          },
          interactive_content: item.interactive_content as InteractiveContent,
          id: item.id?.toString(),
          created_at: item.created_at?.toString(),
          updated_at: item.updated_at?.toString(),
          expires_at: item.expires_at?.toString(),
          channel_username: item.channel_username?.toString(),
          fill_requirement: (item.fill_requirement as FillRequirement) || 'partial'
        })) as FormDataType[];
        
        setFeedItems(transformedData);
      }
    } catch (error) {
      console.error('Error fetching feed items:', error);
    } finally {
      setIsFetching(false);
    }
  }, []);

  // Load feed items on mount
  useEffect(() => {
    fetchFeedItems();
  }, [fetchFeedItems]);

  const renderItem = useCallback(({ item }: { item: FormDataType }) => (
    <FeedItem
      data={item}
      showHeader={true}
      showFooter={true}
    />
  ), []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { height: 44 + (Platform.OS === 'ios' ? 0 : insets.top) }]}>
        <Text style={styles.title}>Alerts</Text>
      </View>

      {/* Feed List */}
      <FlatList
        data={feedItems}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={fetchFeedItems}
            tintColor="#1d9bf0"
            colors={['#1d9bf0']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No alerts yet</Text>
            <Text style={styles.emptyStateSubtext}>When there are alerts, they'll show up here</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    ...Platform.select({
      ios: {
        backdropFilter: 'blur(10px)',
      },
      android: {
        elevation: 4,
      },
    }),
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0f1419',
  },
  listContent: {
    paddingTop: 44, // Header height
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f1419',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 15,
    color: '#536471',
    textAlign: 'center',
  },
});