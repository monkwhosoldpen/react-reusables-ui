import { FormDataType, FeedItemType, MediaLayout, InteractiveContent } from '~/lib/enhanced-chat/types/superfeed';

type InteractiveType = 'poll' | 'quiz' | 'survey';
type StateSetter<T> = (value: T | ((prev: T) => T)) => void;

interface HandleQuickActionProps {
  template: Partial<FormDataType>;
  handleFormDataChange: (updates: Partial<FormDataType>) => void;
  setIsInteractive: React.Dispatch<React.SetStateAction<boolean>>;
  setIncludeMedia: React.Dispatch<React.SetStateAction<boolean>>;
  setIncludeContent: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedType: React.Dispatch<React.SetStateAction<FeedItemType>>;
  setPreviewKey: React.Dispatch<React.SetStateAction<number>>;
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
  setPreviewKey
}: HandleQuickActionProps) => {
  if (template) {
    handleFormDataChange(template);
    setIsInteractive(!!template.interactive_content);
    setIncludeMedia(!!template.media?.length);
    setIncludeContent(!!template.content);
    setSelectedType(template.type || 'all');
    setPreviewKey(prev => prev + 1);
  }
}; 