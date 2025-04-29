import { useScrollToTop } from '@react-navigation/native';
import * as React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, SafeAreaView } from 'react-native';
import { Input } from '~/components/ui/input';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';
import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { useRouter } from 'expo-router';
import { useChannels } from '~/lib/hooks/useChannels';
import { Channel } from '~/lib/types/channel.types';
import OverviewScreen from '~/components/dashboard/overview';
import { MaterialIcons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const [search, setSearch] = React.useState('');
  const ref = React.useRef(null);
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();
  const router = useRouter();
  const { channels, isLoading } = useChannels('janedoe');
  const { width } = useWindowDimensions();
  
  useScrollToTop(ref);

  const isDesktop = width >= 768;
  const isDarkMode = colorScheme.colors.text === '#ffffff' || colorScheme.colors.background === '#000000';
  const subtitleColor = isDarkMode ? 'rgba(255,255,255,0.7)' : '#64748B';

  const handleChannelPress = (channel: Channel) => {
    router.push(`/dashboard/${channel.username}/chat`);
  };

  const handleInfoPress = (channel: Channel) => {
    router.push(`/dashboard/${channel.username}/create-message`);
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
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
      <ScrollView 
        ref={ref}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.mainContent, isDesktop && { maxWidth: 1200, alignSelf: 'center', width: '100%' }]}>
          {/* Search */}
          <View style={styles.searchContainer}>
            <Input
              placeholder='Search channels...'
              clearButtonMode='always'
              value={search}
              onChangeText={setSearch}
              style={styles.input}
            />
          </View>
          
          {/* Overview Section */}
          <View style={[styles.overviewContainer, isDesktop && { flexDirection: 'row', gap: Number(design.spacing.gap) }]}>
            <View style={[styles.overviewCard, isDesktop && { flex: 1 }]}>
              <OverviewScreen />
            </View>
          </View>

          {/* Channels List */}
          <View style={[styles.channelsContainer, isDesktop && { flexDirection: 'row', flexWrap: 'wrap', gap: Number(design.spacing.gap) }]}>
            {channels?.map((channel) => {
              const transformedChannel = transformChannel(channel);
              const relatedChannels = transformedChannel.related_channels || [];
              
              return (
                <Card 
                  key={transformedChannel.username} 
                  style={[styles.channelCard, isDesktop && { flex: 1, minWidth: 300, maxWidth: '48%' }]}
                >
                  <View style={styles.channelHeader}>
                    <View style={[styles.channelAvatar, { backgroundColor: `${colorScheme.colors.primary}1A` }]}>
                      <MaterialIcons name="person" size={24} color={colorScheme.colors.primary} />
                    </View>
                  </View>

                  <View style={styles.channelActions}>
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: `${colorScheme.colors.primary}1A` }]}
                      onPress={() => handleInfoPress(transformedChannel)}
                    >
                      <Text style={{ color: colorScheme.colors.primary }}>Message</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  mainContent: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    marginTop: 16,
  },
  input: {
    width: '100%',
  },
  overviewContainer: {
    marginBottom: 16,
  },
  overviewCard: {
    backgroundColor: 'transparent',
  },
  quickActionsContainer: {
    marginBottom: 16,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'transparent',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  channelsContainer: {
    flex: 1,
  },
  channelCard: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  channelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  channelAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  channelInfo: {
    flex: 1,
  },
  channelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  channelDescription: {
    fontSize: 14,
  },
  channelActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 4,
  },
});


