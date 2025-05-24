"use client";

import { useCallback, useEffect, useRef, useState, memo } from "react";
import { ScrollView, Text, useWindowDimensions, View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Loader2 } from "lucide-react";

import { Button } from "~/components/ui/button";
import { ChannelHeader } from "~/components/channel-profile/ChannelHeader";
import { ChannelSidebar } from "~/components/channel-profile/ChannelSidebar";
import { FeedItem } from "~/lib/enhanced-chat/components/feed/FeedItem";
import useChannelData from "~/lib/core/utils/channel-profile-util";
import { JoinButton } from "~/components/common/JoinButton";
import { useRealtime } from "~/lib/core/providers/RealtimeProvider";
import { Skeleton } from "~/components/ui/skeleton";
import AiChat from "~/components/ai-chat";

/* ------------ isolated components ------------ */

const MessageSkeleton = memo(() => {
  return (
    <View className="flex-1">
      <View className="flex-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} className="flex-row items-start gap-3 p-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <View className="flex-1 gap-2">
              <View className="flex-row items-center gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </View>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </View>
          </View>
        ))}
      </View>

      {/* Message Input Skeleton */}
      <View className="border-t border-border bg-background p-4">
        <View className="flex-row items-center gap-2">
          <View className="flex-1 bg-muted rounded-lg p-3">
            <Skeleton className="h-5 w-full" />
          </View>
          <Skeleton className="h-10 w-20 rounded-lg" />
        </View>
      </View>
    </View>
  );
});

const AgentChat = memo(({ username }: { username: string }) => {
  return (
    <AiChat />
  );
});

type MainContentProps = {
  width: number;
  username: string;
  channel: any;
  refreshKey: number;
};

const MainContent = memo(({
  width,
  username,
  channel,
  refreshKey,
}: MainContentProps) => {
  const isPrivate = channel?.is_owner_db;
  const isAgent = channel?.is_agent;

  // Move message fetching here
  const {
    messages,
    loading: loadingMessages,
    error: messageError,
    accessStatus,
    refreshMessages,
  } = useChannelData(username, refreshKey);

  const renderLoading = (label: string) => (
    <View className="flex-1">
      <MessageSkeleton />
    </View>
  );

  const renderMessages = () => (
    <View className="flex-1">
      <View className="flex-1">
        <ScrollView className={`flex-1 ${isPrivate ? "border-red-500" : "border-blue-500"}`} contentContainerStyle={{ padding: 8 }}>
          {loadingMessages ? (
            renderLoading("Loading messages...")
          ) : messageError ? (
            <View className="items-center justify-center p-6">
              <Text className="mb-2 text-lg text-foreground">{messageError}</Text>
              <Text className="text-base text-muted-foreground">There was a problem loading messages.</Text>
            </View>
          ) : messages.length === 0 ? (
            <View className="items-center justify-center p-6">
              <Text className="mb-2 text-lg text-foreground">No messages yet</Text>
              <Text className="text-base text-muted-foreground">This channel hasn't posted any messages.</Text>
            </View>
          ) : (
            messages.map((msg, idx) => (
              <FeedItem
                key={msg.id ?? idx}
                data={{
                  ...msg,
                  channel_username: msg.channel_username ?? username,
                }}
                showHeader={msg.metadata?.visibility?.header ?? true}
                showFooter={msg.metadata?.visibility?.footer ?? false}
              />
            ))
          )}
        </ScrollView>
      </View>

      <View className="border-t border-border bg-background p-4">
        <View className="flex-row items-center gap-2">
          <View className="flex-1 bg-muted rounded-lg p-3">
            <Text className="text-muted-foreground">Type your message here...</Text>
          </View>
          <Button variant="secondary" onPress={() => { }}>
            <Text>Send</Text>
          </Button>
        </View>
      </View>
    </View>
  );

  const renderNoAccess = () => (
    <View className="flex-1 items-center justify-center bg-orange-500/10">
      <View className="bg-background/95 p-6 rounded-md items-center max-w-md">
        <Text className="text-xl font-bold text-orange-600 dark:text-orange-400 text-center mb-3">Private Channel</Text>
        <Text className="text-sm text-muted-foreground text-center mb-4">
          This is a private channel. Join to view and participate in conversations.
        </Text>
        <View className="w-full">
          <JoinButton
            username={username}
            accessStatus={accessStatus}
            channelDetails={channel}
            onJoin={refreshMessages}
          />
        </View>
      </View>
    </View>
  );

  // Main render logic following the flow
  const renderContent = () => {
    // If still loading, show loading state
    if (loadingMessages) {
      return renderLoading("Loading messages...");
    }

    // If public channel, show messages directly
    if (!isPrivate) {
      return renderMessages();
    }

    // If private channel, check access (only after loading is complete)
    if (accessStatus !== "APPROVED") {
      return renderNoAccess();
    }

    // If has access, check if agent
    if (isAgent) {
      return <AgentChat username={username} />;
    }

    // Otherwise show regular messages
    return renderMessages();
  };

  return (
    <View style={{ width }} className="bg-background flex-1">
      {renderContent()}
    </View>
  );
});

