"use client"

import React from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Channel } from "@/lib/types/channel.types"
import Link from "next/link"
import { Text } from '~/components/ui/text'
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider'
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider'

interface ChannelSidebarProps {
  username: string
  channelDetails: Channel
  selectedChannel: string
}

export function ChannelSidebar({
  username,
  channelDetails,
  selectedChannel
}: ChannelSidebarProps) {
  const { colorScheme } = useColorScheme()
  const { design } = useDesign()

  const sidebarStyle = {
    ...styles.sidebar,
    backgroundColor: colorScheme.colors.background,
    borderRightColor: colorScheme.colors.border,
  }

  const channelItemStyle = {
    ...styles.channelItem,
    backgroundColor: colorScheme.colors.card,
    borderColor: colorScheme.colors.border,
  }

  const textStyle = {
    color: colorScheme.colors.text,
    fontSize: Number(design.spacing.fontSize.base),
  }

  const mutedTextStyle = {
    color: colorScheme.colors.text,
    fontSize: Number(design.spacing.fontSize.sm),
    opacity: 0.7,
  }

  return (
    <View style={sidebarStyle}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.channelList}>
          {channelDetails.related_channels?.map((related) => (
            <Link href={`/${related.username}`} key={related.username}>
              <View style={channelItemStyle}>
                <Text style={textStyle} className="font-medium">
                  @{related.username}
                </Text>
              </View>
            </Link>
          ))}

          {(!channelDetails.related_channels || channelDetails.related_channels.length === 0) && (
            <Text style={mutedTextStyle}>
              No related channels.
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  sidebar: {
    display: 'none',
    width: 320,
    borderRightWidth: StyleSheet.hairlineWidth,
    flexDirection: 'column',
    backgroundColor: 'background',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  channelList: {
    gap: 8,
  },
  channelItem: {
    padding: 16,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
}) 