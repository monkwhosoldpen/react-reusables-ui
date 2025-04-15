"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { ChannelHeader } from '@/components/channel-profile/ChannelHeader';
import { ChannelSidebar } from '@/components/channel-profile/ChannelSidebar';
import { Channel } from '@/lib/types/channel.types';
import { config } from '~/lib/config';
import { useChannelMessages } from '~/lib/hooks/useChannelMessages';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { JoinButton } from '~/components/common/JoinButton';
import { Loader2 } from 'lucide-react';
import { useLocalSearchParams } from 'expo-router';

// Optimized styles with responsive design
const createStyles = (isMobile: boolean, isTablet: boolean) => 
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      paddingHorizontal: isMobile ? 12 : 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 40,
    },
    loadingText: {
      marginTop: 8,
      fontSize: 14,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    errorText: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 8,
    },
    errorSubText: {
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 16,
    },
    contentContainer: {
      flex: 1,
      flexDirection: 'row',
    },
    sidebar: {
      width: isMobile ? 60 : isTablet ? 200 : 240,
      borderRightWidth: StyleSheet.hairlineWidth,
    },
    mainContent: {
      flex: 1,
      marginLeft: isMobile ? 60 : isTablet ? 200 : 240,
    },
    accessBar: {
      padding: isMobile ? 8 : 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    accessInfo: {
      flex: 1,
      gap: isMobile ? 8 : 12,
      marginRight: isMobile ? 8 : 16,
      flexWrap: 'wrap',
    },
    statusBadge: {
      padding: isMobile ? 4 : 6,
      borderRadius: 4,
      borderWidth: StyleSheet.hairlineWidth,
      minWidth: isMobile ? 60 : 80,
      alignItems: 'center',
    },
    messageList: {
      padding: isMobile ? 8 : 16,
    },
    messageItem: {
      padding: isMobile ? 10 : 16,
      marginBottom: isMobile ? 8 : 16,
      borderRadius: 8,
    },
    messageHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    messageContent: {
      fontSize: isMobile ? 14 : 15,
    },
    messageTime: {
      fontSize: isMobile ? 10 : 12,
      opacity: 0.7,
      marginLeft: 8,
    },
    toolbar: {
      width: '100%',
      maxWidth: 1200, // Maximum width for larger screens
      alignSelf: 'center',
    },
  });

