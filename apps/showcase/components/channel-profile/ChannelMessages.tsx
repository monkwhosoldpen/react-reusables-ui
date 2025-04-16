"use client"

import React from 'react'
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, useWindowDimensions } from 'react-native'
import { ChannelMessage, Channel } from '@/lib/types/channel.types'
import { MessageCircle, AlertCircle, Loader2 } from 'lucide-react'
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  channelTypeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  messageCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorIcon: {
    marginBottom: 8,
  },
  errorText: {
    fontWeight: '500',
    fontSize: 16,
  },
  errorSubText: {
    fontSize: 14,
    marginTop: 4,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyStateIcon: {
    marginBottom: 8,
  },
  emptyStateText: {
    fontWeight: '500',
    fontSize: 16,
  },
  emptyStateSubText: {
    fontSize: 14,
    marginTop: 4,
  },
  dateSeparator: {
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  messageContainer: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  messageUsername: {
    fontWeight: '600',
    fontSize: 14,
  },
  messageTime: {
    fontSize: 12,
  },
  messageContent: {
    fontSize: 14,
  },
});

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
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

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
    <View style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
      {/* Channel type indicator */}
      <View style={[styles.channelTypeIndicator, {
        backgroundColor: colorScheme.colors.background,
        borderColor: colorScheme.colors.border,
      }]}>
        <View style={[styles.messageCount, {
          backgroundColor: colorScheme.colors.primary + '10',
        }]}>
          <MessageCircle size={12} color={colorScheme.colors.primary} />
          <Text style={{ fontSize: 12, color: colorScheme.colors.primary }}>
            {messages.length}
          </Text>
        </View>
      </View>

      {/* Show loading spinner when messages are loading */}
      {messagesLoading && messages.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colorScheme.colors.primary} />
          <Text style={{ marginTop: 8, color: colorScheme.colors.text }}>
            Loading messages...
          </Text>
        </View>
      ) : messagesError ? (
        <View style={styles.errorContainer}>
          <AlertCircle size={40} color="#ef4444" style={styles.errorIcon} />
          <Text style={[styles.errorText, { color: '#ef4444' }]}>
            {messagesError}
          </Text>
          <Text style={[styles.errorSubText, { color: colorScheme.colors.text, opacity: 0.7 }]}>
            Unable to load messages at this time.
          </Text>
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <MessageCircle size={40} color={colorScheme.colors.text} style={styles.emptyStateIcon} />
          <Text style={[styles.emptyStateText, { color: colorScheme.colors.text }]}>
            No messages yet
          </Text>
          <Text style={[styles.emptyStateSubText, { color: colorScheme.colors.text, opacity: 0.7 }]}>
            This channel has no messages yet.
          </Text>
        </View>
      ) : (
        // Display message groups
        messageGroups.map((group) => (
          <View key={group.date} style={{ marginBottom: 8 }}>
            {/* Date separator */}
            <View style={styles.dateSeparator}>
              <Text style={[styles.dateText, {
                color: colorScheme.colors.text,
                backgroundColor: colorScheme.colors.background,
              }]}>
                {formatMessageDate(group.date)}
              </Text>
            </View>
            
            {/* Messages for this date */}
            {group.messages.map((message: ChannelMessage) => (
              <View key={message.id} style={[styles.messageContainer, {
                backgroundColor: colorScheme.colors.card,
                borderColor: colorScheme.colors.border,
              }]}>
                <View style={styles.messageHeader}>
                  <Text style={[styles.messageUsername, { color: colorScheme.colors.text }]}>
                    {message.username}
                  </Text>
                  <Text style={[styles.messageTime, { color: colorScheme.colors.text, opacity: 0.7 }]}>
                    {formatMessageTime(message.created_at)}
                  </Text>
                </View>
                <Text style={[styles.messageContent, { color: colorScheme.colors.text }]}>
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