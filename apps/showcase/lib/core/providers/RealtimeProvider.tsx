import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { ChannelActivity } from '../types/channel.types';
import { supabase } from '~/lib/core/supabase';

// Define the type for channels_activity table
type ChannelsActivityRecord = {
  username: string;
  last_updated_at: string;
  message_count: number;
  last_message: {
    id: string;
    type: string;
    content: string;
    caption?: string;
    message?: string;
    media: any;
    metadata: any;
    stats: any;
    interactive_content: any;
    fill_requirement: string;
    expires_at?: string;
    channel_username: string;
    created_at: string;
    updated_at: string;
  };
};

type RealtimeContextType = {
  channelActivities: ChannelActivity[];
  error: string | null;
  isLoading: boolean;
  setRealtimeChangeHandler: (handler: (payload: RealtimePostgresChangesPayload<ChannelsActivityRecord>) => void) => void;
};

const RealtimeContext = createContext<RealtimeContextType>({
  channelActivities: [],
  error: null,
  isLoading: false,
  setRealtimeChangeHandler: () => {},
});

export const useRealtime = () => useContext(RealtimeContext);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [channelActivities, setChannelActivities] = useState<ChannelActivity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const debounceTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const onRealtimeChangeRef = useRef<((payload: RealtimePostgresChangesPayload<ChannelsActivityRecord>) => void) | undefined>();

  const fetchChannelActivities = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('channels_activity')
        .select('username, last_updated_at, message_count, last_message')
        .order('last_updated_at', { ascending: false });

      if (error) {
        setError(error.message);
        return;
      }

      // Transform the data to match ChannelActivity type
      const activities = (data || []).map(item => ({
        username: item.username,
        last_updated_at: item.last_updated_at,
        last_message: item.last_message,
        message_count: item.message_count
      }));

      setChannelActivities(activities);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRealtimeChange = useCallback((payload: RealtimePostgresChangesPayload<ChannelsActivityRecord>) => {
    if (!payload || !payload.new && !payload.old) return;

    const { eventType, new: newRecord, old: oldRecord } = payload;
    const username = (newRecord as ChannelsActivityRecord)?.username || (oldRecord as ChannelsActivityRecord)?.username;

    if (!username) return;

    // Clear any existing timeout for this username
    if (debounceTimeoutRef.current[username]) {
      clearTimeout(debounceTimeoutRef.current[username]);
    }

    // Set a new timeout to debounce the update
    debounceTimeoutRef.current[username] = setTimeout(() => {
      setChannelActivities((prev) => {
        const currentActivity = prev.find(a => a.username === username);
        const oldCount = currentActivity?.message_count || 0;
        const newCount = (newRecord as ChannelsActivityRecord)?.message_count || 0;

        // Enhanced logging for different types of changes
        if (eventType === 'UPDATE') {
          if (oldCount !== newCount) {
          }
          if ((newRecord as ChannelsActivityRecord)?.last_message?.id !== currentActivity?.last_message?.id) {
          }
        } else if (eventType === 'INSERT') {
        } else if (eventType === 'DELETE') {
        }

        // Call the external change handler if provided
        onRealtimeChangeRef.current?.(payload);

        switch (eventType) {
          case 'INSERT':
            return [...prev, newRecord as ChannelsActivityRecord];
          case 'UPDATE':
            return prev.map((activity) =>
              activity.username === username ? (newRecord as ChannelsActivityRecord) : activity
            );
          case 'DELETE':
            return prev.filter((activity) => activity.username !== username);
          default:
            return prev;
        }
      });
    }, 1000); // Debounce for 1 second
  }, []);

  useEffect(() => {
    fetchChannelActivities();

    // Subscribe to channel activity changes
    const channelActivitySubscription = supabase
      .channel('channel-activity-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'channels_activity',
        },
        handleRealtimeChange
      )
      .subscribe((status) => {
      });

    return () => {
      // Clear all debounce timeouts on cleanup
      Object.values(debounceTimeoutRef.current).forEach(timeout => clearTimeout(timeout));
      channelActivitySubscription.unsubscribe();
    };
  }, [handleRealtimeChange]);

  // Function to set the realtime change handler
  const setRealtimeChangeHandler = useCallback((handler: (payload: RealtimePostgresChangesPayload<ChannelsActivityRecord>) => void) => {
    onRealtimeChangeRef.current = handler;
  }, []);

  return (
    <RealtimeContext.Provider
      value={{
        channelActivities,
        error,
        isLoading,
        setRealtimeChangeHandler
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
} 