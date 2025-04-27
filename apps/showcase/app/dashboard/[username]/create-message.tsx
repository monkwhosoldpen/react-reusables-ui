import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TextInput, Switch, TouchableOpacity } from 'react-native';
import { Text } from '~/components/ui/text';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';
import { Card } from '~/components/ui/card';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '~/components/ui/button';
import { 
  FormDataType, 
  MediaLayout, 
  FeedItemType, 
  DisplayMode, 
  VisibilitySettings,
  DEFAULT_METADATA,
  MediaItem,
  InteractiveContent
} from '~/lib/enhanced-chat/types/superfeed';
import { useFeedForm } from '~/lib/hooks/useFeedForm';
import { FeedItem } from '~/lib/enhanced-chat/components/feed/FeedItem';
import { useInteractiveContent } from '~/lib/hooks/useInteractiveContent';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { debounce } from 'lodash';
import { createClient } from '@supabase/supabase-js';

const janedoe_tenant_supabase_url = 'https://risbemjewosmlvzntjkd.supabase.co';
const janedoe_tenant_supabase_anon_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpc2JlbWpld29zbWx2em50amtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxMzIxNDIsImV4cCI6MjA1NTcwODE0Mn0._5wXtDjCr9ZnYatWD7RO5DNhx_YxUjqCcdc6qhZpwGM';

const supabase = createClient(janedoe_tenant_supabase_url, janedoe_tenant_supabase_anon_key);

