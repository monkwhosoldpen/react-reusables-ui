"use client";

import React, { useEffect, useState, useRef } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, Animated, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '@/lib/providers/theme/DesignSystemProvider';
import { MessageCircle, Bell } from 'lucide-react';
import { useLocalSearchParams } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from "@expo/vector-icons";
import { useRealtime } from '@/lib/providers/RealtimeProvider';
import { formatDistanceToNow } from 'date-fns';

export default function AlertsPage() {
  const router = useRouter();
  const { username } = useLocalSearchParams();
  const usernameStr = Array.isArray(username) ? username[0] : username || '';
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { channelActivities } = useRealtime();

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
      width: 48,
      height: 48,
      borderRadius: 24,
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
      fontSize: 16,
      fontWeight: '600',
      color: colorScheme.colors.text,
      marginBottom: 4,
    },
    notificationPreview: {
      fontSize: 14,
      color: subtitleColor,
      lineHeight: 20,
    },
    timestamp: {
      fontSize: 12,
      color: timestampColor,
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

  const getNotificationIcon = (activity: any) => {
    if (activity.last_message?.message_text) {
      return <MessageCircle size={24} color={colorScheme.colors.primary} />;
    }
    return <Bell size={24} color={colorScheme.colors.primary} />;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colorScheme.colors.primary }]}>
        <View style={styles.headerContent}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[styles.avatar, { backgroundColor: avatarBgColor }]}>
              <Text style={[styles.headerTitle, { color: colorScheme.colors.primary }]}>A</Text>
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={[styles.headerTitle, { color: colorScheme.colors.background }]}>Alerts</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.timestamp, { color: colorScheme.colors.background, opacity: 0.8 }]}>
                  {channelActivities.length} active channels
                </Text>
                <MaterialIcons name="keyboard-arrow-down" size={22} color={colorScheme.colors.background} style={{ opacity: 0.8 }} />
              </View>
            </View>
          </View>
        </View>
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        >
          {/* Channel Activities Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>Recent Activities</Text>
          </View>

          {channelActivities.map((activity) => (
            <TouchableOpacity
              key={activity.username}
              style={[
                styles.notificationItem,
                !activity.read && styles.notificationItemUnread
              ]}
              onPress={() => {}}
            >
              <View style={[styles.avatar, { backgroundColor: avatarBgColor }]}>
                {getNotificationIcon(activity)}
              </View>
              <View style={styles.notificationContent}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                  <Text style={styles.notificationText} numberOfLines={1}>
                    <Text style={{ fontWeight: '600' }}>{activity.username}</Text>
                    {activity.last_message?.message_text ? ' posted a message' : ' has no recent activity'}
                  </Text>
                  <Text style={styles.timestamp}>
                    {formatDistanceToNow(new Date(activity.last_updated_at), { addSuffix: true })}
                  </Text>
                </View>
                {activity.last_message?.message_text && (
                  <Text style={styles.notificationPreview} numberOfLines={1}>
                    {activity.last_message.message_text}
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