"use client"

import React from 'react'
import { View, Text, ScrollView } from 'react-native'
import { ChannelMessage, Channel } from '@/lib/types/channel.types'
import { MessageCircle, AlertCircle } from 'lucide-react'
import { groupMessagesByDate } from '~/lib/dateUtils'
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider'

interface ChannelMessagesProps {
  messages: ChannelMessage[]
  messagesLoading: boolean
  messagesError: string | null
  messagesEndRef: React.RefObject<View>
  onRequestAccess?: () => void
  onLoadMore?: () => void
  channelDetails: Channel
  onRefreshMessages?: () => void
}

export function ChannelMessages({
  messages,
  messagesLoading,
  messagesError,
  messagesEndRef,
  onLoadMore,
  channelDetails,
  onRefreshMessages
}: ChannelMessagesProps) {
  const { colorScheme } = useColorScheme();

  // Group messages by date
  const messageGroups = groupMessagesByDate(messages);

  // Format date for display
  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format time for display
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <View className="flex-1 p-4">
      {/* Channel type indicator */}
      <View className="flex-row items-center justify-between mb-4 p-2 rounded-lg border border-border">
        <View className="flex-row items-center gap-2 p-2 rounded bg-primary/10">
          <MessageCircle size={12} color={colorScheme.colors.primary} />
          <Text className="text-xs text-primary">
            {messages.length}
          </Text>
        </View>
      </View>

      {/* Show loading spinner when messages are loading */}
      {messagesLoading && messages.length === 0 ? (
        <View className="flex-1 justify-center items-center py-12">
          <Text className="mt-2 text-base text-muted-foreground">
            Loading messages...
          </Text>
        </View>
      ) : messagesError ? (
        <View className="flex-1 justify-center items-center p-6">
          <AlertCircle size={40} color="#ef4444" className="mb-2" />
          <Text className="text-lg text-destructive mb-2">
            {messagesError}
          </Text>
          <Text className="text-base text-muted-foreground">
            Unable to load messages at this time.
          </Text>
        </View>
      ) : messages.length === 0 ? (
        <View className="flex-1 justify-center items-center p-6">
          <MessageCircle size={40} color={colorScheme.colors.text} className="mb-2" />
          <Text className="text-lg text-foreground mb-2">
            No messages yet
          </Text>
          <Text className="text-base text-muted-foreground">
            This channel has no messages yet.
          </Text>
        </View>
      ) : (
        // Display message groups
        messageGroups.map((group) => (
          <View key={group.date} className="mb-4">
            {/* Date separator */}
            <View className="items-center mb-2">
              <Text className="text-xs font-medium px-2 py-1 rounded bg-background">
                {formatMessageDate(group.date)}
              </Text>
            </View>
            
            {/* Messages for this date */}
            {group.messages.map((message: ChannelMessage) => (
              <View key={message.id} className="p-3 mb-2 rounded-lg border border-border bg-card">
                <View className="flex-row justify-between items-start mb-1">
                  <Text className="text-sm font-semibold text-foreground">
                    {message.username}
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    {formatMessageTime(message.created_at)}
                  </Text>
                </View>
                <Text className="text-sm text-foreground">
                  {message.message_text}
                </Text>
              </View>
            ))}
          </View>
        ))
      )}

      {/* Reference for scrolling to bottom */}
      <View ref={messagesEndRef} />
    </View>
  );
} 