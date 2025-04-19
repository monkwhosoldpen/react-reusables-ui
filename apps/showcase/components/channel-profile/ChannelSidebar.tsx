"use client"

import React from 'react'
import { View, ScrollView, useWindowDimensions, Pressable } from 'react-native'
import { Channel } from "@/lib/types/channel.types"
import { Text } from '~/components/ui/text'
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider'
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider'
import { Users, Settings } from 'lucide-react'
import { useRouter } from 'expo-router'

interface ChannelSidebarProps {
  username: string
  channelDetails: Channel
  selectedChannel: string
}

export function ChannelSidebar({
  username,
  channelDetails,
  selectedChannel,
}: ChannelSidebarProps) {
  const { colorScheme } = useColorScheme()
  const { width: screenWidth } = useWindowDimensions()
  const sidebarWidth = Math.floor(screenWidth * 0.3)
  const isMobile = screenWidth < 768
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
            <View className={`flex-col items-center p-1.5 rounded-lg m-0.5 ${
              selectedChannel === channelDetails.parent_channel.username ? 'bg-muted' : 'bg-card'
            }`}>
              <View className="w-9 h-9 rounded-full bg-primary/10 items-center justify-center">
                <Users size={18} color={colorScheme.colors.primary} />
              </View>
              <Text className="text-[10px] text-center mt-0.5 font-medium">
                {channelDetails.parent_channel.username}
                <Text className="text-[8px] text-muted-foreground"> (Parent)</Text>
              </Text>
            </View>
          </Pressable>
        )}

        {/* Related Channels */}
        {channelDetails.related_channels
          ?.sort((a, b) => a.username.localeCompare(b.username))
          .map((related) => (
          <Pressable key={related.username} onPress={() => handleChannelPress(related.username)}>
            <View className={`flex-col items-center p-1.5 rounded-lg m-0.5 ${
              selectedChannel === related.username ? 'bg-muted' : 'bg-card'
            }`}>
              <View className="w-9 h-9 rounded-full bg-primary/10 items-center justify-center">
                <Users size={18} color={colorScheme.colors.primary} />
              </View>
              <Text className="text-[10px] text-center mt-0.5">
                {related.username}
                {related.is_agent && (
                  <Text className="text-[8px] text-muted-foreground"> (Agent)</Text>
                )}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  )
} 