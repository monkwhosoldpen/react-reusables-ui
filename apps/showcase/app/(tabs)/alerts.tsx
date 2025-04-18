"use client";

import React, { useEffect, useState, useRef } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, ActivityIndicator, Animated, TouchableOpacity, Image } from 'react-native';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { useColorScheme } from '@/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '@/lib/providers/theme/DesignSystemProvider';
import { Loader2, Bell, Heart, MessageCircle, Share2, UserPlus, CheckCircle, XCircle } from 'lucide-react';
import { useLocalSearchParams } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from "@expo/vector-icons";

// Mock notification data
const mockNotifications = [
  {
    id: '1',
    type: 'post',
    username: 'techchannel',
    message: 'posted in',
    channelName: 'Tech Updates',
    timestamp: '2m ago',
    postPreview: 'New React Native 0.73 released with major improvements...',
    read: false
  },
  {
    id: '2',
    type: 'approved',
    username: 'admin',
    message: 'approved your request to join',
    channelName: 'Mobile Dev',
    timestamp: '5m ago',
    read: false
  },
  {
    id: '3',
    type: 'post',
    username: 'designchannel',
    message: 'posted in',
    channelName: 'UI/UX Tips',
    timestamp: '15m ago',
    postPreview: '10 essential Figma plugins for 2024...',
    read: false
  },
  {
    id: '4',
    type: 'rejected',
    username: 'admin',
    message: 'rejected your request to join',
    channelName: 'Premium Content',
    timestamp: '1h ago',
    read: true
  },
  {
    id: '5',
    type: 'post',
    username: 'codingchannel',
    message: 'posted in',
    channelName: 'Programming Tips',
    timestamp: '2h ago',
    postPreview: 'Top 5 VS Code extensions for React developers...',
    read: true
  },
  {
    id: '6',
    type: 'approved',
    username: 'admin',
    message: 'approved your request to join',
    channelName: 'Web Development',
    timestamp: '3h ago',
    read: true
  },
  {
    id: '7',
    type: 'post',
    username: 'aiupdates',
    message: 'posted in',
    channelName: 'AI News',
    timestamp: '5h ago',
    postPreview: 'Latest developments in GPT-4 and its applications...',
    read: true
  },
  {
    id: '8',
    type: 'rejected',
    username: 'admin',
    message: 'rejected your request to join',
    channelName: 'Private Beta',
    timestamp: '1d ago',
    read: true
  }
];

export default function AlertsPage() {
  const router = useRouter();
  const { username } = useLocalSearchParams();
  const usernameStr = Array.isArray(username) ? username[0] : username || '';
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Theme and design
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();

  // Helper function to determine if dark mode
  const isDarkMode = colorScheme.colors.text === '#ffffff' || colorScheme.colors.background === '#000000';
  const avatarBgColor = isDarkMode ? 'rgba(255,255,255,0.1)' : '#E8EEF2';
  const subtitleColor = isDarkMode ? 'rgba(255,255,255,0.7)' : '#64748B';
  const timestampColor = isDarkMode ? 'rgba(255,255,255,0.5)' : '#64748B';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme.colors.background,
    },
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
    headerTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colorScheme.colors.background,
    },
    notificationItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: colorScheme.colors.card,
      borderRadius: 12,
      marginVertical: 4,
      marginHorizontal: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    notificationItemUnread: {
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      backgroundColor: avatarBgColor,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    notificationContent: {
      flex: 1,
    },
    notificationText: {
      fontSize: 14,
      fontWeight: '600',
      color: colorScheme.colors.text,
      marginBottom: 2,
    },
    notificationPreview: {
      fontSize: 13,
      color: subtitleColor,
      lineHeight: 18,
    },
    timestamp: {
      fontSize: 12,
      color: timestampColor,
    },
    actionButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    },
    sectionHeader: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginTop: 8,
      backgroundColor: 'transparent',
    },
    sectionHeaderText: {
      fontSize: 12,
      fontWeight: '600',
      color: subtitleColor,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
  });

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <MessageCircle size={20} color={colorScheme.colors.primary} />;
      case 'approved':
        return <CheckCircle size={20} color={colorScheme.colors.primary} />;
      case 'rejected':
        return <XCircle size={20} color={colorScheme.colors.error} />;
      default:
        return <Bell size={20} color={colorScheme.colors.primary} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        >
          {/* Today's Notifications */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>Today</Text>
          </View>

          {mockNotifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationItem,
                !notification.read && styles.notificationItemUnread
              ]}
              onPress={() => {}}
            >
              <View style={[styles.avatar, { backgroundColor: avatarBgColor }]}>
                {getNotificationIcon(notification.type)}
              </View>
              <View style={styles.notificationContent}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                  <Text style={styles.notificationText} numberOfLines={1}>
                    <Text style={{ fontWeight: '600' }}>{notification.username}</Text>{' '}
                    {notification.message}{' '}
                    <Text style={{ fontWeight: '600' }}>{notification.channelName}</Text>
                  </Text>
                  <Text style={styles.timestamp}>{notification.timestamp}</Text>
                </View>
                {notification.postPreview && (
                  <Text style={styles.notificationPreview} numberOfLines={1}>
                    {notification.postPreview}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}