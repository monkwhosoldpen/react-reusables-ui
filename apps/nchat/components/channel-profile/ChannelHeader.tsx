"use client"

import React from 'react'
import { View, StyleSheet } from 'react-native'
import { ChevronLeft, Settings } from 'lucide-react'
import Link from 'next/link'
import { Text } from '~/components/ui/text'
import { Button } from '~/components/ui/button'
import { Channel } from '@/lib/types/channel.types'
import LanguageChanger from "@/components/common/LanguageChanger"
import { JoinButton } from "@/components/common/JoinButton"
import { FollowButton } from '../common/FollowButton'
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider'
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider'

interface ChannelHeaderProps {
  username: string
  channelDetails: Channel
}

export function ChannelHeader({ username, channelDetails }: ChannelHeaderProps) {
  const { colorScheme } = useColorScheme()
  const { design } = useDesign()

  const headerStyle = {
    ...styles.header,
    backgroundColor: colorScheme.colors.background,
    borderBottomColor: colorScheme.colors.border,
  }

  const textStyle = {
    color: colorScheme.colors.text,
    fontSize: Number(design.spacing.fontSize.lg),
  }

  return (
    <View style={headerStyle}>
      <View style={styles.leftSection}>
        <Link 
          href="/channels" 
          className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-accent/50"
          aria-label="Back to channels"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <Text style={textStyle} className="font-semibold">
          @{username}
        </Text>
      </View>

      <View style={styles.rightSection}>
        <LanguageChanger />

        {channelDetails.is_public ? (
          <FollowButton
            username={username}
            size="sm"
            showIcon={true}
          />
        ) : (
          <JoinButton
            username={username}
            buttonText="Join Channel"
            size="sm"
          />
        )}

        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-full p-2"
          aria-label="Channel settings"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    paddingHorizontal: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
}) 