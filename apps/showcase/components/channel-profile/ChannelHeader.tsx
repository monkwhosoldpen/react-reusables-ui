"use client"

import React from 'react'
import { View, TouchableOpacity, Image } from 'react-native'
import { ChevronLeft } from 'lucide-react-native'
import { useRouter } from 'expo-router'
import { Text } from '~/components/ui/text'
import { Channel } from '~/lib/core/types/channel.types'
import LanguageChanger from '~/components/common/LanguageChanger'

interface ChannelHeaderProps {
  username: string
  channelDetails: Channel
  onBack?: () => void
}

export function ChannelHeader({ username, channelDetails, onBack }: ChannelHeaderProps) {
  const router = useRouter();

  return (
    <View className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <View className="w-full max-w-[1200px] self-center">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3 flex-1 min-w-0">
            <TouchableOpacity 
              onPress={onBack || (() => router.push('/'))}
              className="p-2"
            >
              <ChevronLeft size={24} className="text-gray-900 dark:text-white" />
            </TouchableOpacity>
            <View className="w-10 h-10 rounded-full items-center justify-center bg-gray-200 dark:bg-gray-700 flex-shrink-0">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                {username[0]?.toUpperCase() || '#'}
              </Text>
            </View>
            <View className="flex-1 min-w-0">
              <Text 
                className={`text-lg font-semibold ${channelDetails.is_premium ? 'text-yellow-500' : 'text-gray-900 dark:text-white'}`}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                @{username}
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-300">
                {channelDetails.stateName || 'No state'}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-2 flex-shrink-0">
            <LanguageChanger variant="settings" />
          </View>
        </View>
      </View>
    </View>
  )
} 