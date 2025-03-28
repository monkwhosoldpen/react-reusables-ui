import { useState, useCallback } from 'react';
import { useTheme } from '~/lib/providers/theme/ThemeProvider';

export interface PreviewData {
  type: 'tweet' | 'instagram' | 'linkedin' | 'whatsapp' | 'poll' | 'survey' | 'quiz' | 'all';
  content?: string;
  contentType?: 'text' | 'markdown';
  mediaLayout?: 'grid' | 'carousel';
  isCollapsible?: boolean;
  visibility?: {
    stats: boolean;
    shareButtons: boolean;
    header: boolean;
    footer: boolean;
  };
  displayMode?: 'compact' | 'full';
  maxHeight?: number;
  metadata?: {
    timestamp: string;
  };
  channel_username?: string;
  media?: Array<{
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
  }>;
  poll?: {
    question: string;
    options: string[];
  };
  quiz?: {
    title: string;
    description: string;
    questions: Array<{
      text: string;
      options: string[];
      correct_option: number;
    }>;
  };
  stats?: {
    views: number;
    likes: number;
    shares: number;
  };
}

export function useSuperFeedItemPreview(data: PreviewData) {
  const { theme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(data.isCollapsible && data.displayMode === 'compact');

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  return {
    theme,
    isCollapsed,
    toggleCollapse,
  };
} 