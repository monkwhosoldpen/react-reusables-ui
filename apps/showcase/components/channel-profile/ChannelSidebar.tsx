"use client"

import React from 'react'
import { View, ScrollView, useWindowDimensions } from 'react-native'
import { Channel } from "@/lib/types/channel.types"
import Link from "next/link"
import { Text } from '~/components/ui/text'
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider'
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider'
import { Users, Settings } from 'lucide-react'

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
  const isMobile = screenWidth < 768 // Assuming mobile breakpoint at 768px

  return (
    <View style={{ width: sidebarWidth }} className="h-full border-r border-border bg-background">
      <ScrollView className="flex-1">
        {/* Main Channel */}
        <Link href={`/${username}`}>
          <View className={`flex-col items-center p-1.5 rounded-lg m-0.5 ${
            selectedChannel === username ? 'bg-muted' : 'bg-card'
          }`}>
            <View className="w-9 h-9 rounded-full bg-primary/10 items-center justify-center">
              <Users size={18} color={colorScheme.colors.primary} />
            </View>
            <Text className="text-[10px] text-center mt-0.5">{username}</Text>
          </View>
        </Link>

        {/* Related Channels */}
        {channelDetails.related_channels?.map((related) => (
          <Link href={`/${related.username}`} key={related.username}>
            <View className={`flex-col items-center p-1.5 rounded-lg m-0.5 ${
              selectedChannel === related.username ? 'bg-muted' : 'bg-card'
            }`}>
              <View className="w-9 h-9 rounded-full bg-primary/10 items-center justify-center">
                <Users size={18} color={colorScheme.colors.primary} />
              </View>
              <Text className="text-[10px] text-center mt-0.5">{related.username}</Text>
            </View>
          </Link>
        ))}
      </ScrollView>

    </View>
  )
} 