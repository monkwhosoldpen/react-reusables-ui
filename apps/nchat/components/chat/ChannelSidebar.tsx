import React, { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Text } from '~/components/ui/text';
import { Channel } from '~/types/channel';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';
import { StyleSheet } from 'react-native';

interface ChannelSidebarProps {
  channels: Channel[];
  activeChannelId: string;
  onChannelPress: (username: string) => void;
  isPremium: boolean;
  isVisible: boolean;
  onClose?: () => void;
}

const SIDEBAR_WIDTH = 240;
const MOBILE_BREAKPOINT = 768;
const MOBILE_ICON_WIDTH = 60;

export default function ChannelSidebar({ channels, activeChannelId, onChannelPress, isVisible, onClose }: ChannelSidebarProps) {
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();
  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
  const isMobile = windowWidth < MOBILE_BREAKPOINT;

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWindowWidth(window.width);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const styles = StyleSheet.create({
    container: {
      width: isMobile ? MOBILE_ICON_WIDTH : SIDEBAR_WIDTH,
      maxWidth: isMobile ? MOBILE_ICON_WIDTH : SIDEBAR_WIDTH,
      backgroundColor: colorScheme.colors.card,
      borderRightWidth: 1,
      borderRightColor: colorScheme.colors.border,
      position: 'relative',
      left: 0,
      top: 0,
      bottom: 0,
      zIndex: 1000,
    },
    fullSidebar: {
      position: 'absolute',
      width: '85%',
      maxWidth: SIDEBAR_WIDTH,
      backgroundColor: colorScheme.colors.card,
      borderRightWidth: 1,
      borderRightColor: colorScheme.colors.border,
      left: 0,
      top: 0,
      bottom: 0,
      zIndex: 1000,
      display: isMobile && isVisible ? 'flex' : 'none',
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 999,
      display: isMobile && isVisible ? 'flex' : 'none',
    },
    header: {
      height: Number(design.spacing.padding.card) * 3,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme.colors.border,
      paddingHorizontal: Number(design.spacing.padding.item),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      display: isMobile ? 'none' : 'flex',
    },
    mobileHeader: {
      height: Number(design.spacing.padding.card) * 3,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      display: isMobile ? 'flex' : 'none',
    },
    headerText: {
      color: colorScheme.colors.text,
      fontSize: Number(design.spacing.fontSize.lg),
      fontWeight: '600',
    },
    headerButton: {
      width: Number(design.spacing.iconSize) * 1.5,
      height: Number(design.spacing.iconSize) * 1.5,
      borderRadius: Number(design.radius.full),
      backgroundColor: colorScheme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    section: {
      marginTop: Number(design.spacing.padding.item),
    },
    sectionTitle: {
      color: colorScheme.colors.text,
      fontSize: Number(design.spacing.fontSize.sm),
      opacity: 0.7,
      textTransform: 'uppercase',
      marginBottom: Number(design.spacing.margin.text),
      paddingHorizontal: Number(design.spacing.padding.item),
      display: isMobile ? 'none' : 'flex',
    },
    channelItem: {
      flexDirection: 'row',
      alignItems: 'center',
      height: Number(design.spacing.padding.card) * 2,
      paddingHorizontal: Number(design.spacing.padding.item),
      justifyContent: 'flex-start',
    },
    channelItemActive: {
      backgroundColor: colorScheme.colors.background,
    },
    channelTextContainer: {
      flex: 1,
      marginLeft: Number(design.spacing.margin.text),
      display: 'flex',
    },
    channelText: {
      color: colorScheme.colors.text,
      fontSize: Number(design.spacing.fontSize.base),
      fontWeight: '500',
      opacity: 0.9,
      display: isMobile && !isVisible ? 'none' : 'flex',
    },
    channelUsername: {
      color: colorScheme.colors.text,
      fontSize: Number(design.spacing.fontSize.xs),
      opacity: 0.5,
      marginTop: -1,
      display: isMobile && !isVisible ? 'none' : 'flex',
    },
    channelTextActive: {
      opacity: 1,
      fontWeight: '600',
    },
    userSection: {
      padding: Number(design.spacing.padding.item),
      borderTopWidth: 1,
      borderTopColor: colorScheme.colors.border,
      backgroundColor: colorScheme.colors.card,
      alignItems: isMobile ? 'center' : 'stretch',
    },
    userButton: {
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: 'center',
      padding: Number(design.spacing.padding.item),
      borderRadius: Number(design.radius.md),
    },
    userAvatar: {
      width: Number(design.spacing.iconSize) * 1.5,
      height: Number(design.spacing.iconSize) * 1.5,
      borderRadius: Number(design.radius.full),
      backgroundColor: colorScheme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    userInfo: {
      marginLeft: isMobile ? 0 : Number(design.spacing.margin.text),
      marginTop: isMobile ? Number(design.spacing.margin.text) / 2 : 0,
      flex: isMobile ? 0 : 1,
      display: isMobile ? 'none' : 'flex',
    },
    userName: {
      color: colorScheme.colors.text,
      fontSize: Number(design.spacing.fontSize.sm),
      fontWeight: '500',
    },
    userStatus: {
      color: colorScheme.colors.text,
      fontSize: Number(design.spacing.fontSize.xs),
      opacity: 0.7,
    },
  });

  const renderChannelList = () => (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Channels</Text>
        {channels.map((channel) => (
          <Pressable
            key={channel.username}
            onPress={() => onChannelPress(channel.username)}
            style={[
              styles.channelItem,
              activeChannelId === channel.username && styles.channelItemActive
            ]}
          >
            <Ionicons 
              name={channel.is_realtime ? "chatbubble-outline" : "lock-closed-outline"} 
              size={isMobile ? 20 : 16} 
              color={colorScheme.colors.text} 
              style={{ opacity: activeChannelId === channel.username ? 1 : 0.7 }}
            />
            <View style={styles.channelTextContainer}>
              <Text 
                style={[
                  styles.channelText,
                  activeChannelId === channel.username && styles.channelTextActive
                ]}
                numberOfLines={1}
              >
                {channel.name}
              </Text>
              <Text 
                style={styles.channelUsername}
                numberOfLines={1}
              >
                @{channel.username}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Direct Messages</Text>
        <Pressable style={styles.channelItem}>
          <View style={{
            width: isMobile ? 24 : 16,
            height: isMobile ? 24 : 16,
            borderRadius: isMobile ? 12 : 8,
            backgroundColor: colorScheme.colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text style={{ color: '#FFFFFF', fontSize: isMobile ? 16 : 12 }}>+</Text>
          </View>
          <Text style={styles.channelText}>Add Teammates</Text>
        </Pressable>
      </View>
    </>
  );

  return (
    <>
      {isMobile && <Pressable style={styles.overlay} onPress={onClose} />}
      
      {/* Icon-only sidebar for mobile */}
      <View style={styles.container}>
        <View style={styles.mobileHeader}>
          <TouchableOpacity onPress={() => onClose?.()}>
            <Ionicons name="menu" size={24} color={colorScheme.colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {renderChannelList()}
        </ScrollView>

        <View style={styles.userSection}>
          <Pressable style={styles.userButton}>
            <View style={styles.userAvatar}>
              <Ionicons name="person" size={isMobile ? 20 : 16} color={colorScheme.colors.text} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>You</Text>
              <Text style={styles.userStatus}>Online</Text>
            </View>
            {!isMobile && (
              <Ionicons name="settings-outline" size={16} color={colorScheme.colors.text} style={{ opacity: 0.7 }} />
            )}
          </Pressable>
        </View>
      </View>

      {/* Full sidebar for mobile when expanded */}
      {isMobile && (
        <View style={styles.fullSidebar}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Workspace</Text>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="chevron-down" size={20} color={colorScheme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {renderChannelList()}
          </ScrollView>

          <View style={styles.userSection}>
            <Pressable style={styles.userButton}>
              <View style={styles.userAvatar}>
                <Ionicons name="person" size={16} color={colorScheme.colors.text} />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>You</Text>
                <Text style={styles.userStatus}>Online</Text>
              </View>
              <Ionicons name="settings-outline" size={16} color={colorScheme.colors.text} style={{ opacity: 0.7 }} />
            </Pressable>
          </View>
        </View>
      )}
    </>
  );
}
