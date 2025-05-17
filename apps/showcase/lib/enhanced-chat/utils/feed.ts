import { FeedItemType, PreviewData, FormDataType, MediaItem, PollData, QuizData, SurveyData } from '../types/superfeed';
import { FEED_CONSTANTS } from '../constants/feed';

export const DEFAULT_POLL: PollData = {
  question: '',
  description: '',
  options: ['', '']
};

export const DEFAULT_QUIZ: QuizData = {
  title: '',
  description: '',
  questions: [{
    text: '',
    options: ['', ''],
    correct_option: 0
  }]
};

export const DEFAULT_SURVEY: SurveyData = {
  title: '',
  description: '',
  questions: [{
    text: '',
    options: []
  }]
};

export const DEFAULT_METADATA = {
  timestamp: new Date().toISOString(),
  isCollapsible: true,
  displayMode: 'compact' as const,
  visibility: {
    stats: true,
    shareButtons: true,
    header: true,
    footer: true
  },
  mediaLayout: 'grid' as const
};

export const DEFAULT_STATS = {
  views: 0,
  likes: 0,
  shares: 0,
  responses: 0
};

export function transformFeedItemToPreview(item: any): PreviewData {
  
  const transformed = {
    id: item.id as string,
    type: item.type as FeedItemType,
    content: item.content || '',
    caption: item.caption || '',
    message: item.message || '',
    media: item.media || [],
    stats: {
      ...DEFAULT_STATS,
      ...(item.stats || {})
    },
    metadata: {
      ...DEFAULT_METADATA,
      timestamp: item.created_at || item.metadata?.timestamp || new Date().toISOString(),
      isCollapsible: item.metadata?.isCollapsible ?? DEFAULT_METADATA.isCollapsible,
      displayMode: item.metadata?.displayMode || DEFAULT_METADATA.displayMode,
      visibility: {
        ...DEFAULT_METADATA.visibility,
        ...(item.metadata?.visibility || {})
      },
      mediaLayout: item.metadata?.mediaLayout || DEFAULT_METADATA.mediaLayout
    },
    message_text: item.message_text || '',
    channel_username: item.channel_username || 'anonymous',
    interactive_content: item.interactive_content || {},
    fill_requirement: item.fill_requirement || 'partial',
    expires_at: item.expires_at || null,
    poll: item.poll ? {
      ...DEFAULT_POLL,
      ...item.poll,
      question: item.poll.question || DEFAULT_POLL.question,
      options: item.poll.options || DEFAULT_POLL.options
    } : undefined,
    quiz: item.quiz ? {
      ...DEFAULT_QUIZ,
      ...item.quiz,
      title: item.quiz.title || DEFAULT_QUIZ.title,
      questions: item.quiz.questions || DEFAULT_QUIZ.questions
    } : undefined,
    survey: item.survey ? {
      ...DEFAULT_SURVEY,
      ...item.survey,
      title: item.survey.title || DEFAULT_SURVEY.title,
      questions: item.survey.questions || DEFAULT_SURVEY.questions
    } : undefined
  };

  return transformed;
}
