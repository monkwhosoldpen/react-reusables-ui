import { useState, useCallback, useEffect } from 'react';

import { useAuth } from '~/lib/core/contexts/AuthContext';
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

      // First, create the message
      const { data: messageData, error: messageError } = await supabase
        .from('superfeed')
        .insert({
          channel_username: user?.email || feedItem.channel_username,
          content: feedItem.content || feedItem.message || feedItem.interactive_content?.survey?.title || 'Survey',
          type: feedItem.type,
          media: feedItem.media,
          metadata: feedItem.metadata,
          stats: feedItem.stats,
          interactive_content: feedItem.interactive_content
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Determine the correct response type based on feedItem type
      const responseType = feedItem.type === 'message' ? 'poll' : feedItem.type;

      // Then create the response using the message ID
      const { data: responseData, error: responseError } = await supabase
        .from('superfeed_responses')
        .insert({
          feed_item_id: messageData.id,
          user_id: user?.id,
          response_type: responseType,
          response_data: response
        })
        .select()
        .single();

      if (responseError) throw responseError;

      // Update the stats on the message
      const { error: updateError } = await supabase
        .from('superfeed')
        .update({ 
          stats: {
            ...messageData.stats,
            responses: (messageData.stats?.responses || 0) + 1
          }
        })
        .eq('id', messageData.id);

      if (updateError) throw updateError;

      setUserResponse(responseData as InteractiveResponse);
      return responseData;
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