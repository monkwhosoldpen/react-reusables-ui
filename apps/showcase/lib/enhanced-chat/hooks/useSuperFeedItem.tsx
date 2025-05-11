import { useState, useCallback } from 'react';
import { useTheme } from '~/lib/core/providers/theme/ThemeProvider';

interface FormData {
  type: 'tweet' | 'instagram' | 'linkedin' | 'whatsapp' | 'poll' | 'survey' | 'quiz' | 'all';
  content?: string;
  contentType?: 'text' | 'markdown';
  mediaLayout?: 'grid' | 'carousel';
  isCollapsible?: boolean;
  visibility?: {
    stats: boolean;
    shareButtons: boolean;
    header: boolean;
    footer: boolean;
  };
  displayMode?: 'compact' | 'full';
  maxHeight?: number;
  media?: Array<{
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
  }>;
  poll?: {
    question: string;
    options: string[];
  };
  quiz?: {
    title: string;
    description: string;
    questions: Array<{
      text: string;
      options: string[];
      correct_option: number;
    }>;
  };
}

export function useSuperFeedItem() {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<FormData>({
    type: 'tweet',
    contentType: 'text',
    mediaLayout: 'grid',
    isCollapsible: true,
    visibility: {
      stats: true,
      shareButtons: true,
      header: true,
      footer: true,
    },
    displayMode: 'compact',
    maxHeight: 150,
  });

  const [activeTab, setActiveTab] = useState<FormData['type']>('tweet');

  const handleFormDataChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const fillSampleData = useCallback((type: FormData['type']) => {
    switch (type) {
      case 'poll':
        setFormData(prev => ({
          ...prev,
          type,
          content: 'What is your favorite programming language?',
          poll: {
            question: 'What is your favorite programming language?',
            options: ['JavaScript', 'Python', 'Java', 'C++'],
          },
        }));
        break;
      case 'quiz':
        setFormData(prev => ({
          ...prev,
          type,
          content: 'Test your programming knowledge!',
          quiz: {
            title: 'Programming Quiz',
            description: 'Test your knowledge of programming concepts',
            questions: [
              {
                text: 'What is React Native?',
                options: [
                  'A mobile framework',
                  'A database',
                  'A programming language',
                  'An operating system',
                ],
                correct_option: 0,
              },
            ],
          },
        }));
        break;
      default:
        setFormData(prev => ({
          ...prev,
          type,
          content: 'Sample content for ' + type,
        }));
    }
  }, []);

  const validateMedia = useCallback(async (url: string, type: 'image' | 'video') => {
    if (url.includes('picsum.photos')) {
      if (type !== 'image') {
        throw new Error('Picsum URLs can only be used for images');
      }
      return;
    }

    try {
      const response = await fetch(url, { method: 'GET' });
      if (!response.ok) {
        throw new Error('Invalid media URL');
      }

      const contentType = response.headers.get('content-type');
      if (!contentType) {
        throw new Error('Could not determine media type');
      }

      if (type === 'image' && !contentType.startsWith('image/')) {
        throw new Error('URL does not point to an image');
      }

      if (type === 'video' && !contentType.startsWith('video/')) {
        throw new Error('URL does not point to a video');
      }
    } catch (error: any) {
      throw new Error('Failed to validate media URL: ' + (error.message || 'Unknown error'));
    }
  }, []);

  const validatePoll = useCallback((poll?: FormData['poll']) => {
    if (!poll?.question) {
      throw new Error('Poll question is required');
    }
    if (!poll.options || poll.options.length < 2) {
      throw new Error('Poll must have at least 2 options');
    }
    if (poll.options.some(option => !option.trim())) {
      throw new Error('Poll options cannot be empty');
    }
  }, []);

  const validateQuiz = useCallback((quiz?: FormData['quiz']) => {
    if (!quiz?.title) {
      throw new Error('Quiz title is required');
    }
    if (!quiz.questions || quiz.questions.length === 0) {
      throw new Error('Quiz must have at least 1 question');
    }
    quiz.questions.forEach((question, index) => {
      if (!question.text.trim()) {
        throw new Error(`Question ${index + 1} text is required`);
      }
      if (!question.options || question.options.length < 2) {
        throw new Error(`Question ${index + 1} must have at least 2 options`);
      }
      if (question.options.some(option => !option.trim())) {
        throw new Error(`Question ${index + 1} options cannot be empty`);
      }
      if (question.correct_option >= question.options.length) {
        throw new Error(`Question ${index + 1} has invalid correct option`);
      }
    });
  }, []);

  const validateFormData = useCallback(async (data: FormData) => {
    if (data.media?.length) {
      await Promise.all(
        data.media.map(item => validateMedia(item.url, item.type))
      );
    }

    if (data.type === 'poll') {
      validatePoll(data.poll);
    }

    if (data.type === 'quiz') {
      validateQuiz(data.quiz);
    }
  }, [validateMedia, validatePoll, validateQuiz]);

  return {
    formData,
    activeTab,
    setActiveTab,
    handleFormDataChange,
    fillSampleData,
    validateFormData,
    theme,
  };
} 