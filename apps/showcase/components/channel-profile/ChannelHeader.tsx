"use client"

import React from 'react'
import { View, StyleSheet, useWindowDimensions, TouchableOpacity, Image } from 'react-native'
import { ChevronLeft, Settings } from 'lucide-react'
import { useRouter } from 'expo-router'
import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { Channel } from '~/lib/core/types/channel.types'
import { useColorScheme } from '~/lib/core/providers/theme/ColorSchemeProvider'
import { useDesign } from '~/lib/core/providers/theme/DesignSystemProvider'
import { MaterialIcons } from "@expo/vector-icons"

interface ChannelHeaderProps {
  username: string
  channelDetails: Channel
  onBack?: () => void
}

export function ChannelHeader({ username, channelDetails, onBack }: ChannelHeaderProps) {
  const { colorScheme } = useColorScheme()
  const { design } = useDesign()
  const { width } = useWindowDimensions()
  const router = useRouter()
  const isMobile = width < 768

  // Helper function to determine if dark mode
  const isDarkMode = colorScheme.colors.text === '#ffffff' || colorScheme.colors.background === '#000000';
  const avatarBgColor = isDarkMode ? 'rgba(255,255,255,0.1)' : '#E8EEF2';
  const subtitleColor = isDarkMode ? 'rgba(255,255,255,0.7)' : '#64748B';

  const styles = StyleSheet.create({
    header: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colorScheme.colors.border,
      backgroundColor: colorScheme.colors.primary,
    },
    headerContent: {
      width: '100%',
      maxWidth: 1200,
      alignSelf: 'center',
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
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: avatarBgColor,
    },
    itemTitle: {
      fontSize: 18,
      fontWeight: '600',
    },
    itemSubtitle: {
      fontSize: 14,
      opacity: 0.8,
    },
    backButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.1)',
    },
    settingsButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.1)',
    },
  });

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={styles.leftSection}>
            <TouchableOpacity 
              onPress={onBack || (() => router.push('/'))}
              style={styles.backButton}
            >
              <ChevronLeft 
                size={isMobile ? 20 : 24} 
                color={colorScheme.colors.background} 
              />
            </TouchableOpacity>
            <View style={[styles.avatar, { backgroundColor: avatarBgColor }]}>
              <Text style={[styles.itemTitle, { color: colorScheme.colors.primary }]}>
                {username[0]?.toUpperCase() || '#'}
              </Text>
            </View>
            <View>
              <Text style={[
                styles.itemTitle, 
                { 
                  color: colorScheme.colors.background,
                  ...(channelDetails.is_premium ? { color: '#FFC000' } : {})
                }
              ]}>
                @{username}
              </Text>
              <Text style={[styles.itemSubtitle, { color: colorScheme.colors.background, opacity: 0.8 }]}>
                {channelDetails.stateName || 'No state'}
              </Text>
            </View>
          </View>

          <View style={styles.rightSection}>
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => router.push(`/${username}/settings`)}
            >
              <Settings 
                size={isMobile ? 20 : 24} 
                color={colorScheme.colors.background} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  )
} 