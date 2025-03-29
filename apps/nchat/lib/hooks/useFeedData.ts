import { useState, useCallback, useEffect } from 'react';
import { supabase } from '~/lib/supabase';
import { PreviewData } from '~/lib/enhanced-chat/types/superfeed';
import { transformFeedItemToPreview } from '~/lib/utils/feed';

const MOCK_ITEMS = [
  {
    id: '1',
    type: 'post',
    content: 'This is a sample post',
    caption: 'Sample Post',
    message: 'Sample message',
    media: [],
    metadata: {
      isCollapsible: true,
      displayMode: 'compact',
      visibility: {
        stats: true,
        shareButtons: true,
        header: true,
        footer: true
      }
    }
  },
  {
    id: '2',
    type: 'poll',
    content: 'This is a sample poll',
    poll: {
      question: 'What is your favorite color?',
      options: ['Red', 'Blue', 'Green']
    },
    metadata: {
      isCollapsible: true,
      displayMode: 'compact',
      visibility: {
        stats: true,
        shareButtons: true,
        header: true,
        footer: true
      }
    }
  },
  {
    id: '3',
    type: 'quiz',
    content: 'This is a sample quiz',
    quiz: {
      title: 'General Knowledge',
      questions: [{
        text: 'What is the capital of France?',
        options: ['London', 'Paris', 'Berlin', 'Madrid'],
        correctOption: 1
      }]
    },
    metadata: {
      isCollapsible: true,
      displayMode: 'compact',
      visibility: {
        stats: true,
        shareButtons: true,
        header: true,
        footer: true
      }
    }
  }
];

export function useFeedData() {
  const [selectedItem, setSelectedItem] = useState<PreviewData | undefined>(undefined);
  const [feedItems, setFeedItems] = useState<PreviewData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFeedItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('superfeed')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        if (__DEV__) {
          setFeedItems(MOCK_ITEMS.map(transformFeedItemToPreview));
        }
        return;
      }

      const items = (data || []).map(transformFeedItemToPreview);
      setFeedItems(items);
    } catch (error) {
      if (__DEV__) {
        setFeedItems(MOCK_ITEMS.map(transformFeedItemToPreview));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedItems();
  }, [fetchFeedItems]);

  const handleEditItem = useCallback((item: PreviewData) => {
    setSelectedItem(item);
  }, []);

  const handleItemCreated = useCallback(() => {
    fetchFeedItems();
    setSelectedItem(undefined);
  }, [fetchFeedItems]);

  return {
    feedItems,
    selectedItem,
    isLoading,
    handleEditItem,
    handleItemCreated,
    refreshFeed: fetchFeedItems
  };
} 