export default function CreateMessageScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const { colorScheme } = useColorScheme();
  const [selectedType, setSelectedType] = useState<FeedItemType>('all');
  const [isInteractive, setIsInteractive] = useState(false);
  const [includeMedia, setIncludeMedia] = useState(false);
  const [includeContent, setIncludeContent] = useState(true);
  const [mediaLayout, setMediaLayout] = useState<MediaLayout>('grid');
  const [selectedInteractiveType, setSelectedInteractiveType] = useState<'poll' | 'quiz' | 'survey'>('poll');
  const [messageCount, setMessageCount] = useState<number>(0);
  const [messages, setMessages] = useState<any[]>([]);

  const {
    formData,
    handleFormDataChange,
    isSubmitting
  } = useFeedForm({
    user: { email: username }
  });

  const { submitResponse } = useInteractiveContent(formData as FormDataType);

  const handleQuickAction = (type: 'poll' | 'quiz' | 'survey' | 'media' | 'video' | 'small' | 'long') => {
    // Reset form state completely
    const initialData: Partial<FormDataType> = {
      type: 'all',
      content: '',
      media: [],
      metadata: {
        ...DEFAULT_METADATA,
        mediaLayout: 'grid'
      }
    };
    handleFormDataChangeWithPreview(initialData);
    setIsInteractive(false);
    setIncludeMedia(false);
    setIncludeContent(true);
    setSelectedType('all');
    setSelectedInteractiveType('poll');

    // Prefill form based on type
    switch (type) {
      case 'small':
        handleFormDataChange({
          type: 'all',
          content: 'This is a short message that gets straight to the point.',
          media: [],
          metadata: {
            ...DEFAULT_METADATA,
            isCollapsible: false,
            mediaLayout: 'grid'
          }
        });
        break;

      case 'long':
        handleFormDataChange({
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
        });
        break;

      case 'poll':
        setIsInteractive(true);
        setSelectedType('poll');
        setSelectedInteractiveType('poll');
        handleFormDataChange({
          type: 'poll',
          content: 'We\'re planning our next feature release! Which of these capabilities would be most valuable for your workflow?',
          media: [],
          interactive_content: {
            poll: {
              question: 'Which upcoming feature would be most valuable for your workflow?',
              options: [
                'Advanced analytics dashboard with real-time insights',
                'Customizable workflow automation templates',
                'Enhanced collaboration tools with threaded discussions',
                'AI-powered content suggestions and optimizations',
                'Mobile app with offline capabilities'
              ]
            }
          },
          metadata: {
            ...DEFAULT_METADATA,
            isCollapsible: true,
            mediaLayout: 'grid'
          }
        });
        break;

      case 'quiz':
        setIsInteractive(true);
        setSelectedType('quiz');
        setSelectedInteractiveType('quiz');
        handleFormDataChange({
          type: 'quiz',
          content: 'Test your knowledge about our platform\'s features and best practices with this comprehensive quiz!',
          media: [],
          interactive_content: {
            quiz: {
              title: 'Platform Mastery Quiz',
              questions: [
                {
                  text: 'Which feature allows you to automate repetitive tasks and create custom workflows?',
                  options: [
                    'Workflow Builder with drag-and-drop interface',
                    'Content Scheduler with calendar view',
                    'Analytics Dashboard with real-time metrics',
                    'Team Collaboration Hub with threaded discussions',
                    'Integration Manager with API connections'
                  ],
                  correct_option: 0
                }
              ]
            }
          },
          metadata: {
            ...DEFAULT_METADATA,
            isCollapsible: true,
            mediaLayout: 'grid'
          }
        });
        break;

      case 'survey':
        setIsInteractive(true);
        setSelectedType('survey');
        setSelectedInteractiveType('survey');
        handleFormDataChange({
          type: 'survey',
          content: 'Help us improve our platform by sharing your feedback on these key aspects of your experience.',
          media: [],
          interactive_content: {
            survey: {
              title: 'Platform Experience Survey',
              questions: [
                {
                  text: 'How satisfied are you with the platform\'s performance and reliability?',
                  options: [
                    'Extremely satisfied - Everything works perfectly',
                    'Very satisfied - Minor issues but overall great',
                    'Somewhat satisfied - Some areas need improvement',
                    'Not very satisfied - Several issues need addressing',
                    'Not satisfied at all - Major problems need fixing'
                  ]
                }
              ]
            }
          },
          metadata: {
            ...DEFAULT_METADATA,
            isCollapsible: true,
            mediaLayout: 'grid'
          }
        });
        break;

      case 'media':
        setIncludeMedia(true);
        handleFormDataChange({
          type: 'all',
          content: 'Check out these amazing images from our latest product launch!',
          media: [
            {
              type: 'image',
              url: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
              caption: 'Our new product in action',
              metadata: {
                width: 1000,
                height: 600
              }
            },
            {
              type: 'image',
              url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
              caption: 'Product close-up',
              metadata: {
                width: 1000,
                height: 600
              }
            }
          ],
          metadata: {
            ...DEFAULT_METADATA,
            mediaLayout: 'grid',
            isCollapsible: true
          }
        });
        break;

      case 'video':
        setIncludeMedia(true);
        handleFormDataChange({
          type: 'all',
          content: 'Watch our latest product demo and tutorial videos to get the most out of our platform!',
          media: [
            {
              type: 'video',
              url: 'https://example.com/product-demo.mp4',
              caption: 'Product Demo: Getting Started',
              metadata: {
                width: 1280,
                height: 720,
                duration: 180
              }
            },
            {
              type: 'video',
              url: 'https://example.com/advanced-features.mp4',
              caption: 'Advanced Features Tutorial',
              metadata: {
                width: 1280,
                height: 720,
                duration: 240
              }
            }
          ],
          metadata: {
            ...DEFAULT_METADATA,
            mediaLayout: 'carousel',
            isCollapsible: true
          }
        });
        break;
    }

    // Force preview update
    setPreviewKey(prev => prev + 1);
  };

  // Add debug logging for form data changes
  useEffect(() => {
    console.log('Form Data Changed:', {
      type: formData.type,
      content: formData.content,
      media: formData.media?.length,
      interactive_content: formData.interactive_content,
      metadata: formData.metadata
    });
  }, [formData]);

  // Update preview data memo with better synchronization
  const previewData = useMemo(() => {
    const data: FormDataType = {
      ...formData,
      type: isInteractive ? selectedInteractiveType : (formData.type || 'all'),
      channel_username: username || 'anonymous',
      metadata: {
        ...DEFAULT_METADATA,
        ...formData.metadata,
        displayMode: formData.metadata?.displayMode ?? 'default',
        maxHeight: formData.metadata?.maxHeight ?? 300,
        visibility: formData.metadata?.visibility ?? DEFAULT_METADATA.visibility,
        requireAuth: formData.metadata?.requireAuth ?? false,
        allowResubmit: formData.metadata?.allowResubmit ?? false,
        timestamp: formData.metadata?.timestamp ?? new Date().toISOString()
      }
    };

    // Only include content if includeContent is true
    if (!includeContent) {
      data.content = '';
    }

    // Handle interactive content
    if (isInteractive) {
      if (!formData.interactive_content) {
        // Initialize only the selected interactive content type
        const defaultContent = {
          poll: {
            question: 'Poll Question',
            options: ['Option 1', 'Option 2']
          },
          quiz: {
            title: 'Quiz Title',
            questions: [{
              text: 'Quiz Question',
              options: ['Option 1', 'Option 2'],
              correct_option: 0
            }]
          },
          survey: {
            title: 'Survey Title',
            questions: [{
              text: 'Survey Question',
              options: ['Option 1', 'Option 2']
            }]
          }
        };

        data.interactive_content = {
          [selectedInteractiveType]: defaultContent[selectedInteractiveType]
        };
      } else {
        // Only keep the selected interactive content type
        data.interactive_content = {
          [selectedInteractiveType]: formData.interactive_content[selectedInteractiveType]
        };
      }
    } else {
      data.interactive_content = undefined;
    }

    // Ensure media array is properly structured
    if (includeMedia && formData.media) {
      data.media = formData.media.map(item => ({
        ...item,
        type: item.type || 'image',
        url: item.url || '',
        caption: item.caption || '',
        metadata: item.metadata || {}
      }));
    } else {
      data.media = [];
    }

    return data;
  }, [formData, mediaLayout, isInteractive, selectedInteractiveType, username, includeMedia, includeContent]);

  // Update preview key effect to include more dependencies
  useEffect(() => {
    console.log('Updating preview key due to changes in:', {
      mediaLayout,
      formDataMedia: formData.media,
      isInteractive,
      selectedInteractiveType
    });
    setPreviewKey(prev => prev + 1);
  }, [mediaLayout, formData.media, isInteractive, selectedInteractiveType]);

  // Add debounced preview update
  const debouncedPreviewUpdate = useCallback(
    debounce(() => {
      console.log('Debounced preview update triggered');
      setPreviewKey(prev => prev + 1);
    }, 300),
    []
  );

  // Update handleFormDataChangeWithPreview to handle interactive content state
  const handleFormDataChangeWithPreview = useCallback((updates: Partial<FormDataType>) => {
    console.log('Form data change with preview:', updates);
    const newFormData = {
      ...formData,
      ...updates,
      type: updates.type || formData.type || 'message',
      media: includeMedia ? (updates.media || formData.media || []) : [],
      interactive_content: isInteractive ? updates.interactive_content : undefined
    };
    handleFormDataChange(newFormData as Partial<FormDataType>);
    debouncedPreviewUpdate();
  }, [formData, handleFormDataChange, debouncedPreviewUpdate, includeMedia, isInteractive]);

  // Update all form change handlers to use the new function
  const handleMediaLayoutChange = useCallback((layout: MediaLayout) => {
    console.log('Media layout changed to:', layout);
    setMediaLayout(layout);
    // Preserve existing media data when changing layout
    handleFormDataChangeWithPreview({
      ...formData,
      metadata: {
        ...formData.metadata,
        mediaLayout: layout
      }
    });
  }, [formData, handleFormDataChangeWithPreview]);

  const handleMediaUrlChange = useCallback((index: number, url: string) => {
    const newMedia = [...(formData.media || [])];
    newMedia[index] = {
      type: 'image' as const,
      url: url,
      caption: newMedia[index]?.caption || ''
    };
    handleFormDataChangeWithPreview({
      ...formData,
      media: newMedia
    });
  }, [formData, handleFormDataChangeWithPreview]);

  const handleMediaCaptionChange = useCallback((index: number, caption: string) => {
    const newMedia = [...(formData.media || [])];
    newMedia[index] = {
      ...newMedia[index],
      caption: caption
    };
    handleFormDataChangeWithPreview({
      ...formData,
      media: newMedia
    });
  }, [formData, handleFormDataChangeWithPreview]);

  const renderInteractiveContent = () => {
    if (!isInteractive) return null;

    switch (selectedInteractiveType) {
      case 'poll':
        return (
          <View style={styles.interactiveSection}>
            <Text style={styles.sectionTitle}>Poll Settings</Text>
            <TextInput
              style={styles.input}
              value={formData.content}
              onChangeText={(text) => handleFormDataChange({ ...formData, content: text })}
              placeholder="Poll Description"
              multiline
            />
            <TextInput
              style={styles.input}
              value={formData.interactive_content?.poll?.question}
              onChangeText={(text) => handleFormDataChange({
                ...formData,
                interactive_content: {
                  ...formData.interactive_content,
                  poll: { ...formData.interactive_content?.poll, question: text }
                }
              })}
              placeholder="Poll Question"
            />
            {formData.interactive_content?.poll?.options.map((option, index) => (
              <View key={index} style={styles.optionRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={option}
                  onChangeText={(text) => {
                    const newOptions = [...(formData.interactive_content?.poll?.options || [])];
                    newOptions[index] = text;
                    handleFormDataChange({
                      ...formData,
                      interactive_content: {
                        ...formData.interactive_content,
                        poll: { ...formData.interactive_content?.poll, options: newOptions }
                      }
                    });
                  }}
                  placeholder={`Option ${index + 1}`}
                />
                <Button
                  variant="ghost"
                  onPress={() => {
                    const newOptions = [...(formData.interactive_content?.poll?.options || [])];
                    newOptions.splice(index, 1);
                    handleFormDataChange({
                      ...formData,
                      interactive_content: {
                        ...formData.interactive_content,
                        poll: { ...formData.interactive_content?.poll, options: newOptions }
                      }
                    });
                  }}
                >
                  <Text>Remove</Text>
                </Button>
              </View>
            ))}
            <Button
              variant="outline"
              onPress={() => {
                const newOptions = [...(formData.interactive_content?.poll?.options || []), ''];
                handleFormDataChange({
                  ...formData,
                  interactive_content: {
                    ...formData.interactive_content,
                    poll: { ...formData.interactive_content?.poll, options: newOptions }
                  }
                });
              }}
            >
              <Text>Add Option</Text>
            </Button>
          </View>
        );

      case 'quiz':
        return (
          <View style={styles.interactiveSection}>
            <Text style={styles.sectionTitle}>Quiz Settings</Text>
            <TextInput
              style={styles.input}
              value={formData.content}
              onChangeText={(text) => handleFormDataChange({ ...formData, content: text })}
              placeholder="Quiz Description"
              multiline
            />
            <TextInput
              style={styles.input}
              value={formData.interactive_content?.quiz?.title}
              onChangeText={(text) => handleFormDataChange({
                ...formData,
                interactive_content: {
                  ...formData.interactive_content,
                  quiz: { ...formData.interactive_content?.quiz, title: text }
                }
              })}
              placeholder="Quiz Title"
            />
            {formData.interactive_content?.quiz?.questions.map((question, qIndex) => (
              <View key={qIndex} style={styles.questionSection}>
                <Text style={styles.questionTitle}>Question {qIndex + 1}</Text>
                <TextInput
                  style={styles.input}
                  value={question.text}
                  onChangeText={(text) => {
                    const newQuestions = [...(formData.interactive_content?.quiz?.questions || [])];
                    newQuestions[qIndex] = { ...question, text };
                    handleFormDataChange({
                      ...formData,
                      interactive_content: {
                        ...formData.interactive_content,
                        quiz: { ...formData.interactive_content?.quiz, questions: newQuestions }
                      }
                    });
                  }}
                  placeholder="Question Text"
                  multiline
                />
                {question.options.map((option, oIndex) => (
                  <View key={oIndex} style={styles.optionRow}>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      value={option}
                      onChangeText={(text) => {
                        const newQuestions = [...(formData.interactive_content?.quiz?.questions || [])];
                        const newOptions = [...question.options];
                        newOptions[oIndex] = text;
                        newQuestions[qIndex] = { ...question, options: newOptions };
                        handleFormDataChange({
                          ...formData,
                          interactive_content: {
                            ...formData.interactive_content,
                            quiz: { ...formData.interactive_content?.quiz, questions: newQuestions }
                          }
                        });
                      }}
                      placeholder={`Option ${oIndex + 1}`}
                    />
                    <Button
                      variant="ghost"
                      onPress={() => {
                        const newQuestions = [...(formData.interactive_content?.quiz?.questions || [])];
                        const newOptions = [...question.options];
                        newOptions.splice(oIndex, 1);
                        newQuestions[qIndex] = { ...question, options: newOptions };
                        handleFormDataChange({
                          ...formData,
                          interactive_content: {
                            ...formData.interactive_content,
                            quiz: { ...formData.interactive_content?.quiz, questions: newQuestions }
                          }
                        });
                      }}
                    >
                      <Text>Remove</Text>
                    </Button>
                  </View>
                ))}
                <Button
                  variant="outline"
                  onPress={() => {
                    const newQuestions = [...(formData.interactive_content?.quiz?.questions || [])];
                    const newOptions = [...question.options, ''];
                    newQuestions[qIndex] = { ...question, options: newOptions };
                    handleFormDataChange({
                      ...formData,
                      interactive_content: {
                        ...formData.interactive_content,
                        quiz: { ...formData.interactive_content?.quiz, questions: newQuestions }
                      }
                    });
                  }}
                >
                  <Text>Add Option</Text>
                </Button>
                <View style={styles.correctOption}>
                  <Text style={{ color: colorScheme.colors.text }}>Correct Option:</Text>
                  <TextInput
                    style={[styles.input, { width: 50 }]}
                    value={question.correct_option?.toString() || '0'}
                    onChangeText={(text) => {
                      const newQuestions = [...(formData.interactive_content?.quiz?.questions || [])];
                      newQuestions[qIndex] = { ...question, correct_option: parseInt(text) || 0 };
                      handleFormDataChange({
                        ...formData,
                        interactive_content: {
                          ...formData.interactive_content,
                          quiz: { ...formData.interactive_content?.quiz, questions: newQuestions }
                        }
                      });
                    }}
                    keyboardType="numeric"
                  />
                </View>
                <Button
                  variant="ghost"
                  onPress={() => {
                    const newQuestions = [...(formData.interactive_content?.quiz?.questions || [])];
                    newQuestions.splice(qIndex, 1);
                    handleFormDataChange({
                      ...formData,
                      interactive_content: {
                        ...formData.interactive_content,
                        quiz: { ...formData.interactive_content?.quiz, questions: newQuestions }
                      }
                    });
                  }}
                >
                  <Text>Remove Question</Text>
                </Button>
              </View>
            ))}
            <Button
              variant="outline"
              onPress={() => {
                const newQuestions = [...(formData.interactive_content?.quiz?.questions || []), {
                  text: '',
                  options: ['', ''],
                  correct_option: 0
                }];
                handleFormDataChange({
                  ...formData,
                  interactive_content: {
                    ...formData.interactive_content,
                    quiz: { ...formData.interactive_content?.quiz, questions: newQuestions }
                  }
                });
              }}
            >
              <Text>Add Question</Text>
            </Button>
          </View>
        );

      case 'survey':
        return (
          <View style={styles.interactiveSection}>
            <Text style={styles.sectionTitle}>Survey Settings</Text>
            <TextInput
              style={styles.input}
              value={formData.content}
              onChangeText={(text) => handleFormDataChange({ ...formData, content: text })}
              placeholder="Survey Description"
              multiline
            />
            <TextInput
              style={styles.input}
              value={formData.interactive_content?.survey?.title}
              onChangeText={(text) => handleFormDataChange({
                ...formData,
                interactive_content: {
                  ...formData.interactive_content,
                  survey: { ...formData.interactive_content?.survey, title: text }
                }
              })}
              placeholder="Survey Title"
            />
            {formData.interactive_content?.survey?.questions.map((question, qIndex) => (
              <View key={qIndex} style={styles.questionSection}>
                <Text style={styles.questionTitle}>Question {qIndex + 1}</Text>
                <TextInput
                  style={styles.input}
                  value={question.text}
                  onChangeText={(text) => {
                    const newQuestions = [...(formData.interactive_content?.survey?.questions || [])];
                    newQuestions[qIndex] = { ...question, text };
                    handleFormDataChange({
                      ...formData,
                      interactive_content: {
                        ...formData.interactive_content,
                        survey: { ...formData.interactive_content?.survey, questions: newQuestions }
                      }
                    });
                  }}
                  placeholder="Question Text"
                  multiline
                />
                {question.options.map((option, oIndex) => (
                  <View key={oIndex} style={styles.optionRow}>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      value={option}
                      onChangeText={(text) => {
                        const newQuestions = [...(formData.interactive_content?.survey?.questions || [])];
                        const newOptions = [...question.options];
                        newOptions[oIndex] = text;
                        newQuestions[qIndex] = { ...question, options: newOptions };
                        handleFormDataChange({
                          ...formData,
                          interactive_content: {
                            ...formData.interactive_content,
                            survey: { ...formData.interactive_content?.survey, questions: newQuestions }
                          }
                        });
                      }}
                      placeholder={`Option ${oIndex + 1}`}
                    />
                    <Button
                      variant="ghost"
                      onPress={() => {
                        const newQuestions = [...(formData.interactive_content?.survey?.questions || [])];
                        const newOptions = [...question.options];
                        newOptions.splice(oIndex, 1);
                        newQuestions[qIndex] = { ...question, options: newOptions };
                        handleFormDataChange({
                          ...formData,
                          interactive_content: {
                            ...formData.interactive_content,
                            survey: { ...formData.interactive_content?.survey, questions: newQuestions }
                          }
                        });
                      }}
                    >
                      <Text>Remove</Text>
                    </Button>
                  </View>
                ))}
                <Button
                  variant="outline"
                  onPress={() => {
                    const newQuestions = [...(formData.interactive_content?.survey?.questions || [])];
                    const newOptions = [...question.options, ''];
                    newQuestions[qIndex] = { ...question, options: newOptions };
                    handleFormDataChange({
                      ...formData,
                      interactive_content: {
                        ...formData.interactive_content,
                        survey: { ...formData.interactive_content?.survey, questions: newQuestions }
                      }
                    });
                  }}
                >
                  <Text>Add Option</Text>
                </Button>
                <Button
                  variant="ghost"
                  onPress={() => {
                    const newQuestions = [...(formData.interactive_content?.survey?.questions || [])];
                    newQuestions.splice(qIndex, 1);
                    handleFormDataChange({
                      ...formData,
                      interactive_content: {
                        ...formData.interactive_content,
                        survey: { ...formData.interactive_content?.survey, questions: newQuestions }
                      }
                    });
                  }}
                >
                  <Text>Remove Question</Text>
                </Button>
              </View>
            ))}
            <Button
              variant="outline"
              onPress={() => {
                const newQuestions = [...(formData.interactive_content?.survey?.questions || []), {
                  text: '',
                  options: ['', '']
                }];
                handleFormDataChange({
                  ...formData,
                  interactive_content: {
                    ...formData.interactive_content,
                    survey: { ...formData.interactive_content?.survey, questions: newQuestions }
                  }
                });
              }}
            >
              <Text>Add Question</Text>
            </Button>
          </View>
        );

      default:
        return null;
    }
  };

  const handleCreateItem = async () => {
    try {
      if (!username) {
        console.error('No username found');
        return;
      }

      const createData = {
        ...formData,
        channel_username: username,
        type: formData.type || 'all',
        metadata: {
          ...DEFAULT_METADATA,
          ...formData.metadata,
          displayMode: formData.metadata?.displayMode ?? 'default',
          maxHeight: formData.metadata?.maxHeight ?? 300,
          visibility: formData.metadata?.visibility ?? DEFAULT_METADATA.visibility,
          requireAuth: formData.metadata?.requireAuth ?? false,
          allowResubmit: formData.metadata?.allowResubmit ?? false,
          timestamp: formData.metadata?.timestamp ?? new Date().toISOString()
        }
      };

      const { data, error } = await supabase
        .from('superfeed')
        .insert([createData])
        .select();

      if (error) {
        console.error('Error creating message:', error);
        return;
      }

      // Refresh the message count and list
      const { data: countData, error: countError } = await supabase
        .from('superfeed')
        .select('id', { count: 'exact' })
        .eq('channel_username', username);

      if (!countError) {
        setMessageCount(countData?.length || 0);
      }

      // Reset form data after successful creation
      handleFormDataChange({
        type: 'all',
        content: '',
        media: [],
        metadata: DEFAULT_METADATA,
        interactive_content: undefined
      });

    } catch (error) {
      console.error('Error in handleCreateItem:', error);
    }
  };

  // Log when formData changes
  useEffect(() => {
    console.log('Form data changed:', {
      ...formData,
      media: formData.media?.map(m => ({ ...m, url: m.url.substring(0, 30) + '...' }))
    });
  }, [formData]);

  // Log when mediaLayout changes
  useEffect(() => {
    console.log('Media layout state changed:', mediaLayout);
  }, [mediaLayout]);

  // Add debug logging for preview data
  useEffect(() => {
    console.log('Preview Data Changed:', {
      type: previewData.type,
      content: previewData.content,
      media: previewData.media?.length,
      interactive_content: previewData.interactive_content,
      metadata: previewData.metadata
    });
  }, [previewData]);

  // Force preview update when layout changes
  const [previewKey, setPreviewKey] = useState(0);

  // Add useEffect to fetch message count
  useEffect(() => {
    const fetchMessageCount = async () => {
      try {
        const { data, error } = await supabase
          .from('superfeed')
          .select('id', { count: 'exact' })
          .eq('channel_username', username);

        if (error) {
          console.error('Error fetching message count:', error);
          return;
        }

        console.log('Message count:', data?.length || 0);
        setMessageCount(data?.length || 0);
      } catch (error) {
        console.error('Error in fetchMessageCount:', error);
      }
    };

    fetchMessageCount();
  }, [username]);

  // Update fetchMessages to have minimal logging
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('superfeed')
          .select('*')
          .eq('channel_username', username)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching messages:', error);
          return;
        }

        setMessages(data || []);
        setMessageCount(data?.length || 0);
      } catch (error) {
        console.error('Error in fetchMessages:', error);
      }
    };

    fetchMessages();
  }, [username]);

  const handleEditMessage = (message: any) => {
    console.log('Editing message:', {
      id: message.id,
      type: message.type,
      content: message.content,
      hasMedia: !!message.media?.length,
      hasInteractiveContent: !!message.interactive_content
    });

    // Initialize default interactive content if needed
    const interactiveContent = message.interactive_content || {
      poll: {
        question: 'Poll Question',
        options: ['Option 1', 'Option 2']
      },
      quiz: {
        title: 'Quiz Title',
        questions: [{
          text: 'Quiz Question',
          options: ['Option 1', 'Option 2'],
          correct_option: 0
        }]
      },
      survey: {
        title: 'Survey Title',
        questions: [{
          text: 'Survey Question',
          options: ['Option 1', 'Option 2']
        }]
      }
    };

    // Update form data with the selected message
    const updatedFormData = {
      type: message.type || 'all',
      content: message.content || '',
      message: message.message || '',
      caption: message.caption || '',
      media: message.media || [],
      metadata: {
        ...DEFAULT_METADATA,
        ...message.metadata,
        displayMode: message.metadata?.displayMode ?? 'default',
        maxHeight: message.metadata?.maxHeight ?? 300,
        visibility: message.metadata?.visibility ?? DEFAULT_METADATA.visibility,
        requireAuth: message.metadata?.requireAuth ?? false,
        allowResubmit: message.metadata?.allowResubmit ?? false,
        timestamp: message.metadata?.timestamp ?? new Date().toISOString()
      },
      interactive_content: interactiveContent,
      channel_username: username
    };

    // Update all relevant states
    handleFormDataChange(updatedFormData);
    setSelectedType(message.type || 'all');
    setIsInteractive(!!message.interactive_content);
    if (message.interactive_content) {
      setSelectedInteractiveType(
        message.interactive_content.poll ? 'poll' :
        message.interactive_content.quiz ? 'quiz' :
        message.interactive_content.survey ? 'survey' : 'poll'
      );
    }
    setMediaLayout(message.metadata?.mediaLayout || 'grid');
    setIncludeMedia(!!message.media?.length);
    setIncludeContent(!!message.content);

    // Force preview update with the actual message data
    setPreviewKey(prev => prev + 1);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    quickActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: 16,
      gap: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colorScheme.colors.border,
    },
    quickActionButton: {
      flex: 1,
      minWidth: 100,
    },
    dialogContent: {
      flex: 1,
      flexDirection: 'row',
      overflow: 'hidden',
    },
    formContainer: {
      width: '30%',
      borderRightWidth: StyleSheet.hairlineWidth,
      borderRightColor: colorScheme.colors.border,
      padding: 16,
    },
    formScroll: {
      flex: 1,
    },
    section: {
      marginBottom: 16,
      padding: 16,
      backgroundColor: colorScheme.colors.card,
      borderRadius: 8,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 12,
      color: colorScheme.colors.text,
    },
    toggleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
      paddingVertical: 4,
    },
    input: {
      borderWidth: 1,
      borderColor: colorScheme.colors.border,
      borderRadius: 6,
      padding: 12,
      marginBottom: 12,
      fontSize: 16,
      backgroundColor: colorScheme.colors.background,
      color: colorScheme.colors.text,
    },
    interactiveSection: {
      marginTop: 16,
      gap: 12,
    },
    optionRow: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
    },
    questionSection: {
      marginTop: 16,
      padding: 16,
      backgroundColor: colorScheme.colors.card,
      borderRadius: 8,
      gap: 12,
    },
    questionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colorScheme.colors.text,
    },
    correctOption: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    previewContainer: {
      width: '30%',
      padding: 16,
      borderLeftWidth: StyleSheet.hairlineWidth,
      borderLeftColor: colorScheme.colors.border,
    },
    previewScroll: {
      flex: 1,
    },
    previewCard: {
      flex: 1,
      minHeight: 200,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colorScheme.colors.border,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    dialogFooter: {
      padding: 16,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colorScheme.colors.border,
    },
    mediaLayoutContainer: {
      marginBottom: 20,
    },
    mediaLayoutTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 12,
      color: colorScheme.colors.text,
    },
    mediaLayoutButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    mediaLayoutButton: {
      flex: 1,
      minWidth: 100,
      padding: 12,
      borderRadius: 6,
      borderWidth: 1,
      alignItems: 'center',
      backgroundColor: colorScheme.colors.background,
      borderColor: colorScheme.colors.border,
    },
    selectedMediaLayoutButton: {
      backgroundColor: colorScheme.colors.primary,
      borderColor: colorScheme.colors.primary,
    },
    mediaLayoutButtonText: {
      fontSize: 14,
      fontWeight: '500',
    },
    mediaItemsContainer: {
      marginTop: 16,
      gap: 16,
    },
    mediaItem: {
      gap: 12,
      padding: 12,
      backgroundColor: colorScheme.colors.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colorScheme.colors.border,
    },
    mediaItemLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colorScheme.colors.text,
    },
    mediaButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 16,
    },
    mediaButton: {
      flex: 1,
      paddingVertical: 12,
    },
    radioGroup: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 16,
    },
    radioOption: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colorScheme.colors.border,
      alignItems: 'center',
      backgroundColor: colorScheme.colors.background,
    },
    radioOptionSelected: {
      backgroundColor: colorScheme.colors.primary,
      borderColor: colorScheme.colors.primary,
    },
    radioText: {
      fontSize: 14,
      fontWeight: '500',
    },
    comingSoonContainer: {
      width: '40%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colorScheme.colors.card,
      borderRightWidth: StyleSheet.hairlineWidth,
      borderRightColor: colorScheme.colors.border,
    },
    comingSoonText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colorScheme.colors.text,
      opacity: 0.7,
      transform: [{ rotate: '-45deg' }],
    },
    messageCount: {
      fontSize: 16,
      marginTop: 20,
      textAlign: 'center',
    },
    messageList: {
      flex: 1,
      marginTop: 20,
      width: '100%',
    },
    messageItem: {
      padding: 10,
      marginBottom: 10,
      borderWidth: 1,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    messageId: {
      fontSize: 12,
      flex: 1,
    },
    messageType: {
      fontSize: 12,
      marginLeft: 10,
      flex: 1,
    },
    editButton: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 4,
      marginLeft: 10,
    },
    editButtonText: {
      color: '#fff',
      fontSize: 12,
    },
  });

  return (
    <View style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
      {/* Quick Action Buttons */}
      <View style={styles.quickActions}>
        <Button
          variant="outline"
          onPress={() => handleQuickAction('small')}
          style={styles.quickActionButton}
        >
          <Text>Short Text</Text>
        </Button>
        <Button
          variant="outline"
          onPress={() => handleQuickAction('long')}
          style={styles.quickActionButton}
        >
          <Text>Long Text</Text>
        </Button>
        <Button
          variant="outline"
          onPress={() => handleQuickAction('poll')}
          style={styles.quickActionButton}
        >
          <Text>Create Poll</Text>
        </Button>
        <Button
          variant="outline"
          onPress={() => handleQuickAction('quiz')}
          style={styles.quickActionButton}
        >
          <Text>Create Quiz</Text>
        </Button>
        <Button
          variant="outline"
          onPress={() => handleQuickAction('survey')}
          style={styles.quickActionButton}
        >
          <Text>Create Survey</Text>
        </Button>
        <Button
          variant="outline"
          onPress={() => handleQuickAction('media')}
          style={styles.quickActionButton}
        >
          <Text>Add Image</Text>
        </Button>
        <Button
          variant="outline"
          onPress={() => handleQuickAction('video')}
          style={styles.quickActionButton}
        >
          <Text>Add Video</Text>
        </Button>
      </View>

      <View style={styles.dialogContent}>
        <View style={styles.formContainer}>
          <ScrollView style={styles.formScroll}>
            {/* Content Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Content</Text>
              <View style={styles.toggleRow}>
                <Text style={{ color: colorScheme.colors.text, fontSize: 16 }}>Make Content Collapsible</Text>
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
              <View style={styles.toggleRow}>
                <Text style={{ color: colorScheme.colors.text, fontSize: 16 }}>Include Content</Text>
                <Switch
                  value={includeContent}
                  onValueChange={setIncludeContent}
                />
              </View>
              {includeContent && (
                <TextInput
                  style={styles.input}
                  value={formData.content}
                  onChangeText={(text) => handleFormDataChange({ ...formData, content: text })}
                  placeholder="Enter your content"
                  multiline
                  numberOfLines={4}
                />
              )}
            </View>

            {/* Media Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Media</Text>
              <View style={styles.toggleRow}>
                <Text style={{ color: colorScheme.colors.text, fontSize: 16 }}>Include Media</Text>
                <Switch
                  value={includeMedia}
                  onValueChange={setIncludeMedia}
                />
              </View>
              {includeMedia && (
                <View>
                  <View style={styles.mediaLayoutContainer}>
                    <Text style={styles.mediaLayoutTitle}>Layout Style</Text>
                    <View style={styles.mediaLayoutButtons}>
                      {(['grid', 'carousel', 'list', 'collage', 'masonry', 'fullwidth'] as const).map((layout) => (
                        <TouchableOpacity
                          key={layout}
                          style={[
                            styles.mediaLayoutButton,
                            mediaLayout === layout && styles.selectedMediaLayoutButton,
                            { borderColor: colorScheme.colors.border }
                          ]}
                          onPress={() => handleMediaLayoutChange(layout)}
                        >
                          <Text style={[
                            styles.mediaLayoutButtonText,
                            { color: mediaLayout === layout ? '#fff' : colorScheme.colors.text }
                          ]}>
                            {layout.charAt(0).toUpperCase() + layout.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Media Items List */}
                  <View style={styles.mediaItemsContainer}>
                    {formData.media?.map((item, index) => (
                      <View key={index} style={styles.mediaItem}>
                        <Text style={styles.mediaItemLabel}>
                          {item.type === 'image' ? `Image ${index + 1}` : `Video ${index + 1}`}
                        </Text>
                        <TextInput
                          style={[styles.input, { color: colorScheme.colors.text }]}
                          value={item.url}
                          onChangeText={(text) => handleMediaUrlChange(index, text)}
                          placeholder={`https://placeholder.co/800x600?text=${item.type}+${index + 1}`}
                          placeholderTextColor={colorScheme.colors.text + '80'}
                        />
                        <TextInput
                          style={[styles.input, { color: colorScheme.colors.text }]}
                          value={item.caption}
                          onChangeText={(text) => handleMediaCaptionChange(index, text)}
                          placeholder={`Enter caption for ${item.type} ${index + 1}`}
                          placeholderTextColor={colorScheme.colors.text + '80'}
                        />
                      </View>
                    ))}
                  </View>

                  <View style={styles.mediaButtons}>
                    <Button
                      onPress={() => {
                        const newMedia = [...(formData.media || []), {
                          type: 'image' as const,
                          url: `https://placeholder.co/800x600?text=Image+${(formData.media?.length || 0) + 1}`,
                          caption: `Image ${(formData.media?.length || 0) + 1}`,
                          metadata: {
                            width: 800,
                            height: 600
                          }
                        }];
                        handleFormDataChange({
                          ...formData,
                          media: newMedia
                        });
                      }}
                      variant="default"
                      size="default"
                      style={styles.mediaButton}
                    >
                      <Text>Add Image</Text>
                    </Button>
                    <Button
                      onPress={() => {
                        const newMedia = [...(formData.media || []), {
                          type: 'video' as const,
                          url: 'https://example.com/sample-video.mp4',
                          caption: `Video ${(formData.media?.length || 0) + 1}`,
                          metadata: {
                            width: 1280,
                            height: 720,
                            duration: 120
                          }
                        }];
                        handleFormDataChange({
                          ...formData,
                          media: newMedia
                        });
                      }}
                      variant="default"
                      size="default"
                      style={styles.mediaButton}
                    >
                      <Text>Add Video</Text>
                    </Button>
                  </View>
                </View>
              )}
            </View>

            {/* Interactive Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Interactive Content</Text>
              <View style={styles.toggleRow}>
                <Text style={{ color: colorScheme.colors.text, fontSize: 16 }}>Enable Interactive Content</Text>
                <Switch
                  value={isInteractive}
                  onValueChange={setIsInteractive}
                />
              </View>
              {isInteractive && (
                <>
                  <View style={styles.radioGroup}>
                    {(['poll', 'quiz', 'survey'] as const).map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.radioOption,
                          selectedInteractiveType === type && styles.radioOptionSelected
                        ]}
                        onPress={() => setSelectedInteractiveType(type)}
                      >
                        <Text style={[
                          styles.radioText,
                          { color: selectedInteractiveType === type ? '#fff' : colorScheme.colors.text }
                        ]}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {renderInteractiveContent()}
                </>
              )}
            </View>
          </ScrollView>
        </View>

        <View style={styles.comingSoonContainer}>
          <Text style={styles.comingSoonText}>Coming Soon</Text>
          <Text style={[styles.messageCount, { color: colorScheme.colors.text }]}>
            Total Messages: {messageCount}
          </Text>
          
          <ScrollView style={styles.messageList}>
            {messages.map((message) => (
              <View key={message.id} style={[styles.messageItem, { borderColor: colorScheme.colors.border }]}>
                <Text style={[styles.messageId, { color: colorScheme.colors.text }]}>
                  ID: {message.id}
                </Text>
                <Text style={[styles.messageType, { color: colorScheme.colors.text }]}>
                  Type: {message.type}
                </Text>
                <TouchableOpacity
                  style={[styles.editButton, { backgroundColor: colorScheme.colors.primary }]}
                  onPress={() => handleEditMessage(message)}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={[styles.previewContainer, { backgroundColor: colorScheme.colors.background }]}>
          <ScrollView style={styles.previewScroll}>
            <Card style={[
              styles.previewCard, 
              { 
                backgroundColor: colorScheme.colors.card,
                borderColor: colorScheme.colors.border,
              }
            ]}>
              <FeedItem
                key={`preview-${previewKey}`}
                data={previewData}
                showHeader={true}
                showFooter={true}
              />
            </Card>
          </ScrollView>
        </View>
      </View>

      <View style={styles.dialogFooter}>
        <Button
          variant="default"
          onPress={handleCreateItem}
          disabled={isSubmitting}
        >
          <Text>{isSubmitting ? 'Creating...' : 'Create'}</Text>
        </Button>
      </View>
    </View>
  );
} 