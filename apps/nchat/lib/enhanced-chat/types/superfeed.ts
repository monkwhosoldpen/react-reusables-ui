import { ViewStyle } from 'react-native';

export type FeedItemType = 'tweet' | 'instagram' | 'linkedin' | 'whatsapp' | 'poll' | 'survey' | 'quiz' | 'all';

export type MediaType = 'image' | 'video';
export type DisplayMode = 'compact' | 'expanded';
export type MediaLayout = 'grid' | 'carousel' | 'list' | 'collage' | 'masonry' | 'fullwidth';
export type ShowResults = 'always' | 'after_vote' | 'never';
export type ShowExplanation = 'after_question' | 'after_quiz' | 'never';
export type ShowQuizResults = 'immediately' | 'after_quiz' | 'never';
export type QuestionType = 'text' | 'single_choice' | 'multiple_choice';
export type FillRequirement = 'partial' | 'strict';

export interface MediaItem {
  type: MediaType;
  url: string;
  thumbnail?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  caption?: string;
  duration?: number;
  altText?: string;
}

export interface PollSettings {
  allowRevote?: boolean;
  requireAuth?: boolean;
  saveProgress?: boolean;
}

export interface PollData {
  question: string;
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

export interface Visibility {
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
  displayMode: DisplayMode;
  maxHeight: number;
  visibility: Visibility;
  mediaLayout: MediaLayout;
  requireAuth?: boolean;
  allowResubmit?: boolean;
  timestamp?: string;
}

export interface BaseData {
  id?: string;
  type: FeedItemType;
  content: string;
  caption?: string;
  message?: string;
  media: MediaItem[];
  metadata?: Metadata;
  stats?: Stats;
  fill_requirement?: FillRequirement;
  expires_at?: string;
  channel_username?: string;
  interactive_content?: InteractiveContent;
  created_at?: string;
  updated_at?: string;
}

export interface PreviewData extends BaseData {}

export interface InteractiveContent {
  poll?: PollData;
  quiz?: QuizData;
  survey?: SurveyData;
}

export interface FormDataType extends BaseData {
  interactive_content?: InteractiveContent;
}

export interface SuperFeedItemPreviewProps {
  data: FormDataType;
  style?: ViewStyle;
  onEdit?: (item: FormDataType) => void;
  showHeader?: boolean;
  showCollapsible?: boolean;
  showFooter?: boolean;
} 