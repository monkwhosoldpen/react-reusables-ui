import { FormDataType, Visibility, Metadata, PollData, QuizData, FeedItemType } from '~/lib/enhanced-chat/types/superfeed';

const DEFAULT_VISIBILITY: Visibility = {
  stats: true,
  shareButtons: true,
  header: true,
  footer: true
};

const DEFAULT_METADATA: Metadata = {
  maxHeight: 300,
  isCollapsible: true,
  displayMode: 'compact',
  visibility: DEFAULT_VISIBILITY,
  mediaLayout: 'grid',
  requireAuth: false,
  allowResubmit: false,
  timestamp: new Date().toISOString()
};

const DEFAULT_POLL: PollData = {
  question: 'What feature would you like to see next?',
  options: ['More interactive elements', 'Enhanced media support', 'Better markdown rendering', 'Advanced statistics']
};

const DEFAULT_QUIZ: QuizData = {
  title: 'Sample Quiz',
  questions: [{
    text: 'What is the main purpose of this feed item?',
    options: ['To demonstrate all features', 'To test the layout', 'To show media content', 'To collect user feedback'],
    correct_option: 0
  }]
};

const DEFAULT_MEDIA = [
  {
    type: 'image' as const,
    url: 'https://picsum.photos/800/600',
    caption: 'Beautiful landscape',
    dimensions: { width: 800, height: 600 },
    altText: 'A scenic mountain view'
  },
  {
    type: 'video' as const,
    url: 'https://example.com/sample-video.mp4',
    thumbnail: 'https://picsum.photos/800/450',
    caption: 'Product demo',
    duration: 120,
    dimensions: { width: 1280, height: 720 }
  },
  {
    type: 'image' as const,
    url: 'https://picsum.photos/600/600',
    caption: 'Team photo',
    dimensions: { width: 600, height: 600 },
    altText: 'Our team at the annual meetup'
  }
];

export function useMockFeedItems() {

  const generateMockData = (contentType: FeedItemType, existingContent?: string): Partial<FormDataType> => {
    
    // Base data structure that preserves existing content only if it's provided
    const baseData: Partial<FormDataType> = {
      type: contentType,
      content: '',
      interactive_content: {},
      metadata: {
        ...DEFAULT_METADATA,
        isCollapsible: contentType !== 'tweet',
        displayMode: contentType === 'tweet' ? 'expanded' : 'compact',
        maxHeight: contentType === 'tweet' ? 100 : 300,
        visibility: DEFAULT_VISIBILITY,
        mediaLayout: 'grid',
        requireAuth: false,
        allowResubmit: false,
        timestamp: new Date().toISOString()
      },
      media: []
    };

    // Only preserve existing content if explicitly provided AND if the type hasn't changed
    if (existingContent !== undefined && contentType === baseData.type) {
      baseData.content = existingContent;
    }

    switch (contentType) {
      case 'all':
        return {
          ...baseData,
          content: baseData.content || `# Comprehensive Feed Item\n\nThis example showcases all available features:\n\n## Rich Content\n- **Bold text** for emphasis\n- *Italic text* for style\n- [External links](https://example.com)\n\n## Interactive Elements\nBelow you'll find:\n1. A poll to gather feedback\n2. A quiz to test knowledge\n3. A survey for detailed responses\n\n## Media Content\nCheck out the attached media items!`,
          media: DEFAULT_MEDIA,
          interactive_content: {
            poll: DEFAULT_POLL,
            quiz: DEFAULT_QUIZ,
            survey: {
              title: 'Feature Survey',
              questions: [{
                text: 'How would you rate this feed item?',
                options: ['Excellent', 'Good', 'Average', 'Poor']
              }]
            }
          },
          metadata: {
            ...baseData.metadata,
            maxHeight: 500,
            isCollapsible: true,
            displayMode: 'compact',
            visibility: DEFAULT_VISIBILITY,
            mediaLayout: 'grid',
            requireAuth: false,
            allowResubmit: false,
            timestamp: new Date().toISOString()
          }
        };

      default:
        return baseData;
    }
  };

  return { generateMockData };
} 