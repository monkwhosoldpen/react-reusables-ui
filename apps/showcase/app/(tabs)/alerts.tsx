"use client";

import React, { useEffect, useState, useRef } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, ActivityIndicator, Animated, TouchableOpacity, Image } from 'react-native';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { useColorScheme } from '@/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '@/lib/providers/theme/DesignSystemProvider';
import { Loader2, Bell, Heart, MessageCircle, Share2, UserPlus } from 'lucide-react';
import { useLocalSearchParams } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from "@expo/vector-icons";

// Mock notification data
const mockNotifications = [
  {
    id: '1',
    type: 'like',
    username: 'johndoe',
    message: 'liked your post',
    timestamp: '2m ago',
    postPreview: 'Check out this amazing sunset! 🌅',
    read: false
  },
  {
    id: '2',
    type: 'comment',
    username: 'janedoe',
    message: 'commented on your post',
    timestamp: '15m ago',
    postPreview: 'That looks incredible! Where was this taken?',
    read: false
  },
  {
    id: '3',
    type: 'follow',
    username: 'alexsmith',
    message: 'started following you',
    timestamp: '1h ago',
    read: true
  },
  {
    id: '4',
    type: 'share',
    username: 'mikejohnson',
    message: 'shared your post',
    timestamp: '2h ago',
    postPreview: 'This is so inspiring!',
    read: true
  },
  {
    id: '5',
    type: 'mention',
    username: 'sarahwilson',
    message: 'mentioned you in a comment',
    timestamp: '3h ago',
    postPreview: '@username This reminded me of you!',
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
      padding: 16,
      backgroundColor: 'transparent',
      borderRadius: 12,
      marginVertical: 4,
    },
    notificationItemUnread: {
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      backgroundColor: avatarBgColor,
    },
    notificationContent: {
      flex: 1,
      marginRight: 12,
    },
    notificationText: {
      fontSize: 14,
      color: colorScheme.colors.text,
      marginBottom: 4,
    },
    notificationPreview: {
      fontSize: 14,
      color: subtitleColor,
      marginTop: 4,
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
      case 'like':
        return <Heart size={20} color={colorScheme.colors.primary} />;
      case 'comment':
        return <MessageCircle size={20} color={colorScheme.colors.primary} />;
      case 'follow':
        return <UserPlus size={20} color={colorScheme.colors.primary} />;
      case 'share':
        return <Share2 size={20} color={colorScheme.colors.primary} />;
      case 'mention':
        return <MaterialIcons name="alternate-email" size={20} color={colorScheme.colors.primary} />;
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
                <Text style={styles.notificationText}>
                  <Text style={{ fontWeight: '600' }}>{notification.username}</Text>{' '}
                  {notification.message}
                </Text>
                {notification.postPreview && (
                  <Text style={styles.notificationPreview}>
                    {notification.postPreview}
                  </Text>
                )}
                <Text style={styles.timestamp}>{notification.timestamp}</Text>
              </View>
              <TouchableOpacity style={styles.actionButton}>
                <MaterialIcons 
                  name="more-vert" 
                  size={20} 
                  color={colorScheme.colors.text} 
                />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}