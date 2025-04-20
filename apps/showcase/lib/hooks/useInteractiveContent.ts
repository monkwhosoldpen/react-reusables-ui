import { useState, useCallback, useEffect } from 'react';

import { useAuth } from '~/lib/contexts/AuthContext';
import { FormDataType, InteractiveContent } from '~/lib/enhanced-chat/types/superfeed';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabase = createClient(
  'https://risbemjewosmlvzntjkd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpc2JlbWpld29zbWx2em50amtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxMzIxNDIsImV4cCI6MjA1NTcwODE0Mn0._5wXtDjCr9ZnYatWD7RO5DNhx_YxUjqCcdc6qhZpwGM',
);

interface InteractiveResponse {
  id: string;
  user_id: string;
  message_id: string;
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
    typeof d.message_id === 'string' &&
    ['poll', 'quiz', 'survey'].includes(d.response_type) &&
    typeof d.created_at === 'string'
  );
}

export function useInteractiveContent(feedItem: FormDataType) {
  const { user, refreshUserInfo } = useAuth();
  const isAuthenticated = !!user;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [userResponse, setUserResponse] = useState<InteractiveResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const checkAuthAndRetry = async (operation: () => Promise<any>) => {
    try {
      if (!isAuthenticated) {
        await refreshUserInfo();
        // Wait a short time for auth state to update
        await new Promise(resolve => setTimeout(resolve, 100));
        if (!isAuthenticated) {
          throw new Error('Authentication required');
        }
      }
      return await operation();
    } catch (err) {
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        // Add delay between retries
        await new Promise(resolve => setTimeout(resolve, 1000));
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
          .from('channels_message_responses')
          .select('*')
          .eq('user_id', user.id)
          .eq('message_id', feedItem.id)
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

        // Insert the response into superfeed_responses
        const { data: responseData, error: responseError } = await supabase
          .from('channels_message_responses')
          .insert({
            message_id: feedItem.id,
            user_id: user?.id,
            response_type: feedItem.type,
            response_data: response
          })
          .select()
          .single();

        if (responseError) throw responseError;

        // Update the stats on the superfeed item
        const { error: updateError } = await supabase
          .from('superfeed')
          .update({ stats: updatedStats })
          .eq('id', feedItem.id);

        if (updateError) throw updateError;

        return responseData;
      });

      setUserResponse(result as InteractiveResponse);
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