// Utility functions for date formatting in channel messages
import { ChannelMessage, MessageGroup } from '@/lib/types/channel.types';

/**
 * Format time for message display in WhatsApp style (e.g., 2:30 pm)
 */
export const formatMessageTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).toLowerCase(); // WhatsApp uses lowercase am/pm
};

/**
 * Format date for message groups (Today, Yesterday, or full date)
 */
export const formatMessageDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if the message is from today
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }

  // Check if the message is from yesterday
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  // Otherwise, return the date
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Group messages by date for display
 */
export const groupMessagesByDate = (messages: ChannelMessage[]): MessageGroup[] => {
  const groups: MessageGroup[] = [];

  messages.forEach((message) => {
    const messageDate = new Date(message.created_at).toDateString();
    const existingGroup = groups.find(group =>
      new Date(group.date).toDateString() === messageDate
    );

    if (existingGroup) {
      existingGroup.messages.push(message);
    } else {
      groups.push({
        date: message.created_at,
        messages: [message]
      });
    }
  });

  return groups;
}; 