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
import { FollowButton } from "~/components/common/FollowButton";
import { JoinButton } from "~/components/common/JoinButton";
import { useRealtime } from "~/lib/core/providers/RealtimeProvider";

/* ------------ isolated main-content component ------------ */
type MainContentProps = {
  width: number;
  username: string;
  channel: any;
  messages: any[];
  loadingMessages: boolean;
  messageError: string | null;
  accessStatus: string;
  refreshMessages: () => void;
};

const MainContent = memo(
  ({
    width,
    username,
    channel,
    messages,
    loadingMessages,
    messageError,
    accessStatus,
    refreshMessages,
  }: MainContentProps) => {
    const isPrivate = channel?.is_owner_db;

    const renderLoading = (label: string) => (
      <View className="flex-1 items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <Text className="mt-2 text-base text-muted-foreground">{label}</Text>
      </View>
    );

    return (
      <View style={{ width }} className="bg-background flex-1">
        {/* MESSAGES SECTION WITH SCROLL */}
        <View className="flex-1 relative">
          {isPrivate && accessStatus !== "APPROVED" && (
            <View className="absolute inset-0 z-50 backdrop-blur-md bg-orange-500/30 items-center justify-center">
              <View className="bg-orange-500/90 p-8 rounded-lg items-center max-w-md">
                <Text className="text-2xl font-bold text-white text-center mb-4">
                  No Access
                </Text>
                <View className="p-2">
                  {isPrivate ? (
                    <JoinButton
                      username={username}
                      accessStatus={accessStatus}
                      channelDetails={channel}
                      onJoin={refreshMessages}
                    />
                  ) : (
                    <FollowButton username={username} />
                  )}
                </View>
              </View>
            </View>
          )}

          <ScrollView
            className={`flex-1 p-2 border-2 ${
              isPrivate ? "border-red-500" : "border-blue-500"
            }`}
          >
            {loadingMessages
              ? renderLoading("Loading messages...")
              : messageError
              ? (
                <View className="flex-1 items-center justify-center p-6">
                  <Text className="mb-2 text-lg text-foreground">
                    {messageError}
                  </Text>
                  <Text className="text-base text-muted-foreground">
                    There was a problem loading messages.
                  </Text>
                </View>
              )
              : messages.length === 0
              ? (
                <View className="flex-1 items-center justify-center p-6">
                  <Text className="mb-2 text-lg text-foreground">
                    No messages yet
                  </Text>
                  <Text className="text-base text-muted-foreground">
                    This channel hasn't posted any messages.
                  </Text>
                </View>
              )
              : messages.map((msg, idx) => (
                  <FeedItem
                    key={msg.id ?? idx}
                    data={{
                      ...msg,
                      channel_username: msg.channel_username ?? username,
                    }}
                    showHeader={msg.metadata?.visibility?.header ?? true}
                    showFooter={msg.metadata?.visibility?.footer ?? false}
                  />
                ))}
          </ScrollView>
        </View>

        {/* MESSAGE INPUT SECTION */}
        <View className="border-t border-border bg-background p-4">
          <View className="flex-row items-center gap-2">
            <View className="flex-1 bg-muted rounded-lg p-3">
              <Text className="text-muted-foreground">
                Type your message here...
              </Text>
            </View>
            <Button variant="secondary" onPress={() => {}}>
              <Text>Send</Text>
            </Button>
          </View>
        </View>
      </View>
    );
  }
);
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
    messages,
    loadingMessages,
    messageError,
    accessStatus,
    refreshMessages,
  } = useChannelData(usernameStr, refreshKey);

  const renderLoading = (label: string) => (
    <View className="flex-1 items-center justify-center p-6">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <Text className="mt-2 text-base text-muted-foreground">{label}</Text>
    </View>
  );

  if (loading) return renderLoading("Loading channel...");
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

        {/* use the refactored component */}
        <MainContent
          width={contentWidth}
          username={usernameStr}
          channel={channel}
          messages={messages}
          loadingMessages={loadingMessages}
          messageError={messageError}
          accessStatus={accessStatus}
          refreshMessages={refreshMessages}
        />
      </View>
    </View>
  );
}