const PageSkeleton = memo(() => {
  const { width: screenWidth } = useWindowDimensions();
  const sidebarWidth = Math.floor(screenWidth * 0.2);
  const contentWidth = screenWidth - sidebarWidth;

  return (
    <View className="flex-1 bg-background">
      {/* Header Skeleton */}
      <View className="border-b border-border bg-background p-4">
        <View className="flex-row items-center gap-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <View className="flex-1 gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </View>
        </View>
      </View>

      <View className="flex-1 flex-row">
        {/* Sidebar Skeleton */}
        <View
          style={{ width: sidebarWidth }}
          className="border-border border-r bg-white dark:bg-gray-800"
        >
          <View className="flex-1">
            <ScrollView className="flex-1">
              {/* Parent Channel Skeleton */}
              <View className="flex-col items-center py-2 px-1 m-1 shadow-sm bg-gray-50 dark:bg-gray-700/50">
                <Skeleton className="w-12 h-12 rounded-full" />
                <Skeleton className="h-3 w-16 mt-1.5" />
              </View>

              {/* Related Channels Skeletons */}
              {[1, 2, 3].map((i) => (
                <View key={i} className="flex-col items-center py-2 px-1 m-1 shadow-sm bg-white dark:bg-gray-800">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <Skeleton className="h-3 w-16 mt-1.5" />
                </View>
              ))}
            </ScrollView>

            {/* Settings Section Skeleton */}
            <View className="border-t border-gray-200 dark:border-gray-700 mt-2">
              <View className="flex-col items-center py-3 px-1">
                <Skeleton className="w-12 h-12 rounded-full" />
                <Skeleton className="h-3 w-16 mt-1.5" />
              </View>
            </View>
          </View>
        </View>

        {/* Main Content Skeleton */}
        <View style={{ width: contentWidth }} className="bg-background">
          <MessageSkeleton />
        </View>
      </View>
    </View>
  );
});

/* --------------------------------------------------------- */

export default function ChannelPage() {
  const router = useRouter();
  const { username } = useLocalSearchParams();
  const usernameStr = Array.isArray(username) ? username[0] : username ?? "";

  const { width: screenWidth } = useWindowDimensions();
  const sidebarWidth = Math.floor(screenWidth * 0.2);
  const contentWidth = screenWidth - sidebarWidth;

  const [refreshKey, setRefreshKey] = useState(0);
  const refreshChannelData = useCallback(() => setRefreshKey((k) => k + 1), []);

  const { setRealtimeChangeHandler } = useRealtime();
  const pendingUpdates = useRef(false);
  const debounceTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setRealtimeChangeHandler(({ eventType, new: n, old: o }) => {
      const changed = (n as any)?.username ?? (o as any)?.username;
      if (changed !== usernameStr) return;

      if (
        eventType !== "UPDATE" ||
        n?.last_message?.id !== o?.last_message?.id ||
        n?.message_count !== o?.message_count
      ) {
        pendingUpdates.current = true;
      }

      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        if (pendingUpdates.current) {
          pendingUpdates.current = false;
          refreshChannelData();
        }
      }, 1000);
    });

    return () => clearTimeout(debounceTimer.current);
  }, [usernameStr, setRealtimeChangeHandler, refreshChannelData]);

  const {
    channel,
    loading,
    error,
  } = useChannelData(usernameStr, refreshKey);

  if (loading) return <PageSkeleton />;
  if (error || !channel) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-background">
        <Text className="mb-2 text-lg text-foreground">{error}</Text>
        <Text className="mb-6 text-base text-muted-foreground">
          There was a problem loading the channel.
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
        onBack={() => router.push("/")}
      />

      <View className="flex-1 flex-row">
        <View
          style={{ width: sidebarWidth }}
          className="border-border border-r bg-background"
        >
          <ChannelSidebar
            username={usernameStr}
            channelDetails={channel}
            selectedChannel={usernameStr}
            sidebarWidth={sidebarWidth}
          />
        </View>

        <MainContent
          width={contentWidth}
          username={usernameStr}
          channel={channel}
          refreshKey={refreshKey}
        />
      </View>
    </View>
  );
}
