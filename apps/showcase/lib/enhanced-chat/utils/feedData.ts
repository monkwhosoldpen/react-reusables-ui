import { createClient } from '@supabase/supabase-js';
import { 
  FormDataType, 
  MediaLayout, 
  Metadata, 
  PollData, 
  QuizData, 
  SurveyData, 
  Stats, 
  MediaItem, 
  MediaType, 
  InteractiveContent,
  DisplayMode
} from '~/lib/enhanced-chat/types/superfeed';
import { DEFAULT_INTERACTIVE_CONTENT } from '~/lib/enhanced-chat/types/superfeed';

// Initialize Supabase client with environment variables
const supabase = createClient(
  'https://risbemjewosmlvzntjkd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpc2JlbWpld29zbWx2em50amtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxMzIxNDIsImV4cCI6MjA1NTcwODE0Mn0._5wXtDjCr9ZnYatWD7RO5DNhx_YxUjqCcdc6qhZpwGM',
);

export const DEFAULT_VISIBILITY: any = {
  stats: true,
  shareButtons: true,
  header: true,
  footer: true
};

export const DEFAULT_METADATA: Metadata = {
  maxHeight: 300,
  isCollapsible: true,
  displayMode: 'compact' as const,
  visibility: DEFAULT_VISIBILITY,
  mediaLayout: 'grid' as const,
  requireAuth: false,
};

export const DEFAULT_POLL: PollData = {
  question: '',
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
    options: ['', '']
  }]
};

export const DEFAULT_STATS: Stats = {
  views: 0,
  likes: 0,
  shares: 0,
  responses: 0
};

export const handlePollUpdate = (formData: FormDataType, updates: Partial<PollData>): Partial<FormDataType> => ({
  interactive_content: {
    ...formData.interactive_content,
    poll: {
      ...DEFAULT_POLL,
      ...formData.interactive_content?.poll,
      ...updates
    }
  }
});

export const handleQuizUpdate = (formData: FormDataType, updates: Partial<QuizData>): Partial<FormDataType> => ({
  interactive_content: {
    ...formData.interactive_content,
    quiz: {
      ...DEFAULT_QUIZ,
      ...formData.interactive_content?.quiz,
      ...updates
    }
  }
});

export const handleSurveyUpdate = (formData: FormDataType, updates: Partial<SurveyData>): Partial<FormDataType> => ({
  interactive_content: {
    ...formData.interactive_content,
    survey: {
      ...DEFAULT_SURVEY,
      ...formData.interactive_content?.survey,
      ...updates
    }
  }
});

export const handleMediaChange = (formData: FormDataType, index: number, updates: Partial<MediaItem>): Partial<FormDataType> => {
  const newMedia = [...(formData.media || [])];
  newMedia[index] = { ...newMedia[index], ...updates };
  return { media: newMedia };
};

export const handleAddMedia = (formData: FormDataType, type: MediaType): Partial<FormDataType> => {
  const newMedia = [...(formData.media || [])];
  newMedia.push({
    type,
    url: '',
    caption: '',
    ...(type === 'video' ? { thumbnail: '', duration: 0 } : {})
  });
  return { media: newMedia };
};

export const handleRemoveMedia = (formData: FormDataType, index: number): Partial<FormDataType> => {
  const newMedia = [...(formData.media || [])];
  newMedia.splice(index, 1);
  return { media: newMedia };
};

export const prepareSubmissionData = (formData: FormDataType): FormDataType => ({
  ...formData,
  type: 'poll',
  metadata: {
    ...DEFAULT_METADATA,
    ...formData.metadata,
    timestamp: new Date().toISOString()
  },
  stats: formData.stats || DEFAULT_STATS
});

export const fetchFeedItems = async (username: string): Promise<FormDataType[]> => {
  try {
    const { data, error } = await supabase
      .from('superfeed')
      .select('*')
      .eq('channel_username', username)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform the raw data to ensure it matches FormDataType
    return (data || []).map(item => ({
      id: item.id,
      type: item.type || 'whatsapp',
      content: item.content || '',
      message: item.message,
      caption: item.caption,
      media: Array.isArray(item.media) ? item.media : [],
      metadata: {
        ...DEFAULT_METADATA,
        ...(item.metadata || {}),
      },
      stats: item.stats || {
        likes: 0,
        shares: 0,
        views: 0,
        responses: 0
      },
      interactive_content: item.interactive_content || DEFAULT_INTERACTIVE_CONTENT,
      channel_username: item.channel_username || username,
      created_at: item.created_at,
      updated_at: item.updated_at
    }));
  } catch (error) {
    console.error('Error fetching feed items:', error);
    return [];
  }
};

