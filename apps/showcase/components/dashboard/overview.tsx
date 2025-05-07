import React from 'react';
import { View, ScrollView, useColorScheme } from 'react-native';
import { Text } from '~/components/ui/text';
import { Avatar, AvatarImage } from '~/components/ui/avatar';
import { useChannels } from '~/lib/enhanced-chat/hooks/useChannels';
import { MaterialIcons } from "@expo/vector-icons";

export default function OverviewScreen() {
  const colorScheme = useColorScheme();
  const { channels, isLoading, error } = useChannels('janedoe');
  const mainChannel = channels[0];

  // Color scheme based styles
  const iconColor = colorScheme === 'dark' ? '#fff' : '#111827';
  const avatarBg = colorScheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200';
  const subtitleColor = colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const borderColor = colorScheme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const bgColor = colorScheme === 'dark' ? 'bg-gray-900' : 'bg-white';
  const cardBg = colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white';

  if (isLoading) {
    return (
      <View className={`flex-1 ${bgColor} items-center justify-center`}>
        <Text className="text-gray-600 dark:text-gray-300">Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className={`flex-1 ${bgColor} items-center justify-center`}>
        <Text className="text-red-500 dark:text-red-400">
          Error: {error}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      className={`flex-1 ${bgColor}`}
      contentContainerClassName="p-4"
    >
      {/* Profile Section */}
      <View className={`${cardBg} rounded-xl shadow-sm overflow-hidden mb-5`}>
        <View className="p-4">
          <View className="flex-row items-center mb-4">
            <Avatar 
              className="h-20 w-20 mr-4"
              style={{ borderWidth: 2, borderColor: colorScheme === 'dark' ? '#1F2937' : '#F3F4F6' }}
              alt={mainChannel?.username}
            >
              <AvatarImage source={{ uri: 'https://placehold.co/150' }} />
            </Avatar>
            <View className="flex-1">
              <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                {mainChannel?.username}
              </Text>
              <Text className="text-base text-gray-600 dark:text-gray-300">
                @{mainChannel?.username}
              </Text>
            </View>
          </View>

          <View className="mt-4">
            <View className="flex-row items-center mb-2">
              <MaterialIcons name="location-on" size={20} color={iconColor} className="mr-2" />
              <Text className={`text-base ${subtitleColor}`}>
                {mainChannel?.stateName || 'No location set'}
              </Text>
            </View>
            <View className="flex-row items-center">
              <MaterialIcons name="people" size={20} color={iconColor} className="mr-2" />
              <Text className={`text-base ${subtitleColor}`}>
                {channels.length - 1} Related Channels
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
} 