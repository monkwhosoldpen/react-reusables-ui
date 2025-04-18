import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  FormDataType, 
  FeedItemType, 
  Metadata, 
  Stats, 
  InteractiveContent, 
  FillRequirement 
} from '@/lib/enhanced-chat/types/superfeed';

interface UseFeedFormProps {
  user: { email: string };
  initialData?: FormDataType;
}

interface UseFeedFormReturn {
  formData: FormDataType;
  activeTab: FeedItemType;
  isSubmitting: boolean;
  isLoading: boolean;
  error: Error | null;
  latestItem: FormDataType | null;
  handleFormDataChange: (updates: Partial<FormDataType>) => void;
  handleTabChange: (tab: FeedItemType) => void;
  createOrUpdateSuperFeedItem: (data: FormDataType) => Promise<boolean>;
  fetchLatestItem: () => Promise<void>;
}

const DEFAULT_METADATA: Metadata = {
  maxHeight: 300,
  isCollapsible: true,
  displayMode: 'compact',
  visibility: {
    stats: true,
    shareButtons: true,
    header: true,
    footer: true
  },
  mediaLayout: 'grid'
};

const DEFAULT_STATS: Stats = {
  views: 0,
  likes: 0,
  shares: 0,
  responses: 0
};

export function useFeedForm({ user, initialData }: UseFeedFormProps): UseFeedFormReturn {
  const [formData, setFormData] = useState<FormDataType>(() => {
    // Initialize with proper defaults and validation
    const baseData = initialData || {
      type: 'poll' as FeedItemType,
      content: '',
      media: [],
      channel_username: user.email,
      caption: '',
      message: '',
      metadata: DEFAULT_METADATA,
      stats: DEFAULT_STATS,
      interactive_content: {
        poll: {
          question: '',
          options: ['', '']
        },
        quiz: {
          title: '',
          questions: [{
            text: '',
            options: ['', ''],
            correct_option: 0
          }]
        },
        survey: {
          title: '',
          questions: [{
            text: '',
            type: 'multiple_choice',
            options: ['', '']
          }]
        }
      }
    };

    return {
      ...baseData,
      // Ensure required fields have defaults
      type: baseData.type || 'poll',
      content: baseData.content || '',
      media: Array.isArray(baseData.media) ? baseData.media : [],
      channel_username: baseData.channel_username || user.email,
      caption: baseData.caption || '',
      message: baseData.message || '',
      // Add default metadata and stats if not provided
      metadata: {
        ...DEFAULT_METADATA,
        ...(baseData.metadata || {})
      },
      stats: {
        ...DEFAULT_STATS,
        ...(baseData.stats || {})
      },
      // Initialize interactive content with defaults if not provided
      interactive_content: {
        poll: baseData.interactive_content?.poll || {
          question: '',
          options: ['', '']
        },
        quiz: baseData.interactive_content?.quiz || {
          title: '',
          questions: [{
            text: '',
            options: ['', ''],
            correct_option: 0
          }]
        },
        survey: baseData.interactive_content?.survey || {
          title: '',
          questions: [{
            text: '',
            type: 'multiple_choice',
            options: ['', '']
          }]
        }
      }
    };
  });

  const [activeTab, setActiveTab] = useState<FeedItemType>(formData.type || 'poll');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [latestItem, setLatestItem] = useState<FormDataType | null>(null);

  const handleFormDataChange = useCallback((updates: Partial<FormDataType>) => {
    setFormData(prev => {
      // Validate and sanitize updates
      const sanitizedUpdates = { ...updates };
      
      // Ensure media is always an array
      if ('media' in updates && !Array.isArray(updates.media)) {
        sanitizedUpdates.media = [];
      }

      // Ensure metadata has required fields
      if (updates.metadata) {
        sanitizedUpdates.metadata = {
          ...DEFAULT_METADATA,
          ...updates.metadata
        };
      }

      // Ensure stats has required fields
      if (updates.stats) {
        sanitizedUpdates.stats = {
          ...DEFAULT_STATS,
          ...updates.stats
        };
      }

      // Ensure interactive content fields are never undefined
      if (updates.interactive_content) {
        sanitizedUpdates.interactive_content = {
          poll: {
            question: updates.interactive_content.poll?.question || '',
            options: updates.interactive_content.poll?.options || ['', '']
          },
          quiz: {
            title: updates.interactive_content.quiz?.title || '',
            questions: updates.interactive_content.quiz?.questions || [{
              text: '',
              options: ['', ''],
              correct_option: 0
            }]
          },
          survey: {
            title: updates.interactive_content.survey?.title || '',
            questions: updates.interactive_content.survey?.questions || [{
              text: '',
              options: ['', '']
            }]
          }
        };
      }

      // Ensure string fields are never undefined
      if ('content' in updates) sanitizedUpdates.content = updates.content || '';
      if ('caption' in updates) sanitizedUpdates.caption = updates.caption || '';
      if ('message' in updates) sanitizedUpdates.message = updates.message || '';
      if ('channel_username' in updates) sanitizedUpdates.channel_username = updates.channel_username || prev.channel_username;

      return {
        ...prev,
        ...sanitizedUpdates,
      };
    });
  }, []);

  const handleTabChange = useCallback((tab: FeedItemType) => {
    if (!tab) {
      console.warn('[useFeedForm] Invalid tab type provided');
      return;
    }
    setActiveTab(tab);
    handleFormDataChange({ type: tab });
  }, [handleFormDataChange]);

  const fetchLatestItem = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('superfeed')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError) throw fetchError;

      if (data && typeof data === 'object') {
        // Transform the raw data to ensure it matches FormDataType
        const transformedData: FormDataType = {
          type: (data.type as FeedItemType) || 'poll',
          content: typeof data.content === 'string' ? data.content : '',
          media: Array.isArray(data.media) ? data.media : [],
          caption: typeof data.caption === 'string' ? data.caption : undefined,
          message: typeof data.message === 'string' ? data.message : undefined,
          metadata: typeof data.metadata === 'object' ? {
            ...DEFAULT_METADATA,
            ...data.metadata as Metadata
          } : DEFAULT_METADATA,
          stats: typeof data.stats === 'object' ? {
            ...DEFAULT_STATS,
            ...data.stats as Stats
          } : DEFAULT_STATS,
          interactive_content: typeof data.interactive_content === 'object' ? data.interactive_content as InteractiveContent : {},
          channel_username: typeof data.channel_username === 'string' ? data.channel_username : user.email,
          id: typeof data.id === 'string' ? data.id : undefined,
          created_at: typeof data.created_at === 'string' ? data.created_at : undefined,
          updated_at: typeof data.updated_at === 'string' ? data.updated_at : undefined,
          expires_at: typeof data.expires_at === 'string' ? data.expires_at : undefined,
          fill_requirement: typeof data.fill_requirement === 'string' ? data.fill_requirement as FillRequirement : 'partial'
        };
        setLatestItem(transformedData);
      }
    } catch (err) {
      console.error('[useFeedForm] Error fetching latest item:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch latest item'));
    } finally {
      setIsLoading(false);
    }
  }, [user.email]);

  const createOrUpdateSuperFeedItem = useCallback(async (data: FormDataType) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Validate required fields
      if (!data.type || !data.content) {
        throw new Error('Type and content are required fields');
      }

      // Prepare the data for submission
      const submissionData = {
        type: data.type,
        channel_username: data.channel_username || user.email,
        content: data.content.trim(),
        caption: data.caption?.trim(),
        message: data.message?.trim(),
        media: Array.isArray(data.media) ? data.media : [],
        metadata: {
          ...DEFAULT_METADATA,
          ...data.metadata
        },
        stats: {
          ...DEFAULT_STATS,
          ...data.stats
        },
        interactive_content: data.interactive_content || {},
        fill_requirement: data.fill_requirement || 'partial',
        expires_at: data.expires_at,
        updated_at: new Date().toISOString()
      };

      const { error: upsertError } = await supabase
        .from('superfeed')
        .upsert(submissionData);

      if (upsertError) throw upsertError;

      // Fetch the updated item
      await fetchLatestItem();
      return true;
    } catch (err) {
      console.error('[useFeedForm] Error creating/updating feed item:', err);
      setError(err instanceof Error ? err : new Error('Failed to create/update feed item'));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [user.email, fetchLatestItem]);

  return {
    formData,
    activeTab,
    isSubmitting,
    isLoading,
    error,
    latestItem,
    handleFormDataChange,
    handleTabChange,
    createOrUpdateSuperFeedItem,
    fetchLatestItem,
  };
} 