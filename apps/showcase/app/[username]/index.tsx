"use client";

import React, { useEffect, useState, useRef } from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { ChannelSidebar } from '@/components/channel-profile/ChannelSidebar';
import { ChannelMessages } from '@/components/channel-profile/ChannelMessages';
import { Channel } from '@/lib/types/channel.types';
import { config } from '~/lib/config';
import { useChannelMessages } from '~/lib/hooks/useChannelMessages';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';
import { Loader2 } from 'lucide-react';
import { useLocalSearchParams } from 'expo-router';
import { ChannelHeader } from '~/components/channel-profile/ChannelHeader';
import { useWindowDimensions } from 'react-native';
import { useRealtime } from '~/lib/providers/RealtimeProvider';

export default function ChannelPage() {
  const router = useRouter();
  const { username } = useLocalSearchParams();
  const usernameStr = Array.isArray(username) ? username[0] : username || '';
  const { width: screenWidth } = useWindowDimensions();
  const { channelActivities } = useRealtime();

  // Calculate widths
  const sidebarWidth = Math.floor(screenWidth * 0.3);
  const contentWidth = screenWidth - sidebarWidth;

  // State management
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Theme and design
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();

  const messagesEndRef = useRef<View>(null);

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
      <View className="flex-1 justify-center items-center p-6 bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <Text className="mt-2 text-base text-muted-foreground">
          Loading channel...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-6 bg-background">
        <Text className="text-lg text-foreground mb-2">
          {error}
        </Text>
        <Text className="text-base text-muted-foreground mb-6">
          There was a problem loading the channel.
        </Text>
        <Button onPress={() => router.back()}>
          <Text>Go Back</Text>
        </Button>
      </View>
    );
  }

  if (!channel) {
    return (
      <View className="flex-1 justify-center items-center p-6 bg-background">
        <Text className="text-lg text-foreground mb-6">
          Channel not found
        </Text>
        <Button onPress={() => router.back()}>
          <Text>Go Back</Text>
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ChannelHeader
        username={usernameStr}
        channelDetails={channel}
      />
      <View className="flex-1 flex-row">
        {/* Sidebar */}
        <View style={{ width: sidebarWidth }} className="border-r border-border bg-background">
          <ChannelSidebar
            username={usernameStr}
            channelDetails={channel}
            selectedChannel={usernameStr}
          />
        </View>

        {/* Content Area */}
        <View style={{ width: contentWidth }} className="bg-background">
          <ScrollView className="p-4">
            <ChannelMessages
              messages={messages || []}
              messagesLoading={loadingMessages}
              messagesError={messageError}
              messagesEndRef={messagesEndRef}
              channelDetails={channel}
            />
          </ScrollView>
        </View>
      </View>
    </View>
  );
}