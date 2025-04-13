"use client"

import React from 'react'
import { View, Text, ScrollView } from 'react-native'
import { ChannelMessage, Channel } from '@/lib/types/channel.types'
import { MessageCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Spinner } from "@/components/ui/spinner"
import { groupMessagesByDate } from '~/lib/dateUtils'
import { Badge } from 'lucide-react-native'

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
    <View style={{ paddingBottom: 16 }}>
      {/* Channel type indicator */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: 'background',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'border'
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {/* Message count */}
          <Badge style={{ marginLeft: 8, backgroundColor: 'primary/10' }}>
            <MessageCircle size={12} style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 12 }}>{messages.length}</Text>
          </Badge>
        </View>
      </View>

      {/* Show loading spinner when messages are loading */}
      {messagesLoading && messages.length === 0 ? (
        <View style={{ justifyContent: 'center', alignItems: 'center', paddingVertical: 48 }}>
          <Spinner size="large" />
        </View>
      ) : messagesError ? (
        <View style={{ alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <AlertCircle size={40} color="red" style={{ marginBottom: 8 }} />
          <Text style={{ color: 'red', fontWeight: '500' }}>{messagesError}</Text>
          <Text style={{ color: 'gray', fontSize: 14, marginTop: 4 }}>
            Unable to load messages at this time.
          </Text>
        </View>
      ) : messages.length === 0 ? (
        <View style={{ alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <MessageCircle size={40} color="gray" style={{ marginBottom: 8 }} />
          <Text style={{ fontWeight: '500' }}>No messages yet</Text>
          <Text style={{ color: 'gray', fontSize: 14, marginTop: 4 }}>
            This channel has no messages yet.
          </Text>
        </View>
      ) : (
        // Display message groups
        messageGroups.map((group) => (
          <View key={group.date} style={{ marginBottom: 8 }}>
            {/* Date separator */}
            <View style={{ alignItems: 'center' }}>
              <Text style={{ 
                fontSize: 12, 
                fontWeight: '500', 
                color: 'gray',
                backgroundColor: 'background',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 4
              }}>
                {formatMessageDate(group.date)}
              </Text>
            </View>
            
            {/* Messages for this date */}
            {group.messages.map((message: ChannelMessage) => (
              <View key={message.id} style={{ 
                borderWidth: 1,
                borderRadius: 8,
                padding: 12,
                backgroundColor: 'card',
                marginTop: 8
              }}>
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: 4
                }}>
                  <Text style={{ fontWeight: '600', fontSize: 14 }}>{message.username}</Text>
                  <Text style={{ fontSize: 12, color: 'gray' }}>{formatMessageTime(message.created_at)}</Text>
                </View>
                <Text style={{ fontSize: 14 }}>
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