import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Channel } from '@/lib/types/channel.types';

interface UseChannelMessagesProps {
  username: string;
}

export function useChannelMessages({ username }: UseChannelMessagesProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [channelDetails, setChannelDetails] = useState<Channel | null>(null);
  
  // Get authentication state
  const auth = useAuth();

  // Fetch channel details
  useEffect(() => {
    if (!username) return;

    const fetchChannelDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { channelData, error } = await auth.fetchChannelDetails(username);
        
        if (error) {
          setError(error);
        } else {
          setChannelDetails(channelData);
          console.log('Channel details:', channelData);
        }
      } catch (error) {
        console.error('Error fetching channel details:', error);
        setError('An error occurred while loading the channel');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChannelDetails();
  }, [username, auth.fetchChannelDetails]);

  return {
    isLoading,
    error,
    channelDetails
  };
} 