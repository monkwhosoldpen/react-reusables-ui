import { useScrollToTop } from '@react-navigation/native';
import * as React from 'react';
import { View, ScrollView, TouchableOpacity, useWindowDimensions, SafeAreaView } from 'react-native';
import { Input } from '~/components/ui/input';
import { useColorScheme } from '~/lib/core/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/core/providers/theme/DesignSystemProvider';
import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { useRouter } from 'expo-router';
import { useChannels } from '~/lib/enhanced-chat/hooks/useChannels';
import { Channel } from '~/lib/core/types/channel.types';
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
    <SafeAreaView className="flex-1 bg-background dark:bg-gray-900">
      <ScrollView 
        ref={ref}
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className={`flex-1 p-4 ${isDesktop ? 'max-w-[1200px] self-center w-full' : ''}`}>
          {/* Search */}
          <View className="mt-4">
            <Input
              placeholder='Search channels...'
              clearButtonMode='always'
              value={search}
              onChangeText={setSearch}
              className="w-full"
            />
          </View>
          
          {/* Overview Section */}
          <View className={`mb-4 ${isDesktop ? 'flex-row gap-4' : ''}`}>
            <View className={`bg-transparent ${isDesktop ? 'flex-1' : ''}`}>
              <OverviewScreen />
            </View>
          </View>

          {/* Channels List */}
          <View className={`flex-1 ${isDesktop ? 'flex-row flex-wrap gap-4' : ''}`}>
            {channels?.map((channel) => {
              debugger
              const transformedChannel = transformChannel(channel);
              debugger
              const relatedChannels = transformedChannel.related_channels || [];
              
              return (
                <Card 
                  key={transformedChannel.username} 
                  className={`mb-4 p-4 bg-card dark:bg-gray-800 shadow-sm ${isDesktop ? 'flex-1 min-w-[300px] max-w-[48%]' : ''}`}
                >
                  <View className="flex-row items-center mb-3">
                    <View 
                      className="w-12 h-12 rounded-full justify-center items-center mr-3"
                      style={{ backgroundColor: `${colorScheme.colors.primary}1A` }}
                    >
                      <MaterialIcons name="person" size={24} color={colorScheme.colors.primary} />
                    </View>
                  </View>

                  <View className="flex-row justify-end gap-2">
                    <TouchableOpacity 
                      className="p-2 rounded"
                      style={{ backgroundColor: `${colorScheme.colors.primary}1A` }}
                      onPress={() => handleInfoPress(transformedChannel)}
                    >
                      <Text>{transformedChannel.username}</Text>
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


