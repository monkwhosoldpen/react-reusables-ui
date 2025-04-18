import { useState, useCallback, useEffect } from 'react';
import { supabase } from '~/lib/supabase';
import { useAuth } from '~/lib/contexts/AuthContext';
import { FormDataType } from '~/lib/enhanced-chat/types/superfeed';

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
  const { user, isAuthenticated, refreshAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [userResponse, setUserResponse] = useState<InteractiveResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const checkAuthAndRetry = async (operation: () => Promise<any>) => {
    try {
      if (!isAuthenticated) {
        await refreshAuth();
        if (!isAuthenticated) {
          throw new Error('Authentication required');
        }
      }
      return await operation();
    } catch (err) {
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        return checkAuthAndRetry(operation);
      }
      throw err;
    }
  };

  const checkUserResponse = useCallback(async () => {
    if (!user || !feedItem.id) return null;

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await checkAuthAndRetry(async () => {
        const { data, error } = await supabase
          .from('superfeed_responses')
          .select('*')
          .eq('user_id', user.id)
          .eq('feed_item_id', feedItem.id)
          .single();

        if (error) throw error;
        return data;
      });

      if (isInteractiveResponse(response)) {
        setUserResponse(response);
        return response;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to check user response'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, feedItem.id, isAuthenticated]);

  const submitResponse = async (response: any) => {
    if (isSubmitting) {
      throw new Error('Already submitting response');
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const result = await checkAuthAndRetry(async () => {
        const currentStats = feedItem.stats || {
          views: 0,
          likes: 0,
          shares: 0,
          responses: 0
        };

        const updatedStats = {
          ...currentStats,
          responses: currentStats.responses + 1
        };

        const { data: updatedFeedItem, error } = await supabase
          .from('superfeed')
          .update({ 
            stats: updatedStats,
            interactive_content: {
              ...feedItem.interactive_content,
              responses: [...(feedItem.interactive_content?.responses || []), response]
            }
          })
          .eq('id', feedItem.id)
          .select()
          .single();

        if (error) throw error;
        return updatedFeedItem;
      });

      setUserResponse(response as InteractiveResponse);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to submit response'));
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add cleanup on unmount
  useEffect(() => {
    return () => {
      setIsLoading(false);
      setIsSubmitting(false);
      setError(null);
    };
  }, []);

  return {
    isLoading,
    error,
    userResponse,
    isSubmitting,
    checkUserResponse,
    submitResponse,
    isAuthenticated: !!user,
  };
} 