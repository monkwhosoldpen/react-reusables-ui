import { useState } from 'react';
import { usePreviewRenderers } from './usePreviewRenderers';
import { useTheme } from '~/lib/core/providers/theme/ThemeProvider';
import { PreviewData } from '../types/superfeed';

export function useSuperFeedPreview(data: PreviewData) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { theme, isDarkMode } = useTheme();
  const previewRenderers = usePreviewRenderers(data);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return {
    theme,
    isDarkMode,
    isCollapsed,
    toggleCollapse,
    ...previewRenderers,
  };
} 