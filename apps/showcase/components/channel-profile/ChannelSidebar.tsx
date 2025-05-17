"use client"

import React from 'react'
import { View, ScrollView, Pressable, useColorScheme } from 'react-native'
import { Channel } from "~/lib/core/types/channel.types"
import { Text } from '~/components/ui/text'
import { Users, Settings } from 'lucide-react'
import { useRouter } from 'expo-router'

interface ChannelSidebarProps {
  username: string
  channelDetails: Channel
  selectedChannel: string
  sidebarWidth: number
}

export function ChannelSidebar({
  username,
  channelDetails,
  selectedChannel,
  sidebarWidth,
}: ChannelSidebarProps) {
  const router = useRouter()

  const handleChannelPress = (channelUsername: string) => {
    router.push(`/${channelUsername}`)
  }

  const handleSettingsPress = () => {
    console.log('Settings pressed')
  }

  return (
    <View style={{ width: sidebarWidth }} className="h-full border-r border-border bg-white dark:bg-gray-800">
      <View className="flex-1">
        <ScrollView className="flex-1">
          {/* Parent Channel */}
          {channelDetails.parent_channel && (
            <Pressable onPress={() => handleChannelPress(channelDetails.parent_channel.username)}>
              <View className={`flex-col items-center py-2 px-1 m-1 shadow-sm ${
                selectedChannel === channelDetails.parent_channel.username 
                  ? 'bg-gray-50 dark:bg-gray-700/50' 
                  : 'bg-white dark:bg-gray-800'
              }`}>
                <View className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center shadow-sm">
                  <Users size={20} />
                </View>
                <Text 
                  className="text-xs text-center mt-1.5 font-medium px-1 w-full text-gray-900 dark:text-white"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {channelDetails.parent_channel.username}
                </Text>
              </View>
            </Pressable>
          )}

          {/* Related Channels */}
          {channelDetails.related_channels
            ?.sort((a, b) => a.username.localeCompare(b.username))
            .map((related) => (
            <Pressable key={related.username} onPress={() => handleChannelPress(related.username)}>
              <View className={`flex-col items-center py-2 px-1 m-1 shadow-sm ${
                selectedChannel === related.username 
                  ? 'bg-gray-50 dark:bg-gray-700/50' 
                  : 'bg-white dark:bg-gray-800'
              }`}>
                <View className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center shadow-sm">
                  <Users size={20} />
                </View>
                <Text 
                  className="text-xs text-center mt-1.5 px-1 w-full text-gray-900 dark:text-white"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {related.username}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* Settings Section */}
        <View className="border-t border-gray-200 dark:border-gray-700 mt-2">
          <Pressable 
            onPress={handleSettingsPress}
            className="flex-col items-center py-3 px-1"
          >
            <View className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center shadow-sm">
              <Settings size={20} />
            </View>
            <Text 
              className="text-xs text-center mt-1.5 font-medium text-gray-900 dark:text-white"
            >
              Settings
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
} 