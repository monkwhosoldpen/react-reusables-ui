import { ViewStyle } from 'react-native';

export type FeedItemType = 'tweet' | 'instagram' | 'linkedin' | 'whatsapp' | 'poll' | 'survey' | 'quiz' | 'all' | 'message';

export type MediaType = 'image' | 'video';
export type MediaLayout = 'grid' | 'carousel' | 'list' | 'collage' | 'masonry' | 'fullwidth';
export type DisplayMode = 'compact' | 'default';
export type ShowResults = 'always' | 'after_vote' | 'never';
export type ShowExplanation = 'after_question' | 'after_quiz' | 'never';
export type ShowQuizResults = 'immediately' | 'after_quiz' | 'never';
export type QuestionType = 'text' | 'single_choice' | 'multiple_choice';
export type FillRequirement = 'partial' | 'strict';
export type InteractiveType = 'poll' | 'quiz' | 'survey';

export interface MediaItem {
  type: MediaType;
  url: string;
  caption?: string;
  thumbnail?: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
  };
}

export interface PollSettings {
  allowRevote?: boolean;
  requireAuth?: boolean;
  saveProgress?: boolean;
}

export interface PollData {
  question: string;
  description?: string;
  options: string[];
}

export interface QuizQuestion {
  text: string;
  options: string[];
  correct_option: number;
}

export interface QuizSettings {
  randomizeQuestions?: boolean;
  showExplanation?: ShowExplanation;
  passingScore?: number;
  timeLimit?: number;
  showProgress?: boolean;
  showResults?: ShowQuizResults;
  allowResubmission?: boolean;
  requireAuth?: boolean;
  saveProgress?: boolean;
  resumable?: boolean;
}

export interface QuizData {
  title: string;
  description?: string;
  questions: QuizQuestion[];
}

export interface SurveyQuestion {
  text: string;
  options: string[];
}

export interface SurveySettings {
  allowAnonymous?: boolean;
  showProgress?: boolean;
  showResults?: boolean;
  requireAuth?: boolean;
}

export interface SurveyData {
  title: string;
  description?: string;
  questions: SurveyQuestion[];
}

export interface VisibilitySettings {
  stats: boolean;
  shareButtons: boolean;
  header: boolean;
  footer: boolean;
}

export interface Stats {
  views: number;
  likes: number;
  shares: number;
  responses: number;
}

export interface Metadata {
  isCollapsible: boolean;
  displayMode: 'default' | 'compact' | 'expanded';
  maxHeight?: number;
  visibility: {
    stats: boolean;
    shareButtons: boolean;
    header: boolean;
  };
  mediaLayout: MediaLayout;
  interactiveType?: InteractiveType;
  requireAuth?: boolean;
  timestamp?: string;
}

export interface BaseData {
  id?: string;
  username?: string;
  type: string;
  message_text: string;
  caption?: string;
  media?: Record<string, any>;
  metadata?: Record<string, any>;
  stats?: Record<string, any>;
  interactive_content?: Record<string, any>;
  fill_requirement?: string;
  translations?: Record<string, any>;
  is_translated?: boolean;
  message_count?: number;
  expires_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PreviewData extends BaseData {}

export interface InteractiveContent {
  poll?: PollData;
  quiz?: QuizData;
  survey?: SurveyData;
}

export interface FormDataType {
  id?: string;
  type: FeedItemType;
  content: string;
  message?: string;
  caption?: string;
  media?: MediaItem[];
  metadata?: Metadata;
  stats?: Stats;
  interactive_content?: InteractiveContent;
  fill_requirement?: FillRequirement;
  channel_username?: string;
  expires_at?: Date;
  created_at?: string;
  updated_at?: string;
}

export interface SuperFeedItemPreviewProps {
  data: FormDataType;
  style?: ViewStyle;
  onEdit?: (item: FormDataType) => void;
  showHeader?: boolean;
  showCollapsible?: boolean;
  showFooter?: boolean;
}

export interface FeedItemResponse {
  id: string;
  feed_item_id: string;
  user_id: string;
  response_type: 'poll' | 'quiz' | 'survey';
  response_data: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export const DEFAULT_METADATA: Metadata = {
  isCollapsible: true,
  displayMode: 'default',
  maxHeight: 300,
  visibility: {
    stats: true,
    shareButtons: true,
    header: true
  },
  mediaLayout: 'grid',
  requireAuth: false,
  timestamp: new Date().toISOString()
};

export const DEFAULT_INTERACTIVE_CONTENT: InteractiveContent = {
  poll: {
    question: '',
    options: []
  },
  quiz: {
    title: '',
    questions: []
  },
  survey: {
    title: '',
    questions: []
  }
}; 