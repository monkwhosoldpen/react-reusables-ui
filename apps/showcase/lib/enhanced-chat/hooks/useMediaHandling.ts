import { useCallback, useState } from 'react';
import { FormDataType, MediaLayout, MediaItem } from '~/lib/enhanced-chat/types/superfeed';

interface UseMediaHandlingProps {
  formData: FormDataType;
  handleFormDataChange: (updates: Partial<FormDataType>) => void;
}

interface UseMediaHandlingReturn {
  error: Error | null;
  handleMediaLayoutChange: (layout: MediaLayout) => void;
  handleMediaUrlChange: (index: number, url: string) => void;
  handleMediaCaptionChange: (index: number, caption: string) => void;
  handleAddImage: () => void;
  handleAddVideo: () => void;
}

export const useMediaHandling = ({ formData, handleFormDataChange }: UseMediaHandlingProps): UseMediaHandlingReturn => {
  const [error, setError] = useState<Error | null>(null);

  const handleMediaLayoutChange = useCallback((layout: MediaLayout) => {
    try {
      handleFormDataChange({
        metadata: {
          ...formData.metadata,
          mediaLayout: layout
        }
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to change media layout');
      setError(error);
      console.error('Error in handleMediaLayoutChange:', error);
    }
  }, [formData.metadata, handleFormDataChange]);

  const handleMediaUrlChange = useCallback((index: number, url: string) => {
    try {
      const newMedia = [...(formData.media || [])];
      newMedia[index] = {
        ...newMedia[index],
        url
      };
      handleFormDataChange({
        media: newMedia
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to change media URL');
      setError(error);
      console.error('Error in handleMediaUrlChange:', error);
    }
  }, [formData.media, handleFormDataChange]);

  const handleMediaCaptionChange = useCallback((index: number, caption: string) => {
    try {
      const newMedia = [...(formData.media || [])];
      newMedia[index] = {
        ...newMedia[index],
        caption
      };
      handleFormDataChange({
        media: newMedia
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to change media caption');
      setError(error);
      console.error('Error in handleMediaCaptionChange:', error);
    }
  }, [formData.media, handleFormDataChange]);

  const handleAddImage = useCallback(() => {
    try {
      const newMedia = [...(formData.media || []), {
        type: 'image' as const,
        url: `https://picsum.photos/800/600?random=${(formData.media?.length || 0) + 1}`,
        caption: `Image ${(formData.media?.length || 0) + 1}`,
        metadata: {
          width: 800,
          height: 600
        }
      }];
      handleFormDataChange({
        media: newMedia
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add image');
      setError(error);
      console.error('Error in handleAddImage:', error);
    }
  }, [formData.media, handleFormDataChange]);

  const handleAddVideo = useCallback(() => {
    try {
      const newMedia = [...(formData.media || []), {
        type: 'video' as const,
        url: 'https://picsum.photos/1280/720?random=video',
        caption: `Video ${(formData.media?.length || 0) + 1}`,
        metadata: {
          width: 1280,
          height: 720,
          duration: 120
        }
      }];
      handleFormDataChange({
        media: newMedia
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add video');
      setError(error);
      console.error('Error in handleAddVideo:', error);
    }
  }, [formData.media, handleFormDataChange]);

  return {
    error,
    handleMediaLayoutChange,
    handleMediaUrlChange,
    handleMediaCaptionChange,
    handleAddImage,
    handleAddVideo
  };
}; 