"use client"

import React from 'react'
import { View, StyleSheet, ScrollView, useWindowDimensions } from 'react-native'
import { Channel } from "@/lib/types/channel.types"
import Link from "next/link"
import { Text } from '~/components/ui/text'
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider'
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider'
import { Users, Plus } from 'lucide-react'

interface ChannelSidebarProps {
  username: string
  channelDetails: Channel
  selectedChannel: string
  isCompact?: boolean
}

const styles = StyleSheet.create({
  sidebar: {
    height: '100%',
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  mobileScrollView: {
    flex: 1,
  },
  mobileItem: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  selectedMobileItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  mobileLabel: {
    maxWidth: 60,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 8,
  },
  mobilePlusButton: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedChannelItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  channelIcon: {
    marginRight: 12,
  },
  channelInfo: {
    flex: 1,
  },
  channelName: {
    fontWeight: '600',
  },
  channelStatus: {
    opacity: 0.7,
  },
});

export function ChannelSidebar({
  username,
  channelDetails,
  selectedChannel,
  isCompact = false
}: ChannelSidebarProps) {
  const { colorScheme } = useColorScheme()
  const { design } = useDesign()
  const { width } = useWindowDimensions()

  const sidebarStyle = {
    ...styles.sidebar,
    backgroundColor: colorScheme.colors.background,
    borderRightColor: colorScheme.colors.border,
    width: isCompact ? 72 : 320,
  }

  const channelItemStyle = {
    ...styles.channelItem,
    backgroundColor: colorScheme.colors.card,
    borderColor: colorScheme.colors.border,
    padding: isCompact ? 8 : 16,
    flexDirection: isCompact ? 'column' : 'row',
    alignItems: 'center',
    gap: isCompact ? 4 : 12,
  }

  const textStyle = {
    color: colorScheme.colors.text,
    fontSize: isCompact ? 10 : Number(design.spacing.fontSize.base),
    textAlign: isCompact ? 'center' as const : 'left' as const,
  }

  const mutedTextStyle = {
    color: colorScheme.colors.text,
    fontSize: Number(design.spacing.fontSize.sm),
    opacity: 0.7,
  }

  if (isCompact) {
    return (
      <View style={sidebarStyle}>
        <ScrollView style={styles.mobileScrollView}>
          {/* Main Channel */}
          <Link href={`/${username}`}>
            <View style={[
              styles.mobileItem,
              selectedChannel === username && styles.selectedMobileItem
            ]}>
              <Users size={24} color={colorScheme.colors.text} />
              <Text style={[textStyle, styles.mobileLabel]} numberOfLines={1}>
                {username}
              </Text>
            </View>
          </Link>

          {channelDetails.related_channels && channelDetails.related_channels.length > 0 && (
            <View style={[styles.divider, { backgroundColor: colorScheme.colors.border }]} />
          )}

          {/* Related Channels */}
          {channelDetails.related_channels?.map((related) => (
            <Link href={`/${related.username}`} key={related.username}>
              <View style={[
                styles.mobileItem,
                selectedChannel === related.username && styles.selectedMobileItem
              ]}>
                <Users size={24} color={colorScheme.colors.text} />
                <Text style={[textStyle, styles.mobileLabel]} numberOfLines={1}>
                  {related.username}
                </Text>
              </View>
            </Link>
          ))}
        </ScrollView>
        <View style={[styles.mobilePlusButton, { borderTopColor: colorScheme.colors.border }]}>
          <Plus size={24} color={colorScheme.colors.text} />
        </View>
      </View>
    )
  }

  return (
    <View style={sidebarStyle}>
      <ScrollView style={styles.mobileScrollView}>
        {/* Main Channel */}
        <Link href={`/${username}`}>
          <View style={[
            styles.channelItem,
            selectedChannel === username && styles.selectedChannelItem
          ]}>
            <View style={styles.channelIcon}>
              <Users size={24} color={colorScheme.colors.text} />
            </View>
            <View style={styles.channelInfo}>
              <Text style={[textStyle, styles.channelName]}>
                @{username}
              </Text>
              <Text style={[mutedTextStyle, styles.channelStatus]}>
                {channelDetails.is_public ? 'Public Channel' : 'Private Channel'}
              </Text>
            </View>
          </View>
        </Link>

        {channelDetails.related_channels && channelDetails.related_channels.length > 0 && (
          <View style={[styles.divider, { backgroundColor: colorScheme.colors.border }]} />
        )}

        {/* Related Channels */}
        {channelDetails.related_channels?.map((related) => (
          <Link href={`/${related.username}`} key={related.username}>
            <View style={[
              styles.channelItem,
              selectedChannel === related.username && styles.selectedChannelItem
            ]}>
              <View style={styles.channelIcon}>
                <Users size={24} color={colorScheme.colors.text} />
              </View>
              <View style={styles.channelInfo}>
                <Text style={[textStyle, styles.channelName]}>
                  @{related.username}
                </Text>
                <Text style={[mutedTextStyle, styles.channelStatus]}>
                  {related.is_public ? 'Public Channel' : 'Private Channel'}
                </Text>
              </View>
            </View>
          </Link>
        ))}
      </ScrollView>
      <View style={[styles.mobilePlusButton, { borderTopColor: colorScheme.colors.border }]}>
        <Plus size={24} color={colorScheme.colors.text} />
      </View>
    </View>
  )
} 