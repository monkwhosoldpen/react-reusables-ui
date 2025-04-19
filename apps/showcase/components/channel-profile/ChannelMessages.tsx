"use client"

import React from 'react'
import { View, Text, ScrollView } from 'react-native'
import { ChannelMessage, Channel } from '@/lib/types/channel.types'
import { MessageCircle, AlertCircle, Users } from 'lucide-react'
import { groupMessagesByDate } from '~/lib/dateUtils'
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider'
import { JoinButton } from '@/components/common/JoinButton'
import { FollowButton } from '@/components/common/FollowButton'

interface ChannelMessagesProps {
  messages: ChannelMessage[]
  messagesLoading: boolean
  messagesError: string | null
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

  const ChannelProperty = ({ label, value }: { label: string; value: boolean }) => (
    <View className="flex-row items-center gap-1 px-2 py-1 rounded bg-primary/10">
      <Text className="text-[8px] text-primary">
        {label}: {value ? 'Yes' : 'No'}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 p-4">
      <View className="flex-col gap-2 mb-4">
        <View className="flex-col gap-2">

          {/* Current Channel */}
          <View className="flex-col items-center p-1.5 rounded-lg m-0.5 bg-card">
            <View className="w-9 h-9 rounded-full bg-primary/10 items-center justify-center">
              <Users size={18} color={colorScheme.colors.primary} />
            </View>
            <Text className="text-[10px] text-center mt-0.5">
              {username}
              <Text className="text-[8px] text-muted-foreground"> (Current)</Text>
            </Text>
            <View className="flex-row flex-wrap gap-1 mt-1">
              <ChannelProperty label="Agent" value={channelDetails.is_agent} />
              <ChannelProperty label="Owner" value={channelDetails.is_owner_db} />
              <ChannelProperty label="Premium" value={channelDetails.is_premium} />
              <ChannelProperty label="Public" value={channelDetails.is_public} />
              <ChannelProperty label="Realtime" value={channelDetails.is_realtime} />
              <ChannelProperty label="Update Only" value={channelDetails.is_update_only} />
            </View>
          </View>

          {/* Parent Channel */}
          {channelDetails.parent_channel && (
            <View className="flex-col items-center p-1.5 rounded-lg m-0.5 bg-card">
              <View className="w-9 h-9 rounded-full bg-primary/10 items-center justify-center">
                <Users size={18} color={colorScheme.colors.primary} />
              </View>
              <Text className="text-[10px] text-center mt-0.5 font-medium">
                {channelDetails.parent_channel.username}
                <Text className="text-[8px] text-muted-foreground"> (Parent)</Text>
              </Text>
              <View className="flex-row flex-wrap gap-1 mt-1">
                <ChannelProperty label="Agent" value={channelDetails.parent_channel.is_agent} />
                <ChannelProperty label="Owner" value={channelDetails.parent_channel.is_owner_db} />
                <ChannelProperty label="Premium" value={channelDetails.parent_channel.is_premium} />
                <ChannelProperty label="Public" value={channelDetails.parent_channel.is_public} />
                <ChannelProperty label="Realtime" value={channelDetails.parent_channel.is_realtime} />
                <ChannelProperty label="Update Only" value={channelDetails.parent_channel.is_update_only} />
              </View>
            </View>
          )}

          {/* Related Channels Count */}
          {channelDetails.related_channels && channelDetails.related_channels.length > 0 && (
            <View className="flex-col items-center p-1.5 rounded-lg bg-card">
              <View className="w-9 h-9 rounded-full bg-primary/10 items-center justify-center">
                <Users size={18} color={colorScheme.colors.primary} />
              </View>
              <Text className="text-[10px] text-center mt-0.5">
                {channelDetails.related_channels.length} Related Channels
              </Text>
            </View>
          )}
        </View>

        {/* Message count and Action button */}
        <View className="flex-row items-center justify-between p-2 rounded-lg border border-border">
          <View className="flex-row items-center gap-2 p-2 rounded bg-primary/10">
            <MessageCircle size={12} color={colorScheme.colors.primary} />
            <Text className="text-xs text-primary">
              {messages.length}
            </Text>
          </View>
          {channelDetails.is_public ? (
            <FollowButton 
              username={channelDetails.username}
              size="sm"
              showIcon={false}
            />
          ) : (
            <JoinButton 
              username={channelDetails.username}
              channelDetails={channelDetails}
              size="sm"
              showIcon={false}
            />
          )}
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