"use client"

import React from 'react'
import { View, StyleSheet, ScrollView, useWindowDimensions } from 'react-native'
import { Channel } from "@/lib/types/channel.types"
import Link from "next/link"
import { Text } from '~/components/ui/text'
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider'
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider'
import { Users, Plus, Settings, MessageCircle } from 'lucide-react'

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
  header: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'transparent',
    borderRadius: 12,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mobileChannelItem: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 12,
    gap: 4,
  },
  selectedChannelItem: {
    backgroundColor: 'rgba(128,128,128,0.05)',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#E8EEF2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mobileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  channelContent: {
    flex: 1,
    marginRight: 12,
  },
  mobileChannelContent: {
    alignItems: 'center',
  },
  channelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  mobileChannelHeader: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  channelName: {
    fontWeight: '600',
    fontSize: 15,
    color: '#1E293B',
  },
  mobileChannelName: {
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 60,
    lineHeight: 14,
    color: '#1E293B',
  },
  timestamp: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  messagePreview: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 12,
    justifyContent: 'space-around',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  footerButton: {
    padding: 8,
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
  const isMobile = width < 768

  const sidebarStyle = {
    ...styles.sidebar,
    backgroundColor: colorScheme.colors.background,
    borderRightColor: colorScheme.colors.border,
    width: isCompact ? 72 : 320,
  }

  const textStyle = {
    color: colorScheme.colors.text,
  }

  return (
    <View style={sidebarStyle}>
      <ScrollView style={styles.scrollView}>
        {/* Main Channel */}
        <Link href={`/${username}`}>
          <View style={[
            isMobile ? styles.mobileChannelItem : styles.channelItem,
            selectedChannel === username && styles.selectedChannelItem,
            { backgroundColor: colorScheme.colors.card }
          ]}>
            <View style={[
              styles.avatar,
              isMobile && styles.mobileAvatar,
              { backgroundColor: colorScheme.colors.notification }
            ]}>
              <Users size={isMobile ? 20 : 24} color={colorScheme.colors.background} />
            </View>
            <View style={[isMobile ? styles.mobileChannelContent : styles.channelContent]}>
              <View style={[isMobile ? styles.mobileChannelHeader : styles.channelHeader]}>
                <Text style={[
                  isMobile ? styles.mobileChannelName : styles.channelName,
                  textStyle
                ]} numberOfLines={2}>
                  {username}
                </Text>
                {!isMobile && (
                  <Text style={[styles.timestamp, textStyle]}>
                    10:15
                  </Text>
                )}
              </View>
              {!isMobile && (
                <Text style={[styles.messagePreview, textStyle]} numberOfLines={1}>
                  {channelDetails.is_public ? 'Public Channel' : 'Private Channel'}
                </Text>
              )}
            </View>
          </View>
        </Link>

        {/* Related Channels */}
        {channelDetails.related_channels?.map((related) => (
          <Link href={`/${related.username}`} key={related.username}>
            <View style={[
              isMobile ? styles.mobileChannelItem : styles.channelItem,
              selectedChannel === related.username && styles.selectedChannelItem,
              { backgroundColor: colorScheme.colors.card }
            ]}>
              <View style={[
                styles.avatar,
                isMobile && styles.mobileAvatar,
                { backgroundColor: colorScheme.colors.notification }
              ]}>
                <Users size={isMobile ? 20 : 24} color={colorScheme.colors.background} />
              </View>
              <View style={[isMobile ? styles.mobileChannelContent : styles.channelContent]}>
                <View style={[isMobile ? styles.mobileChannelHeader : styles.channelHeader]}>
                  <Text style={[
                    isMobile ? styles.mobileChannelName : styles.channelName,
                    textStyle
                  ]} numberOfLines={2}>
                    {related.username}
                  </Text>
                  {!isMobile && (
                    <Text style={[styles.timestamp, textStyle]}>
                      9:45
                    </Text>
                  )}
                </View>
                {!isMobile && (
                  <Text style={[styles.messagePreview, textStyle]} numberOfLines={1}>
                    {related.is_public ? 'Public Channel' : 'Private Channel'}
                  </Text>
                )}
              </View>
            </View>
          </Link>
        ))}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colorScheme.colors.border }]}>
        <View style={styles.footerButton}>
          <Settings size={24} color={colorScheme.colors.text} />
        </View>
      </View>
    </View>
  )
} 