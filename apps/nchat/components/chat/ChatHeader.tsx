import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Text } from '~/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { cn } from '~/lib/utils';

interface ChatHeaderProps {
  goatName: string;
  subgroupName: string;
  avatar: string;
  onBackPress?: () => void;
}

export function ChatHeader({ goatName, subgroupName, avatar, onBackPress }: ChatHeaderProps) {
  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.push('/(tabs)/chats');
    }
  };

  const handleSearch = () => {
    router.push('/search');
  };

  return (
    <View className="flex-row items-center justify-between bg-primary px-3 py-2">
      <View className="flex-row items-center flex-1">
        <TouchableOpacity onPress={handleBack} className="p-1 mr-3">
          <Ionicons name="arrow-back" size={24} color="hsl(var(--primary-foreground))" />
        </TouchableOpacity>
        <Image 
          source={{ uri: avatar }} 
          className="w-10 h-10 rounded-full mr-3"
        />
        <View className="flex-1">
          <Text className="text-base font-semibold text-primary-foreground mb-0.5">{goatName}</Text>
          <Text className="text-sm text-primary-foreground/70">{subgroupName}</Text>
        </View>
      </View>
      <View className="flex-row items-center">
        <TouchableOpacity className="p-2" onPress={handleSearch}>
          <Ionicons name="search" size={24} color="hsl(var(--primary-foreground))" />
        </TouchableOpacity>
        <TouchableOpacity className="p-2 ml-1">
          <Ionicons name="ellipsis-vertical" size={24} color="hsl(var(--primary-foreground))" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default ChatHeader; 