import { useState, useCallback } from 'react';
import { supabase } from '~/lib/supabase';
import { useUser } from '~/lib/providers/auth/AuthProvider';
import { FormDataType } from '~/lib/types/superfeed';

interface InteractiveResponse {
  id: string;
  user_id: string;
  feed_item_id: string;
  response_type: 'poll' | 'quiz' | 'survey';
  response_data: any;
  created_at: string;
}

function isInteractiveResponse(data: unknown): data is InteractiveResponse {
  if (!data || typeof data !== 'object') return false;
  const d = data as any;
  return (
    typeof d.id === 'string' &&
    typeof d.user_id === 'string' &&
    typeof d.feed_item_id === 'string' &&
    ['poll', 'quiz', 'survey'].includes(d.response_type) &&
    typeof d.created_at === 'string'
  );
}

export function useInteractiveContent(feedItem: FormDataType) {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [userResponse, setUserResponse] = useState<InteractiveResponse | null>(null);

  const checkUserResponse = useCallback(async () => {
    if (!user || !feedItem.id) return null;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('superfeed_responses')
        .select('*')
        .eq('user_id', user.id)
        .eq('feed_item_id', feedItem.id)
        .single();

      if (error) throw error;
      
      if (isInteractiveResponse(data)) {
        setUserResponse(data);
        return data;
      }
      return null;
    } catch (err) {
      console.error('Error checking user response:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, feedItem.id]);

  const submitResponse = useCallback(async (responseData: any, responseType: 'poll' | 'quiz' | 'survey') => {
    if (!user) {
      setError(new Error('Please sign in to interact with this content'));
      return null;
    }

    if (!feedItem.id) {
      setError(new Error('Invalid feed item'));
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('superfeed_responses')
        .upsert({
          user_id: user.id,
          feed_item_id: feedItem.id,
          response_type: responseType,
          response_data: responseData,
        })
        .select()
        .single();

      if (error) throw error;

      // Update stats
      await supabase
        .from('superfeed')
        .update({
          stats: {
            ...feedItem.stats,
            responses: (feedItem.stats?.responses || 0) + 1
          }
        })
        .eq('id', feedItem.id);

      if (isInteractiveResponse(data)) {
        setUserResponse(data);
        return data;
      }
      throw new Error('Invalid response data received from server');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to submit response');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, feedItem]);

  return {
    isLoading,
    error,
    userResponse,
    checkUserResponse,
    submitResponse,
    isAuthenticated: !!user,
  };
} 