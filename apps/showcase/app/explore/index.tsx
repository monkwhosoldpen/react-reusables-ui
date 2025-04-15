'use client';

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useRouter } from 'expo-router';
import { toast } from 'sonner';
import { FollowButton } from '@/components/common/FollowButton';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Channel } from '@/lib/types/channel.types';
import { config } from '~/lib/config';
import { useTheme } from '~/lib/providers/theme/ThemeProvider';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.6,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.6,
  },
  channelList: {
    flex: 1,
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '500',
  },
  channelInfo: {
    flex: 1,
    marginRight: 16,
  },
  channelName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  channelDescription: {
    fontSize: 14,
    opacity: 0.6,
    flex: 1,
    flexWrap: 'nowrap',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
  },
  showMore: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default function ExplorePage() {
  const { user } = useAuth();
  const [channels, setChannels] = React.useState<Channel[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { theme } = useTheme();
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

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
        console.error('Error fetching channels:', error);
        setError('Failed to load channels. Please try again.');
        toast.error('Failed to load channels');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChannels();
  }, []);

  const renderItem = useCallback(({ item, index }: { item: Channel; index: number }) => (
    <Animated.View
      style={[
        styles.channelItem,
        {
          backgroundColor: colorScheme.colors.card,
          borderColor: colorScheme.colors.border,
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
        onPress={() => router.push(`/${item.username}`)}
      >
        <View style={[styles.avatar, { backgroundColor: colorScheme.colors.background }]}>
          <Text style={[styles.avatarText, { color: colorScheme.colors.text }]}>
            {item.username?.[0]?.toUpperCase() || '#'}
          </Text>
        </View>
        <View style={styles.channelInfo}>
          <Text style={[styles.channelName, { color: colorScheme.colors.text }]} numberOfLines={1}>
            {item.username}
          </Text>
          <Text style={[styles.channelDescription, { color: colorScheme.colors.text }]} numberOfLines={1}>
            {item.stateName || 'No description available'}
          </Text>
        </View>
      </TouchableOpacity>
      <FollowButton
        username={item.username}
        initialFollowing={false}
      />
    </Animated.View>
  ), [colorScheme, router, fadeAnim]);

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colorScheme.colors.background }]}>
        <Text style={[styles.errorText, { color: colorScheme.colors.text }]}>
          {error}
        </Text>
        <Text style={[styles.errorSubText, { color: colorScheme.colors.text }]}>
          There was a problem loading the channels. This could be due to a network issue or the server might be unavailable.
        </Text>
        <Button onPress={() => window.location.reload()}>
          Try Again
        </Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
      {isLoading ? (
        <View style={[styles.loadingContainer, { backgroundColor: colorScheme.colors.background }]}>
          <ActivityIndicator size="large" color={colorScheme.colors.primary} />
          <Text style={[styles.loadingText, { color: colorScheme.colors.text }]}>
            Loading channels...
          </Text>
        </View>
      ) : channels.length > 0 ? (
        <FlashList
          data={channels}
          renderItem={renderItem}
          estimatedItemSize={72}
          contentContainerStyle={{
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 16,
            paddingHorizontal: 16,
          }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={[styles.emptyState, { backgroundColor: colorScheme.colors.background }]}>
          <Text style={[styles.emptyStateText, { color: colorScheme.colors.text }]}>
            No channels found
          </Text>
        </View>
      )}
    </View>
  );
} 