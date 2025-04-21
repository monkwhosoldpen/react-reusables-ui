import React, { useCallback } from 'react';
import { FormDataType, FeedItemType, Metadata, DisplayMode, Visibility } from '../types/superfeed';

const DEFAULT_VISIBILITY: Visibility = {
  stats: true,
  shareButtons: true,
  header: true,
  footer: true,
};

const DEFAULT_METADATA: Metadata = {
  timestamp: new Date().toISOString(),
  requireAuth: false,
  allowResubmit: false,
  isCollapsible: false,
  displayMode: 'expanded',
  maxHeight: 0,
  visibility: DEFAULT_VISIBILITY,
  mediaLayout: 'grid',
};

const DEFAULT_STATS = {
  likes: 0,
  shares: 0,
  views: 0,
  responses: 0,
};

const DEFAULT_FORM_DATA: FormDataType = {
  type: 'text' as FeedItemType,
  content: '',
  media: [],
  metadata: DEFAULT_METADATA,
  stats: DEFAULT_STATS,
  interactive_content: undefined,
  channel_username: '',
};

const useFeedForm = () => {
  const [formData, setFormData] = React.useState<FormDataType>(DEFAULT_FORM_DATA);

  const handleFormDataChange = useCallback((updates: Partial<FormDataType>) => {
    console.log('useFeedForm - handleFormDataChange - Updates received:', updates);
    console.log('useFeedForm - handleFormDataChange - Current formData:', formData);
    console.log('useFeedForm - handleFormDataChange - Updates type:', updates.type);
    console.log('useFeedForm - handleFormDataChange - Updates interactive_content:', updates.interactive_content);
    
    setFormData(prev => {
      const newData = {
        ...prev,
        ...updates,
        type: updates.type ?? prev.type,
        content: updates.content ?? prev.content,
        media: Array.isArray(updates.media) ? updates.media : prev.media,
        metadata: {
          ...DEFAULT_METADATA,
          ...prev.metadata,
          ...updates.metadata,
        },
        stats: {
          ...DEFAULT_STATS,
          ...prev.stats,
          ...updates.stats,
        },
        interactive_content: updates.interactive_content ?? prev.interactive_content,
        channel_username: updates.channel_username ?? prev.channel_username,
      };
      console.log('useFeedForm - handleFormDataChange - New formData:', newData);
      console.log('useFeedForm - handleFormDataChange - New type:', newData.type);
      console.log('useFeedForm - handleFormDataChange - New interactive_content:', newData.interactive_content);
      return newData;
    });
  }, [formData]);

  return { formData, handleFormDataChange };
};

export default useFeedForm; 