"use client";

import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { ChannelHeader } from '@/components/channel-profile/ChannelHeader';
import { ChannelSidebar } from '@/components/channel-profile/ChannelSidebar';
import { Channel } from '@/lib/types/channel.types';
import { config } from '~/lib/config';
import { useChannelMessages } from '~/lib/hooks/useChannelMessages';
import { JoinButton } from '../common/JoinButton';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ChannelContentProps {
  username: string;
}

export function ChannelContent({ username }: ChannelContentProps) {
  const router = useRouter();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();
  const insets = useSafeAreaInsets();

  // Fetch messages only when channel exists
  const {
    messages,
    isLoading: loadingMessages,
    error: messageError,
    accessStatus: currentAccessStatus,
  } = useChannelMessages(channel ? { username } : { username: '' });

  useEffect(() => {
    const fetchChannel = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${config.api.endpoints.channels.base}/${username}`);

        if (!res.ok) {
          throw new Error(res.status === 404 ? `Channel @${username} not found` : 'Failed to fetch channel details');
        }

        const data: Channel = await res.json();
        setChannel(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load channel');
        setChannel(null);
      } finally {
        setLoading(false);
      }
    };

    fetchChannel();
  }, [username]);

  // Apply design system tokens
  const sectionStyle = {
    backgroundColor: colorScheme.colors.card,
    padding: Number(design.spacing.padding.card),
    borderRadius: Number(design.radius.lg),
  };

  const messageStyle = {
    backgroundColor: colorScheme.colors.background,
    padding: Number(design.spacing.padding.card),
    borderRadius: Number(design.radius.md),
  };

  const textStyle = {
    color: colorScheme.colors.text,
    fontSize: Number(design.spacing.fontSize.base),
  };

  const labelStyle = {
    color: colorScheme.colors.text,
    fontSize: Number(design.spacing.fontSize.sm),
    opacity: 0.7,
  };

  // Debug logs
  console.log('Channel:', channel);
  console.log('Messages:', messages);
  console.log('Loading Messages:', loadingMessages);
  console.log('Message Error:', messageError);

  if (loading) {
    return (
      <View className="flex items-center justify-center h-screen" style={{ backgroundColor: colorScheme.colors.background }}>
        Loading...
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex flex-col h-screen items-center justify-center" style={{ backgroundColor: colorScheme.colors.background }}>
        <Text style={textStyle} className="mb-4">{error}</Text>
        <Button onPress={() => router.back()}>Go Back</Button>
      </View>
    );
  }

  if (!channel) {
    return (
      <View className="flex flex-col h-screen items-center justify-center" style={{ backgroundColor: colorScheme.colors.background }}>
        <Text style={textStyle} className="mb-4">Channel not found</Text>
        <Button onPress={() => router.back()}>Go Back</Button>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colorScheme.colors.background }}>
      {/* Header Section */}
      <View style={{ zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colorScheme.colors.border }}>
        <ChannelHeader username={username} channelDetails={channel} />
      </View>

      {/* Main Content Area */}
      <View className="flex-1 flex-row relative">
        {/* Sidebar */}
        <View style={{ 
          position: 'absolute', 
          left: 0, 
          top: 0, 
          bottom: 0, 
          zIndex: 5,
          width: 240,
          borderRightWidth: StyleSheet.hairlineWidth,
          borderRightColor: colorScheme.colors.border
        }}>
          <ChannelSidebar username={username} channelDetails={channel} selectedChannel={username} />
        </View>

        {/* Content Area */}
        <View style={{ 
          flex: 1, 
          marginLeft: 240,
          height: '100%'
        }}>
          {/* Access Control Bar */}
          <View 
            style={[{
              padding: Number(design.spacing.padding.card),
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: colorScheme.colors.card,
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: colorScheme.colors.border
            }]}
          >
            <View className="flex-row items-center">
              <Text style={[labelStyle, { marginRight: Number(design.spacing.padding.card) }]}>
                Access Status:
              </Text>
              <Text style={textStyle} className="font-medium">
                {currentAccessStatus || 'Loading...'}
              </Text>
            </View>
            <JoinButton
              username={username}
              channelDetails={channel}
              buttonText="Join Channel"
              size="sm"
            />
          </View>

          {/* Messages Section */}
          <View style={{ flex: 1 }}>
            <ScrollView 
              style={{ flex: 1 }}
              contentContainerStyle={{
                padding: Number(design.spacing.padding.card),
                paddingBottom: insets.bottom + Number(design.spacing.padding.card)
              }}
            >
              {loadingMessages ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  Loading...
                </View>
              ) : messageError ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={textStyle} className="text-red-500">{messageError}</Text>
                </View>
              ) : (
                <View style={{ gap: Number(design.spacing.padding.card) }}>
                  {messages?.map((message) => (
                    <View 
                      key={message.id} 
                      style={[{
                        padding: Number(design.spacing.padding.card),
                        backgroundColor: colorScheme.colors.card,
                        borderRadius: Number(design.radius.md),
                        borderWidth: StyleSheet.hairlineWidth,
                        borderColor: colorScheme.colors.border
                      }]}
                    >
                      <View className="flex-row items-center mb-2">
                        <Text style={[textStyle, { fontWeight: '600' }]}>
                          {message.username}
                        </Text>
                        <Text style={[labelStyle, { marginLeft: Number(design.spacing.padding.card) }]}>
                          {new Date(message.created_at).toLocaleTimeString()}
                        </Text>
                      </View>
                      <Text style={textStyle}>
                        {message.message_text}
                      </Text>
                    </View>
                  ))}
                  {(!messages || messages.length === 0) && (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 32 }}>
                      <Text style={labelStyle}>No messages yet</Text>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </View>
    </View>
  );
}