export default function ChannelPage() {
  const router = useRouter();
  const { username } = useLocalSearchParams();
  const usernameStr = Array.isArray(username) ? username[0] : username || '';
  
  // State management
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Theme and design
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const styles = useMemo(() => createStyles(isMobile, isTablet), [isMobile, isTablet]);

  // Fetch channel data only once
  useEffect(() => {
    let isMounted = true;
    
    const fetchChannel = async () => {
      try {
        const res = await fetch(`${config.api.endpoints.channels.base}/${usernameStr}`);
        
        if (!res.ok) {
          throw new Error(res.status === 404 ? 
            `Channel @${usernameStr} not found` : 
            'Failed to fetch channel details');
        }

        const data: Channel = await res.json();
        if (isMounted) {
          setChannel(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load channel');
          setChannel(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchChannel();

    return () => {
      isMounted = false;
    };
  }, [usernameStr]);

  // Fetch messages only when channel exists (optimized to run once)
  const {
    messages,
    isLoading: loadingMessages,
    error: messageError,
    accessStatus: currentAccessStatus,
  } = useChannelMessages(channel ? { username: usernameStr } : { username: '' });

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colorScheme.colors.background }]}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <Text style={[styles.loadingText, { color: colorScheme.colors.text }]}>
          Loading channel...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colorScheme.colors.background }]}>
        <Text style={[styles.errorText, { color: colorScheme.colors.text }]}>
          {error}
        </Text>
        <Text style={[styles.errorSubText, { color: colorScheme.colors.text }]}>
          There was a problem loading the channel.
        </Text>
        <Button onPress={() => router.back()}>
          Go Back
        </Button>
      </View>
    );
  }

  if (!channel) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colorScheme.colors.background }]}>
        <Text style={[styles.errorText, { color: colorScheme.colors.text }]}>
          Channel not found
        </Text>
        <Button onPress={() => router.back()}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
      {/* Header Section */}
      <View style={[styles.header, { 
        borderBottomColor: colorScheme.colors.border,
        backgroundColor: colorScheme.colors.background,
      }]}>
        <View style={styles.toolbar}>
          <ChannelHeader username={usernameStr} channelDetails={channel} />
        </View>
      </View>

      {/* Main Content Area */}
      <View style={styles.contentContainer}>
        {/* Sidebar */}
        <View style={[styles.sidebar, { 
          position: isMobile ? 'absolute' : 'relative',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 5,
          backgroundColor: colorScheme.colors.background,
          borderRightColor: colorScheme.colors.border,
        }]}>
          <ChannelSidebar 
            username={usernameStr} 
            channelDetails={channel} 
            selectedChannel={usernameStr}
            isCompact={isMobile}
          />
        </View>

        {/* Content Area */}
        <View style={styles.mainContent}>
          {/* Access Control Bar */}
          <View style={[styles.accessBar, { 
            backgroundColor: colorScheme.colors.card,
            borderBottomColor: colorScheme.colors.border,
          }]}>
            <View style={styles.accessInfo}>
              <View style={[styles.statusBadge, { 
                backgroundColor: colorScheme.colors.background,
                borderColor: colorScheme.colors.border,
              }]}>
                <Text style={{ 
                  fontSize: isMobile ? 10 : 12,
                  color: colorScheme.colors.text,
                  opacity: 0.7,
                }}>
                  {loadingMessages ? 'Loading...' : currentAccessStatus}
                </Text>
              </View>
              
              {!isMobile && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ 
                    fontSize: 12,
                    color: colorScheme.colors.text,
                    opacity: 0.7,
                  }}>
                    Channel Status:
                  </Text>
                  <View style={{
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    backgroundColor: channel.is_public ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    borderRadius: 4,
                  }}>
                    <Text style={{ 
                      fontSize: 12,
                      color: channel.is_public ? '#22c55e' : '#ef4444',
                    }}>
                      {channel.is_public ? 'Public' : 'Private'}
                    </Text>
                  </View>
                </View>
              )}
            </View>
            
            <JoinButton
              username={usernameStr}
              channelDetails={channel}
              buttonText={isMobile ? "Join" : "Join Channel"}
              size="sm"
            />
          </View>

          {/* Messages Section */}
          <ScrollView style={styles.messageList}>
            {loadingMessages ? (
              <View style={styles.loadingContainer}>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <Text style={[styles.loadingText, { color: colorScheme.colors.text }]}>
                  Loading messages...
                </Text>
              </View>
            ) : messageError ? (
              <View style={styles.errorContainer}>
                <Text style={[styles.errorText, { color: colorScheme.colors.text }]}>
                  {messageError}
                </Text>
              </View>
            ) : (
              messages?.map((message) => (
                <View 
                  key={message.id} 
                  style={[styles.messageItem, { 
                    backgroundColor: colorScheme.colors.card,
                    borderColor: colorScheme.colors.border,
                  }]}
                >
                  <View style={styles.messageHeader}>
                    <Text style={{ 
                      color: colorScheme.colors.text,
                      fontWeight: '600',
                      fontSize: isMobile ? 14 : 16,
                    }}>
                      {message.username}
                    </Text>
                    <Text style={[styles.messageTime, { color: colorScheme.colors.text }]}>
                      {new Date(message.created_at).toLocaleTimeString()}
                    </Text>
                  </View>
                  <Text style={[styles.messageContent, { color: colorScheme.colors.text }]}>
                    {message.message_text}
                  </Text>
                </View>
              ))
            )}
            
            {(!messages || messages.length === 0) && !loadingMessages && !messageError && (
              <View style={styles.loadingContainer}>
                <Text style={{ 
                  fontSize: isMobile ? 16 : 20,
                  color: colorScheme.colors.text,
                  fontWeight: 'bold',
                }}>
                  No messages yet
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}