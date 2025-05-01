"use client"

import React from 'react'
import { View, Text, ScrollView } from 'react-native'
import { ChannelMessage, Channel } from '~/lib/core/types/channel.types'
import { MessageCircle, AlertCircle } from 'lucide-react'
import { groupMessagesByDate } from '~/lib/core/utils/dateUtils'
import { useColorScheme } from '~/lib/core/providers/theme/ColorSchemeProvider'
import { FeedItem } from '~/lib/enhanced-chat/components/feed/FeedItem'
import { DEFAULT_METADATA } from '~/lib/enhanced-chat/utils/feedData'
import { FeedItemType, MediaItem, PollData, QuizData, SurveyData } from '~/lib/enhanced-chat/types/superfeed'

interface ChannelMessagesProps {
  messages: ChannelMessage[]
  messagesLoading: boolean
  messagesError: Error | null
  messagesEndRef: React.RefObject<View>
  onRequestAccess?: () => void
  onLoadMore?: () => void
  channelDetails: Channel
  onRefreshMessages?: () => void
  username: string
}

export function ChannelMessages({
  messages,
  messagesLoading,
  messagesError,
  messagesEndRef,
  onLoadMore,
  channelDetails,
  onRefreshMessages,
  username
}: ChannelMessagesProps) {
  const { colorScheme } = useColorScheme();

  if (messagesLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading messages...</Text>
      </View>
    );
  }

  if (messagesError) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Error loading messages: {messagesError.message}</Text>
      </View>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>No messages yet</Text>
      </View>
    );
  }

  // Group messages by date
  const groupedMessages = messages.reduce((acc, message) => {
    const date = new Date(message.created_at).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(message);
    return acc;
  }, {} as Record<string, ChannelMessage[]>);

  return (
    <ScrollView className="flex-1">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <View key={date} className="mb-4">
          <Text className="text-sm text-gray-500 mb-2">{date}</Text>
          {dateMessages.map((message) => {
            // Parse message_text as JSON to extract media and interactive content
            let media: MediaItem[] = [];
            let interactive_content: { poll?: PollData; quiz?: QuizData; survey?: SurveyData } = {};
            let content = message.message_text;

            try {
              const parsed = JSON.parse(message.message_text);
              if (parsed.media) media = parsed.media;
              if (parsed.interactive_content) interactive_content = parsed.interactive_content;
              if (parsed.content) content = parsed.content;
            } catch (e) {
              // If parsing fails, use the message_text as is
            }

            return (
              <View key={message.id} className="mb-4">
                <FeedItem
                  data={{
                    id: message.id,
                    type: 'message' as FeedItemType,
                    content: content,
                    media: media,
                    metadata: {
                      ...DEFAULT_METADATA,
                      timestamp: message.created_at,
                      isCollapsible: true
                    },
                    channel_username: username,
                    interactive_content: interactive_content,
                    created_at: message.created_at,
                    updated_at: message.updated_at
                  }}
                  showHeader={true}
                  showFooter={true}
                />
              </View>
            );
          })}
        </View>
      ))}
      <View ref={messagesEndRef} />
    </ScrollView>
  );
} 