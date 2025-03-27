import { useEffect } from 'react';
import type { SuperFeedItem } from '~/lib/types/superfeed';
import { useBaseFeedFetch } from './useBaseFeedFetch';

interface FeedItemComponentProps {
  id: string;
  type: string;
  content: string;
  message: string;
  author_id: string;
  author_name: string;
  author_avatar_url: string;
  created_at: string;
  channel_avatar: string;
  channel_username: string;
  channel_display_name: string;
  channel_verified: boolean;
  media?: Array<{
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
  }>;
  metadata?: {
    timestamp: string;
    [key: string]: any;
  };
  stats?: {
    views: number;
    likes: number;
    shares: number;
    responses: number;
  };
  interactive_content?: {
    [key: string]: any;
  };
}

function transformToComponentItem(data: SuperFeedItem): FeedItemComponentProps {
  return {
    id: data.id,
    type: data.type,
    content: data.content || '',
    message: data.message || '',
    author_id: data.channel_username || 'anonymous',
    author_name: data.channel_username || 'anonymous',
    author_avatar_url: `https://ui-avatars.com/api/?name=${data.channel_username || 'anonymous'}`,
    created_at: data.created_at,
    channel_avatar: `https://ui-avatars.com/api/?name=${data.channel_username || 'anonymous'}`,
    channel_username: data.channel_username || 'anonymous',
    channel_display_name: data.channel_username || 'anonymous',
    channel_verified: false,
    media: data.media || undefined,
    metadata: {
      ...(data.metadata || {}),
      timestamp: new Date(data.created_at).toLocaleString()
    },
    stats: data.stats || undefined,
    interactive_content: data.interactive_content || undefined
  };
}

export function useSuperfeed() {
  const { data: latestItem, isLoading, error, fetchData } = useBaseFeedFetch<FeedItemComponentProps | null>({
    table: 'superfeed',
    limit: 1,
    transform: (data) => data.length > 0 ? transformToComponentItem(data[0]) : null,
  });

  useEffect(() => {
    fetchData();
  }, []);

  return {
    latestItem,
    isLoading,
    error,
    refresh: fetchData,
  };
}

// Export the transform function and types for reuse in other hooks
export { transformToComponentItem };
export type { FeedItemComponentProps }; 