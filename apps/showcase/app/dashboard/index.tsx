import { useScrollToTop } from '@react-navigation/native';
import * as React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Input } from '~/components/ui/input';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';
import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { useRouter } from 'expo-router';
import { useChannels } from '~/lib/hooks/useChannels';
import { Channel } from '~/lib/types/channel.types';
import OverviewScreen from '~/components/dashboard/overview';

export default function DashboardScreen() {
  const [search, setSearch] = React.useState('');
  const ref = React.useRef(null);
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();
  const router = useRouter();
  const { channels, isLoading } = useChannels('janedoe');
  
  useScrollToTop(ref);

  const searchContainerStyle = {
    paddingVertical: Number(design.spacing.padding.card),
  };

  const handleChannelPress = (channel: Channel) => {
    router.push(`/dashboard/${channel.username}/chat`);
  };

  const handleInfoPress = (channel: Channel) => {
    router.push(`/dashboard/${channel.username}/channel-info`);
  };

  const handleRelatedChannelsPress = (channel: Channel) => {
    router.push(`/dashboard/${channel.username}/related-channels`);
  };

  const handleTenantRequestsPress = () => {
    router.push('/dashboard/tenant-requests');
  };

  const handleAIDashboardPress = () => {
    router.push('/dashboard/ai-dashboard');
  };

  const transformChannel = (channel: any): Channel => {
    return {
      ...channel,
      is_enhanced_chat: false,
      custom_properties: channel.custom_properties || {},
      related_channels: channel.related_channels || []
    };
  };

  return (
    <View style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
      <View style={[styles.searchContainer, searchContainerStyle]}>
        <Input
          placeholder='Search channels...'
          clearButtonMode='always'
          value={search}
          onChangeText={setSearch}
          style={styles.input}
        />
      </View>
      
      {/* Overview Section */}
      <View style={styles.overviewContainer}>
        <OverviewScreen />
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={handleTenantRequestsPress}
        >
          <Text style={styles.quickActionText}>Tenant Requests</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={handleAIDashboardPress}
        >
          <Text style={styles.quickActionText}>AI Dashboard</Text>
        </TouchableOpacity>
      </View>

      {/* Channels List */}
      <ScrollView style={styles.channelsContainer}>
        {channels?.map((channel) => {
          const transformedChannel = transformChannel(channel);
          const relatedChannels = transformedChannel.related_channels || [];
          
          return (
            <Card key={transformedChannel.username} style={styles.channelCard}>
              <View style={styles.channelHeader}>
                <Text style={styles.channelTitle}>{transformedChannel.username}</Text>
                <Text style={styles.channelDescription}>{transformedChannel.custom_properties.description || 'No description'}</Text>
              </View>
              
              {/* Related Channels Preview */}
              {relatedChannels.length > 0 && (
                <View style={styles.relatedChannelsContainer}>
                  <Text style={styles.relatedChannelsTitle}>Related Channels:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.relatedChannelsList}>
                    {relatedChannels.map((related: any) => (
                      <TouchableOpacity 
                        key={related.username}
                        style={styles.relatedChannelItem}
                        onPress={() => handleChannelPress(related)}
                      >
                        <Text style={styles.relatedChannelText}>{related.username}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <View style={styles.channelActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleChannelPress(transformedChannel)}
                >
                  <Text>Chat</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleInfoPress(transformedChannel)}
                >
                  <Text>Info</Text>
                </TouchableOpacity>
                {relatedChannels.length > 0 && (
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleRelatedChannelsPress(transformedChannel)}
                  >
                    <Text>View All Related</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    width: '100%',
  },
  input: {
    width: '100%',
  },
  overviewContainer: {
    padding: 16,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  quickActionButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  channelsContainer: {
    flex: 1,
    padding: 16,
  },
  channelCard: {
    marginBottom: 16,
    padding: 16,
  },
  channelHeader: {
    marginBottom: 12,
  },
  channelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  channelDescription: {
    fontSize: 14,
    color: '#666',
  },
  relatedChannelsContainer: {
    marginBottom: 12,
  },
  relatedChannelsTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#666',
  },
  relatedChannelsList: {
    flexDirection: 'row',
  },
  relatedChannelItem: {
    padding: 6,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  relatedChannelText: {
    fontSize: 12,
  },
  channelActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
});


