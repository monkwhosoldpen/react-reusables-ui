import React, { useState } from 'react';
import { View, TouchableOpacity, useColorScheme, ScrollView, Dimensions } from 'react-native';
import { Text } from '~/components/ui/text';
import { useRouter } from 'expo-router';
import { Avatar, AvatarImage } from '~/components/ui/avatar';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

interface SidebarProps {
  username: string;
  ownerUsername: string;
  clientType: string;
  relatedChannels?: Array<{
    username: string;
    is_premium?: boolean;
    is_public?: boolean;
  }>;
}

export function Sidebar({ username, ownerUsername, clientType, relatedChannels = [] }: SidebarProps) {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const windowWidth = Dimensions.get('window').width;
  const isMobile = windowWidth < 768;

  // Helper function to determine border color based on client type
  const getBorderColorClass = () => {
    if (clientType === 'basic') {
      return 'border-red-500 dark:border-red-600';
    }
    if (clientType === 'pro') {
      return 'border-blue-500 dark:border-blue-600';
    }
    return 'border-gray-500 dark:border-gray-600';
  };

  // Helper function to determine background color based on client type
  const getBgColorClass = (isActive: boolean) => {
    if (!isActive) return 'bg-white dark:bg-gray-800';
    
    if (clientType === 'basic') {
      return 'bg-red-50 dark:bg-red-900/30';
    }
    if (clientType === 'pro') {
      return 'bg-blue-50 dark:bg-blue-900/30';
    }
    return 'bg-gray-50 dark:bg-gray-800';
  };

  // Helper function to determine text color based on client type
  const getTextColorClass = (isActive: boolean) => {
    if (!isActive) return 'text-gray-600 dark:text-gray-400';
    
    if (clientType === 'basic') {
      return 'text-red-500 dark:text-red-400';
    }
    if (clientType === 'pro') {
      return 'text-blue-500 dark:text-blue-400';
    }
    return 'text-gray-900 dark:text-gray-100';
  };

  const renderChannelItem = (channelUsername: string, isOwner: boolean = false) => {
    const isActive = channelUsername === username;
    
    return (
      <TouchableOpacity
        key={channelUsername}
        className={`flex-row items-center p-3 rounded-lg mb-2 ${getBgColorClass(isActive)}`}
        onPress={() => router.push(`/dashboard/${channelUsername}`)}
      >
        <Avatar 
          className="h-8 w-8 mr-3"
          style={{ borderWidth: 2, borderColor: colorScheme === 'dark' ? '#1F2937' : '#F3F4F6' }}
          alt={channelUsername}
        >
          <AvatarImage source={{ uri: 'https://placehold.co/150' }} />
        </Avatar>
        {(!isMobile || isExpanded) && (
          <View className="flex-1">
            <Text className={`font-medium ${getTextColorClass(isActive)}`}>
              {channelUsername}
            </Text>
            {isOwner && (
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                Owner Channel
              </Text>
            )}
          </View>
        )}
        {isActive && (
          <View className={`w-2 h-2 rounded-full ${
            clientType === 'basic'
              ? 'bg-red-500'
              : clientType === 'pro'
              ? 'bg-blue-500'
              : 'bg-gray-500'
          }`} />
        )}
      </TouchableOpacity>
    );
  };

  const SidebarContent = () => (
    <ScrollView className="flex-1 p-4">
      {/* Owner Channel Section */}
      <View className="mb-6">
        {(!isMobile || isExpanded) && (
          <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
            Owner Channel
          </Text>
        )}
        {renderChannelItem(ownerUsername, true)}
      </View>

      {/* Related Channels Section */}
      {relatedChannels.length > 0 && (
        <View>
          {(!isMobile || isExpanded) && (
            <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
              Related Channels
            </Text>
          )}
          {relatedChannels.map(channel => renderChannelItem(channel.username))}
        </View>
      )}
    </ScrollView>
  );

  return (
    <View 
      className={`border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-all duration-300 ${
        isMobile ? (isExpanded ? 'w-64' : 'w-20') : 'w-64'
      }`}
    >
      {/* Toggle Button - Only visible on mobile */}
      {isMobile && (
        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          className="absolute -right-3 top-4 z-50 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md"
        >
          {isExpanded ? (
            <ChevronLeft size={16} color={colorScheme === 'dark' ? 'white' : 'black'} />
          ) : (
            <ChevronRight size={16} color={colorScheme === 'dark' ? 'white' : 'black'} />
          )}
        </TouchableOpacity>
      )}
      <SidebarContent />
    </View>
  );
} 