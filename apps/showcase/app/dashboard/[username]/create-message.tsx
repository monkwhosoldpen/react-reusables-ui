import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Switch, TouchableOpacity } from 'react-native';
import { Text } from '~/components/ui/text';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { Card } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { 
  FormDataType, 
  MediaLayout, 
  FeedItemType, 
  DEFAULT_METADATA,
  InteractiveContent,
  Metadata,
  QuizData,
  SurveyData
} from '~/lib/enhanced-chat/types/superfeed';
import { useFeedForm } from '~/lib/hooks/useFeedForm';
import { FeedItem } from '~/lib/enhanced-chat/components/feed/FeedItem';
import { useInteractiveContent } from '~/lib/hooks/useInteractiveContent';
import { useLocalSearchParams } from 'expo-router';
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
  const [messages, setMessages] = useState<FormDataType[]>([]);

  const {
    formData,
    handleFormDataChange,
    isSubmitting
  } = useFeedForm({
    user: { email: username }
  });

  const { submitResponse } = useInteractiveContent(formData as FormDataType);

  const handleQuickAction = (type: 'poll' | 'quiz' | 'survey' | 'media' | 'video' | 'small' | 'long' | 'superfeed') => {
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
      case 'superfeed':
        setIsInteractive(true);
        setIncludeMedia(true);
        setSelectedType('poll');
        setSelectedInteractiveType('poll');
        handleFormDataChange({
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
            },
            {
              type: 'image',
              url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
              caption: 'Customizable workflow interface',
              metadata: {
                width: 1000,
                height: 600
              }
            },
            {
              type: 'image',
              url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
              caption: 'AI-powered insights visualization',
              metadata: {
                width: 1000,
                height: 600
              }
            },
            {
              type: 'image',
              url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
              caption: 'Mobile app interface',
              metadata: {
                width: 1000,
                height: 600
              }
            },
            {
              type: 'video',
              url: 'https://placehold.co/1280x720/FF6B6B/ffffff/png?text=Product+Demo',
              caption: 'Product Demo: Getting Started',
              metadata: {
                width: 1280,
                height: 720,
                duration: 180
              }
            },
            {
              type: 'video',
              url: 'https://placehold.co/1280x720/4ECDC4/ffffff/png?text=Features+Overview',
              caption: 'Features Overview',
              metadata: {
                width: 1280,
                height: 720,
                duration: 240
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
                'Mobile app with offline capabilities',
                'Enhanced security and compliance features',
                'Integration with third-party tools',
                'Custom branding and white-labeling options'
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
        });
        break;

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

    }

    // Force preview update
    setPreviewKey(prev => prev + 1);
  };

  // Update preview data memo with better synchronization
  const previewData = useMemo(() => {
    console.log('🔄 Preview Data Update:', {
      formData: {
        type: formData.type,
        mediaLayout: formData.metadata?.mediaLayout,
        isInteractive,
        selectedInteractiveType,
        includeMedia,
        includeContent
      },
      currentState: {
        mediaLayout,
        isInteractive,
        selectedInteractiveType,
        includeMedia
      }
    });

    // Calculate fixed height based on collapsible state
    const fixedHeight = formData.metadata?.isCollapsible ? 400 : undefined;
    
    const data: FormDataType = {
      ...formData,
      type: isInteractive ? selectedInteractiveType : (formData.type || 'all'),
      channel_username: username || 'anonymous',
      media: includeMedia ? formData.media : [],
      metadata: {
        ...DEFAULT_METADATA,
        ...formData.metadata,
        displayMode: formData.metadata?.displayMode ?? 'default',
        maxHeight: fixedHeight, // Always use fixed height for collapsible items
        isCollapsible: formData.metadata?.isCollapsible ?? false,
        visibility: formData.metadata?.visibility ?? DEFAULT_METADATA.visibility,
        requireAuth: formData.metadata?.requireAuth ?? false,
        allowResubmit: formData.metadata?.allowResubmit ?? false,
        timestamp: formData.metadata?.timestamp ?? new Date().toISOString(),
        mediaLayout: mediaLayout // Ensure mediaLayout is always in sync
      }
    };

    console.log('📊 Preview Data Generated:', {
      type: data.type,
      mediaLayout: data.metadata.mediaLayout,
      isInteractive: !!data.interactive_content,
      mediaCount: data.media?.length || 0,
      hasContent: !!data.content,
      includeMedia,
      isCollapsible: data.metadata.isCollapsible,
      maxHeight: data.metadata.maxHeight
    });

    // Handle media dimensions
    if (includeMedia && formData.media) {
      data.media = formData.media.map(item => {
        const maxWidth = 800; // Fixed max width for media
        const maxHeight = fixedHeight ? fixedHeight * 0.6 : 600; // Use 60% of fixed height for media if collapsible
        
        const originalWidth = item.metadata?.width || 800;
        const originalHeight = item.metadata?.height || 600;
        
        // Calculate aspect ratio preserving dimensions
        const aspectRatio = originalWidth / originalHeight;
        let constrainedWidth = originalWidth;
        let constrainedHeight = originalHeight;
        
        if (originalWidth > maxWidth) {
          constrainedWidth = maxWidth;
          constrainedHeight = maxWidth / aspectRatio;
        }
        if (constrainedHeight > maxHeight) {
          constrainedHeight = maxHeight;
          constrainedWidth = maxHeight * aspectRatio;
        }

        return {
          ...item,
          type: item.type || 'image',
          url: item.url || '',
          caption: item.caption || '',
          metadata: {
            ...item.metadata,
            width: Math.round(constrainedWidth),
            height: Math.round(constrainedHeight)
          }
        };
      });
    }

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
          [selectedInteractiveType]: formData.interactive_content[selectedInteractiveType] || {
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
          }[selectedInteractiveType]
        };
      }
    } else {
      data.interactive_content = undefined;
    }

    return data;
  }, [formData, mediaLayout, isInteractive, selectedInteractiveType, username, includeMedia, includeContent]);

  // Update preview key effect to include more dependencies
  useEffect(() => {
    console.log('🔑 Preview Key Update:', {
      mediaLayout,
      mediaCount: formData.media?.length,
      isInteractive,
      selectedInteractiveType
    });
    setPreviewKey(prev => prev + 1);
  }, [mediaLayout, formData.media, isInteractive, selectedInteractiveType]);

  // Add debounced preview update
  const debouncedPreviewUpdate = useCallback(
    debounce(() => {
      console.log('⏱️ Debounced Preview Update');
      setPreviewKey(prev => prev + 1);
    }, 300),
    []
  );

  // Update handleFormDataChangeWithPreview to handle interactive content state
  const handleFormDataChangeWithPreview = useCallback((updates: Partial<FormDataType> & {
    metadata?: Partial<Metadata>;
    interactive_content?: Partial<InteractiveContent>;
  }) => {
    console.log('📝 Form Data Change:', {
      updates,
      currentState: {
        type: formData.type,
        mediaLayout: formData.metadata?.mediaLayout,
        isInteractive,
        selectedInteractiveType,
        includeMedia
      }
    });

    const newFormData: FormDataType = {
      ...formData,
      ...updates,
      type: isInteractive ? selectedInteractiveType : (updates.type || formData.type || 'all') as FeedItemType,
      media: includeMedia ? (updates.media || formData.media || []) : [],
      interactive_content: isInteractive ? {
        ...formData.interactive_content,
        ...updates.interactive_content,
        [selectedInteractiveType]: {
          ...formData.interactive_content?.[selectedInteractiveType],
          ...updates.interactive_content?.[selectedInteractiveType],
          ...(selectedInteractiveType === 'quiz' || selectedInteractiveType === 'survey' ? {
            questions: updates.interactive_content?.[selectedInteractiveType]?.questions?.map(q => ({
              text: q.text || '',
              options: q.options || ['', ''],
              correct_option: q.correct_option || 0
            })) || formData.interactive_content?.[selectedInteractiveType]?.questions || []
          } : {
            question: updates.interactive_content?.[selectedInteractiveType]?.question || '',
            options: updates.interactive_content?.[selectedInteractiveType]?.options || ['', '']
          })
        }
      } : undefined,
      metadata: {
        ...DEFAULT_METADATA,
        ...formData.metadata,
        ...updates.metadata,
        mediaLayout: mediaLayout, // Ensure mediaLayout is always in sync
        requireAuth: updates.metadata?.requireAuth ?? formData.metadata?.requireAuth ?? false,
        allowResubmit: updates.metadata?.allowResubmit ?? formData.metadata?.allowResubmit ?? false,
        timestamp: updates.metadata?.timestamp ?? formData.metadata?.timestamp ?? new Date().toISOString()
      }
    };

    console.log('✅ New Form Data:', {
      type: newFormData.type,
      mediaLayout: newFormData.metadata.mediaLayout,
      isInteractive: !!newFormData.interactive_content,
      mediaCount: newFormData.media?.length || 0,
      hasContent: !!newFormData.content,
      includeMedia
    });

    handleFormDataChange(newFormData);
    setPreviewKey(prev => prev + 1);
  }, [formData, handleFormDataChange, includeMedia, isInteractive, selectedInteractiveType, mediaLayout]);

  // Update the Add Question button handler
  const handleAddQuestion = useCallback(() => {
    if (selectedInteractiveType === 'poll') return; // Polls don't have questions
    
    const currentContent = formData.interactive_content?.[selectedInteractiveType];
    const newQuestions = [
      ...(selectedInteractiveType === 'quiz' || selectedInteractiveType === 'survey' 
        ? (currentContent as QuizData | SurveyData)?.questions || [] 
        : []),
      {
        text: 'New Question',
        options: ['Option 1', 'Option 2'],
        correct_option: 0
      }
    ];
    
    handleFormDataChangeWithPreview({
      interactive_content: {
        [selectedInteractiveType]: {
          ...currentContent,
          questions: newQuestions
        }
      }
    });
  }, [formData, selectedInteractiveType, handleFormDataChangeWithPreview]);

  // Update all form change handlers to use the new function
  const handleMediaLayoutChange = useCallback((layout: MediaLayout) => {
    console.log('🖼️ Media Layout Change:', {
      from: mediaLayout,
      to: layout,
      currentMediaCount: formData.media?.length || 0
    });
    
    setMediaLayout(layout);
    handleFormDataChangeWithPreview({
      metadata: {
        ...formData.metadata,
        mediaLayout: layout
      }
    });
    // Force immediate preview update
    setPreviewKey(prev => prev + 1);
  }, [formData, handleFormDataChangeWithPreview, mediaLayout]);

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
              value={formData.interactive_content?.poll?.question}
              onChangeText={(text) => handleFormDataChange({
                ...formData,
                interactive_content: {
                  ...formData.interactive_content,
                  poll: { ...formData.interactive_content?.poll, question: text }
                }
              })}
              placeholder="Enter poll question"
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
              value={formData.interactive_content?.quiz?.title}
              onChangeText={(text) => handleFormDataChange({
                ...formData,
                interactive_content: {
                  ...formData.interactive_content,
                  quiz: { ...formData.interactive_content?.quiz, title: text }
                }
              })}
              placeholder="Enter quiz title"
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
                  onPress={handleAddQuestion}
                >
                  <Text>Add Question</Text>
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
          </View>
        );

      case 'survey':
        return (
          <View style={styles.interactiveSection}>
            <Text style={styles.sectionTitle}>Survey Settings</Text>
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
              placeholder="Enter survey title"
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
                <View style={styles.optionContainer}>
                  <TextInput
                    style={styles.optionInput}
                    value={question.options[0]}
                    onChangeText={(text) => {
                      const newQuestions = [...(formData.interactive_content?.survey?.questions || [])];
                      const newOptions = [...question.options];
                      newOptions[0] = text;
                      newQuestions[qIndex] = { ...question, options: newOptions };
                      handleFormDataChange({
                        ...formData,
                        interactive_content: {
                          ...formData.interactive_content,
                          survey: { ...formData.interactive_content?.survey, questions: newQuestions }
                        }
                      });
                    }}
                    placeholder={`Option 1`}
                  />
                  <Button
                    variant="ghost"
                    onPress={() => {
                      const newQuestions = [...(formData.interactive_content?.survey?.questions || [])];
                      const newOptions = [...question.options];
                      newOptions.splice(0, 1);
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
                <View style={styles.optionContainer}>
                  <TextInput
                    style={styles.optionInput}
                    value={question.options[1]}
                    onChangeText={(text) => {
                      const newQuestions = [...(formData.interactive_content?.survey?.questions || [])];
                      const newOptions = [...question.options];
                      newOptions[1] = text;
                      newQuestions[qIndex] = { ...question, options: newOptions };
                      handleFormDataChange({
                        ...formData,
                        interactive_content: {
                          ...formData.interactive_content,
                          survey: { ...formData.interactive_content?.survey, questions: newQuestions }
                        }
                      });
                    }}
                    placeholder={`Option 2`}
                  />
                  <Button
                    variant="ghost"
                    onPress={() => {
                      const newQuestions = [...(formData.interactive_content?.survey?.questions || [])];
                      const newOptions = [...question.options];
                      newOptions.splice(1, 1);
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
                <View style={styles.questionActions}>
                  <Button
                    variant="outline"
                    onPress={handleAddQuestion}
                  >
                    <Text>Add Question</Text>
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
              </View>
            ))}
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

      const createData: FormDataType = {
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
      } as FormDataType);

    } catch (error) {
      console.error('Error in handleCreateItem:', error);
    }
  };

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

  const handleEditMessage = (message: FormDataType) => {

    // Initialize default interactive content if needed
    const interactiveContent: InteractiveContent = message.interactive_content || {
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
    const updatedFormData: FormDataType = {
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
        'poll' in message.interactive_content ? 'poll' :
        'quiz' in message.interactive_content ? 'quiz' :
        'survey' in message.interactive_content ? 'survey' : 'poll'
      );
    }
    setMediaLayout(message.metadata?.mediaLayout || 'grid');
    setIncludeMedia(!!message.media?.length);
    setIncludeContent(!!message.content);

    // Force preview update with the actual message data
    setPreviewKey(prev => prev + 1);
  };

  // Add effect to monitor collapsible state changes
  useEffect(() => {
    const baseMaxHeight = formData.metadata?.isCollapsible ? 400 : 600;
    const mediaMaxHeight = formData.media?.length ? 500 : baseMaxHeight;
    const forcedMaxHeight = Math.min(mediaMaxHeight, formData.metadata?.maxHeight ?? baseMaxHeight);
    
    console.log('Height Calculation:', {
      isCollapsible: formData.metadata?.isCollapsible,
      baseMaxHeight,
      mediaMaxHeight,
      forcedMaxHeight,
      hasMedia: !!formData.media?.length
    });
  }, [formData.metadata?.isCollapsible, formData.metadata?.maxHeight, mediaLayout, formData.media]);

  // Add effect to monitor preview container dimensions
  useEffect(() => {
    const previewContainer = document.querySelector('.preview-container');
    if (previewContainer) {
      const observer = new ResizeObserver(entries => {
        for (const entry of entries) {
          const baseMaxHeight = formData.metadata?.isCollapsible ? 400 : 600;
          const mediaMaxHeight = formData.media?.length ? 500 : baseMaxHeight;
          const forcedMaxHeight = Math.min(mediaMaxHeight, formData.metadata?.maxHeight ?? baseMaxHeight);
          
          console.log('Preview Container Dimensions:', {
            width: entry.contentRect.width,
            height: entry.contentRect.height,
            isCollapsible: formData.metadata?.isCollapsible,
            hasMedia: !!formData.media?.length,
            expectedHeight: forcedMaxHeight,
            difference: entry.contentRect.height - forcedMaxHeight
          });
        }
      });
      observer.observe(previewContainer);
      return () => observer.disconnect();
    }
  }, [formData.metadata?.isCollapsible, formData.media]);

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
      width: '50%',
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
      width: '20%',
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
    optionContainer: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
    },
    optionInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: colorScheme.colors.border,
      borderRadius: 6,
      padding: 12,
      fontSize: 16,
      backgroundColor: colorScheme.colors.background,
      color: colorScheme.colors.text,
    },
    questionActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
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
          onPress={() => handleQuickAction('superfeed')}
          style={styles.quickActionButton}
        >
          <Text>Create SuperfeedItem</Text>
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
                          url: 'https://placehold.co/1280x720/45B7D1/ffffff/png?text=Sample+Video',
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
                        onPress={() => {
                          setSelectedInteractiveType(type);
                          handleFormDataChangeWithPreview({
                            type: type,
                            interactive_content: {
                              ...formData.interactive_content,
                              [type]: formData.interactive_content?.[type] || {
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
                              }[type]
                            }
                          });
                        }}
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