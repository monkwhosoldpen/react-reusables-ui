"use client"

import React from 'react'
import { View, ScrollView, Pressable, useColorScheme } from 'react-native'
import { Channel } from "~/lib/core/types/channel.types"
import { Text } from '~/components/ui/text'
import { Users, Settings, Home, X, Twitter } from 'lucide-react'
import { useRouter } from 'expo-router'

interface ChannelSidebarProps {
  username: string
  channelDetails: Channel
  selectedChannel: string
  sidebarWidth: number
}

const getUsernameColor = (channel: Channel) => {
  if (channel.is_agent) return 'text-green-600 dark:text-green-400'
  if (channel.is_owner_db) return 'text-red-600 dark:text-red-400'
  return 'text-blue-600 dark:text-blue-400'
}

export function ChannelSidebar({
  username,
  channelDetails,
  selectedChannel,
  sidebarWidth,
}: ChannelSidebarProps) {
  const router = useRouter()
  const isPrivate = channelDetails?.is_owner_db
  const mainChannelUsername = isPrivate ? channelDetails.owner_username : username

  const handleChannelPress = (channelUsername: string) => {
    router.push(`/${channelUsername}`)
  }

  const handleSettingsPress = () => {
  }

  return (
    <View style={{ width: sidebarWidth }} className="h-full border-r border-border bg-white dark:bg-gray-800">
      <View className="flex-1">
        <ScrollView className="flex-1">
          {/* Main Channel */}
          <Pressable onPress={() => handleChannelPress(mainChannelUsername)}>
            <View className={`flex-col items-center py-2 px-1 m-1 shadow-sm ${
              selectedChannel === mainChannelUsername 
                ? 'bg-gray-50 dark:bg-gray-700/50' 
                : 'bg-white dark:bg-gray-800'
            }`}>
              <View className="w-12 h-12 rounded-full bg-black dark:bg-white items-center justify-center shadow-sm">
                <Twitter size={24} className="text-white dark:text-black" />
              </View>
              <View className="flex-col items-center">
                <Text 
                  className="text-[10px] text-center mt-1.5 font-medium px-1 w-full text-gray-900 dark:text-white"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {mainChannelUsername}
                </Text>
              </View>
            </View>
          </Pressable>

          {/* Related Channels */}
          {channelDetails.related_channels
            ?.filter(related => 
              related.username !== mainChannelUsername
            )
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
                  className={`text-[10px] text-center mt-1.5 px-1 w-full ${getUsernameColor(related)}`}
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
              className="text-[10px] text-center mt-1.5 font-medium text-gray-900 dark:text-white"
            >
              Settings
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
} 