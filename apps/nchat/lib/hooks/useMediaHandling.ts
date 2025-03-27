import { useState, useCallback } from 'react';
import { validateMedia } from '~/lib/utils/validation';

export function useMediaHandling() {
  const [mediaLoadingStates, setMediaLoadingStates] = useState<Record<number, boolean>>({});
  const [mediaErrors, setMediaErrors] = useState<Record<number, string>>({});

  const handleMediaLoadStart = useCallback((index: number) => {
    setMediaLoadingStates(prev => ({ ...prev, [index]: true }));
    setMediaErrors(prev => ({ ...prev, [index]: '' }));
  }, []);

  const handleMediaLoadSuccess = useCallback((index: number) => {
    setMediaLoadingStates(prev => ({ ...prev, [index]: false }));
  }, []);

  const handleMediaLoadError = useCallback((index: number, error: string) => {
    setMediaLoadingStates(prev => ({ ...prev, [index]: false }));
    setMediaErrors(prev => ({ ...prev, [index]: error }));
  }, []);

  const handleMediaChange = useCallback(async (
    index: number, 
    url: string, 
    type: 'image' | 'video',
    onSuccess: (newMedia: { type: 'image' | 'video'; url: string; }) => void
  ) => {
    try {
      handleMediaLoadStart(index);
      await validateMedia(url, type);
      onSuccess({ type, url });
    } catch (error) {
      console.error('Error processing media:', error);
      handleMediaLoadError(index, error instanceof Error ? error.message : 'Error processing media. Please try again.');
    } finally {
      handleMediaLoadSuccess(index);
    }
  }, [handleMediaLoadStart, handleMediaLoadSuccess, handleMediaLoadError]);

  return {
    mediaLoadingStates,
    mediaErrors,
    handleMediaLoadStart,
    handleMediaLoadSuccess,
    handleMediaLoadError,
    handleMediaChange,
  };
} 