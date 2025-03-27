import { useCallback, useState } from 'react';
import { supabase } from '~/lib/supabase';
import { FormDataType, TabType, Stats, MediaItem } from '~/lib/types/superfeed';

interface SuperFeedItem {
  type: TabType;
  content: string;
  media: MediaItem[];
  caption: string;
  message: string;
  metadata: {
    isCollapsible: boolean;
    displayMode: 'expanded' | 'compact';
    maxHeight: number;
    visibility: {
      stats: boolean;
      shareButtons: boolean;
      header: boolean;
      footer: true;
    };
    mediaLayout: 'grid';
  };
  stats: Stats;
  channel_username: string;
  interactive_content: {
    poll: any;
    quiz: any;
    survey: any;
  } | null;
}

const DEFAULT_METADATA = {
  isCollapsible: true,
  displayMode: 'expanded' as const,
  maxHeight: 300,
  visibility: {
    stats: true,
    shareButtons: true,
    header: true,
    footer: true,
  },
  mediaLayout: 'grid' as const,
};

const DEFAULT_STATS = {
  views: 0,
  likes: 0,
  shares: 0,
  responses: 0,
};

export function useSuperfeedAdmin() {
  const [latestItem, setLatestItem] = useState<FormDataType | null>(null);
  const [latestError, setLatestError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLatestItem = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('superfeed')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      if (data && typeof data === 'object') {
        const interactive = (data.interactive_content as SuperFeedItem['interactive_content']) || null;
        const transformedData: FormDataType = {
          type: (data.type as TabType) || 'tweet',
          content: (data.content as string) || '',
          media: (data.media as MediaItem[]) || [],
          caption: (data.caption as string) || '',
          message: (data.message as string) || '',
          metadata: (data.metadata as SuperFeedItem['metadata']) || DEFAULT_METADATA,
          stats: (data.stats as Stats) || DEFAULT_STATS,
          channel_username: (data.channel_username as string) || 'anonymous',
          poll: interactive?.poll || null,
          quiz: interactive?.quiz || null,
          survey: interactive?.survey || null,
        };
        setLatestItem(transformedData);
      }
    } catch (error) {
      setLatestError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createOrUpdateSuperFeedItem = useCallback(async (data: FormDataType) => {
    try {
      setIsLoading(true);
      const interactive_content = {
        poll: data.type === 'poll' ? data.poll : null,
        quiz: data.type === 'quiz' ? data.quiz : null,
        survey: data.type === 'survey' ? data.survey : null,
      };

      const { error } = await supabase.from('superfeed').upsert({
        type: data.type,
        content: data.content,
        media: data.media,
        caption: data.caption,
        message: data.message,
        metadata: data.metadata,
        stats: data.stats,
        channel_username: data.channel_username,
        interactive_content,
      });

      if (error) throw error;

      await fetchLatestItem();
    } catch (error) {
      setLatestError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchLatestItem]);

  return {
    latestItem,
    latestError,
    isLoading,
    fetchLatestItem,
    createOrUpdateSuperFeedItem,
  };
} 