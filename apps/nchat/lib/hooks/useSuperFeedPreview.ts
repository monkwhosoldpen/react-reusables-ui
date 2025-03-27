import { useState } from 'react';
import { PreviewData } from '~/types/feed';
import { usePreviewRenderers } from './usePreviewRenderers';
import { useTheme } from '~/lib/providers/theme/ThemeProvider';

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