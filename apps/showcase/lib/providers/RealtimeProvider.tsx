import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { ChannelActivity } from '../types/channel.types';
import { supabase } from '@/lib/supabase';

// Define the type for channels_activity table
type ChannelsActivityRecord = {
  username: string;
  last_updated_at: string;
  message_count: number;
  last_message: {
    id: string;
    message_text?: string;
    created_at: string;
  };
};

type RealtimeContextType = {
  channelActivities: ChannelActivity[];
};

const RealtimeContext = createContext<RealtimeContextType>({
  channelActivities: [],
});

export const useRealtime = () => useContext(RealtimeContext);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [channelActivities, setChannelActivities] = useState<ChannelActivity[]>([]);
  const debounceTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const fetchChannelActivities = async () => {
    try {
      console.log('🔍 Fetching channel activities...');
      const { data, error } = await supabase
        .from('channels_activity')
        .select('username, last_updated_at, message_count, last_message')
        .order('last_updated_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching channel activities:', error);
        throw error;
      }

      // Transform the data to match ChannelActivity type
      const activities = (data || []).map(item => ({
        username: item.username,
        last_updated_at: item.last_updated_at,
        last_message: item.last_message,
        message_count: item.message_count
      }));

      console.log('✅ Channel activities fetched:', {
        count: activities.length,
        activities: activities.map(a => ({
          username: a.username,
          message_count: a.message_count,
          last_updated: a.last_updated_at
        }))
      });

      setChannelActivities(activities);
    } catch (error) {
      console.error('❌ Error in fetchChannelActivities:', error);
    }
  };

  const handleRealtimeChange = useCallback((payload: any) => {
    if (!payload) return;

    const { eventType, new: newRecord, old: oldRecord } = payload;
    const username = newRecord?.username || oldRecord?.username;

    // Clear any existing timeout for this username
    if (debounceTimeoutRef.current[username]) {
      clearTimeout(debounceTimeoutRef.current[username]);
    }

    // Set a new timeout to debounce the update
    debounceTimeoutRef.current[username] = setTimeout(() => {
      setChannelActivities((prev) => {
        const currentActivity = prev.find(a => a.username === username);
        const oldCount = currentActivity?.message_count || 0;
        const newCount = newRecord?.message_count || 0;

        // Only log if there's a meaningful change in message count
        if (eventType === 'UPDATE' && oldCount !== newCount) {
          console.log(`📡 ${username}: ${oldCount} → ${newCount} messages`);
        } else if (eventType === 'INSERT') {
          console.log(`📡 New channel: ${username} (${newCount} messages)`);
        } else if (eventType === 'DELETE') {
          console.log(`📡 Channel deleted: ${username}`);
        }

        switch (eventType) {
          case 'INSERT':
            return [...prev, newRecord];
          case 'UPDATE':
            return prev.map((activity) =>
              activity.username === username ? newRecord : activity
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
    console.log('🚀 Initializing RealtimeProvider...');
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
      .subscribe();

    return () => {
      console.log('🧹 Cleaning up RealtimeProvider...');
      // Clear all debounce timeouts on cleanup
      Object.values(debounceTimeoutRef.current).forEach(timeout => clearTimeout(timeout));
      channelActivitySubscription.unsubscribe();
    };
  }, [handleRealtimeChange]);

  return (
    <RealtimeContext.Provider
      value={{
        channelActivities,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
} 