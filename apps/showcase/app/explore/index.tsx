'use client';

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'expo-router';
import { toast } from 'sonner';
import { FollowButton } from '@/components/common/FollowButton';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Channel } from '@/lib/types/channel.types';
import { config } from '~/lib/config';
import { useTheme } from '~/lib/providers/theme/ThemeProvider';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
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
  },
  channelList: {
    paddingHorizontal: 16,
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  channelInfo: {
    flex: 1,
  },
  username: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  handle: {
    fontSize: 14,
  },
  showMore: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  showMoreText: {
    fontSize: 14,
    color: '#1DA1F2',
  }
});

export default function ExplorePage() {
  const { user } = useAuth();
  const [channels, setChannels] = React.useState<Channel[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { theme } = useTheme();
  const { colorScheme } = useColorScheme();

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

      <ScrollView style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <Text style={[styles.loadingText, { color: colorScheme.colors.text }]}>
              Loading suggestions...
            </Text>
          </View>
        ) : channels.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.headerText, { color: colorScheme.colors.text }]}>
              No suggestions found
            </Text>
          </View>
        ) : (
          <View style={styles.channelList}>
            {channels.map((channel, index) => (
              <View 
                key={index}
                style={[styles.channelItem, { borderBottomColor: colorScheme.colors.border }]}
              >
                <img
                  src={`https://placehold.co/100x100/emerald/white?text=${channel.username.substring(0, 2).toUpperCase()}`}
                  alt={channel.username}
                  className="w-12 h-12 rounded-full"
                  style={styles.avatar}
                />
                
                <View style={styles.channelInfo}>
                  <Link href={`/${channel.username}`}>
                    <Text style={[styles.username, { color: colorScheme.colors.text }]}>
                      {channel.username}
                    </Text>
                    <Text style={[styles.handle, { color: colorScheme.colors.text }]}>
                      @{channel.username}
                    </Text>
                  </Link>
                </View>

                <FollowButton 
                  username={channel.username} 
                  size="sm"
                  className="ml-2"
                  initialFollowing={channel.isFollowing}
                />
              </View>
            ))}

            <View style={styles.showMore}>
              <Text style={styles.showMoreText}>Show more</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
} 