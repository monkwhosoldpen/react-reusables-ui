import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { ChannelMessage } from '@/lib/types/channel.types';

interface UseChannelMessagesProps {
  username: string;
  pageSize?: number;
}

interface AccessStatus {
  canView: boolean;
  isPremium: boolean;
  isFollowing: boolean;
  [key: string]: any;
}

export function useChannelMessages({ username, pageSize = 20 }: UseChannelMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [initialScrollDone, setInitialScrollDone] = useState(false);
  
  // State for messages
  const [messages, setMessages] = useState<ChannelMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [accessStatus, setAccessStatus] = useState<AccessStatus>({
    canView: false,
    isPremium: false,
    isFollowing: false
  });
  
  // Get authentication state
  const auth = useAuth();

  // Update last viewed timestamp when user views the channel
  useEffect(() => {
    const updateLastViewed = async () => {
      if (auth.user?.id && username) {
        const success = await auth.updateChannelLastViewed(username);
        if (!success) {
          console.error('Failed to update last viewed timestamp');
        }
      }
    };

    updateLastViewed();
  }, [auth.user?.id, username, auth.updateChannelLastViewed]);

  // Fetch messages function
  const fetchMessages = async (lastTimestamp: string | null = null) => {
    setMessagesLoading(true);
    setMessagesError(null);

    try {
      const result = await auth.fetchChannelMessages(
        username,
        pageSize,
        lastTimestamp
      );

      if (result.error) {
        setMessagesError(result.error);
      } else {
        if (lastTimestamp) {
          // Append to existing messages for pagination
          setMessages(prevMessages => [...prevMessages, ...result.messages]);
        } else {
          // Replace messages for initial load
          setMessages(result.messages);

          // Scroll to bottom after messages are loaded (for initial load or refresh)
          setTimeout(() => {
            scrollToBottom();
          }, 100);
        }

        // Update access status and hasMore flag
        setAccessStatus(result.accessStatus || {
          canView: true,
          isPremium: false,
          isFollowing: false
        });
        setHasMoreMessages(result.hasMore);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessagesError('An error occurred while loading messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  // Function to scroll to the bottom of the messages
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Fetch messages when component mounts
  useEffect(() => {
    if (username) {
      fetchMessages();
    }
  }, [username, auth.user?.email]);

  // Handle loading more messages
  const handleLoadMore = async () => {
    if (messagesLoading || !hasMoreMessages) return;

    // Get the oldest message timestamp for pagination
    if (messages.length > 0) {
      const oldestMessage = messages.reduce((oldest, current) =>
        new Date(oldest.created_at) < new Date(current.created_at) ? oldest : current,
        messages[0]
      );

      if (oldestMessage) {
        await fetchMessages(oldestMessage.created_at);
      }
    }
  };

  // Scroll to bottom when new messages are added or on initial load
  useEffect(() => {
    if (messages.length > 0 && !messagesLoading) {
      // Use auto behavior for initial load (WhatsApp-like immediate scroll)
      // and smooth for subsequent scrolls
      const scrollBehavior: ScrollIntoViewOptions = initialScrollDone
        ? { behavior: 'smooth' }
        : { behavior: 'auto' };

      // Scroll to the bottom
      messagesEndRef.current?.scrollIntoView(scrollBehavior)

      // Mark initial scroll as done
      if (!initialScrollDone) {
        setInitialScrollDone(true)
      }
    }
  }, [messages, messagesLoading, initialScrollDone]);

  // Listen for messages from service worker
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.serviceWorker) return;

    const handleServiceWorkerMessage = (event: MessageEvent) => {
      const data = event.data;

      // If it's a notification for the current channel, refresh messages
      if (data && data.type === 'TOAST_NOTIFICATION' && data.notification) {
        const notification = data.notification;

        // Check if the notification is for the current channel
        if (notification.data?.channelActivity?.username === username) {
          console.log(`Refreshing messages for channel ${username} due to service worker notification`);
          fetchMessages();
        }
      }
    };

    // Add event listener for messages from service worker
    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

    // Clean up event listener
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, [username]);

  return {
    messages,
    messagesLoading,
    messagesError,
    hasMoreMessages,
    accessStatus,
    messagesEndRef,
    fetchMessages,
    handleLoadMore,
    scrollToBottom
  };
} 