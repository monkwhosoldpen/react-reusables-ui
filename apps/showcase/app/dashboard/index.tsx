import { useScrollToTop } from '@react-navigation/native';
import * as React from 'react';
import { View, ScrollView, TouchableOpacity, useWindowDimensions, SafeAreaView, useColorScheme } from 'react-native';
import { Input } from '~/components/ui/input';
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
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { channels, isLoading } = useChannels('janedoe');
  const { width } = useWindowDimensions();
  
  useScrollToTop(ref);

  const isDesktop = width >= 768;
  const iconColor = colorScheme === 'dark' ? '#fff' : '#111827';
  const bgColor = colorScheme === 'dark' ? 'bg-gray-900' : 'bg-white';
  const cardBg = colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const borderColor = colorScheme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const textColor = colorScheme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const subtitleColor = colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600';

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
    <SafeAreaView className={`flex-1 ${bgColor}`}>
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
              className={`w-full ${bgColor} border ${borderColor}`}
              placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
            />
          </View>
          
          {/* Overview Section */}
          <View className={`mb-4 ${isDesktop ? 'flex-row gap-4' : ''}`}>
            <View className={`${isDesktop ? 'flex-1' : ''}`}>
              <OverviewScreen />
            </View>
          </View>

          {/* Channels List */}
          <View className={`flex-1 ${isDesktop ? 'flex-row flex-wrap gap-4' : ''}`}>
            {channels?.map((channel) => {
              const transformedChannel = transformChannel(channel);
              return (
                <Card 
                  key={transformedChannel.username} 
                  className={`mb-4 p-4 ${cardBg} shadow-sm rounded-xl ${isDesktop ? 'flex-1 min-w-[300px] max-w-[48%]' : ''}`}
                >
                  <View className="flex-row items-center mb-3">
                    <View 
                      className="w-12 h-12 rounded-full justify-center items-center mr-3 bg-blue-50 dark:bg-blue-900/30"
                    >
                      <MaterialIcons name="person" size={24} color="#3B82F6" />
                    </View>
                    <View className="flex-1">
                      <Text className={`text-lg font-semibold ${textColor}`}>
                        {transformedChannel.username}
                      </Text>
                      <Text className={subtitleColor}>
                        {transformedChannel.stateName || 'No location set'}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row justify-end gap-2">
                    <TouchableOpacity 
                      className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30"
                      onPress={() => handleInfoPress(transformedChannel)}
                    >
                      <Text className="text-blue-500 dark:text-blue-400 font-medium">Message</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
                      onPress={() => handleChannelPress(transformedChannel)}
                    >
                      <Text className={`${textColor} font-medium`}>Chat</Text>
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


