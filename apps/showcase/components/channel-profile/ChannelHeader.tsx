"use client"

import React from 'react'
import { View, StyleSheet, useWindowDimensions } from 'react-native'
import { ChevronLeft, Settings } from 'lucide-react'
import Link from 'next/link'
import { Text } from '~/components/ui/text'
import { Button } from '~/components/ui/button'
import { Channel } from '@/lib/types/channel.types'
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider'
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider'

interface ChannelHeaderProps {
  username: string
  channelDetails: Channel
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    padding: 8,
    borderRadius: 9999,
    backgroundColor: 'transparent',
  },
  usernameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  settingsButton: {
    padding: 8,
    borderRadius: 9999,
    backgroundColor: 'transparent',
  },
});

export function ChannelHeader({ username, channelDetails }: ChannelHeaderProps) {
  const { colorScheme } = useColorScheme()
  const { design } = useDesign()
  const { width } = useWindowDimensions()
  const isMobile = width < 768

  const headerStyle = {
    ...styles.header,
    backgroundColor: colorScheme.colors.background,
    borderBottomColor: colorScheme.colors.border,
  }

  const textStyle = {
    color: colorScheme.colors.text,
    fontSize: isMobile ? 14 : 16,
  }

  const backButtonStyle = {
    ...styles.backButton,
    backgroundColor: colorScheme.colors.card,
  }

  const settingsButtonStyle = {
    ...styles.settingsButton,
    backgroundColor: colorScheme.colors.card,
  }

  return (
    <View style={headerStyle}>
      <View style={styles.leftSection}>
        <Link 
          href="/explore" 
          className="text-muted-foreground hover:text-foreground"
          aria-label="Back to channels"
        >
          <View style={backButtonStyle}>
            <ChevronLeft 
              size={isMobile ? 20 : 24} 
              color={colorScheme.colors.text} 
            />
          </View>
        </Link>
        <Text style={[textStyle, styles.usernameText]}>
          @{username}
        </Text>
      </View>

      <View style={styles.rightSection}>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Channel settings"
        >
          <View style={settingsButtonStyle}>
            <Settings 
              size={isMobile ? 20 : 24} 
              color={colorScheme.colors.text} 
            />
          </View>
        </Button>
      </View>
    </View>
  )
} 