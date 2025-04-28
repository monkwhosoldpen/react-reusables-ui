import { FormDataType, FeedItemType, MediaLayout, InteractiveContent } from '~/lib/enhanced-chat/types/superfeed';
import { QUICK_ACTION_TEMPLATES } from './quickActionTemplates';

type InteractiveType = 'poll' | 'quiz' | 'survey';
type StateSetter<T> = (value: T | ((prev: T) => T)) => void;

interface HandleQuickActionProps {
  template: Partial<FormDataType>;
  handleFormDataChange: (updates: Partial<FormDataType>) => void;
  setIsInteractive: StateSetter<boolean>;
  setIncludeMedia: StateSetter<boolean>;
  setIncludeContent: StateSetter<boolean>;
  setSelectedType: StateSetter<FeedItemType>;
  setSelectedInteractiveType: StateSetter<InteractiveType>;
  setMediaLayout: StateSetter<MediaLayout>;
  setPreviewKey: StateSetter<number>;
}

const getInteractiveType = (content: InteractiveContent | undefined): InteractiveType => {
  if (!content) return 'poll';
  if ('poll' in content) return 'poll';
  if ('quiz' in content) return 'quiz';
  if ('survey' in content) return 'survey';
  return 'poll';
};

export const handleQuickAction = ({
  template,
  handleFormDataChange,
  setIsInteractive,
  setIncludeMedia,
  setIncludeContent,
  setSelectedType,
  setSelectedInteractiveType,
  setMediaLayout,
  setPreviewKey
}: HandleQuickActionProps) => {
  if (template) {
    handleFormDataChange(template);
    setIsInteractive(!!template.interactive_content);
    setIncludeMedia(!!template.media?.length);
    setIncludeContent(!!template.content);
    setSelectedType(template.type || 'all');
    if (template.interactive_content) {
      setSelectedInteractiveType(getInteractiveType(template.interactive_content));
    }
    setMediaLayout(template.metadata?.mediaLayout || 'grid');
    setPreviewKey(prev => prev + 1);
  }
}; 