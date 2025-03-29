import React from 'react';
import { View, ScrollView, StyleSheet, TextInput, Switch, Pressable, Animated, RefreshControl } from 'react-native';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { useFeedForm } from '~/lib/hooks/useFeedForm';
import { FeedItem } from '~/lib/enhanced-chat/components/feed/FeedItem';
import { useMockFeedItems } from '~/lib/hooks/useMockFeedItems';
import { 
  FormDataType, 
  MediaLayout, 
  DisplayMode, 
  Visibility, 
  Metadata,
  PollData,
  QuizData,
  MediaItem,
  MediaType,
  SurveyData,
  Stats,
  InteractiveContent,
  FillRequirement
} from '~/lib/enhanced-chat/types/superfeed';
import { useUser } from '~/lib/providers/auth/AuthProvider';
import { useRouter } from 'expo-router';
import { supabase } from '~/lib/supabase';
import { generateMockFeedItem } from '~/lib/enhanced-chat/utils/mockData';
import { useRealtime } from '~/lib/providers/RealtimeProvider';

const DEFAULT_VISIBILITY: Visibility = {
  stats: true,
  shareButtons: true,
  header: true,
  footer: true
};

const DEFAULT_METADATA: Metadata = {
  maxHeight: 300,
  isCollapsible: true,
  displayMode: 'compact' as const,
  visibility: DEFAULT_VISIBILITY,
  mediaLayout: 'grid' as const,
  requireAuth: false,
  allowResubmit: false,
};

const DEFAULT_POLL: PollData = {
  question: '',
  options: ['', '']
};

const DEFAULT_QUIZ: QuizData = {
  title: '',
  description: '',
  questions: [{
    text: '',
    options: ['', ''],
    correct_option: 0
  }]
};

const DEFAULT_SURVEY: SurveyData = {
  title: '',
  description: '',
  questions: [{
    text: '',
    options: ['', '']
  }]
};

const REALISTIC_CONTENT = {
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

const REALISTIC_MEDIA = {
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
      url: 'https://example.com/product-demo.mp4',
      thumbnail: 'https://picsum.photos/800/450',
      caption: 'Product demo walkthrough',
      duration: 180,
      dimensions: { width: 1280, height: 720 }
    },
    {
      type: 'video' as const,
      url: 'https://example.com/feature-overview.mp4',
      thumbnail: 'https://picsum.photos/1600/900',
      caption: 'New features overview',
      duration: 240,
      dimensions: { width: 1920, height: 1080 }
    },
    {
      type: 'video' as const,
      url: 'https://example.com/tutorial.mp4',
      thumbnail: 'https://picsum.photos/1200/675',
      caption: 'Getting started tutorial',
      duration: 300,
      dimensions: { width: 1280, height: 720 }
    },
    {
      type: 'video' as const,
      url: 'https://example.com/team-update.mp4',
      thumbnail: 'https://picsum.photos/1920/1080',
      caption: 'Monthly team update',
      duration: 420,
      dimensions: { width: 1920, height: 1080 }
    }
  ]
};

