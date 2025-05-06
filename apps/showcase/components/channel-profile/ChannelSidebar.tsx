"use client"

import React from 'react'
import { View, ScrollView, Pressable } from 'react-native'
import { Channel } from "~/lib/core/types/channel.types"
import { Text } from '~/components/ui/text'
import { useColorScheme } from '~/lib/core/providers/theme/ColorSchemeProvider'
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
  const { colorScheme } = useColorScheme()
  const router = useRouter()

  const handleChannelPress = (channelUsername: string) => {
    router.push(`/${channelUsername}`)
  }

  return (
    <View style={{ width: sidebarWidth }} className="h-full border-r border-border bg-background">
      <ScrollView className="flex-1">
        {/* Parent Channel */}
        {channelDetails.parent_channel && (
          <Pressable onPress={() => handleChannelPress(channelDetails.parent_channel.username)}>
            <View className={`flex-col items-center py-0.5 px-0 rounded-lg m-0. ${
              selectedChannel === channelDetails.parent_channel.username ? 'bg-muted' : 'bg-card'
            }`}>
              <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
                <Users size={16} color={colorScheme.colors.primary} />
              </View>
              <Text 
                className="text-[9px] text-center mt-0.5 font-medium px-1 w-full"
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
            <View className={`flex-col items-center py-0.5 px-0 ${
              selectedChannel === related.username ? 'bg-muted' : 'bg-card'
            }`}>
              <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
                <Users size={16} color={colorScheme.colors.primary} />
              </View>
              <Text 
                className="text-[9px] text-center mt-0.5 px-1 w-full"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {related.username}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  )
} 