"use client";

import React, { useRef, useState, useCallback } from 'react';
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
import { config } from '~/lib/core/config';
import { AuthHelper } from '~/lib/core/helpers/AuthHelpers';

export default function ChannelPage() {
  const router = useRouter();
  const { username } = useLocalSearchParams();
  const usernameStr = Array.isArray(username) ? username[0] : username || '';
  const { width: screenWidth } = useWindowDimensions();
  const { channelActivities } = useRealtime();
  const prevActivitiesRef = useRef<typeof channelActivities>([]);
  const processedMessagesRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef(true);
  const { user } = AuthHelper();
  
  // Add a refreshKey state to force the useChannelData hook to re-fetch data
  const [refreshKey, setRefreshKey] = useState(0);

  // Create a function to refresh channel data
  const refreshChannelData = useCallback(() => {
    console.log('[ChannelPage] Refreshing channel data with new key:', refreshKey + 1);
    setRefreshKey(prev => prev + 1);
  }, [refreshKey]);

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

  // Function to check access status and refresh messages if needed
  const checkAccessStatusAndRefresh = async (channelResponse: any) => {
    console.log('[ChannelPage] Checking for updated access status from response:', channelResponse);
    
    if (channelResponse && 'access_status' in channelResponse) {
      console.log('[ChannelPage] New access status detected:', channelResponse.access_status);
      if (channelResponse.access_status !== accessStatus) {
        console.log('[ChannelPage] Access status changed, refreshing channel data');
        refreshChannelData();
      }
    } else if (channelResponse && 'status' in channelResponse) {
      console.log('[ChannelPage] Request status detected:', channelResponse.status);
      if (channelResponse.status === 'APPROVED') {
        console.log('[ChannelPage] Request approved, refreshing channel data');
        refreshChannelData();
      } else {
        console.log('[ChannelPage] Request status is:', channelResponse.status, ', refreshing messages');
        if (refreshMessages) {
          await refreshMessages();
        }
      }
    } else {
      console.log('[ChannelPage] No specific status in response, refreshing messages');
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
              <JoinButton 
                username={usernameStr} 
                accessStatus={accessStatus} 
                channelDetails={channel} 
                onJoin={(channelResponse) => {
                  console.log('[ChannelPage] Join successful for channel:', usernameStr);
                  console.log('[ChannelPage] Refreshing channel data after successful join');
                  
                  // Check for updated access status and refresh data accordingly
                  checkAccessStatusAndRefresh(channelResponse);
                }}
                onRequestAccess={() => {
                  console.log('[ChannelPage] Access requested for channel:', usernameStr);
                  console.log('[ChannelPage] Channel details:', channel);
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