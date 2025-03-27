import { useState, useCallback } from 'react';
import { ViewStyle, DimensionValue } from 'react-native';
import { MediaItem } from '~/lib/types/superfeed';

export function useMediaHandlers() {
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

  const getMediaStyle = useCallback((index: number, mediaArray: MediaItem[], isGrid: boolean): ViewStyle => {
    const baseStyle: ViewStyle = {
      flex: 1,
      minWidth: '48%' as DimensionValue,
      aspectRatio: 16/9,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: 'rgba(0,0,0,0.05)',
    };

    if (!isGrid) return baseStyle;

    return {
      ...baseStyle,
      aspectRatio: mediaArray.length === 2 ? 1.1 : 
                  mediaArray.length === 3 && index === 0 ? 2/1.6 :
                  mediaArray.length === 3 || mediaArray.length === 4 ? 1 : 16/9,
      minWidth: (mediaArray.length === 3 && index === 0 ? '100%' : '48%') as DimensionValue,
      flex: mediaArray.length === 2 ? 0.5 : 1,
    };
  }, []);

  const isMediaLoading = useCallback((index: number) => mediaLoadingStates[index], [mediaLoadingStates]);
  const getMediaError = useCallback((index: number) => mediaErrors[index], [mediaErrors]);

  return {
    mediaLoadingStates,
    mediaErrors,
    handleMediaLoadStart,
    handleMediaLoadSuccess,
    handleMediaLoadError,
    getMediaStyle,
    isMediaLoading,
    getMediaError,
  };
} 