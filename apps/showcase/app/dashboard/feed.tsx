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

// Initialize Supabase client with tenant's credentials

export default function FeedScreen() {
  const [isInteractive, setIsInteractive] = React.useState(false);
  const [includeMedia, setIncludeMedia] = React.useState(false);
  const [selectedInteractiveType, setSelectedInteractiveType] = React.useState<'survey' | 'quiz' | 'poll' | 'all'>('all');
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
    user: { email: mockTenant.username }
  });

  // Fetch initial feed items
  React.useEffect(() => {
    refreshFeedHandler();
  }, []);

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
  }, []);

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
          <View className="mb-4 p-4 bg-card rounded-lg">
            <Text className="text-lg font-bold mb-2 text-text">Poll</Text>
            <TextInput
              className="border border-border rounded-md p-2 mb-2 text-text bg-background"
              value={formData.interactive_content?.poll?.question}
              onChangeText={(text) => handlePollUpdate({ question: text })}
              placeholder="Poll Question"
            />
            {formData.interactive_content?.poll?.options.map((option, index) => (
              <TextInput
                key={index}
                className="border border-border rounded-md p-2 mb-2 text-text bg-background"
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
          <View className="mb-4 p-4 bg-card rounded-lg">
            <Text className="text-lg font-bold mb-2 text-text">Quiz</Text>
            <TextInput
              className="border border-border rounded-md p-2 mb-2 text-text bg-background"
              value={formData.interactive_content?.quiz?.title}
              onChangeText={(text) => handleQuizUpdate({ title: text })}
              placeholder="Quiz Title"
            />
          </View>
        );
      case 'survey':
        return (
          <View className="mb-4 p-4 bg-card rounded-lg">
            <Text className="text-lg font-bold mb-2 text-text">Survey</Text>
            <TextInput
              className="border border-border rounded-md p-2 mb-2 text-text bg-background"
              value={formData.interactive_content?.survey?.title}
              onChangeText={(text) => handleSurveyUpdate({ title: text })}
              placeholder="Survey Title"
            />
          </View>
        );
      case 'all':
        return (
          <>
            <View className="mb-4 p-4 bg-card rounded-lg">
              <Text className="text-lg font-bold mb-2 text-text">Poll</Text>
              <TextInput
                className="border border-border rounded-md p-2 mb-2 text-text bg-background"
                value={formData.interactive_content?.poll?.question}
                onChangeText={(text) => handlePollUpdate({ question: text })}
                placeholder="Poll Question"
              />
              {formData.interactive_content?.poll?.options.map((option, index) => (
                <TextInput
                  key={index}
                  className="border border-border rounded-md p-2 mb-2 text-text bg-background"
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
            <View className="mb-4 p-4 bg-card rounded-lg">
              <Text className="text-lg font-bold mb-2 text-text">Quiz</Text>
              <TextInput
                className="border border-border rounded-md p-2 mb-2 text-text bg-background"
                value={formData.interactive_content?.quiz?.title}
                onChangeText={(text) => handleQuizUpdate({ title: text })}
                placeholder="Quiz Title"
              />
            </View>
            <View className="mb-4 p-4 bg-card rounded-lg">
              <Text className="text-lg font-bold mb-2 text-text">Survey</Text>
              <TextInput
                className="border border-border rounded-md p-2 mb-2 text-text bg-background"
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
      <View className="mb-4 p-4 bg-card rounded-lg">
        <Text className="text-lg font-bold mb-2 text-text">Media</Text>
        <View className="flex-row gap-2 mb-4">
          <Button
            onPress={() => handleAddMedia('image')}
            variant="default"
            size="default"
          >
            <Text>Add Image</Text>
          </Button>
          <Button
            onPress={() => handleAddMedia('video')}
            variant="default"
            size="default"
          >
            <Text>Add Video</Text>
          </Button>
        </View>

        {/* Media Layout Selection */}
        <View className="mb-4">
          <Text className="text-lg font-bold mb-2 text-text">Layout Style</Text>
          <View className="flex-row flex-wrap gap-2">
            {(['grid', 'carousel', 'list', 'collage', 'masonry', 'fullwidth'] as const).map((layout) => (
              <Pressable
                key={layout}
                className={`
                  flex-1 min-w-[100px] p-2 rounded-md border-2
                  ${formData.metadata?.mediaLayout === layout ? 'bg-primary border-primary' : 'border-border'}
                `}
                onPress={() => handleFormDataChange({
                  metadata: {
                    ...DEFAULT_METADATA,
                    ...formData.metadata,
                    mediaLayout: layout
                  }
                })}
              >
                <Text className={`
                  text-center
                  ${formData.metadata?.mediaLayout === layout ? 'text-background' : 'text-text'}
                `}>
                  {layout.charAt(0).toUpperCase() + layout.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {formData.media?.map((media, index) => (
          <View key={index} className="mb-4 p-4 bg-card rounded-lg">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-text">
                {media.type === 'image' ? '🖼️ Image' : '🎥 Video'}
              </Text>
              <Button
                onPress={() => handleRemoveMedia(index)}
                variant="destructive"
                size="default"
              >
                <Text>Remove</Text>
              </Button>
            </View>

            <TextInput
              className="border border-border rounded-md p-2 mb-2 text-text bg-background"
              value={media.url}
              onChangeText={(text) => handleMediaChange(index, { url: text })}
              placeholder="Media URL"
            />

            <TextInput
              className="border border-border rounded-md p-2 mb-2 text-text bg-background"
              value={media.caption}
              onChangeText={(text) => handleMediaChange(index, { caption: text })}
              placeholder="Caption"
            />

            {media.type === 'video' && (
              <>
                <TextInput
                  className="border border-border rounded-md p-2 mb-2 text-text bg-background"
                  value={media.thumbnail}
                  onChangeText={(text) => handleMediaChange(index, { thumbnail: text })}
                  placeholder="Thumbnail URL"
                />
                <TextInput
                  className="border border-border rounded-md p-2 mb-2 text-text bg-background"
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
    setSelectedInteractiveType('all');
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
      setSelectedInteractiveType('all');
      setContentType('long');

      // Generate rich content using the utility function
      const newContent = createRichMock(formData);
      handleFormDataChange({
        ...newContent,
        channel_username: mockTenant.username
      });

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
    <View className="flex-1 bg-background">
      {/* Toolbar */}
      <View className="flex-row p-4 border-b border-border bg-card">
        <Button
          onPress={generateRealisticContentHandler}
        >
          <Text className="text-background">Create New</Text>
        </Button>
        <Button
          onPress={createRichMockHandler}
        >
          <Text className="text-background">Create Rich</Text>
        </Button>
      </View>

      <View className="flex-1 flex-row">
        {/* Left side - Form */}
        <ScrollView 
          className="flex-1 p-4"
          ref={leftScrollRef}
          contentContainerStyle={{
            paddingBottom: insets.bottom + Number(design.spacing.padding.card),
          }}
        >
          {/* Content Section */}
          <View className="mb-6 bg-card p-4 rounded-lg">
            <Text className="text-lg font-bold mb-4 text-text">Content</Text>

            {/* Content Toggle */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-text">Include Content</Text>
              <Switch
                value={includeContent}
                onValueChange={setIncludeContent}
              />
            </View>

            {/* Content Type Selection */}
            {includeContent && (
              <View className="mt-2">
                {(['small', 'long'] as const).map((type) => (
                  <Pressable
                    key={type}
                    className="flex-row justify-between items-center p-2"
                    onPress={() => setContentType(type)}
                  >
                    <Text className="text-text">
                      {type.charAt(0).toUpperCase() + type.slice(1)} Content
                    </Text>
                    <View className={`
                      w-6 h-6 rounded-full border-2 border-primary
                      items-center justify-center
                      ${contentType === type ? 'bg-primary' : 'bg-transparent'}
                    `} />
                  </Pressable>
                ))}
              </View>
            )}

            {/* Content Input */}
            {includeContent && (
              <TextInput
                className={`
                  border border-border rounded-md p-2 mb-2
                  text-text bg-background
                  ${contentType === 'long' ? 'min-h-[120px]' : ''}
                `}
                value={formData.content}
                onChangeText={(text) => handleFormDataChange({ content: text })}
                placeholder={`Enter your ${contentType} content`}
                placeholderTextColor={colorScheme.colors.text + '80'}
                multiline
                numberOfLines={contentType === 'long' ? 6 : 3}
              />
            )}

            {/* Form Settings */}
            <View className="mt-6 mb-6 bg-card p-4 rounded-lg">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-text">Require Auth</Text>
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

              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-text">Allow Resubmit</Text>
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

              <View className="flex-row justify-between items-center">
                <Text className="text-text">Make Content Collapsible</Text>
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
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-text">Include Media</Text>
              <Switch
                value={includeMedia}
                onValueChange={setIncludeMedia}
              />
            </View>

            {/* Media Section */}
            {renderMediaSection()}

            {/* Interactive Switch */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-text">Interactive Content</Text>
              <Switch
                value={isInteractive}
                onValueChange={setIsInteractive}
              />
            </View>

            {/* Interactive Type Selection */}
            {isInteractive && (
              <View className="mt-2">
                {(['all', 'poll', 'quiz', 'survey'] as const).map((type) => (
                  <Pressable
                    key={type}
                    className="flex-row justify-between items-center p-2"
                    onPress={() => setSelectedInteractiveType(type)}
                  >
                    <Text className="text-text">
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                    <View className={`
                      w-6 h-6 rounded-full border-2 border-primary
                      items-center justify-center
                      ${selectedInteractiveType === type ? 'bg-primary' : 'bg-transparent'}
                    `} />
                  </Pressable>
                ))}
              </View>
            )}

            {/* Interactive Content Forms */}
            <View className="mt-6">
              {renderInteractiveContent()}
            </View>
          </View>

          <Button
            onPress={() => handleSubmitHandler()}
            disabled={isSubmitting}
          >
            <Text className="text-background">
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Text>
          </Button>
        </ScrollView>

        {/* Right side - Feed Items */}
        <ScrollView
          className="flex-1 p-4"
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
          <View className="flex-row justify-between items-center py-3 border-b border-border">
            <Text className="text-lg font-bold text-text">Feed Items</Text>
          </View>

          {feedItems.map((item, index) => (
            <View key={item.id || index} className="mb-6 border border-border rounded-lg overflow-hidden bg-card">
              <FeedItem
                data={item}
                showHeader={true}
                showFooter={true}
              />
              <Button
                onPress={() => handleEditItemHandler(item)}
              >
                <Text className="text-background">Edit</Text>
              </Button>
            </View>
          ))}

          {feedItems.length === 0 && !isLoading && (
            <View className="p-6 items-center justify-center">
              <Text className="text-base text-text opacity-50">No feed items found</Text>
            </View>
          )}

          {isLoading && (
            <View className="p-6 items-center justify-center">
              <Text className="text-text">Loading feed items...</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
