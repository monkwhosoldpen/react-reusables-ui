import React, { createContext, useContext, useEffect, useState } from 'react';
import { PreviewData } from '../enhanced-chat/types/superfeed';
import { transformFeedItemToPreview } from '../enhanced-chat/utils/feed';
import { supabase } from '../supabase';

type RealtimeContextType = {
  feedItems: PreviewData[];
  isLoading: boolean;
  refreshFeed: () => Promise<void>;
};

const RealtimeContext = createContext<RealtimeContextType>({
  feedItems: [],
  isLoading: false,
  refreshFeed: async () => {},
});

export const useRealtime = () => useContext(RealtimeContext);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [feedItems, setFeedItems] = useState<PreviewData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFeedItems = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('superfeed')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const items = (data || []).map(transformFeedItemToPreview);
      setFeedItems(items);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedItems();

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('superfeed-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'superfeed',
        },
        async (payload) => {
          // Refresh the entire feed when any change occurs
          await fetchFeedItems();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <RealtimeContext.Provider
      value={{
        feedItems,
        isLoading,
        refreshFeed: fetchFeedItems,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
} 