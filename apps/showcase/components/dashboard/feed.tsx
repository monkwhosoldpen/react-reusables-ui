import React from 'react';
import { View, ScrollView, TextInput, Switch, Pressable, RefreshControl, StyleSheet } from 'react-native';
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
import { useChannels } from '~/lib/hooks/useChannels';
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
import { ChannelMessage } from '~/lib/types/channel.types';

interface FeedScreenProps {
  username: string;
  messages: ChannelMessage[];
}

export default function FeedScreen({ username, messages }: FeedScreenProps) {
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
  const { channels, isLoading: channelsLoading, error } = useChannels(username);
  const mainChannel = channels[0];

  const {
    formData,
    handleFormDataChange,
    isSubmitting  } = useFeedForm({
    user: { email: username }
  });

  // Log incoming messages
  React.useEffect(() => {
    console.log('FeedScreen - Received messages:', messages);
  }, [messages]);

  // Use the passed messages to initialize feed items
  React.useEffect(() => {
    console.log('FeedScreen - Processing messages to feed items');
    if (messages && messages.length > 0) {
      const formattedMessages: FormDataType[] = messages.map(message => ({
        id: message.id,
        type: 'tweet' as const,
        content: message.message_text,
        username: message.username,
        created_at: message.created_at,
        metadata: {
          ...DEFAULT_METADATA,
          timestamp: message.created_at
        },
        media: []
      }));
      console.log('FeedScreen - Formatted feed items:', formattedMessages);
      setFeedItems(formattedMessages);
      setIsLoading(false);
    } else {
      console.log('FeedScreen - No messages to process');
      setFeedItems([]);
      setIsLoading(false);
    }
  }, [messages]);

  // Log feed items state changes
  React.useEffect(() => {
    console.log('FeedScreen - Current feed items:', feedItems);
  }, [feedItems]);

  // Set up realtime subscription
  React.useEffect(() => {
    const cleanup = setupRealtimeSubscription(
      username,
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
      const items = await refreshFeed(username);
      setFeedItems(items);
    } catch (error) {
      console.error('Error refreshing feed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitHandler = async () => {
    try {
      const success = await handleSubmit(formData, username);
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

  const createMultipleMessages = async () => {
    try {
      setIsLoading(true);
      
      // Create 2 polls with realistic questions and options
      const pollQuestions = [
        {
          question: "What's your favorite programming language?",
          options: [
            "JavaScript/TypeScript",
            "Python",
            "Java",
            "C#",
            "Go",
            "Rust",
            "Swift"
          ]
        },
        {
          question: "Which frontend framework do you prefer?",
          options: [
            "React",
            "Vue",
            "Angular",
            "Svelte",
            "Next.js",
            "Remix",
            "SolidJS"
          ]
        }
      ];

      for (const poll of pollQuestions) {
        const pollData: FormDataType = {
          type: 'poll',
          content: poll.question,
          interactive_content: {
            poll: {
              question: poll.question,
              options: poll.options
            }
          },
          metadata: {
            ...DEFAULT_METADATA,
            timestamp: new Date().toISOString(),
            requireAuth: false,
            allowResubmit: true
          },
          media: [],
          stats: {
            views: 0,
            likes: 0,
            shares: 0,
            responses: 0
          }
        };
        await handleSubmit(pollData, username);
      }

      // Create 2 quizzes with realistic questions and answers
      const quizQuestions = [
        {
          title: "JavaScript Fundamentals Quiz",
          questions: [
            {
              text: "What is the output of 'typeof null' in JavaScript?",
              options: [
                "object",
                "null",
                "undefined",
                "string",
                "number",
                "boolean"
              ],
              correct_option: 0
            },
            {
              text: "Which of these is NOT a JavaScript framework?",
              options: [
                "Django",
                "React",
                "Vue",
                "Angular",
                "Svelte",
                "Next.js"
              ],
              correct_option: 0
            }
          ]
        },
        {
          title: "React Knowledge Check",
          questions: [
            {
              text: "What is the correct way to update state in React?",
              options: [
                "Using setState()",
                "Directly modifying state",
                "Using useState() hook",
                "Using useReducer() hook",
                "Using Context API",
                "Using Redux"
              ],
              correct_option: 2
            },
            {
              text: "Which hook is used for side effects?",
              options: [
                "useEffect",
                "useState",
                "useContext",
                "useReducer",
                "useCallback",
                "useMemo"
              ],
              correct_option: 0
            }
          ]
        }
      ];

      for (const quiz of quizQuestions) {
        const quizData: FormDataType = {
          type: 'quiz',
          content: quiz.title,
          interactive_content: {
            quiz: {
              title: quiz.title,
              questions: quiz.questions
            }
          },
          metadata: {
            ...DEFAULT_METADATA,
            timestamp: new Date().toISOString(),
            requireAuth: false,
            allowResubmit: true
          },
          media: [],
          stats: {
            views: 0,
            likes: 0,
            shares: 0,
            responses: 0
          }
        };
        await handleSubmit(quizData, username);
      }

      // Create 2 surveys with realistic questions and options
      const surveyQuestions = [
        {
          title: "Developer Experience Survey",
          description: "Help us understand your development preferences and challenges",
          questions: [
            {
              text: "How many years of experience do you have in software development?",
              options: [
                "Less than 1 year",
                "1-3 years",
                "3-5 years",
                "5-10 years",
                "10+ years"
              ]
            },
            {
              text: "What's your preferred development environment?",
              options: [
                "VS Code",
                "WebStorm",
                "Sublime Text",
                "Vim/Neovim",
                "Emacs",
                "Other"
              ]
            }
          ]
        },
        {
          title: "Project Management Preferences",
          description: "Share your thoughts on project management tools and methodologies",
          questions: [
            {
              text: "Which project management methodology do you prefer?",
              options: [
                "Agile/Scrum",
                "Kanban",
                "Waterfall",
                "Lean",
                "Hybrid",
                "Other"
              ]
            },
            {
              text: "What's your preferred project management tool?",
              options: [
                "Jira",
                "Trello",
                "Asana",
                "Monday.com",
                "ClickUp",
                "Other"
              ]
            }
          ]
        }
      ];

      for (const survey of surveyQuestions) {
        const surveyData: FormDataType = {
          type: 'survey',
          content: survey.title,
          interactive_content: {
            survey: {
              title: survey.title,
              description: survey.description,
              questions: survey.questions
            }
          },
          metadata: {
            ...DEFAULT_METADATA,
            timestamp: new Date().toISOString(),
            requireAuth: false,
            allowResubmit: true
          },
          media: [],
          stats: {
            views: 0,
            likes: 0,
            shares: 0,
            responses: 0
          }
        };
        await handleSubmit(surveyData, username);
      }

      // Create 2 media posts with realistic content
      const mediaPosts = [
        {
          content: "Check out this amazing code snippet!",
          media: [
            {
              type: 'image' as const,
              url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
              caption: 'Beautiful code editor setup',
              dimensions: {
                width: 1000,
                height: 667
              }
            }
          ]
        },
        {
          content: "Team collaboration in action!",
          media: [
            {
              type: 'image' as const,
              url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
              caption: 'Team working together',
              dimensions: {
                width: 1000,
                height: 667
              }
            }
          ]
        }
      ];

      for (const post of mediaPosts) {
        const mediaData: FormDataType = {
          type: 'message',
          content: post.content,
          media: post.media,
          metadata: {
            ...DEFAULT_METADATA,
            timestamp: new Date().toISOString(),
            requireAuth: false,
            allowResubmit: true
          },
          stats: {
            views: 0,
            likes: 0,
            shares: 0,
            responses: 0
          }
        };
        await handleSubmit(mediaData, username);
      }

      // Create 2 video posts
      const videoPosts = [
        {
          content: "Watch this amazing coding tutorial!",
          media: [
            {
              type: 'video' as const,
              url: 'https://example.com/video1.mp4',
              thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
              caption: 'Learn React in 10 minutes',
              duration: 600,
              dimensions: {
                width: 1280,
                height: 720
              }
            }
          ]
        },
        {
          content: "Check out this live coding session!",
          media: [
            {
              type: 'video' as const,
              url: 'https://example.com/video2.mp4',
              thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
              caption: 'Building a full-stack app',
              duration: 1800,
              dimensions: {
                width: 1280,
                height: 720
              }
            }
          ]
        }
      ];

      for (const post of videoPosts) {
        const videoData: FormDataType = {
          type: 'message',
          content: post.content,
          media: post.media,
          metadata: {
            ...DEFAULT_METADATA,
            timestamp: new Date().toISOString(),
            requireAuth: false,
            allowResubmit: true
          },
          stats: {
            views: 0,
            likes: 0,
            shares: 0,
            responses: 0
          }
        };
        await handleSubmit(videoData, username);
      }

      // Create 2 mixed media posts (image + video)
      const mixedMediaPosts = [
        {
          content: "Check out our latest project updates!",
          media: [
            {
              type: 'image' as const,
              url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
              caption: 'Project screenshot',
              dimensions: {
                width: 1000,
                height: 667
              }
            },
            {
              type: 'video' as const,
              url: 'https://example.com/video3.mp4',
              thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
              caption: 'Project demo',
              duration: 300,
              dimensions: {
                width: 1280,
                height: 720
              }
            }
          ]
        },
        {
          content: "Behind the scenes of our development process",
          media: [
            {
              type: 'video' as const,
              url: 'https://example.com/video4.mp4',
              thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
              caption: 'Development process',
              duration: 450,
              dimensions: {
                width: 1280,
                height: 720
              }
            },
            {
              type: 'image' as const,
              url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
              caption: 'Team meeting',
              dimensions: {
                width: 1000,
                height: 667
              }
            }
          ]
        }
      ];

      for (const post of mixedMediaPosts) {
        const mixedMediaData: FormDataType = {
          type: 'message',
          content: post.content,
          media: post.media,
          metadata: {
            ...DEFAULT_METADATA,
            timestamp: new Date().toISOString(),
            requireAuth: false,
            allowResubmit: true
          },
          stats: {
            views: 0,
            likes: 0,
            shares: 0,
            responses: 0
          }
        };
        await handleSubmit(mixedMediaData, username);
      }

      // Create 2 Instagram posts
      const instagramPosts = [
        {
          content: "Check out our latest project! 🚀 #coding #webdev",
          media: [
            {
              type: 'image' as const,
              url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
              caption: 'Beautiful code editor setup',
              dimensions: {
                width: 1000,
                height: 667
              }
            }
          ]
        },
        {
          content: "Team collaboration in action! 👨‍💻👩‍💻 #teamwork #development",
          media: [
            {
              type: 'image' as const,
              url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
              caption: 'Team working together',
              dimensions: {
                width: 1000,
                height: 667
              }
            }
          ]
        }
      ];

      for (const post of instagramPosts) {
        const instagramData: FormDataType = {
          type: 'message',
          content: post.content,
          media: post.media,
          metadata: {
            ...DEFAULT_METADATA,
            timestamp: new Date().toISOString(),
            requireAuth: false,
            allowResubmit: true
          },
          stats: {
            views: 0,
            likes: 0,
            shares: 0,
            responses: 0
          }
        };
        await handleSubmit(instagramData, username);
      }

      // Create 2 LinkedIn posts
      const linkedinPosts = [
        {
          content: "Excited to share our latest project milestone! We've successfully implemented a new feature that improves user experience by 40%. #innovation #tech #development",
          media: [
            {
              type: 'image' as const,
              url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
              caption: 'Project milestone achieved',
              dimensions: {
                width: 1000,
                height: 667
              }
            }
          ]
        },
        {
          content: "Join us for an exciting webinar on modern web development practices! We'll be discussing the latest trends and best practices. #webinar #development #learning",
          media: [
            {
              type: 'image' as const,
              url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
              caption: 'Webinar announcement',
              dimensions: {
                width: 1000,
                height: 667
              }
            }
          ]
        }
      ];

      for (const post of linkedinPosts) {
        const linkedinData: FormDataType = {
          type: 'message',
          content: post.content,
          media: post.media,
          metadata: {
            ...DEFAULT_METADATA,
            timestamp: new Date().toISOString(),
            requireAuth: false,
            allowResubmit: true
          },
          stats: {
            views: 0,
            likes: 0,
            shares: 0,
            responses: 0
          }
        };
        await handleSubmit(linkedinData, username);
      }

      // Create 2 WhatsApp posts
      const whatsappPosts = [
        {
          content: "Hey team! Just wanted to share this amazing code snippet I found. Check it out! 👇",
          media: [
            {
              type: 'image' as const,
              url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
              caption: 'Useful code snippet',
              dimensions: {
                width: 1000,
                height: 667
              }
            }
          ]
        },
        {
          content: "Quick update: The new feature is ready for testing! Let me know what you think. 🚀",
          media: [
            {
              type: 'image' as const,
              url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
              caption: 'Feature preview',
              dimensions: {
                width: 1000,
                height: 667
              }
            }
          ]
        }
      ];

      for (const post of whatsappPosts) {
        const whatsappData: FormDataType = {
          type: 'message',
          content: post.content,
          media: post.media,
          metadata: {
            ...DEFAULT_METADATA,
            timestamp: new Date().toISOString(),
            requireAuth: false,
            allowResubmit: true
          },
          stats: {
            views: 0,
            likes: 0,
            shares: 0,
            responses: 0
          }
        };
        await handleSubmit(whatsappData, username);
      }

      // Refresh the feed after creating all messages
      await refreshFeedHandler();
    } catch (error) {
      console.error('Error creating multiple messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (channelsLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
        <Text style={{ color: colorScheme.colors.text }}>Loading feed...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
        <Text style={{ color: colorScheme.colors.notification }}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
      <View style={[styles.toolbar, { backgroundColor: colorScheme.colors.card }]}>
        <Button
          onPress={createMultipleMessages}
          disabled={isLoading}
          style={styles.toolbarButton}
        >
          <Text style={{ color: colorScheme.colors.background }}>
            {isLoading ? 'Creating Messages...' : 'Create All Message Types'}
          </Text>
        </Button>
      </View>
      <ScrollView 
        ref={feedListRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: Number(design.spacing.padding.card) }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshFeedHandler}
            colors={[colorScheme.colors.primary]}
            tintColor={colorScheme.colors.primary}
          />
        }
      >
        {isLoading ? (
          <Text style={{ color: colorScheme.colors.text }}>Loading feed...</Text>
        ) : feedItems.length > 0 ? (
          feedItems.map((item) => {
            console.log('FeedScreen - Rendering feed item:', item);
            return (
              <FeedItem
                key={item.id}
                data={item}
                showHeader={true}
                showFooter={true}
              />
            );
          })
        ) : (
          <Text style={{ color: colorScheme.colors.text }}>No messages yet</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  toolbar: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  toolbarButton: {
    flex: 1,
  },
});
