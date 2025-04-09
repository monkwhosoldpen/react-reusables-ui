"use client"

import React from 'react'
import { ChannelMessage, Channel } from '@/lib/types/channel.types'
import { MessageCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Spinner } from "@/components/ui/spinner"
import { groupMessagesByDate } from '~/lib/dateUtils'
import { Badge } from 'lucide-react-native'

interface ChannelMessagesProps {
  messages: ChannelMessage[]
  messagesLoading: boolean
  messagesError: string | null
  messagesEndRef: React.RefObject<HTMLDivElement>
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
    <div className="space-y-6 pb-4">
      {/* Channel type indicator */}
      <div className="flex items-center justify-between mb-4 px-2 py-1 bg-background/80 backdrop-blur-sm rounded-lg shadow-sm border border-border/50 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          {/* Message count */}
          <Badge className="ml-2 bg-primary/10 hover:bg-primary/15 text-primary">
            <MessageCircle className="h-3 w-3 mr-1" />
            <span className="text-xs">{messages.length}</span>
          </Badge>
        </div>
      </div>

      {/* Show loading spinner when messages are loading */}
      {messagesLoading && messages.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <Spinner size="large" />
        </div>
      ) : messagesError ? (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
          <p className="text-red-500 font-medium">{messagesError}</p>
          <p className="text-muted-foreground text-sm mt-1">
            Unable to load messages at this time.
          </p>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <MessageCircle className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="font-medium">No messages yet</p>
          <p className="text-muted-foreground text-sm mt-1">
            This channel has no messages yet.
          </p>
        </div>
      ) : (
        // Display message groups
        messageGroups.map((group) => (
          <div key={group.date} className="space-y-2">
            {/* Date separator */}
            <div className="text-center">
              <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded">
                {formatMessageDate(group.date)}
              </span>
            </div>
            
            {/* Messages for this date */}
            {group.messages.map((message: ChannelMessage) => (
              <div key={message.id} className="border rounded p-3 bg-card">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-sm">{message.username}</span>
                  <span className="text-xs text-muted-foreground">{formatMessageTime(message.created_at)}</span>
                </div>
                <div className="text-sm">
                  {message.message_text}
                </div>
              </div>
            ))}
          </div>
        ))
      )}

      {/* Reference for scrolling to bottom */}
      <div ref={messagesEndRef} />
    </div>
  );
} 