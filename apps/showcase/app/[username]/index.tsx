"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { ChannelHeader } from '@/components/channel-profile/ChannelHeader';
import { ChannelSidebar } from '@/components/channel-profile/ChannelSidebar';
import { Channel, ChannelMessage } from '@/lib/types/channel.types';
import { config } from '~/lib/config';
import { useChannelMessages } from '~/lib/hooks/useChannelMessages';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { JoinButton } from '~/components/common/JoinButton';
import { Loader2 } from 'lucide-react';
import { useLocalSearchParams } from 'expo-router';
import { ColorScheme, DesignConfig } from '~/lib/providers/theme/types';
import { CommonHeader } from '~/components/CommonHeader';

const createStyles = (
  isMobile: boolean,
  isTablet: boolean,
  design: DesignConfig,
  colorScheme: ColorScheme,
  insets: { top: number; bottom: number; left: number; right: number }
) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#17212B',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#17212B',
  },
  headerContent: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: isMobile ? 60 : isTablet ? 200 : 240,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#17212B',
  },
  mainContent: {
    flex: 1,
    marginLeft: isMobile ? 60 : isTablet ? 200 : 240,
    backgroundColor: '#17212B',
  },
  accessBar: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#17212B',
  },
  accessInfo: {
    flex: 1,
    gap: 8,
    marginRight: 16,
    flexWrap: 'wrap',
  },
  statusBadge: {
    padding: 6,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 80,
    alignItems: 'center',
    backgroundColor: '#242F3D',
  },
  statusText: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.7,
  },
  channelStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  channelStatusLabel: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.7,
  },
  channelStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#242F3D',
  },
  channelStatusText: {
    fontSize: 14,
    color: '#ffffff',
  },
  messageList: {
    padding: 16,
    backgroundColor: '#17212B',
  },
  messageItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#242F3D',
    borderWidth: 0,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  messageUsername: {
    color: '#64B5F6',
    fontWeight: '600',
    fontSize: 15,
  },
  messageTime: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    marginLeft: 8,
  },
  messageContent: {
    fontSize: 15,
    color: '#ffffff',
    lineHeight: 1.4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#17212B',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#17212B',
  },
  errorText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 24,
  },
  noMessagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#17212B',
  },
  noMessagesText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
    textAlign: 'center',
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
  const styles = useMemo(() => createStyles(isMobile, isTablet, design, colorScheme, { top: 0, bottom: 0, left: 0, right: 0 }), [isMobile, isTablet, design, colorScheme]);

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
      <CommonHeader
        title={usernameStr}
        showBackButton={true}
      />
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

          {/* Messages Section */}
          <ScrollView style={styles.messageList}>

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
                  <View style={styles.channelStatusContainer}>
                    <Text style={styles.channelStatusLabel}>
                      Channel Status:
                    </Text>
                    <View style={[
                      styles.channelStatusBadge,
                      { backgroundColor: channel.is_public ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)' }
                    ]}>
                      <Text style={[
                        styles.channelStatusText,
                        { color: channel.is_public ? '#22c55e' : '#ef4444' }
                      ]}>
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

            {loadingMessages ? (
              <View style={styles.loadingContainer}>
                <Loader2 size={Number(design.spacing.iconSize)} color={colorScheme.colors.primary} />
                <Text style={styles.loadingText}>
                  Loading messages...
                </Text>
              </View>
            ) : messageError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  {messageError}
                </Text>
              </View>
            ) : messages && messages.length > 0 ? (
              messages.map((message: ChannelMessage) => (
                <View
                  key={message.id}
                  style={styles.messageItem}
                >
                  <View style={styles.messageHeader}>
                    <Text style={styles.messageUsername}>
                      {message.username}
                    </Text>
                    <Text style={styles.messageTime}>
                      {new Date(message.created_at).toLocaleTimeString()}
                    </Text>
                  </View>
                  <Text style={styles.messageContent}>
                    {message.message_text}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.noMessagesContainer}>
                <Text style={styles.noMessagesText}>
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