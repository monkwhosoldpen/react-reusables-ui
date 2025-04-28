import { FormDataType } from '~/lib/enhanced-chat/types/superfeed';
import { DEFAULT_METADATA } from '~/lib/enhanced-chat/types/superfeed';

export const INTERACTIVE_TYPES = ['poll', 'quiz', 'survey'] as const;

export const QUICK_ACTION_TEMPLATES: Record<string, Partial<FormDataType>> = {
  small: {
    type: 'all',
    content: 'This is a short message that gets straight to the point.',
    media: [],
    metadata: {
      ...DEFAULT_METADATA,
      isCollapsible: false,
      mediaLayout: 'grid'
    }
  },
  long: {
    type: 'all',
    content: `In today's fast-paced digital world, effective communication is more important than ever. This longer message format allows you to express complex ideas, share detailed information, and engage your audience with rich content. Whether you're discussing important updates, sharing insights, or providing comprehensive explanations, the long text format gives you the space you need to communicate effectively.

Use this format when you need to:
- Explain complex concepts
- Share detailed updates
- Provide comprehensive information
- Engage with thoughtful content

Remember to structure your content with clear paragraphs and formatting to ensure readability.`,
    media: [],
    metadata: {
      ...DEFAULT_METADATA,
      isCollapsible: true,
      mediaLayout: 'grid'
    }
  },
  superfeed: {
    type: 'poll',
    content: `We're excited to announce our latest product launch! 🚀

After months of development and testing, we're proud to introduce our new platform that revolutionizes how teams collaborate and manage their workflows.

Key Features:
• Real-time collaboration
• Advanced analytics
• Customizable workflows
• AI-powered insights
• Mobile-first experience

We'd love to know which features you're most excited about! Please take a moment to vote in our poll below.`,
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        caption: 'Team collaboration in action',
        metadata: {
          width: 1000,
          height: 600
        }
      },
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        caption: 'Advanced analytics dashboard',
        metadata: {
          width: 1000,
          height: 600
        }
      }
    ],
    interactive_content: {
      poll: {
        question: 'Which of these new features are you most excited about?',
        options: [
          'Real-time collaboration with team members',
          'Advanced analytics dashboard with custom reports',
          'Customizable workflow automation templates',
          'AI-powered content suggestions and optimizations',
          'Mobile app with offline capabilities'
        ]
      }
    },
    metadata: {
      ...DEFAULT_METADATA,
      isCollapsible: true,
      mediaLayout: 'grid',
      displayMode: 'default',
      maxHeight: 500,
      visibility: DEFAULT_METADATA.visibility,
      requireAuth: true,
      allowResubmit: false,
      timestamp: new Date().toISOString()
    }
  }
}; 