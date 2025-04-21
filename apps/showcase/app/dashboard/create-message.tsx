import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TextInput, Switch, TouchableOpacity } from 'react-native';
import { Text } from '~/components/ui/text';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';
import { Card } from '~/components/ui/card';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '~/components/ui/button';
import { FormDataType, MediaLayout, FeedItemType, DisplayMode, Visibility } from '~/lib/enhanced-chat/types/superfeed';
import { useFeedForm } from '~/lib/hooks/useFeedForm';
import { FeedItem } from '~/lib/enhanced-chat/components/feed/FeedItem';
import { DEFAULT_METADATA } from '~/lib/utils/feedData';
import { useInteractiveContent } from '~/lib/hooks/useInteractiveContent';
import { useRouter } from 'expo-router';

export default function CreateMessageScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();
  const [selectedType, setSelectedType] = useState<'message' | 'poll' | 'quiz' | 'survey'>('message');
  const [isInteractive, setIsInteractive] = useState(false);
  const [includeMedia, setIncludeMedia] = useState(false);
  const [includeContent, setIncludeContent] = useState(true);
  const [contentType, setContentType] = useState<'small' | 'long'>('small');
  const [mediaLayout, setMediaLayout] = useState<MediaLayout>('grid');
  const [selectedInteractiveType, setSelectedInteractiveType] = useState<'poll' | 'quiz' | 'survey'>('poll');

  const {
    formData,
    handleFormDataChange,
    isSubmitting
  } = useFeedForm({
    user: { email: 'johndoe' }
  });

  const { submitResponse } = useInteractiveContent(formData as FormDataType);

  const handleQuickAction = (type: 'poll' | 'quiz' | 'survey' | 'media' | 'video' | 'small' | 'long') => {
    // Reset form state completely
    handleFormDataChange({});
    setIsInteractive(false);
    setIncludeMedia(false);
    setIncludeContent(true);
    setSelectedType('message');
    setSelectedInteractiveType('poll');

    // Prefill form based on type
    switch (type) {
      case 'small':
        handleFormDataChange({
          type: 'message',
          content: 'This is a short message that gets straight to the point.',
          metadata: {
            ...DEFAULT_METADATA,
            isCollapsible: false
          }
        });
        break;

      case 'long':
        handleFormDataChange({
          type: 'message',
          content: `In today's fast-paced digital world, effective communication is more important than ever. This longer message format allows you to express complex ideas, share detailed information, and engage your audience with rich content. Whether you're discussing important updates, sharing insights, or providing comprehensive explanations, the long text format gives you the space you need to communicate effectively.

Use this format when you need to:
- Explain complex concepts
- Share detailed updates
- Provide comprehensive information
- Engage with thoughtful content

Remember to structure your content with clear paragraphs and formatting to ensure readability.`,
          metadata: {
            ...DEFAULT_METADATA,
            isCollapsible: true
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
            requireAuth: true,
            allowResubmit: false,
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
            requireAuth: true,
            allowResubmit: false,
            isCollapsible: true
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
            requireAuth: true,
            allowResubmit: false,
            isCollapsible: true
          }
        });
        break;

      case 'media':
        setIncludeMedia(true);
        handleFormDataChange({
          type: 'message',
          content: 'Check out these amazing images from our latest product launch!',
          media: [
            {
              type: 'image',
              url: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
              caption: 'Our new product in action'
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
          type: 'message',
          content: 'Watch our latest product demo and tutorial videos to get the most out of our platform!',
          media: [
            {
              type: 'video',
              url: 'https://example.com/product-demo.mp4',
              caption: 'Product Demo: Getting Started',
              thumbnail: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
              duration: 180
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
  };

  const handleMediaLayoutChange = (layout: MediaLayout) => {
    console.log('Media layout changed to:', layout);
    setMediaLayout(layout);
    // Create default media content when layout is selected
    const defaultMedia = Array(5).fill(null).map((_, index) => ({
      type: 'image' as const,
      url: `https://placeholder.co/800x600?text=Image+${index + 1}`,
      caption: `Image ${index + 1}`,
      metadata: {
        width: 800,
        height: 600
      }
    }));

    console.log('Created default media:', defaultMedia);

    // Update form data with new layout and media
    const updatedFormData = {
      ...formData,
      media: defaultMedia,
      metadata: {
        ...formData.metadata,
        mediaLayout: layout
      }
    };

    console.log('Updated form data:', updatedFormData);

    // Force update the form data
    handleFormDataChange(updatedFormData);
  };

  const handleMediaUrlChange = (index: number, url: string) => {
    const newMedia = [...(formData.media || [])];
    newMedia[index] = {
      ...newMedia[index],
      url: url
    };
    const updatedFormData = {
      ...formData,
      media: newMedia
    };
    handleFormDataChange(updatedFormData);
  };

  const handleMediaCaptionChange = (index: number, caption: string) => {
    const newMedia = [...(formData.media || [])];
    newMedia[index] = {
      ...newMedia[index],
      caption: caption
    };
    const updatedFormData = {
      ...formData,
      media: newMedia
    };
    handleFormDataChange(updatedFormData);
  };

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
      await submitResponse(formData);
      router.back();
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  // Update the preview data to properly reflect the form state
  const previewData = useMemo(() => {
    const data: FormDataType = {
      ...formData,
      type: (isInteractive ? selectedInteractiveType : 'message') as FeedItemType,
      metadata: {
        ...formData.metadata,
        mediaLayout: mediaLayout,
        isCollapsible: formData.metadata?.isCollapsible ?? true,
        displayMode: formData.metadata?.displayMode ?? 'default' as DisplayMode,
        maxHeight: formData.metadata?.maxHeight ?? 300,
        visibility: formData.metadata?.visibility ?? 'public' as unknown as Visibility,
        requireAuth: formData.metadata?.requireAuth ?? false,
        allowResubmit: formData.metadata?.allowResubmit ?? false,
        timestamp: formData.metadata?.timestamp ?? new Date().toISOString()
      }
    };

    // Ensure interactive content is properly structured
    if (isInteractive) {
      switch (selectedInteractiveType) {
        case 'poll':
          data.interactive_content = {
            poll: {
              question: formData.interactive_content?.poll?.question || 'Poll Question',
              options: formData.interactive_content?.poll?.options || ['Option 1', 'Option 2']
            }
          };
          break;
        case 'quiz':
          data.interactive_content = {
            quiz: {
              title: formData.interactive_content?.quiz?.title || 'Quiz Title',
              questions: formData.interactive_content?.quiz?.questions || [{
                text: 'Quiz Question',
                options: ['Option 1', 'Option 2'],
                correct_option: 0
              }]
            }
          };
          break;
        case 'survey':
          data.interactive_content = {
            survey: {
              title: formData.interactive_content?.survey?.title || 'Survey Title',
              questions: formData.interactive_content?.survey?.questions || [{
                text: 'Survey Question',
                options: ['Option 1', 'Option 2']
              }]
            }
          };
          break;
      }
    }

    // Ensure content is set
    if (!data.content) {
      data.content = isInteractive 
        ? `This is a ${selectedInteractiveType} content.` 
        : 'Enter your message here.';
    }

    return data;
  }, [formData, mediaLayout, isInteractive, selectedInteractiveType]);

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

  // Force preview update when layout changes
  const [previewKey, setPreviewKey] = useState(0);
  useEffect(() => {
    setPreviewKey(prev => prev + 1);
  }, [mediaLayout, formData.media]);

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
    borderBottomColor: '#ccc',
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
    borderRightColor: '#ccc',
    padding: 16,
  },
  formScroll: {
    flex: 1,
  },
  section: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
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
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fff',
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
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    gap: 12,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
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
    borderLeftColor: '#ccc',
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dialogFooter: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ccc',
  },
  mediaLayoutContainer: {
    marginBottom: 20,
  },
  mediaLayoutTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
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
    backgroundColor: '#fff',
  },
  selectedMediaLayoutButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
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
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  mediaItemLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
    borderColor: '#ccc',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  radioOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  radioText: {
    fontSize: 14,
    fontWeight: '500',
  },
  comingSoonContainer: {
    width: '40%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: '#ccc',
  },
  comingSoonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
    transform: [{ rotate: '-45deg' }],
  },
}); 