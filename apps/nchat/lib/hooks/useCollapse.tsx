import { useState, useCallback, useEffect } from 'react';
import { PreviewData } from '~/lib/enhanced-chat/types/superfeed';

interface UseCollapseProps {
  data: PreviewData;
  onInteract?: () => void;
}

export function useCollapse({ data, onInteract }: UseCollapseProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [shouldShowGradient, setShouldShowGradient] = useState(false);
  const [hasCalculatedHeight, setHasCalculatedHeight] = useState(false);

  useEffect(() => {
    if (data?.metadata && hasCalculatedHeight) {
      const shouldCollapse = !!data.metadata.isCollapsible && data.metadata.maxHeight !== undefined;
      setIsCollapsed(shouldCollapse);
      setShouldShowGradient(shouldCollapse && contentHeight > (data.metadata.maxHeight || 0));
    }
  }, [data?.metadata, contentHeight, hasCalculatedHeight]);

  const handleLayout = useCallback((height: number) => {
    if (!hasCalculatedHeight) {
      setContentHeight(height);
      setShouldShowGradient(isCollapsed && height > (data?.metadata?.maxHeight || 300));
      setHasCalculatedHeight(true);
    }
  }, [hasCalculatedHeight, isCollapsed, data?.metadata?.maxHeight]);

  const toggleCollapse = useCallback(() => {
    if (data?.metadata?.isCollapsible) {
      setIsCollapsed(prev => !prev);
      setShouldShowGradient(false);
      onInteract?.();
    }
  }, [data?.metadata?.isCollapsible, onInteract]);

  const getNumberOfLines = useCallback((type: 'caption' | 'content' | 'message') => {
    if (!isCollapsed) return undefined;
    switch (type) {
      case 'caption':
        return 2;
      case 'content':
        return 3;
      case 'message':
        return 2;
      default:
        return undefined;
    }
  }, [isCollapsed]);

  return {
    isCollapsed,
    shouldShowGradient,
    handleLayout,
    toggleCollapse,
    getNumberOfLines,
  };
} 