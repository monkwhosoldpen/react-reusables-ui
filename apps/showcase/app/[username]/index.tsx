"use client";

import React, { useRef } from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '~/components/ui/button';
import { ChannelSidebar } from '~/components/channel-profile/ChannelSidebar';
import { ChannelDebugInfo } from '~/components/channel-profile/ChannelDebugInfo';
import { useColorScheme } from '~/lib/core/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/core/providers/theme/DesignSystemProvider';
import { Loader2 } from 'lucide-react';
import { useLocalSearchParams } from 'expo-router';
import { ChannelHeader } from '~/components/channel-profile/ChannelHeader';
import { useWindowDimensions } from 'react-native';
import { useRealtime } from '~/lib/core/providers/RealtimeProvider';
import ChannelInfoSection from '~/components/channel-profile/ChannelInfoSection';
import { FeedItem } from '~/lib/enhanced-chat/components/feed/FeedItem';
import useChannelData from '~/lib/channel/channel-profile-util';
import { FollowButton } from '~/components/common/FollowButton';
import { JoinButton } from '~/components/common/JoinButton';

export default function ChannelPage() {
  const router = useRouter();
  const { username } = useLocalSearchParams();
  const usernameStr = Array.isArray(username) ? username[0] : username || '';
  const { width: screenWidth } = useWindowDimensions();
  const { channelActivities } = useRealtime();
  const prevActivitiesRef = useRef<typeof channelActivities>([]);
  const processedMessagesRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef(true);

  // Use the custom hook to fetch channel data
  const {
    channel,
    loading,
    error,
    messages,
    loadingMessages,
    messageError,
    accessStatus
  } = useChannelData(usernameStr);

  // Add logging for channel activities
  React.useEffect(() => {
    if (isInitialLoadRef.current) {
      // Skip logging on initial load
      isInitialLoadRef.current = false;
      prevActivitiesRef.current = channelActivities;
      return;
    }

    // Compare with previous activities to detect changes
    channelActivities.forEach(activity => {
      const prevActivity = prevActivitiesRef.current.find(a => a.username === activity.username);

      if (activity.last_message &&
        (!prevActivity || prevActivity.last_message?.id !== activity.last_message?.id) &&
        !processedMessagesRef.current.has(activity.last_message.id)) {

        // Mark this message as processed
        processedMessagesRef.current.add(activity.last_message.id);
      }
    });

    // Update previous activities
    prevActivitiesRef.current = channelActivities;
  }, [channelActivities]);

  // Calculate widths
  const sidebarWidth = Math.floor(screenWidth * 0.25);
  const contentWidth = screenWidth - sidebarWidth;

  const messagesEndRef = useRef<View>(null);

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
        onBack={() => router.push('/')}
      />
      <View className="flex-1 flex-row">
        {/* Sidebar */}
        <View style={{ width: sidebarWidth }} className="border-r border-border bg-background">
          <ChannelSidebar
            username={usernameStr}
            channelDetails={channel}
            selectedChannel={usernameStr}
            sidebarWidth={sidebarWidth}
          />
        </View>

        {/* Main Content */}
        <View style={{ width: contentWidth }} className="bg-background">

          {/* Access Status Indicator */}
          <View className="p-2 border-b border-border">
            <Text className={`font-medium ${accessStatus === 'public' 
              ? 'text-green-600 dark:text-green-400'
              : 'text-orange-600 dark:text-orange-400'}`}>
              {`Access Status: ${accessStatus}`}
            </Text>
          </View>

          {/* Follow/Join Button */}
          <View className="p-2 border-b border-border">
            {accessStatus === 'public' ? (
              <FollowButton username={usernameStr} />
            ) : (
              <JoinButton username={usernameStr} accessStatus={accessStatus} channelDetails={channel} />
            )}
          </View>

          <ScrollView className="flex-1 p-2">
            {loadingMessages ? (
              <View className="flex-1 justify-center items-center p-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <Text className="mt-2 text-base text-muted-foreground">
                  Loading messages...
                </Text>
              </View>
            ) : messageError ? (
              <View className="flex-1 justify-center items-center p-6">
                <Text className="text-lg text-foreground mb-2">
                  {messageError}
                </Text>
                <Text className="text-base text-muted-foreground">
                  There was a problem loading messages.
                </Text>
              </View>
            ) : messages.length === 0 ? (
              <View className="flex-1 justify-center items-center p-6">
                <Text className="text-lg text-foreground mb-2">
                  No messages yet
                </Text>
                <Text className="text-base text-muted-foreground">
                  This channel hasn't posted any messages.
                </Text>
              </View>
            ) : (
              <View>
                {messages.map((message, index) => (
                  <FeedItem
                    key={`${message.id || index}`}
                    data={message}
                    showHeader={message.metadata?.visibility?.header ?? true}
                    showFooter={message.metadata?.visibility?.footer ?? false}
                  />
                ))}
              </View>
            )}
          </ScrollView>
          <View ref={messagesEndRef} />
        </View>
      </View>
    </View>
  );
}