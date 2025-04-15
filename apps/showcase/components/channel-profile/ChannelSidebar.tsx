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
            <View style={styles.divider} />
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
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.channelList}>
          {/* Main Channel */}
          <Link href={`/${username}`}>
            <View style={[
              channelItemStyle,
              selectedChannel === username && styles.selectedChannel
            ]}>
              <Users size={20} color={colorScheme.colors.text} />
              <View style={styles.channelInfo}>
                <Text style={textStyle} className="font-medium" numberOfLines={1}>
                  @{username}
                </Text>
                <Text style={mutedTextStyle} className="mt-1">
                  Main Channel
                </Text>
              </View>
            </View>
          </Link>

          {/* Related Channels */}
          {channelDetails.related_channels?.map((related) => (
            <Link href={`/${related.username}`} key={related.username}>
              <View style={[
                channelItemStyle,
                selectedChannel === related.username && styles.selectedChannel
              ]}>
                <Users size={20} color={colorScheme.colors.text} />
                <View style={styles.channelInfo}>
                  <Text style={textStyle} className="font-medium" numberOfLines={1}>
                    @{related.username}
                  </Text>
                  {!isCompact && related.is_public && (
                    <Text style={mutedTextStyle} className="mt-1">
                      Public Channel
                    </Text>
                  )}
                </View>
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
    width: 320,
    borderRightWidth: StyleSheet.hairlineWidth,
    flexDirection: 'column',
    backgroundColor: 'background',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
  },
  channelList: {
    gap: 6,
  },
  channelItem: {
    padding: 12,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  selectedChannel: {
    borderColor: '#3b82f6',
    borderWidth: 1,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  mobileScrollView: {
    flex: 1,
    paddingVertical: 6,
  },
  mobileItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    gap: 3,
    borderRadius: 4,
  },
  selectedMobileItem: {
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  mobileLabel: {
    marginTop: 2,
    fontSize: 9,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    marginVertical: 6,
  },
  mobilePlusButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
  },
  channelInfo: {
    flex: 1,
  }
}) 