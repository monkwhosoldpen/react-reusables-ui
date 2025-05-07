"use client";

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '~/components/ui/button';
import { ChannelSidebar } from '~/components/channel-profile/ChannelSidebar';
import { Loader2 } from 'lucide-react';
import { useLocalSearchParams } from 'expo-router';
import { ChannelHeader } from '~/components/channel-profile/ChannelHeader';
import { useWindowDimensions } from 'react-native';
import { FeedItem } from '~/lib/enhanced-chat/components/feed/FeedItem';
import useChannelData from '~/lib/channel/channel-profile-util';
import { FollowButton } from '~/components/common/FollowButton';
import { JoinButton } from '~/components/common/JoinButton';
import { AuthHelper } from '~/lib/core/helpers/AuthHelpers';
import { useRealtime } from '~/lib/core/providers/RealtimeProvider';

export default function ChannelPage() {
  const router = useRouter();
  const { username } = useLocalSearchParams();
  const usernameStr = Array.isArray(username) ? username[0] : username || '';
  const { width: screenWidth } = useWindowDimensions();
  const [refreshKey, setRefreshKey] = useState(0);
  const { user } = AuthHelper();
  
  // Create a function to refresh channel data
  const refreshChannelData = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, [refreshKey]);

  // Use the realtime provider for logging
  const { setRealtimeChangeHandler } = useRealtime();
  const pendingUpdatesRef = useRef<boolean>(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  // Handle realtime changes
  useEffect(() => {
    setRealtimeChangeHandler((payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      const username = (newRecord as any)?.username || (oldRecord as any)?.username;

      if (username !== usernameStr) return;

      // Clear any existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      if (eventType === 'UPDATE') {
        if (newRecord?.last_message?.id !== oldRecord?.last_message?.id) {
          console.log(`[ChannelPage] New message in channel ${username}:`, newRecord?.last_message);
          pendingUpdatesRef.current = true;
        }
        if (newRecord?.message_count !== oldRecord?.message_count) {
          console.log(`[ChannelPage] Channel ${username} message count changed: ${oldRecord?.message_count} → ${newRecord?.message_count}`);
          pendingUpdatesRef.current = true;
        }
      } else if (eventType === 'INSERT') {
        console.log(`[ChannelPage] New channel added: ${username} (${newRecord?.message_count} messages)`);
        pendingUpdatesRef.current = true;
      } else if (eventType === 'DELETE') {
        console.log(`[ChannelPage] Channel deleted: ${username}`);
        pendingUpdatesRef.current = true;
      }

      // Set a new timeout to debounce the update
      debounceTimeoutRef.current = setTimeout(() => {
        if (pendingUpdatesRef.current) {
          pendingUpdatesRef.current = false;
          refreshChannelData();
        }
      }, 1000); // Debounce for 1 second
    });

    // Cleanup function
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [usernameStr, setRealtimeChangeHandler, refreshChannelData]);

  // Use the custom hook to fetch channel data
  const {
    channel,
    loading,
    error,
    messages,
    loadingMessages,
    messageError,
    accessStatus,
    refreshMessages
  } = useChannelData(usernameStr, refreshKey);

  // Calculate widths
  const sidebarWidth = Math.floor(screenWidth * 0.20);
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

  // Function to check access status and refresh messages if needed
  const checkAccessStatusAndRefresh = async (channelResponse: any) => {
    
    if (channelResponse && 'access_status' in channelResponse) {
      if (channelResponse.access_status !== accessStatus) {
        refreshChannelData();
      }
    } else if (channelResponse && 'status' in channelResponse) {
      if (channelResponse.status === 'APPROVED') {
        refreshChannelData();
      } else {
        if (refreshMessages) {
          await refreshMessages();
        }
      }
    } else {
      if (refreshMessages) {
        await refreshMessages();
      }
    }
  };

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

          {/* Follow/Join Button */}
          <View className="p-2 border-b border-border">
            {!channel?.is_owner_db ? (
              <FollowButton username={usernameStr} />
            ) : (
              <JoinButton 
                username={usernameStr} 
                accessStatus={accessStatus} 
                channelDetails={channel} 
                onJoin={(channelResponse) => {
                  
                  // Check for updated access status and refresh data accordingly
                  checkAccessStatusAndRefresh(channelResponse);
                }}
                onRequestAccess={() => {
                }}
              />
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
                    data={{
                      ...message,
                      // Ensure required fields are present
                      content: message.content,
                      channel_username: message.channel_username || usernameStr
                    }}
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