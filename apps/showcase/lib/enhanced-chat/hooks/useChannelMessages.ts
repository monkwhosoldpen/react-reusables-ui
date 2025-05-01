import { useState, useEffect } from 'react';
import { useAuth } from '~/lib/core/contexts/AuthContext';
import { Channel, ChannelMessage } from '~/lib/core/types/channel.types';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabase = createClient(
  'https://risbemjewosmlvzntjkd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpc2JlbWpld29zbWx2em50amtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxMzIxNDIsImV4cCI6MjA1NTcwODE0Mn0._5wXtDjCr9ZnYatWD7RO5DNhx_YxUjqCcdc6qhZpwGM',
);

interface UseChannelMessagesProps {
  username: string;
}

export function useChannelMessages({ username }: UseChannelMessagesProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [channelDetails, setChannelDetails] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<ChannelMessage[]>([]);
  const [accessStatus, setAccessStatus] = useState<string>('none');
  
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

        // Fetch messages directly from Supabase
        const { data, error: messagesError } = await supabase
          .from('channels_messages')
          .select('*')
          .eq('username', username)
          .order('created_at', { ascending: true })
          .limit(50);

        if (messagesError) {
          console.error('Error fetching messages:', messagesError);
          setError('Failed to fetch channel messages');
          return;
        }

        setMessages(data || []);
        setAccessStatus('none'); // Default access status
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
    messages,
    accessStatus
  };
} 