import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Channel, ChannelMessage } from '@/lib/types/channel.types';

interface UseChannelMessagesProps {
  username: string;
}

export function useChannelMessages({ username }: UseChannelMessagesProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [channelDetails, setChannelDetails] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<ChannelMessage[]>([]);
  
  // Get authentication state
  const auth = useAuth();

  // Fetch channel details and messages
  useEffect(() => {
    if (!username) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch channel details
        const { channelData, error: channelError } = await auth.fetchChannelDetails(username);
        
        if (channelError) {
          setError(channelError);
          return;
        }
        
        setChannelDetails(channelData);

        // Fetch messages
        const { messages: channelMessages, error: messagesError } = await auth.fetchChannelMessages(username, 50);
        
        if (messagesError) {
          setError(messagesError);
          return;
        }

        setMessages(channelMessages);
      } catch (error) {
        console.error('Error fetching channel data:', error);
        setError('An error occurred while loading the channel');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [username, auth]);

  return {
    isLoading,
    error,
    channelDetails,
    messages
  };
} 