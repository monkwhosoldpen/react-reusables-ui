import { useMemo } from 'react';
import { FormDataType, FeedItemType, MediaLayout } from '~/lib/enhanced-chat/types/superfeed';
import { calculateMaxHeight } from '~/lib/enhanced-chat/utils/heightCalculations';

interface UsePreviewDataProps {
  formData: FormDataType;
  mediaLayout: MediaLayout;
  isInteractive: boolean;
  selectedInteractiveType: FeedItemType;
  username: string;
  includeMedia: boolean;
  includeContent: boolean;
}

export const usePreviewData = ({
  formData,
  mediaLayout,
  isInteractive,
  selectedInteractiveType,
  username,
  includeMedia,
  includeContent
}: UsePreviewDataProps) => {
  return useMemo(() => {

    // Calculate fixed height based on collapsible state
    const fixedHeight = formData.metadata?.isCollapsible ? 400 : undefined;
    
    const data: FormDataType = {
      ...formData,
      type: isInteractive ? selectedInteractiveType : (formData.type || 'all'),
      channel_username: username || 'anonymous',
      media: includeMedia ? formData.media : [],
      metadata: {
        ...formData.metadata,
        displayMode: formData.metadata?.displayMode ?? 'default',
        maxHeight: fixedHeight,
        isCollapsible: formData.metadata?.isCollapsible ?? false,
        visibility: formData.metadata?.visibility ?? {
          stats: true,
          shareButtons: true,
          header: true,
          footer: true
        },
        requireAuth: formData.metadata?.requireAuth ?? false,
        timestamp: formData.metadata?.timestamp ?? new Date().toISOString(),
        mediaLayout: mediaLayout
      }
    };

    // Handle media dimensions
    if (includeMedia && formData.media) {
      data.media = formData.media.map(item => {
        const maxWidth = 800;
        const maxHeight = fixedHeight ? fixedHeight * 0.6 : 600;
        
        const originalWidth = item.metadata?.width || 800;
        const originalHeight = item.metadata?.height || 600;
        
        const aspectRatio = originalWidth / originalHeight;
        let constrainedWidth = originalWidth;
        let constrainedHeight = originalHeight;
        
        if (originalWidth > maxWidth) {
          constrainedWidth = maxWidth;
          constrainedHeight = maxWidth / aspectRatio;
        }
        if (constrainedHeight > maxHeight) {
          constrainedHeight = maxHeight;
          constrainedWidth = maxHeight * aspectRatio;
        }

        return {
          ...item,
          type: item.type || 'image',
          url: item.url || '',
          caption: item.caption || '',
          metadata: {
            ...item.metadata,
            width: Math.round(constrainedWidth),
            height: Math.round(constrainedHeight)
          }
        };
      });
    }

    // Only include content if includeContent is true
    if (!includeContent) {
      data.content = '';
    }

    // Handle interactive content
    if (isInteractive && selectedInteractiveType) {
      // Initialize with default structure for the selected type
      const defaultInteractiveContent = {
        poll: { question: '', options: [] },
        quiz: { title: '', questions: [] },
        survey: { title: '', questions: [] }
      };

      // Only include the selected interactive type
      data.interactive_content = {
        [selectedInteractiveType]: formData.interactive_content?.[selectedInteractiveType] || defaultInteractiveContent[selectedInteractiveType]
      };

      // Ensure type matches the interactive content
      data.type = selectedInteractiveType;
    } else {
      // Clear interactive content if not interactive
      data.interactive_content = undefined;
      data.type = 'all';
    }

    return data;
  }, [formData, mediaLayout, isInteractive, selectedInteractiveType, username, includeMedia, includeContent]);
}; 