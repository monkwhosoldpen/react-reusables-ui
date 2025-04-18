import React from 'react';
import { View, ScrollView, TextInput, Switch, Pressable, RefreshControl } from 'react-native';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { useFeedForm } from '~/lib/hooks/useFeedForm';
import { FeedItem } from '~/lib/enhanced-chat/components/feed/FeedItem';
import {
  FormDataType,
  PollData,
  QuizData,
  MediaItem,
  MediaType,
  SurveyData} from '~/lib/enhanced-chat/types/superfeed';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mockTenant } from '../../components/dashboard/mocktenant';
import {
  setupRealtimeSubscription,
  DEFAULT_METADATA,
  handlePollUpdate as updatePoll,
  handleQuizUpdate as updateQuiz,
  handleSurveyUpdate as updateSurvey,
  handleMediaChange as updateMedia,
  handleAddMedia as addMedia,
  handleRemoveMedia as removeMedia,
  generateRealisticContent,
  createRichMock,
  handleEditItem,
  refreshFeed,
  handleSubmit,
  determineInteractiveType
} from '~/lib/utils/feedData';
import { PreviewDialog } from '~/lib/enhanced-chat/components/feed/PreviewDialog';

// Initialize Supabase client with tenant's credentials

export default function FeedScreen({ username = "janedoe" }: { username?: string }) {
  const [isInteractive, setIsInteractive] = React.useState(false);
  const [includeMedia, setIncludeMedia] = React.useState(false);
  const [selectedInteractiveType, setSelectedInteractiveType] = React.useState<'survey' | 'quiz' | 'poll'>('poll');
  const [includeContent, setIncludeContent] = React.useState(true);
  const [contentType, setContentType] = React.useState<'small' | 'long'>('small');
  const leftScrollRef = React.useRef<ScrollView>(null);
  const feedListRef = React.useRef<ScrollView>(null);
  const [feedItems, setFeedItems] = React.useState<FormDataType[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();
  const insets = useSafeAreaInsets();

  const {
    formData,
    handleFormDataChange,
    isSubmitting  } = useFeedForm({
    user: { email: username }
  });

  // Fetch initial feed items
  React.useEffect(() => {
    refreshFeedHandler();
  }, [username]);

  // Set up realtime subscription
  React.useEffect(() => {
    const cleanup = setupRealtimeSubscription(
      (newItem) => setFeedItems(prev => [newItem, ...prev]),
      (updatedItem) => setFeedItems(prev => 
        prev.map(item => item.id === updatedItem.id ? updatedItem : item)
      ),
      (deletedId) => setFeedItems(prev => prev.filter(item => item.id !== deletedId))
    );

    return cleanup;
  }, [username]);

  const refreshFeedHandler = async () => {
    try {
      setIsLoading(true);
      const items = await refreshFeed();
      setFeedItems(items);
    } catch (error) {
      console.error('Error refreshing feed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitHandler = async () => {
    try {
      const success = await handleSubmit(formData);
      if (success) {
        // Refresh feed after successful submission
        refreshFeedHandler();
      }
    } catch (error) {
      console.error('Error submitting feed item:', error);
    }
  };

  const handlePollUpdate = (updates: Partial<PollData>) => {
    const changes = updatePoll(formData, updates);
    handleFormDataChange(changes);
  };

  const handleQuizUpdate = (updates: Partial<QuizData>) => {
    const changes = updateQuiz(formData, updates);
    handleFormDataChange(changes);
  };

  const handleSurveyUpdate = (updates: Partial<SurveyData>) => {
    const changes = updateSurvey(formData, updates);
    handleFormDataChange(changes);
  };

  const handleMediaChange = (index: number, updates: Partial<MediaItem>) => {
    const changes = updateMedia(formData, index, updates);
    handleFormDataChange(changes);
  };

  const handleAddMedia = (type: MediaType) => {
    const changes = addMedia(formData, type);
    handleFormDataChange(changes);
  };

  const handleRemoveMedia = (index: number) => {
    const changes = removeMedia(formData, index);
    handleFormDataChange(changes);
  };

  const renderInteractiveContent = () => {
    if (!isInteractive) return null;

    switch (selectedInteractiveType) {
      case 'poll':
        return (
          <View style={{
            marginBottom: Number(design.spacing.margin.card),
            padding: Number(design.spacing.padding.card),
            backgroundColor: colorScheme.colors.card,
            borderRadius: Number(design.radius.lg),
          }}>
            <Text style={{
              fontSize: Number(design.spacing.fontSize.lg),
              fontWeight: '700',
              marginBottom: Number(design.spacing.margin.item),
              color: colorScheme.colors.text,
            }}>Poll</Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: colorScheme.colors.border,
                borderRadius: Number(design.radius.md),
                padding: Number(design.spacing.padding.item),
                marginBottom: Number(design.spacing.margin.item),
                color: colorScheme.colors.text,
                backgroundColor: colorScheme.colors.background,
              }}
              value={formData.interactive_content?.poll?.question}
              onChangeText={(text) => handlePollUpdate({ question: text })}
              placeholder="Poll Question"
            />
            {formData.interactive_content?.poll?.options.map((option, index) => (
              <TextInput
                key={index}
                style={{
                  borderWidth: 1,
                  borderColor: colorScheme.colors.border,
                  borderRadius: Number(design.radius.md),
                  padding: Number(design.spacing.padding.item),
                  marginBottom: Number(design.spacing.margin.item),
                  color: colorScheme.colors.text,
                  backgroundColor: colorScheme.colors.background,
                }}
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
          <View style={{
            marginBottom: Number(design.spacing.margin.card),
            padding: Number(design.spacing.padding.card),
            backgroundColor: colorScheme.colors.card,
            borderRadius: Number(design.radius.lg),
          }}>
            <Text style={{
              fontSize: Number(design.spacing.fontSize.lg),
              fontWeight: '700',
              marginBottom: Number(design.spacing.margin.item),
              color: colorScheme.colors.text,
            }}>Quiz</Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: colorScheme.colors.border,
                borderRadius: Number(design.radius.md),
                padding: Number(design.spacing.padding.item),
                marginBottom: Number(design.spacing.margin.item),
                color: colorScheme.colors.text,
                backgroundColor: colorScheme.colors.background,
              }}
              value={formData.interactive_content?.quiz?.title}
              onChangeText={(text) => handleQuizUpdate({ title: text })}
              placeholder="Quiz Title"
            />
            <Text style={{
              fontSize: Number(design.spacing.fontSize.base),
              fontWeight: '600',
              marginBottom: Number(design.spacing.margin.item),
              color: colorScheme.colors.text,
            }}>Questions</Text>
            {formData.interactive_content?.quiz?.questions?.map((question, index) => (
              <View key={index} style={{
                marginBottom: Number(design.spacing.margin.item),
                padding: Number(design.spacing.padding.item),
                borderWidth: 1,
                borderColor: colorScheme.colors.border,
                borderRadius: Number(design.radius.md),
              }}>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: colorScheme.colors.border,
                    borderRadius: Number(design.radius.md),
                    padding: Number(design.spacing.padding.item),
                    marginBottom: Number(design.spacing.margin.item),
                    color: colorScheme.colors.text,
                    backgroundColor: colorScheme.colors.background,
                  }}
                  value={question.text}
                  onChangeText={(text) => {
                    const newQuestions = [...(formData.interactive_content?.quiz?.questions || [])];
                    newQuestions[index] = { ...question, text };
                    handleQuizUpdate({ questions: newQuestions });
                  }}
                  placeholder={`Question ${index + 1}`}
                />
                <Text style={{
                  fontSize: Number(design.spacing.fontSize.sm),
                  marginBottom: Number(design.spacing.margin.item),
                  color: colorScheme.colors.text,
                }}>Options</Text>
                {question.options.map((option, optionIndex) => (
                  <View key={optionIndex} style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: Number(design.spacing.margin.item),
                  }}>
                    <TextInput
                      style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: colorScheme.colors.border,
                        borderRadius: Number(design.radius.md),
                        padding: Number(design.spacing.padding.item),
                        marginRight: Number(design.spacing.margin.item),
                        color: colorScheme.colors.text,
                        backgroundColor: colorScheme.colors.background,
                      }}
                      value={option}
                      onChangeText={(text) => {
                        const newQuestions = [...(formData.interactive_content?.quiz?.questions || [])];
                        const newOptions = [...question.options];
                        newOptions[optionIndex] = text;
                        newQuestions[index] = { ...question, options: newOptions };
                        handleQuizUpdate({ questions: newQuestions });
                      }}
                      placeholder={`Option ${optionIndex + 1}`}
                    />
                    <Pressable
                      onPress={() => {
                        const newQuestions = [...(formData.interactive_content?.quiz?.questions || [])];
                        newQuestions[index] = { ...question, correct_option: optionIndex };
                        handleQuizUpdate({ questions: newQuestions });
                      }}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: Number(design.radius.full) / 2,
                        borderWidth: 2,
                        borderColor: colorScheme.colors.primary,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: question.correct_option === optionIndex ? colorScheme.colors.primary : 'transparent',
                      }}
                    />
                  </View>
                ))}
                <Button
                  onPress={() => {
                    const newQuestions = [...(formData.interactive_content?.quiz?.questions || [])];
                    const newOptions = [...question.options, ''];
                    newQuestions[index] = { ...question, options: newOptions };
                    handleQuizUpdate({ questions: newQuestions });
                  }}
                  variant="default"
                  size="default"
                >
                  <Text style={{ color: colorScheme.colors.background }}>Add Option</Text>
                </Button>
              </View>
            ))}
            <Button
              onPress={() => {
                const newQuestions = [...(formData.interactive_content?.quiz?.questions || [])];
                newQuestions.push({ text: '', options: ['', ''], correct_option: 0 });
                handleQuizUpdate({ questions: newQuestions });
              }}
              variant="default"
              size="default"
            >
              <Text style={{ color: colorScheme.colors.background }}>Add Question</Text>
            </Button>
          </View>
        );
      case 'survey':
        return (
          <View style={{
            marginBottom: Number(design.spacing.margin.card),
            padding: Number(design.spacing.padding.card),
            backgroundColor: colorScheme.colors.card,
            borderRadius: Number(design.radius.lg),
          }}>
            <Text style={{
              fontSize: Number(design.spacing.fontSize.lg),
              fontWeight: '700',
              marginBottom: Number(design.spacing.margin.item),
              color: colorScheme.colors.text,
            }}>Survey</Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: colorScheme.colors.border,
                borderRadius: Number(design.radius.md),
                padding: Number(design.spacing.padding.item),
                marginBottom: Number(design.spacing.margin.item),
                color: colorScheme.colors.text,
                backgroundColor: colorScheme.colors.background,
              }}
              value={formData.interactive_content?.survey?.title}
              onChangeText={(text) => handleSurveyUpdate({ title: text })}
              placeholder="Survey Title"
            />
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: colorScheme.colors.border,
                borderRadius: Number(design.radius.md),
                padding: Number(design.spacing.padding.item),
                marginBottom: Number(design.spacing.margin.item),
                color: colorScheme.colors.text,
                backgroundColor: colorScheme.colors.background,
                minHeight: 100,
              }}
              value={formData.interactive_content?.survey?.description}
              onChangeText={(text) => handleSurveyUpdate({ description: text })}
              placeholder="Survey Description"
              multiline
              numberOfLines={4}
            />
            <Text style={{
              fontSize: Number(design.spacing.fontSize.base),
              fontWeight: '600',
              marginBottom: Number(design.spacing.margin.item),
              color: colorScheme.colors.text,
            }}>Questions</Text>
            {formData.interactive_content?.survey?.questions?.map((question, index) => (
              <View key={index} style={{
                marginBottom: Number(design.spacing.margin.item),
                padding: Number(design.spacing.padding.item),
                borderWidth: 1,
                borderColor: colorScheme.colors.border,
                borderRadius: Number(design.radius.md),
              }}>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: colorScheme.colors.border,
                    borderRadius: Number(design.radius.md),
                    padding: Number(design.spacing.padding.item),
                    marginBottom: Number(design.spacing.margin.item),
                    color: colorScheme.colors.text,
                    backgroundColor: colorScheme.colors.background,
                  }}
                  value={question.text}
                  onChangeText={(text) => {
                    const newQuestions = [...(formData.interactive_content?.survey?.questions || [])];
                    newQuestions[index] = { ...question, text };
                    handleSurveyUpdate({ questions: newQuestions });
                  }}
                  placeholder={`Question ${index + 1}`}
                />
                <Text style={{
                  fontSize: Number(design.spacing.fontSize.sm),
                  marginBottom: Number(design.spacing.margin.item),
                  color: colorScheme.colors.text,
                }}>Options</Text>
                {question.options.map((option, optionIndex) => (
                  <TextInput
                    key={optionIndex}
                    style={{
                      borderWidth: 1,
                      borderColor: colorScheme.colors.border,
                      borderRadius: Number(design.radius.md),
                      padding: Number(design.spacing.padding.item),
                      marginBottom: Number(design.spacing.margin.item),
                      color: colorScheme.colors.text,
                      backgroundColor: colorScheme.colors.background,
                    }}
                    value={option}
                    onChangeText={(text) => {
                      const newQuestions = [...(formData.interactive_content?.survey?.questions || [])];
                      const newOptions = [...question.options];
                      newOptions[optionIndex] = text;
                      newQuestions[index] = { ...question, options: newOptions };
                      handleSurveyUpdate({ questions: newQuestions });
                    }}
                    placeholder={`Option ${optionIndex + 1}`}
                  />
                ))}
                <Button
                  onPress={() => {
                    const newQuestions = [...(formData.interactive_content?.survey?.questions || [])];
                    const newOptions = [...question.options, ''];
                    newQuestions[index] = { ...question, options: newOptions };
                    handleSurveyUpdate({ questions: newQuestions });
                  }}
                  variant="default"
                  size="default"
                >
                  <Text style={{ color: colorScheme.colors.background }}>Add Option</Text>
                </Button>
              </View>
            ))}
            <Button
              onPress={() => {
                const newQuestions = [...(formData.interactive_content?.survey?.questions || [])];
                newQuestions.push({ text: '', options: ['', ''] });
                handleSurveyUpdate({ questions: newQuestions });
              }}
              variant="default"
              size="default"
            >
              <Text style={{ color: colorScheme.colors.background }}>Add Question</Text>
            </Button>
          </View>
        );
    }
  };

  const renderMediaSection = () => {
    if (!includeMedia) return null;

    return (
      <View style={{
        marginBottom: Number(design.spacing.margin.card),
        padding: Number(design.spacing.padding.card),
        backgroundColor: colorScheme.colors.card,
        borderRadius: Number(design.radius.lg),
      }}>
        <Text style={{
          fontSize: Number(design.spacing.fontSize.lg),
          fontWeight: '700',
          marginBottom: Number(design.spacing.margin.item),
          color: colorScheme.colors.text,
        }}>Media</Text>
        <View style={{
          flexDirection: 'row',
          gap: Number(design.spacing.padding.item),
          marginBottom: Number(design.spacing.margin.card),
        }}>
          <Button
            onPress={() => handleAddMedia('image')}
            variant="default"
            size="default"
          >
            <Text style={{ color: colorScheme.colors.background }}>Add Image</Text>
          </Button>
          <Button
            onPress={() => handleAddMedia('video')}
            variant="default"
            size="default"
          >
            <Text style={{ color: colorScheme.colors.background }}>Add Video</Text>
          </Button>
        </View>

        {/* Media Layout Selection */}
        <View style={{ marginBottom: Number(design.spacing.margin.card) }}>
          <Text style={{
            fontSize: Number(design.spacing.fontSize.lg),
            fontWeight: '700',
            marginBottom: Number(design.spacing.margin.item),
            color: colorScheme.colors.text,
          }}>Layout Style</Text>
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: Number(design.spacing.padding.item),
          }}>
            {(['grid', 'carousel', 'list', 'collage', 'masonry', 'fullwidth'] as const).map((layout) => (
              <Pressable
                key={layout}
                style={{
                  flex: 1,
                  minWidth: 100,
                  padding: Number(design.spacing.padding.item),
                  borderRadius: Number(design.radius.md),
                  borderWidth: 2,
                  borderColor: formData.metadata?.mediaLayout === layout ? colorScheme.colors.primary : colorScheme.colors.border,
                  backgroundColor: formData.metadata?.mediaLayout === layout ? colorScheme.colors.primary : 'transparent',
                }}
                onPress={() => handleFormDataChange({
                  metadata: {
                    ...DEFAULT_METADATA,
                    ...formData.metadata,
                    mediaLayout: layout
                  }
                })}
              >
                <Text style={{
                  textAlign: 'center',
                  color: formData.metadata?.mediaLayout === layout ? colorScheme.colors.background : colorScheme.colors.text,
                }}>
                  {layout.charAt(0).toUpperCase() + layout.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {formData.media?.map((media, index) => (
          <View key={index} style={{
            marginBottom: Number(design.spacing.margin.card),
            padding: Number(design.spacing.padding.card),
            backgroundColor: colorScheme.colors.card,
            borderRadius: Number(design.radius.lg),
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: Number(design.spacing.margin.item),
            }}>
              <Text style={{ color: colorScheme.colors.text }}>
                {media.type === 'image' ? '🖼️ Image' : '🎥 Video'}
              </Text>
              <Button
                onPress={() => handleRemoveMedia(index)}
                variant="destructive"
                size="default"
              >
                <Text style={{ color: colorScheme.colors.background }}>Remove</Text>
              </Button>
            </View>

            <TextInput
              style={{
                borderWidth: 1,
                borderColor: colorScheme.colors.border,
                borderRadius: Number(design.radius.md),
                padding: Number(design.spacing.padding.item),
                marginBottom: Number(design.spacing.margin.item),
                color: colorScheme.colors.text,
                backgroundColor: colorScheme.colors.background,
              }}
              value={media.url}
              onChangeText={(text) => handleMediaChange(index, { url: text })}
              placeholder="Media URL"
            />

            <TextInput
              style={{
                borderWidth: 1,
                borderColor: colorScheme.colors.border,
                borderRadius: Number(design.radius.md),
                padding: Number(design.spacing.padding.item),
                marginBottom: Number(design.spacing.margin.item),
                color: colorScheme.colors.text,
                backgroundColor: colorScheme.colors.background,
              }}
              value={media.caption}
              onChangeText={(text) => handleMediaChange(index, { caption: text })}
              placeholder="Caption"
            />

            {media.type === 'video' && (
              <>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: colorScheme.colors.border,
                    borderRadius: Number(design.radius.md),
                    padding: Number(design.spacing.padding.item),
                    marginBottom: Number(design.spacing.margin.item),
                    color: colorScheme.colors.text,
                    backgroundColor: colorScheme.colors.background,
                  }}
                  value={media.thumbnail}
                  onChangeText={(text) => handleMediaChange(index, { thumbnail: text })}
                  placeholder="Thumbnail URL"
                />
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: colorScheme.colors.border,
                    borderRadius: Number(design.radius.md),
                    padding: Number(design.spacing.padding.item),
                    marginBottom: Number(design.spacing.margin.item),
                    color: colorScheme.colors.text,
                    backgroundColor: colorScheme.colors.background,
                  }}
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

  const generateRealisticContentHandler = () => {
    // Reset form to clean state
    setIncludeContent(true);
    setIncludeMedia(true);
    setIsInteractive(true);
    setSelectedInteractiveType('poll');
    setContentType(Math.random() > 0.5 ? 'long' : 'small');

    // Generate random content using the utility function
    const newContent = generateRealisticContent(contentType);
    handleFormDataChange(newContent);

    // Scroll form to top
    if (leftScrollRef.current) {
      leftScrollRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const createRichMockHandler = async () => {
    try {
      // Reset form to clean state
      setIncludeContent(true);
      setIncludeMedia(true);
      setIsInteractive(true);
      setSelectedInteractiveType('poll');
      setContentType('long');

      // Generate rich content with Tesla/Elon Musk theme
      const newContent: Partial<FormDataType> = {
        type: 'poll',
        content: "🚀 Exciting news! Tesla's latest software update brings Full Self-Driving (FSD) to more vehicles. What feature are you most excited about?",
        media: [
          {
            type: 'image' as MediaType,
            url: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
            caption: 'Tesla Model 3 with FSD'
          }
        ],
        interactive_content: {
          poll: {
            question: "Which FSD feature are you most excited about?",
            options: [
              "Automatic lane changes",
              "Traffic light and stop sign control",
              "Navigate on Autopilot",
              "Smart Summon"
            ]
          }
        },
        metadata: {
          ...DEFAULT_METADATA,
          requireAuth: true,
          allowResubmit: false,
          timestamp: new Date().toISOString()
        },
        channel_username: username
      };

      handleFormDataChange(newContent);

      // Submit to database
      await handleSubmitHandler();
    } catch (error) {
      console.error('Error creating rich mock:', error);
    }
  };

  const handleEditItemHandler = (item: FormDataType) => {
    const newContent = handleEditItem(item);
    handleFormDataChange(newContent);

    // Set appropriate form states based on item
    setIsInteractive(!!item.interactive_content);
    setIncludeMedia(item.media?.length > 0);
    setSelectedInteractiveType(determineInteractiveType(item.interactive_content));
  };

  return (
    <View style={{ flex: 1, backgroundColor: colorScheme.colors.background }}>
      {/* Toolbar */}
      <View style={{
        flexDirection: 'row',
        padding: Number(design.spacing.padding.card),
        borderBottomWidth: 1,
        borderBottomColor: colorScheme.colors.border,
        backgroundColor: colorScheme.colors.card,
        gap: Number(design.spacing.padding.item),
      }}>
        <Button
          onPress={generateRealisticContentHandler}
        >
          <Text style={{ color: colorScheme.colors.background }}>Create New</Text>
        </Button>
        <Button
          onPress={createRichMockHandler}
        >
          <Text style={{ color: colorScheme.colors.background }}>Create Rich</Text>
        </Button>
        <PreviewDialog 
          data={formData}
          triggerText="Preview"
        />
      </View>

      {/* New Content Type Buttons */}
      <View style={{
        flexDirection: 'row',
        padding: Number(design.spacing.padding.card),
        borderBottomWidth: 1,
        borderBottomColor: colorScheme.colors.border,
        backgroundColor: colorScheme.colors.card,
        gap: Number(design.spacing.padding.item),
        flexWrap: 'wrap',
      }}>
        <Button
          onPress={() => {
            setIncludeContent(true);
            setIncludeMedia(false);
            setIsInteractive(false);
            setContentType('small');
            handleFormDataChange({
              content: 'Short text content example',
              media: [],
              interactive_content: undefined
            });
          }}
          variant="outline"
          size="default"
        >
          <Text style={{ color: colorScheme.colors.text }}>Short Text</Text>
        </Button>
        <Button
          onPress={() => {
            setIncludeContent(true);
            setIncludeMedia(false);
            setIsInteractive(false);
            setContentType('long');
            handleFormDataChange({
              content: 'This is an example of a long-form text content that would be suitable for blog posts, articles, or detailed updates. It can contain multiple paragraphs and extensive information.',
              media: [],
              interactive_content: undefined
            });
          }}
          variant="outline"
          size="default"
        >
          <Text style={{ color: colorScheme.colors.text }}>Long Text</Text>
        </Button>
        <Button
          onPress={() => {
            setIncludeContent(true);
            setIncludeMedia(true);
            setIsInteractive(false);
            handleFormDataChange({
              content: 'Media content showcase',
              media: [{
                type: 'image',
                url: 'https://picsum.photos/1200/675',
                caption: 'Sample media content'
              }]
            });
          }}
          variant="outline"
          size="default"
        >
          <Text style={{ color: colorScheme.colors.text }}>Media</Text>
        </Button>
        <Button
          onPress={() => {
            setIncludeContent(true);
            setIncludeMedia(false);
            setIsInteractive(true);
            setSelectedInteractiveType('poll');
            handleFormDataChange({
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
              }
            });
          }}
          variant="outline"
          size="default"
        >
          <Text style={{ color: colorScheme.colors.text }}>Polls</Text>
        </Button>
        <Button
          onPress={() => {
            setIncludeContent(true);
            setIncludeMedia(false);
            setIsInteractive(true);
            setSelectedInteractiveType('survey');
            handleFormDataChange({
              content: 'Help us improve our platform by sharing your feedback on these key aspects of your experience.',
              interactive_content: {
                survey: {
                  title: 'Platform Experience Survey',
                  questions: [{
                    text: 'How satisfied are you with the platform\'s performance and reliability?',
                    options: [
                      'Extremely satisfied - Everything works perfectly',
                      'Very satisfied - Minor issues but overall great',
                      'Somewhat satisfied - Some areas need improvement',
                      'Not very satisfied - Several issues need addressing',
                      'Not satisfied at all - Major problems need fixing'
                    ]
                  }, {
                    text: 'Which aspect of the platform do you use most frequently?',
                    options: [
                      'Content creation and management',
                      'Analytics and reporting',
                      'Team collaboration features',
                      'Integration with other tools',
                      'Customization and settings'
                    ]
                  }]
                }
              }
            });
          }}
          variant="outline"
          size="default"
        >
          <Text style={{ color: colorScheme.colors.text }}>Surveys</Text>
        </Button>
        <Button
          onPress={() => {
            setIncludeContent(true);
            setIncludeMedia(false);
            setIsInteractive(true);
            setSelectedInteractiveType('quiz');
            const quizData: Partial<FormDataType> = {
              type: 'quiz' as const,
              content: 'Test your knowledge about our platform\'s features and best practices with this comprehensive quiz!',
              interactive_content: {
                quiz: {
                  title: 'Platform Mastery Quiz',
                  questions: [{
                    text: 'Which feature allows you to automate repetitive tasks and create custom workflows?',
                    options: [
                      'Workflow Builder with drag-and-drop interface',
                      'Content Scheduler with calendar view',
                      'Analytics Dashboard with real-time metrics',
                      'Team Collaboration Hub with threaded discussions',
                      'Integration Manager with API connections'
                    ],
                    correct_option: 0
                  }, {
                    text: 'What is the maximum file size supported for media uploads in the platform?',
                    options: [
                      '10MB for basic users, 25MB for premium',
                      '25MB for all users with compression',
                      '50MB with automatic optimization',
                      '100MB for video content only',
                      '250MB for enterprise users'
                    ],
                    correct_option: 2
                  }, {
                    text: 'Which of these integrations provides real-time analytics and user behavior tracking?',
                    options: [
                      'Google Analytics with custom dimensions',
                      'Mixpanel with cohort analysis',
                      'Amplitude with behavioral analytics',
                      'Segment with unified customer data',
                      'All of the above with different strengths'
                    ],
                    correct_option: 4
                  }, {
                    text: 'How can you optimize content for better engagement according to platform guidelines?',
                    options: [
                      'Use short, concise sentences with clear headings',
                      'Include relevant images and media content',
                      'Add interactive elements like polls and quizzes',
                      'Optimize for mobile viewing and loading speed',
                      'All of the above are recommended practices'
                    ],
                    correct_option: 4
                  }, {
                    text: 'What is the recommended approach for team collaboration on content?',
                    options: [
                      'Use the built-in commenting and review system',
                      'Share content via direct links with permissions',
                      'Create collaborative workspaces for projects',
                      'Use the real-time co-editing feature',
                      'All of these methods are supported and recommended'
                    ],
                    correct_option: 4
                  }]
                }
              },
              metadata: {
                ...DEFAULT_METADATA,
                requireAuth: true,
                allowResubmit: false,
                timestamp: new Date().toISOString()
              }
            };
            console.log('Setting quiz data:', quizData);
            handleFormDataChange(quizData);
          }}
          variant="outline"
          size="default"
        >
          <Text style={{ color: colorScheme.colors.text }}>Quizzes</Text>
        </Button>
      </View>

      {/* Main Content Area */}
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {/* Left side - Form (50%) */}
        <View style={{ flex: 1, width: '50%' }}>
          <ScrollView 
            style={{ flex: 1, padding: Number(design.spacing.padding.card) }}
            ref={leftScrollRef}
            contentContainerStyle={{
              paddingBottom: insets.bottom + Number(design.spacing.padding.card),
            }}
          >
            {/* Content Section */}
            <View style={{
              marginBottom: Number(design.spacing.margin.card),
              backgroundColor: colorScheme.colors.card,
              padding: Number(design.spacing.padding.card),
              borderRadius: Number(design.radius.lg),
            }}>
              <Text style={{
                fontSize: Number(design.spacing.fontSize.lg),
                fontWeight: '700',
                marginBottom: Number(design.spacing.margin.card),
                color: colorScheme.colors.text,
              }}>Content</Text>

              {/* Content Toggle */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: Number(design.spacing.margin.card),
              }}>
                <Text style={{ color: colorScheme.colors.text }}>Include Content</Text>
                <Switch
                  value={includeContent}
                  onValueChange={setIncludeContent}
                />
              </View>

              {/* Content Type Selection */}
              {includeContent && (
                <View style={{ marginTop: Number(design.spacing.margin.item) }}>
                  {(['small', 'long'] as const).map((type) => (
                    <Pressable
                      key={type}
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: Number(design.spacing.padding.item),
                      }}
                      onPress={() => setContentType(type)}
                    >
                      <Text style={{ color: colorScheme.colors.text }}>
                        {type.charAt(0).toUpperCase() + type.slice(1)} Content
                      </Text>
                      <View style={{
                        width: 24,
                        height: 24,
                        borderRadius: Number(design.radius.full) / 2,
                        borderWidth: 2,
                        borderColor: colorScheme.colors.primary,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: contentType === type ? colorScheme.colors.primary : 'transparent',
                      }} />
                    </Pressable>
                  ))}
                </View>
              )}

              {/* Content Input */}
              {includeContent && (
                <>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: colorScheme.colors.border,
                      borderRadius: Number(design.radius.md),
                      padding: Number(design.spacing.padding.item),
                      marginBottom: Number(design.spacing.margin.item),
                      color: colorScheme.colors.text,
                      backgroundColor: colorScheme.colors.background,
                      minHeight: contentType === 'long' ? 120 : undefined,
                    }}
                    value={formData.content}
                    onChangeText={(text) => handleFormDataChange({ content: text })}
                    placeholder={`Enter your ${contentType} content`}
                    placeholderTextColor={colorScheme.colors.text + '80'}
                    multiline
                    numberOfLines={contentType === 'long' ? 6 : 3}
                  />

                  {/* Make Content Collapsible */}
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: Number(design.spacing.margin.card),
                  }}>
                    <Text style={{ color: colorScheme.colors.text }}>Make Content Collapsible</Text>
                    <Switch
                      value={formData.metadata?.isCollapsible ?? (contentType === 'long')}
                      onValueChange={(value) => handleFormDataChange({
                        metadata: {
                          ...DEFAULT_METADATA,
                          ...formData.metadata,
                          isCollapsible: value
                        }
                      })}
                    />
                  </View>
                </>
              )}

              {/* Media Toggle */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: Number(design.spacing.margin.card),
              }}>
                <Text style={{ color: colorScheme.colors.text }}>Include Media</Text>
                <Switch
                  value={includeMedia}
                  onValueChange={setIncludeMedia}
                />
              </View>

              {/* Media Section */}
              {renderMediaSection()}

              {/* Interactive Switch */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: Number(design.spacing.margin.card),
              }}>
                <Text style={{ color: colorScheme.colors.text }}>Interactive Content</Text>
                <Switch
                  value={isInteractive}
                  onValueChange={setIsInteractive}
                />
              </View>

              {/* Interactive Settings */}
              {isInteractive && (
                <>
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: Number(design.spacing.margin.item),
                    paddingLeft: Number(design.spacing.padding.card),
                    borderLeftWidth: 2,
                    borderLeftColor: colorScheme.colors.primary,
                  }}>
                    <Text style={{ color: colorScheme.colors.text }}>Require Auth</Text>
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

                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: Number(design.spacing.margin.item),
                    paddingLeft: Number(design.spacing.padding.card),
                    borderLeftWidth: 2,
                    borderLeftColor: colorScheme.colors.primary,
                  }}>
                    <Text style={{ color: colorScheme.colors.text }}>Allow Resubmit</Text>
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
                </>
              )}

              {/* Interactive Type Selection */}
              {isInteractive && (
                <View style={{ marginTop: Number(design.spacing.margin.item) }}>
                  {(['poll', 'quiz', 'survey'] as const).map((type) => (
                    <Pressable
                      key={type}
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: Number(design.spacing.padding.item),
                      }}
                      onPress={() => setSelectedInteractiveType(type)}
                    >
                      <Text style={{ color: colorScheme.colors.text }}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                      <View style={{
                        width: 24,
                        height: 24,
                        borderRadius: Number(design.radius.full) / 2,
                        borderWidth: 2,
                        borderColor: colorScheme.colors.primary,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: selectedInteractiveType === type ? colorScheme.colors.primary : 'transparent',
                      }} />
                    </Pressable>
                  ))}
                </View>
              )}

              {/* Interactive Content Forms */}
              <View style={{ marginTop: Number(design.spacing.margin.card) }}>
                {renderInteractiveContent()}
              </View>
            </View>

            <Button
              onPress={() => handleSubmitHandler()}
              disabled={isSubmitting}
            >
              <Text style={{ color: colorScheme.colors.background }}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Text>
            </Button>
          </ScrollView>
        </View>

        {/* Right side - Feed List (50%) */}
        <View style={{ 
          flex: 1, 
          width: '50%', 
          borderLeftWidth: 1, 
          borderLeftColor: colorScheme.colors.border,
          backgroundColor: colorScheme.colors.card,
        }}>
          <ScrollView
            style={{ height: '100%' }}
            ref={feedListRef}
            refreshControl={
              <RefreshControl 
                refreshing={isLoading} 
                onRefresh={refreshFeedHandler}
                colors={[colorScheme.colors.primary]}
                tintColor={colorScheme.colors.primary}
              />
            }
            contentContainerStyle={{
              paddingBottom: insets.bottom + Number(design.spacing.padding.card),
            }}
          >
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: Number(design.spacing.padding.item),
              borderBottomWidth: 1,
              borderBottomColor: colorScheme.colors.border,
              paddingHorizontal: Number(design.spacing.padding.card),
            }}>
              <Text style={{
                fontSize: Number(design.spacing.fontSize.lg),
                fontWeight: '700',
                color: colorScheme.colors.text,
              }}>Feed Items</Text>
            </View>

            {feedItems.map((item, index) => (
              <View key={item.id || index} style={{
                margin: Number(design.spacing.margin.card),
                borderWidth: 1,
                borderColor: colorScheme.colors.border,
                borderRadius: Number(design.radius.lg),
                overflow: 'hidden',
                backgroundColor: colorScheme.colors.card,
                shadowColor: colorScheme.colors.text,
              }}>
                <FeedItem
                  data={item}
                  showHeader={true}
                  showFooter={true}
                />
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  padding: Number(design.spacing.padding.item),
                  borderTopWidth: 1,
                  borderTopColor: colorScheme.colors.border,
                  backgroundColor: colorScheme.colors.card,
                }}>
                  <Button
                    onPress={() => handleEditItemHandler(item)}
                    variant="outline"
                    size="default"
                    style={{
                      marginRight: Number(design.spacing.margin.item),
                    }}
                  >
                    <Text style={{ color: colorScheme.colors.text }}>Edit</Text>
                  </Button>
                  <Button
                    onPress={() => {
                      const newItems = feedItems.filter(feedItem => feedItem.id !== item.id);
                      setFeedItems(newItems);
                    }}
                    variant="destructive"
                    size="default"
                  >
                    <Text style={{ color: colorScheme.colors.background }}>Delete</Text>
                  </Button>
                </View>
              </View>
            ))}

            {feedItems.length === 0 && !isLoading && (
              <View style={{
                padding: Number(design.spacing.padding.card),
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colorScheme.colors.card,
                borderRadius: Number(design.radius.lg),
                borderWidth: 1,
                borderColor: colorScheme.colors.border,
                margin: Number(design.spacing.margin.card),
              }}>
                <Text style={{
                  fontSize: Number(design.spacing.fontSize.base),
                  color: colorScheme.colors.text,
                  opacity: Number(design.opacity.subtle),
                }}>No feed items found</Text>
              </View>
            )}

            {isLoading && (
              <View style={{
                padding: Number(design.spacing.padding.card),
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colorScheme.colors.card,
                borderRadius: Number(design.radius.lg),
                borderWidth: 1,
                borderColor: colorScheme.colors.border,
                margin: Number(design.spacing.margin.card),
              }}>
                <Text style={{
                  color: colorScheme.colors.text,
                  opacity: Number(design.opacity.medium),
                }}>Loading feed items...</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}