const REALISTIC_POLLS = [
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

const REALISTIC_QUIZZES = [
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

const REALISTIC_SURVEYS = [
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

const REALISTIC_IMAGES = [
  'https://picsum.photos/1200/675', // 16:9 ratio
  'https://picsum.photos/800/800',  // Square
  'https://picsum.photos/900/1200', // Portrait
  'https://source.unsplash.com/random/1200x675/?technology',
  'https://source.unsplash.com/random/800x800/?nature',
  'https://source.unsplash.com/random/900x1200/?architecture',
];

const REALISTIC_VIDEOS = [
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

const PLACEHOLDER_IMAGES = [
  'https://placehold.co/1200x675/4287f5/ffffff/png?text=Sample+Image+16:9',  // 16:9 ratio blue
  'https://placehold.co/800x800/42f545/ffffff/png?text=Sample+Square',       // Square green
  'https://placehold.co/900x1200/f54242/ffffff/png?text=Portrait+Image',     // Portrait red
  'https://placehold.co/1600x900/f5a442/ffffff/png?text=Wide+Image',         // Wide orange
  'https://placehold.co/400x400/9442f5/ffffff/png?text=Thumbnail',           // Thumbnail purple
];

const PLACEHOLDER_VIDEOS: MediaItem[] = [
  {
    type: 'video' as const,
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://placehold.co/1200x675/4287f5/ffffff/png?text=Video+Thumbnail+1',
    duration: 180,
    dimensions: { width: 1280, height: 720 },
    caption: 'Big Buck Bunny'
  },
  {
    type: 'video' as const,
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail: 'https://placehold.co/1200x675/42f545/ffffff/png?text=Video+Thumbnail+2',
    duration: 240,
    dimensions: { width: 1280, height: 720 },
    caption: 'Elephant Dreams'
  }
];

export default function FeedScreen() {
  const { user } = useUser();
  const { generateMockData } = useMockFeedItems();
  const router = useRouter();
  const [isInteractive, setIsInteractive] = React.useState(false);
  const [includeMedia, setIncludeMedia] = React.useState(false);
  const [selectedInteractiveType, setSelectedInteractiveType] = React.useState<'survey' | 'quiz' | 'poll' | 'all'>('all');
  const [includeContent, setIncludeContent] = React.useState(true);
  const [contentType, setContentType] = React.useState<'small' | 'long'>('small');
  const leftScrollRef = React.useRef<ScrollView>(null);
  const feedListRef = React.useRef<ScrollView>(null);
  const { feedItems, isLoading: realtimeLoading, refreshFeed } = useRealtime();

  const { 
    formData, 
    handleFormDataChange, 
    createOrUpdateSuperFeedItem, 
    isSubmitting,
    latestItem,
    fetchLatestItem,
    isLoading 
  } = useFeedForm({
    user: { email: 'demo@example.com' }
  });
  
  // Set initial form data when component mounts
  React.useEffect(() => {
    const mockData = generateMockData('all');
    handleFormDataChange({
      ...mockData,
      type: 'all',
      interactive_content: {
        poll: DEFAULT_POLL,
        quiz: DEFAULT_QUIZ,
        survey: DEFAULT_SURVEY
      }
    });
  }, []);

  const handleSubmit = async () => {
    try {
      
      const submissionData: FormDataType = {
        ...formData,
        type: 'all',
        metadata: {
          ...DEFAULT_METADATA,
          ...formData.metadata,
          timestamp: new Date().toISOString()
        },
        stats: formData.stats || {
          views: 0,
          likes: 0,
          shares: 0,
          responses: 0
        }
      };

      const success = await createOrUpdateSuperFeedItem(submissionData);
      
      if (success) {
        // Refresh feed after successful submission
        refreshFeed();
      } else {
      }
    } catch (error) {
    }
  };

  const handlePollUpdate = (updates: Partial<PollData>) => {
    handleFormDataChange({
      interactive_content: {
        ...formData.interactive_content,
        poll: {
          ...DEFAULT_POLL,
          ...formData.interactive_content?.poll,
          ...updates
        }
      }
    });
  };

  const handleQuizUpdate = (updates: Partial<QuizData>) => {
    handleFormDataChange({
      interactive_content: {
        ...formData.interactive_content,
        quiz: {
          ...DEFAULT_QUIZ,
          ...formData.interactive_content?.quiz,
          ...updates
        }
      }
    });
  };

  const handleSurveyUpdate = (updates: Partial<SurveyData>) => {
    handleFormDataChange({
      interactive_content: {
        ...formData.interactive_content,
        survey: {
          ...DEFAULT_SURVEY,
          ...formData.interactive_content?.survey,
          ...updates
        }
      }
    });
  };

  const handleMediaChange = (index: number, updates: Partial<MediaItem>) => {
    const newMedia = [...(formData.media || [])];
    newMedia[index] = { ...newMedia[index], ...updates };
    handleFormDataChange({ media: newMedia });
  };

  const handleAddMedia = (type: MediaType) => {
    const newMedia = [...(formData.media || [])];
    newMedia.push({
      type,
      url: '',
      caption: '',
      ...(type === 'video' ? { thumbnail: '', duration: 0 } : {})
    });
    handleFormDataChange({ media: newMedia });
  };

  const handleRemoveMedia = (index: number) => {
    const newMedia = [...(formData.media || [])];
    newMedia.splice(index, 1);
    handleFormDataChange({ media: newMedia });
  };

  const renderInteractiveContent = () => {
    if (!isInteractive) return null;

    switch (selectedInteractiveType) {
      case 'poll':
        return (
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Poll</Text>
            <TextInput
              style={styles.input}
              value={formData.interactive_content?.poll?.question}
              onChangeText={(text) => handlePollUpdate({ question: text })}
              placeholder="Poll Question"
            />
            {formData.interactive_content?.poll?.options.map((option, index) => (
              <TextInput
                key={index}
                style={styles.input}
                value={option}
                onChangeText={(text) => {
                  const newOptions = [...(formData.interactive_content?.poll?.options || ['', ''])];
                  newOptions[index] = text;
                  handlePollUpdate({ options: newOptions });
                }}
                placeholder={`Option ${index + 1}`}
              />
            ))}
          </View>
        );
      case 'quiz':
        return (
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Quiz</Text>
            <TextInput
              style={styles.input}
              value={formData.interactive_content?.quiz?.title}
              onChangeText={(text) => handleQuizUpdate({ title: text })}
              placeholder="Quiz Title"
            />
          </View>
        );
      case 'survey':
        return (
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Survey</Text>
            <TextInput
              style={styles.input}
              value={formData.interactive_content?.survey?.title}
              onChangeText={(text) => handleSurveyUpdate({ title: text })}
              placeholder="Survey Title"
            />
          </View>
        );
      case 'all':
        return (
          <>
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Poll</Text>
              <TextInput
                style={styles.input}
                value={formData.interactive_content?.poll?.question}
                onChangeText={(text) => handlePollUpdate({ question: text })}
                placeholder="Poll Question"
              />
              {formData.interactive_content?.poll?.options.map((option, index) => (
                <TextInput
                  key={index}
                  style={styles.input}
                  value={option}
                  onChangeText={(text) => {
                    const newOptions = [...(formData.interactive_content?.poll?.options || ['', ''])];
                    newOptions[index] = text;
                    handlePollUpdate({ options: newOptions });
                  }}
                  placeholder={`Option ${index + 1}`}
                />
              ))}
            </View>
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Quiz</Text>
              <TextInput
                style={styles.input}
                value={formData.interactive_content?.quiz?.title}
                onChangeText={(text) => handleQuizUpdate({ title: text })}
                placeholder="Quiz Title"
              />
            </View>
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Survey</Text>
              <TextInput
                style={styles.input}
                value={formData.interactive_content?.survey?.title}
                onChangeText={(text) => handleSurveyUpdate({ title: text })}
                placeholder="Survey Title"
              />
            </View>
          </>
        );
    }
  };

  const renderMediaSection = () => {
    if (!includeMedia) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Media</Text>
        <View style={styles.mediaButtons}>
          <Button
            onPress={() => handleAddMedia('image')}
            style={styles.mediaButton}
          >
            Add Image
          </Button>
          <Button
            onPress={() => handleAddMedia('video')}
            style={styles.mediaButton}
          >
            Add Video
          </Button>
        </View>

        {/* Media Layout Selection */}
        <View style={styles.mediaLayoutSection}>
          <Text style={styles.subsectionTitle}>Layout Style</Text>
          <View style={styles.mediaLayoutButtons}>
            {(['grid', 'carousel', 'list', 'collage', 'masonry', 'fullwidth'] as const).map((layout) => (
              <Pressable
                key={layout}
                style={[
                  styles.layoutButton,
                  formData.metadata?.mediaLayout === layout && styles.layoutButtonSelected
                ]}
                onPress={() => handleFormDataChange({
                  metadata: {
                    ...DEFAULT_METADATA,
                    ...formData.metadata,
                    mediaLayout: layout
                  }
                })}
              >
                <Text style={[
                  styles.layoutButtonText,
                  formData.metadata?.mediaLayout === layout && styles.layoutButtonTextSelected
                ]}>
                  {layout.charAt(0).toUpperCase() + layout.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {formData.media?.map((media, index) => (
          <View key={index} style={styles.mediaItem}>
            <View style={styles.mediaHeader}>
              <Text style={styles.mediaType}>
                {media.type === 'image' ? '🖼️ Image' : '🎥 Video'}
              </Text>
              <Button
                onPress={() => handleRemoveMedia(index)}
                style={styles.removeButton}
              >
                Remove
              </Button>
            </View>

            <TextInput
              style={styles.input}
              value={media.url}
              onChangeText={(text) => handleMediaChange(index, { url: text })}
              placeholder="Media URL"
            />

            <TextInput
              style={styles.input}
              value={media.caption}
              onChangeText={(text) => handleMediaChange(index, { caption: text })}
              placeholder="Caption"
            />

            {media.type === 'video' && (
              <>
                <TextInput
                  style={styles.input}
                  value={media.thumbnail}
                  onChangeText={(text) => handleMediaChange(index, { thumbnail: text })}
                  placeholder="Thumbnail URL"
                />
                <TextInput
                  style={styles.input}
                  value={media.duration?.toString()}
                  onChangeText={(text) => handleMediaChange(index, { duration: parseInt(text) || 0 })}
                  placeholder="Duration (seconds)"
                  keyboardType="numeric"
                />
              </>
            )}
          </View>
        ))}
      </View>
    );
  };

  const handleEditItem = (item: FormDataType) => {
    handleFormDataChange({
      ...item,
      interactive_content: {
        poll: item.interactive_content?.poll || DEFAULT_POLL,
        quiz: item.interactive_content?.quiz || DEFAULT_QUIZ,
        survey: item.interactive_content?.survey || DEFAULT_SURVEY
      }
    });
    
    // Set appropriate form states based on item
    setIsInteractive(!!item.interactive_content);
    setIncludeMedia(item.media?.length > 0);
    
    if (item.interactive_content) {
      if (item.interactive_content.poll && !item.interactive_content.quiz && !item.interactive_content.survey) {
        setSelectedInteractiveType('poll');
      } else if (!item.interactive_content.poll && item.interactive_content.quiz && !item.interactive_content.survey) {
        setSelectedInteractiveType('quiz');
      } else if (!item.interactive_content.poll && !item.interactive_content.quiz && item.interactive_content.survey) {
        setSelectedInteractiveType('survey');
      } else {
        setSelectedInteractiveType('all');
      }
    }
  };

  const generateRealisticContent = () => {
    // Reset form to clean state
    setIncludeContent(true);
    setIncludeMedia(true);
    setIsInteractive(true);
    setSelectedInteractiveType('all');
    setContentType(Math.random() > 0.5 ? 'long' : 'small');

    // Generate random content
    const content = contentType === 'long' 
      ? REALISTIC_CONTENT.long[Math.floor(Math.random() * REALISTIC_CONTENT.long.length)]
      : REALISTIC_CONTENT.small[Math.floor(Math.random() * REALISTIC_CONTENT.small.length)];

    // Generate random media
    const media = [
      ...REALISTIC_MEDIA.image.slice(0, Math.floor(Math.random() * 2) + 1),
      ...(Math.random() > 0.5 ? REALISTIC_MEDIA.video : [])
    ];

    // Pick random interactive content
    const poll = REALISTIC_POLLS[Math.floor(Math.random() * REALISTIC_POLLS.length)];
    const quiz = REALISTIC_QUIZZES[Math.floor(Math.random() * REALISTIC_QUIZZES.length)];
    const survey = REALISTIC_SURVEYS[Math.floor(Math.random() * REALISTIC_SURVEYS.length)];

    // Update form data
    handleFormDataChange({
      type: 'all',
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
    });

    // Scroll form to top
    if (leftScrollRef.current) {
      leftScrollRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const createRichMock = async () => {
    try {
      // Reset form to clean state
      setIncludeContent(true);
      setIncludeMedia(true);
      setIsInteractive(true);
      setSelectedInteractiveType('all');
      setContentType('long');

      // Generate rich markdown content
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

Here's a [link to our latest blog post](https://example.com/blog)

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

      // Always create 4 media items for grid layout
      const media: MediaItem[] = [
        // First three items as images
        ...PLACEHOLDER_IMAGES.slice(0, 3).map((url, index) => ({
          type: 'image' as const,
          url,
          caption: `Innovation Snapshot ${index + 1}`,
          dimensions: { 
            width: parseInt(url.split('x')[0].split('/').pop() || '800'),
            height: parseInt(url.split('x')[1].split('/')[0] || '600')
          }
        })),
        // Last item as video
        PLACEHOLDER_VIDEOS[0]
      ];

      // Enhanced poll with tech topics
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

      // Enhanced quiz about tech and space
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

      // Enhanced survey about future tech
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

      // Enhanced metadata with grid layout
      const metadata = {
        ...DEFAULT_METADATA,
        mediaLayout: 'grid' as const,
        maxHeight: 600,
        isCollapsible: true,
        displayMode: 'expanded' as const,
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

      // Random but higher stats for engagement
      const stats = {
        views: Math.floor(Math.random() * 1000000) + 500000, // 500k-1.5M views
        likes: Math.floor(Math.random() * 100000) + 50000,   // 50k-150k likes
        shares: Math.floor(Math.random() * 50000) + 25000,   // 25k-75k shares
        responses: Math.floor(Math.random() * 10000) + 5000  // 5k-15k responses
      };

      // Update form data with enhanced content
      handleFormDataChange({
        type: 'all',
        content,
        media,
        metadata,
        stats,
        interactive_content: {
          poll,
          quiz,
          survey
        },
        channel_username: 'elonmusk'
      });

      // Submit to database
      await handleSubmit();
      
    } catch (error) {
    }
  };

  return (
    <View style={styles.container}>
      {/* Toolbar */}
      <View style={styles.toolbar}>
        <Button
          onPress={generateRealisticContent}
          style={styles.createButton}
        >
          <Text>Create New</Text>
        </Button>
        <Button
          onPress={createRichMock}
          style={[styles.createButton, { marginLeft: 8 }]}
        >
          <Text>Create Rich</Text>
        </Button>
      </View>

      <View style={styles.splitView}>
        {/* Left side - Form */}
        <ScrollView style={styles.column} ref={leftScrollRef}>
          {/* Specific Content Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Content</Text>
            
            {/* Content Toggle */}
            <View style={styles.row}>
              <Text>Include Content</Text>
              <Switch
                value={includeContent}
                onValueChange={setIncludeContent}
              />
            </View>

            {/* Content Type Selection */}
            {includeContent && (
              <View style={styles.radioGroup}>
                {(['small', 'long'] as const).map((type) => (
                  <Pressable
                    key={type}
                    style={styles.radioOption}
                    onPress={() => setContentType(type)}
                  >
                    <Text>{type.charAt(0).toUpperCase() + type.slice(1)} Content</Text>
                    <View style={styles.radio}>
                      <View 
                        style={[
                          styles.radioInner,
                          contentType === type && styles.radioSelected
                        ]} 
                      />
                    </View>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Content Input */}
            {includeContent && (
              <TextInput
                style={[
                  styles.input,
                  contentType === 'long' && styles.longInput
                ]}
                value={formData.content}
                onChangeText={(text) => handleFormDataChange({ content: text })}
                placeholder={`Enter your ${contentType} content`}
                multiline
                numberOfLines={contentType === 'long' ? 6 : 3}
              />
            )}

            {/* Form Settings */}
            <View style={styles.formSettings}>
              <View style={styles.row}>
                <Text>Require Auth</Text>
                <Switch
                  value={formData.metadata?.requireAuth ?? false}
                  onValueChange={(value) => handleFormDataChange({
                    metadata: {
                      ...DEFAULT_METADATA,
                      ...formData.metadata,
                      requireAuth: value
                    }
                  })}
                />
              </View>

              <View style={styles.row}>
                <Text>Allow Resubmit</Text>
                <Switch
                  value={formData.metadata?.allowResubmit ?? false}
                  onValueChange={(value) => handleFormDataChange({
                    metadata: {
                      ...DEFAULT_METADATA,
                      ...formData.metadata,
                      allowResubmit: value
                    }
                  })}
                />
              </View>

              <View style={styles.row}>
                <Text>Make Content Collapsible</Text>
                <Switch
                  value={formData.metadata?.isCollapsible ?? true}
                  onValueChange={(value) => handleFormDataChange({
                    metadata: {
                      ...DEFAULT_METADATA,
                      ...formData.metadata,
                      isCollapsible: value
                    }
                  })}
                />
              </View>
            </View>
            
            {/* Media Toggle */}
            <View style={styles.row}>
              <Text>Include Media</Text>
              <Switch
                value={includeMedia}
                onValueChange={setIncludeMedia}
              />
            </View>

            {/* Media Section */}
            {renderMediaSection()}
            
            {/* Interactive Switch */}
            <View style={styles.row}>
              <Text>Interactive Content</Text>
              <Switch
                value={isInteractive}
                onValueChange={setIsInteractive}
              />
            </View>

            {/* Interactive Type Selection */}
            {isInteractive && (
              <View style={styles.radioGroup}>
                {(['all', 'poll', 'quiz', 'survey'] as const).map((type) => (
                  <Pressable
                    key={type}
                    style={styles.radioOption}
                    onPress={() => setSelectedInteractiveType(type)}
                  >
                    <Text>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                    <View style={styles.radio}>
                      <View 
                        style={[
                          styles.radioInner,
                          selectedInteractiveType === type && styles.radioSelected
                        ]} 
                      />
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
            
            {/* Interactive Content Forms */}
            <View style={styles.interactiveSection}>
              {renderInteractiveContent()}
            </View>
          </View>

          <Button 
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={styles.submitButton}
          >
            <Text>{isSubmitting ? 'Submitting...' : 'Submit'}</Text>
          </Button>
        </ScrollView>

        {/* Right side - Feed Items */}
        <ScrollView 
          style={styles.column} 
          ref={feedListRef}
          refreshControl={
            <RefreshControl refreshing={realtimeLoading} onRefresh={refreshFeed} />
          }
        >
          <View style={styles.previewHeader}>
            <Text style={styles.sectionTitle}>Feed Items</Text>
          </View>
          
          {feedItems.map((item, index) => (
            <View key={item.id || index} style={styles.feedItemContainer}>
              <FeedItem
                data={item}
                showHeader={true}
                showFooter={true}
              />
              <Button 
                onPress={() => handleEditItem(item)}
                style={styles.editButton}
              >
                <Text>Edit</Text>
              </Button>
            </View>
          ))}

          {feedItems.length === 0 && !realtimeLoading && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No feed items found</Text>
            </View>
          )}

          {realtimeLoading && (
            <View style={styles.loadingState}>
              <Text>Loading feed items...</Text>
            </View>
          )}
        </ScrollView>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  splitView: {
    flex: 1,
    flexDirection: 'row',
  },
  column: {
    flex: 1,
    padding: 0,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  interactiveSection: {
    marginTop: 16,
  },
  subsection: {
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  submitButton: {
    marginTop: 16,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  radioGroup: {
    marginTop: 12,
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  radioSelected: {
    backgroundColor: '#666',
  },
  refreshButton: {
    marginLeft: 8,
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  mediaButton: {
    flex: 1,
  },
  mediaItem: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
  },
  mediaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mediaType: {
    fontSize: 16,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: '#dc2626',
  },
  feedItemContainer: {
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    overflow: 'hidden',
  },
  editButton: {
    margin: 8,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
  },
  loadingState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  commonSettings: {
    paddingTop: 8,
  },
  mediaLayoutSection: {
    marginBottom: 16,
  },
  mediaLayoutButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  layoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  layoutButtonSelected: {
    backgroundColor: '#666',
    borderColor: '#666',
  },
  layoutButtonText: {
    color: '#666',
  },
  layoutButtonTextSelected: {
    color: '#fff',
  },
  formSettings: {
    marginTop: 16,
    marginBottom: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  longInput: {
    minHeight: 120,
  },
  toolbar: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  createButton: {
    backgroundColor: '#0ea5e9',
  },
  bottomToolbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: '50%', // Only cover the left column
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eff3f4',
    padding: 16,
    elevation: 4,
  },
  generateButton: {
    backgroundColor: '#1d9bf0',
    paddingVertical: 12,
    borderRadius: 9999,
  },
});