export const createFeedItem = async (item: FormDataType, username: string): Promise<FormDataType | null> => {
  try {
    const { data, error } = await supabase
      .from('superfeed')
      .insert([{
        ...item,
        channel_username: username,
        content: item.content
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating feed item:', error);
    return null;
  }
};

export const setupRealtimeSubscription = (
  username: string,
  onInsert: (item: FormDataType) => void,
  onUpdate: (item: FormDataType) => void,
  onDelete: (id: string) => void
) => {
  const channel = supabase
    .channel('superfeed_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'superfeed',
        filter: `channel_username=eq.${username}`
      },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          onInsert(payload.new as FormDataType);
        } else if (payload.eventType === 'UPDATE') {
          onUpdate(payload.new as FormDataType);
        } else if (payload.eventType === 'DELETE') {
          onDelete(payload.old.id);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const REALISTIC_CONTENT = {
  small: [
    "🎉 Just launched our new feature! Check it out and let us know what you think.",
    "📢 Important update: System maintenance scheduled for tomorrow at 10 AM EST.",
    "💡 Pro tip: Use keyboard shortcuts to boost your productivity!",
    "🎯 Weekly goal achieved! Thanks to everyone who contributed.",
  ],
  long: [
    "🚀 We're excited to announce the launch of our latest product update! This release includes several highly-requested features and performance improvements. We've completely redesigned the dashboard, added new analytics tools, and improved the overall user experience.\n\nKey highlights:\n• New dashboard layout\n• Advanced analytics\n• Improved performance\n• Better mobile support\n\nTry it out and share your feedback!",
    "📋 Monthly Project Update\n\nWe've made significant progress this month:\n\n1. Completed the main infrastructure upgrade\n2. Launched three new integrations\n3. Reduced loading times by 40%\n4. Fixed 50+ reported issues\n\nNext steps:\n- Rolling out the new UI\n- Implementing user feedback\n- Expanding the API\n\nStay tuned for more updates!",
  ]
};

export const REALISTIC_MEDIA = {
  image: [
    {
      type: 'image' as const,
      url: 'https://picsum.photos/800/600',
      caption: 'Our new office space in downtown',
      dimensions: { width: 800, height: 600 }
    },
    {
      type: 'image' as const,
      url: 'https://picsum.photos/900/600',
      caption: 'Team building event highlights',
      dimensions: { width: 900, height: 600 }
    },
    {
      type: 'image' as const,
      url: 'https://picsum.photos/1200/800',
      caption: 'Product launch event',
      dimensions: { width: 1200, height: 800 }
    },
    {
      type: 'image' as const,
      url: 'https://picsum.photos/1000/1000',
      caption: 'Behind the scenes at our design workshop',
      dimensions: { width: 1000, height: 1000 }
    },
    {
      type: 'image' as const,
      url: 'https://picsum.photos/800/800',
      caption: 'Meet our engineering team',
      dimensions: { width: 800, height: 800 }
    },
    {
      type: 'image' as const,
      url: 'https://picsum.photos/1600/900',
      caption: 'Our annual conference keynote',
      dimensions: { width: 1600, height: 900 }
    }
  ],
  video: [
    {
      type: 'video' as const,
      url: 'https://placehold.co/1280x720/FF6B6B/ffffff/png?text=Product+Demo',
      caption: 'Product Demo: Getting Started',
      metadata: {
        width: 1280,
        height: 720,
        duration: 180
      }
    },
    {
      type: 'video' as const,
      url: 'https://placehold.co/1280x720/4ECDC4/ffffff/png?text=Features+Overview',
      caption: 'Features Overview',
      metadata: {
        width: 1280,
        height: 720,
        duration: 240
      }
    },
    {
      type: 'video' as const,
      url: 'https://placehold.co/1280x720/45B7D1/ffffff/png?text=Tutorial',
      caption: 'Getting Started Tutorial',
      metadata: {
        width: 1280,
        height: 720,
        duration: 300
      }
    },
    {
      type: 'video' as const,
      url: 'https://placehold.co/1280x720/96CEB4/ffffff/png?text=Team+Update',
      caption: 'Team Update Video',
      metadata: {
        width: 1280,
        height: 720,
        duration: 180
      }
    }
  ]
};

export const REALISTIC_POLLS = [
  {
    question: "What feature would you like to see next?",
    options: [
      "Dark mode support",
      "Mobile app",
      "API integration",
      "Custom dashboards",
      "Advanced analytics",
      "Team collaboration tools",
      "Automated workflows",
      "Integration with Slack"
    ]
  },
  {
    question: "How often do you use our platform?",
    options: [
      "Multiple times a day",
      "Once a day",
      "2-3 times a week",
      "Weekly",
      "Monthly",
      "Occasionally",
      "Just getting started",
      "Haven't used it yet"
    ]
  },
  {
    question: "Which integration is most important to you?",
    options: [
      "Google Workspace",
      "Microsoft 365",
      "Slack",
      "Jira",
      "GitHub",
      "Salesforce",
      "Notion",
      "Trello"
    ]
  },
  {
    question: "What's your preferred way to learn about new features?",
    options: [
      "Video tutorials",
      "Documentation",
      "Live webinars",
      "Blog posts",
      "Email newsletters",
      "Social media",
      "In-app notifications",
      "Community forums"
    ]
  }
];

export const REALISTIC_QUIZZES = [
  {
    title: "Platform Features Quiz",
    description: "Test your knowledge about our platform's features",
    questions: [
      {
        text: "Which of these is NOT a feature of our platform?",
        options: [
          "Real-time analytics",
          "Time travel",
          "Custom reports",
          "Team collaboration"
        ],
        correct_option: 1
      },
      {
        text: "What's the maximum number of team members allowed?",
        options: [
          "10 members",
          "50 members",
          "100 members",
          "Unlimited"
        ],
        correct_option: 3
      },
      {
        text: "Which integration is available out of the box?",
        options: [
          "Slack",
          "Discord",
          "Teams",
          "All of the above"
        ],
        correct_option: 3
      }
    ]
  },
  {
    title: "Security Best Practices",
    description: "Check your understanding of our security features",
    questions: [
      {
        text: "What's the recommended password length?",
        options: [
          "6 characters",
          "8 characters",
          "12 characters",
          "16 characters"
        ],
        correct_option: 2
      },
      {
        text: "How often should you rotate API keys?",
        options: [
          "Never",
          "Monthly",
          "Quarterly",
          "Yearly"
        ],
        correct_option: 2
      }
    ]
  }
];

export const REALISTIC_SURVEYS = [
  {
    title: "User Experience Survey",
    description: "Help us improve our platform",
    questions: [
      {
        text: "How satisfied are you with the new interface?",
        options: [
          "Very satisfied",
          "Satisfied",
          "Neutral",
          "Dissatisfied",
          "Very dissatisfied"
        ]
      },
      {
        text: "How likely are you to recommend us?",
        options: [
          "Definitely would recommend",
          "Probably would recommend",
          "Might recommend",
          "Probably wouldn't recommend",
          "Definitely wouldn't recommend"
        ]
      },
      {
        text: "Which area needs the most improvement?",
        options: [
          "User interface",
          "Performance",
          "Features",
          "Documentation",
          "Support",
          "Pricing",
          "Integrations"
        ]
      }
    ]
  },
  {
    title: "Feature Usage Survey",
    description: "Tell us about your feature preferences",
    questions: [
      {
        text: "Which feature do you use most often?",
        options: [
          "Dashboard analytics",
          "Team collaboration",
          "Project management",
          "Integrations",
          "API access",
          "Custom reports"
        ]
      },
      {
        text: "How would you rate the onboarding experience?",
        options: [
          "Excellent",
          "Good",
          "Average",
          "Below average",
          "Poor"
        ]
      },
      {
        text: "What's your primary use case?",
        options: [
          "Personal projects",
          "Small team collaboration",
          "Enterprise management",
          "Client projects",
          "Education/Learning"
        ]
      }
    ]
  }
];

export const REALISTIC_IMAGES = [
  'https://picsum.photos/1200/675', // 16:9 ratio
  'https://picsum.photos/800/800',  // Square
  'https://picsum.photos/900/1200', // Portrait
  'https://source.unsplash.com/random/1200x675/?technology',
  'https://source.unsplash.com/random/800x800/?nature',
  'https://source.unsplash.com/random/900x1200/?architecture',
];

export const REALISTIC_VIDEOS = [
  {
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://picsum.photos/1200/675',
  },
  {
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail: 'https://picsum.photos/1200/675',
  },
  {
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://picsum.photos/1200/675',
  },
];

export const PLACEHOLDER_IMAGES = [
  'https://placehold.co/1200x675/4287f5/ffffff/png?text=Sample+Image+16:9',  // 16:9 ratio blue
  'https://placehold.co/800x800/42f545/ffffff/png?text=Sample+Square',       // Square green
  'https://placehold.co/900x1200/f54242/ffffff/png?text=Portrait+Image',     // Portrait red
  'https://placehold.co/1600x900/f5a442/ffffff/png?text=Wide+Image',         // Wide orange
  'https://placehold.co/400x400/9442f5/ffffff/png?text=Thumbnail',           // Thumbnail purple
];

export const PLACEHOLDER_VIDEOS: MediaItem[] = [
  {
    type: 'video' as const,
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://placehold.co/1200x675/4287f5/ffffff/png?text=Video+Thumbnail+1',
    metadata: {
      width: 1280,
      height: 720,
      duration: 180
    },
    caption: 'Big Buck Bunny'
  },
  {
    type: 'video' as const,
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail: 'https://placehold.co/1200x675/42f545/ffffff/png?text=Video+Thumbnail+2',
    metadata: {
      width: 1280,
      height: 720,
      duration: 240
    },
    caption: 'Elephant Dreams'
  }
];

export const generateRealisticContent = (contentType: 'small' | 'long'): Partial<FormDataType> => {
  const content = contentType === 'long'
    ? REALISTIC_CONTENT.long[Math.floor(Math.random() * REALISTIC_CONTENT.long.length)]
    : REALISTIC_CONTENT.small[Math.floor(Math.random() * REALISTIC_CONTENT.small.length)];

  const media = [
    ...REALISTIC_MEDIA.image.slice(0, Math.floor(Math.random() * 2) + 1),
    ...(Math.random() > 0.5 ? REALISTIC_MEDIA.video : [])
  ];

  const poll = REALISTIC_POLLS[Math.floor(Math.random() * REALISTIC_POLLS.length)];
  const quiz = REALISTIC_QUIZZES[Math.floor(Math.random() * REALISTIC_QUIZZES.length)];
  const survey = REALISTIC_SURVEYS[Math.floor(Math.random() * REALISTIC_SURVEYS.length)];

  return {
    type: 'poll',
    content,
    media,
    metadata: {
      ...DEFAULT_METADATA,
      mediaLayout: ['grid', 'carousel', 'list'][Math.floor(Math.random() * 3)] as MediaLayout,
    },
    interactive_content: {
      poll,
      quiz,
      survey
    }
  };
};

export const createRichMock = (formData: FormDataType): Partial<FormDataType> => {
  const content = `# 🚀 Tesla & SpaceX Update

## Latest Achievements
* Successfully launched **Starship SN20** 🛸
* Tesla reached **2M cars** produced this year
* Neuralink got FDA approval

### Innovation Highlights
1. New Gigafactory progress at 85%
2. Solar roof installations up by 40%
3. Mars mission planning in full swing

> "The future of civilization is about becoming a multi-planetary species" 

#### Technical Details
* Battery efficiency: \`98.5%\`
* Range improvement: \`+15%\`
* Production rate: \`1,200/day\`

Here's a [link to our latest blog post](https://placehold.co/800x400/FFD93D/000000/png?text=Blog+Post)

---

*Join us* in making the world **sustainable** and **multi-planetary**!

\`\`\`
Innovation = f(ambition × execution)
\`\`\`

##### Poll Results from Last Quarter
| Initiative | Support |
|------------|---------|
| Mars Colony | 78% |
| Neural Link | 65% |
| Tesla Bot | 82% |`;

  const media: MediaItem[] = [
    ...PLACEHOLDER_IMAGES.slice(0, 3).map((url, index) => ({
      type: 'image' as const,
      url,
      caption: `Innovation Snapshot ${index + 1}`,
      dimensions: {
        width: parseInt(url.split('x')[0].split('/').pop() || '800'),
        height: parseInt(url.split('x')[1].split('/')[0] || '600')
      }
    })),
    PLACEHOLDER_VIDEOS[0]
  ];

  const poll = {
    question: "Which technology should we prioritize next?",
    options: [
      "Mars colonization tech 🚀",
      "Neural interface chips 🧠",
      "Electric VTOL aircraft ✈️",
      "Humanoid robots 🤖",
      "Quantum computing 💻",
      "Sustainable energy 🌞"
    ]
  };

  const quiz = {
    title: "Space & Tech Knowledge Quiz",
    description: "Test your knowledge about the future of technology",
    questions: [
      {
        text: "What's the primary fuel used in Starship?",
        options: [
          "Liquid Methane",
          "Hydrogen",
          "Kerosene",
          "Ion Propulsion"
        ],
        correct_option: 0
      },
      {
        text: "What's the target range for Tesla's next-gen battery?",
        options: [
          "400 miles",
          "500 miles",
          "600 miles",
          "700 miles"
        ],
        correct_option: 2
      },
      {
        text: "When is the first crewed Mars mission planned?",
        options: [
          "2024",
          "2026",
          "2028",
          "2030"
        ],
        correct_option: 1
      }
    ]
  };

  const survey = {
    title: "Future Technology Survey",
    description: "Help shape the future of innovation",
    questions: [
      {
        text: "How likely are you to use neural interface technology?",
        options: [
          "Very likely",
          "Somewhat likely",
          "Neutral",
          "Unlikely",
          "Very unlikely"
        ]
      },
      {
        text: "Which sustainable energy solution interests you most?",
        options: [
          "Solar Roof",
          "Powerwall",
          "Grid-scale battery",
          "Solar panels",
          "Wind turbines"
        ]
      },
      {
        text: "When would you consider moving to Mars?",
        options: [
          "As soon as possible",
          "After first successful colony",
          "After 10,000 people living there",
          "Never",
          "Need more information"
        ]
      }
    ]
  };

  const metadata = {
    ...DEFAULT_METADATA,
    mediaLayout: 'grid' as const,
    maxHeight: 600,
    isCollapsible: true,
    displayMode: 'default' as DisplayMode,
    visibility: {
      stats: true,
      shareButtons: true,
      header: true,
      footer: true
    },
    requireAuth: false,
    allowResubmit: true,
    fillRequirement: 'optional' as const
  };

  const stats = {
    views: Math.floor(Math.random() * 1000000) + 500000,
    likes: Math.floor(Math.random() * 100000) + 50000,
    shares: Math.floor(Math.random() * 50000) + 25000,
    responses: Math.floor(Math.random() * 10000) + 5000
  };

  return {
    type: 'poll',
    content,
    media,
    metadata,
    stats,
    interactive_content: {
      poll,
      quiz,
      survey
    }
  };
};

export const handleEditItem = (item: FormDataType): Partial<FormDataType> => ({
  ...item,
  interactive_content: {
    poll: item.interactive_content?.poll || DEFAULT_POLL,
    quiz: item.interactive_content?.quiz || DEFAULT_QUIZ,
    survey: item.interactive_content?.survey || DEFAULT_SURVEY
  }
});

export const refreshFeed = async (username: string): Promise<FormDataType[]> => {
  try {
    const { data, error } = await supabase
      .from('superfeed')
      .select('*')
      .eq('channel_username', username)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error refreshing feed:', error);
    return [];
  }
};

export const handleSubmit = async (formData: FormDataType, username: string): Promise<boolean> => {
  try {
    console.log('handleSubmit - Starting submission with data:', {
      username,
      formData: {
        type: formData.type,
        content: formData.content,
        message: formData.message,
        media: formData.media,
        metadata: formData.metadata,
        stats: formData.stats,
        interactive_content: formData.interactive_content
      }
    });

    // Determine the message text to use, with fallbacks in order of preference
    const messageText = formData.message || 
                       formData.content || 
                       formData.interactive_content?.survey?.title || 
                       formData.interactive_content?.poll?.question || 
                       formData.interactive_content?.quiz?.title || 
                       'Survey';

    const submissionData = {
      username: username,
      type: formData.type,
      message_text: messageText,
      media: formData.media,
      metadata: formData.metadata,
      stats: formData.stats,
      interactive_content: formData.interactive_content,
      fill_requirement: formData.fill_requirement || 'partial'
    };

    console.log('handleSubmit - Prepared submission data:', submissionData);

    const { data, error } = await supabase
      .from('superfeed')
      .insert([submissionData])
      .select();

    if (error) {
      console.error('handleSubmit - Error inserting message:', error);
      throw error;
    }

    console.log('handleSubmit - Successfully inserted message:', data);
    return true;
  } catch (error) {
    console.error('handleSubmit - Error submitting feed item:', error);
    return false;
  }
};

export const determineInteractiveType = (interactiveContent?: InteractiveContent): 'poll' | 'quiz' | 'survey' => {
  if (interactiveContent?.poll) return 'poll';
  if (interactiveContent?.quiz) return 'quiz';
  if (interactiveContent?.survey) return 'survey';
  return 'poll'; // Default to poll if no interactive content
};
