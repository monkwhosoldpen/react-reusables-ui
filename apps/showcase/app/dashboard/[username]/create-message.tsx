import React, { useState, useCallback, useEffect } from 'react';
import { View, ScrollView, TextInput, Switch, TouchableOpacity } from 'react-native';
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
  SurveyData,
  DEFAULT_INTERACTIVE_CONTENT
} from '~/lib/enhanced-chat/types/superfeed';
import { useFeedForm } from '~/lib/hooks/useFeedForm';
import { FeedItem } from '~/lib/enhanced-chat/components/feed/FeedItem';
import { useInteractiveContent } from '~/lib/hooks/useInteractiveContent';
import { useLocalSearchParams } from 'expo-router';
import { debounce } from 'lodash';
import { createMessageStyles } from '~/lib/utils/createMessageStyles';
import { InteractiveContentSection } from '~/components/dashboard/InteractiveContentSection';
import { QUICK_ACTION_TEMPLATES, INTERACTIVE_TYPES } from '~/lib/utils/quickActionTemplates';
import { MEDIA_LAYOUTS, getMediaLayoutLabel, getMediaLayoutIcon } from '~/lib/utils/mediaLayouts';
import { calculateMaxHeight, logHeightCalculation } from '~/lib/utils/heightCalculations';
import { usePreviewData } from '~/lib/hooks/usePreviewData';
import { useMessageHandling } from '~/lib/hooks/useMessageHandling';
import { useMediaHandling } from '~/lib/hooks/useMediaHandling';
import { handleQuickAction } from '~/lib/utils/quickActionHandlers';
import { generateBulkShortMessages, generateBulkLongMessages } from '~/lib/utils/bulkCreateTemplates';

type InteractiveType = 'poll' | 'quiz' | 'survey';

interface CreateMessageScreenProps {
  username: string;
}

export default function CreateMessageScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const { colorScheme } = useColorScheme();
  const styles = createMessageStyles(colorScheme);

  // State declarations with proper types
  const [selectedType, setSelectedType] = useState<FeedItemType>('whatsapp');
  const [isInteractive, setIsInteractive] = useState<boolean>(false);
  const [includeMedia, setIncludeMedia] = useState<boolean>(false);
  const [includeContent, setIncludeContent] = useState<boolean>(true);
  const [previewKey, setPreviewKey] = useState<number>(0);
  const [error, setError] = useState<Error | null>(null);

  const {
    formData,
    handleFormDataChange,
  } = useFeedForm({
    user: { email: username }
  });

  const { submitResponse } = useInteractiveContent(formData as FormDataType);

  const {
    messageCount,
    messages,
    isSubmitting,
    error: messageError,
    handleCreateItem,
    handleEditMessage
  } = useMessageHandling({
    username,
    formData,
    handleFormDataChange
  });

  const {
    error: mediaError,
    handleMediaLayoutChange,
    handleMediaUrlChange,
    handleMediaCaptionChange,
    handleAddImage,
    handleAddVideo
  } = useMediaHandling({
    formData,
    handleFormDataChange
  });

  const handleQuickActionClick = useCallback((type: keyof typeof QUICK_ACTION_TEMPLATES) => {
    try {
      const template = QUICK_ACTION_TEMPLATES[type];
      handleQuickAction({
        template,
        handleFormDataChange,
        setIsInteractive,
        setIncludeMedia,
        setIncludeContent,
        setSelectedType,
        setPreviewKey
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to handle quick action');
      setError(error);
      console.error('Error in handleQuickActionClick:', error);
    }
  }, [handleFormDataChange]);

  // Use the new usePreviewData hook
  const previewData = usePreviewData({
    formData,
    mediaLayout: formData.metadata?.mediaLayout,
    isInteractive,
    selectedInteractiveType: formData.metadata?.interactiveType,
    username,
    includeMedia,
    includeContent
  });

  // Add effect to monitor collapsible state changes
  useEffect(() => {
    try {
      logHeightCalculation(formData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to calculate height');
      setError(error);
      console.error('Error in height calculation:', error);
    }
  }, [formData.metadata?.isCollapsible, formData.metadata?.maxHeight, formData.metadata?.mediaLayout, formData.media]);

  // Add effect to monitor preview container dimensions
  useEffect(() => {
    const previewContainer = document.querySelector('.preview-container');
    if (previewContainer) {
      const observer = new ResizeObserver(entries => {
        try {
          for (const entry of entries) {
            const maxHeight = calculateMaxHeight(formData);
            
            console.log('Preview Container Dimensions:', {
              width: entry.contentRect.width,
              height: entry.contentRect.height,
              isCollapsible: formData.metadata?.isCollapsible,
              hasMedia: !!formData.media?.length,
              expectedHeight: maxHeight,
              difference: entry.contentRect.height - maxHeight
            });
          }
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Failed to calculate preview dimensions');
          setError(error);
          console.error('Error in preview dimension calculation:', error);
        }
      });
      observer.observe(previewContainer);
      return () => observer.disconnect();
    }
  }, [formData.metadata?.isCollapsible, formData.media]);

  const handleBulkCreateShort = useCallback(async () => {
    try {
      const messages = generateBulkShortMessages(20);
      const batchSize = 5;
      
      for (let i = 0; i < messages.length; i += batchSize) {
        const batch = messages.slice(i, i + batchSize);
        await Promise.all(batch.map(message => handleCreateItem(message)));
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to bulk create short messages');
      setError(error);
      console.error('Error in handleBulkCreateShort:', error);
    }
  }, [handleCreateItem]);

  const handleBulkCreateLong = useCallback(async () => {
    try {
      const messages = generateBulkLongMessages(20);
      const batchSize = 5;
      
      for (let i = 0; i < messages.length; i += batchSize) {
        const batch = messages.slice(i, i + batchSize);
        await Promise.all(batch.map(message => handleCreateItem(message)));
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to bulk create long messages');
      setError(error);
      console.error('Error in handleBulkCreateLong:', error);
    }
  }, [handleCreateItem]);

  // Combine all errors
  const combinedError = error || messageError || mediaError;

  return (
    <View className="flex-1 bg-background">
      {combinedError && (
        <View className="p-4 bg-white border border-gray-200 rounded-lg">
          <Text className="text-red-600 text-sm font-medium">{combinedError.message}</Text>
        </View>
      )}
      
      {/* Quick Action Buttons */}
      <View className="flex-row gap-2 p-4">
        <Button
          variant="outline"
          onPress={() => handleQuickActionClick('small')}
          style={{ flex: 1 }}
        >
          <Text>Short Text</Text>
        </Button>
        <Button
          variant="outline"
          onPress={() => handleQuickActionClick('long')}
          style={{ flex: 1 }}
        >
          <Text>Long Text</Text>
        </Button>
        <Button
          variant="outline"
          onPress={() => handleQuickActionClick('superfeed')}
          style={{ flex: 1 }}
        >
          <Text>Create SuperfeedItem</Text>
        </Button>
        <Button
          variant="outline"
          onPress={handleBulkCreateShort}
          style={{ flex: 1 }}
        >
          <Text>Bulk Create Short</Text>
        </Button>
        <Button
          variant="outline"
          onPress={handleBulkCreateLong}
          style={{ flex: 1 }}
        >
          <Text>Bulk Create Long</Text>
        </Button>
      </View>

      <View className="flex-1 flex-row p-4 gap-4">
        {/* Left Section - Form (30%) */}
        <View className="flex-[0.3] border-r border-gray-200 pr-4">
          <ScrollView className="p-4">
            {/* Content Section */}
            <View className="p-4">
              <Text className="text-lg font-semibold mb-4">Content</Text>
              <View className="flex-row items-center mb-2">
                <Text className="text-base">Make Content Collapsible</Text>
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
              <View className="flex-row items-center mb-2">
                <Text className="text-base">Include Content</Text>
                <Switch
                  value={includeContent}
                  onValueChange={setIncludeContent}
                />
              </View>
              <View className="flex-row items-center mb-2">
                <Text className="text-base">Show Footer</Text>
                <Switch
                  value={formData.metadata?.visibility?.footer ?? true}
                  onValueChange={(value) => handleFormDataChange({
                    metadata: {
                      ...formData.metadata,
                      visibility: {
                        ...formData.metadata?.visibility,
                        footer: value
                      }
                    }
                  })}
                />
              </View>
              {includeContent && (
                <TextInput
                  className="p-3 border border-gray-200 rounded-lg"
                  value={formData.content}
                  onChangeText={(text) => handleFormDataChange({ ...formData, content: text })}
                  placeholder="Enter your content"
                  multiline
                  numberOfLines={4}
                />
              )}
            </View>

            {/* Media Section */}
            <View className="p-4">
              <Text className="text-lg font-semibold mb-4">Media</Text>
              <View className="flex-row items-center mb-2">
                <Text className="text-base">Include Media</Text>
                <Switch
                  value={includeMedia}
                  onValueChange={setIncludeMedia}
                />
              </View>
              {includeMedia && (
                <View>
                  <View className="mb-4">
                    <Text className="text-base font-semibold mb-2">Layout Style</Text>
                    <View className="flex-row gap-2">
                      {MEDIA_LAYOUTS.map((layout) => (
                        <TouchableOpacity
                          key={layout}
                          className={`flex-1 p-3 border rounded-lg ${
                            formData.metadata?.mediaLayout === layout 
                              ? 'border-black bg-primary'
                              : 'border-gray-200'
                          }`}
                          onPress={() => handleMediaLayoutChange(layout)}
                        >
                          <Text className={
                            formData.metadata?.mediaLayout === layout 
                              ? 'text-white'
                              : 'text-gray-700'
                          }>
                            {getMediaLayoutLabel(layout)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Media Items List */}
                  <View className="mb-4">
                    {formData.media?.map((item, index) => (
                      <View key={index} className="p-3 border border-gray-200 rounded-lg mb-2">
                        <Text className="text-sm font-medium mb-2">
                          {item.type === 'image' ? `Image ${index + 1}` : `Video ${index + 1}`}
                        </Text>
                        <TextInput
                          className="p-3 border border-gray-200 rounded-lg mb-2"
                          value={item.url}
                          onChangeText={(text) => handleMediaUrlChange(index, text)}
                          placeholder={`https://placeholder.co/800x600?text=${item.type}+${index + 1}`}
                        />
                        <TextInput
                          className="p-3 border border-gray-200 rounded-lg"
                          value={item.caption}
                          onChangeText={(text) => handleMediaCaptionChange(index, text)}
                          placeholder={`Enter caption for ${item.type} ${index + 1}`}
                        />
                      </View>
                    ))}
                  </View>

                  <View className="flex-row gap-2">
                    <Button
                      onPress={handleAddImage}
                      variant="default"
                      size="default"
                      style={{ flex: 1 }}
                    >
                      <Text>Add Image</Text>
                    </Button>
                    <Button
                      onPress={handleAddVideo}
                      variant="default"
                      size="default"
                      style={{ flex: 1 }}
                    >
                      <Text>Add Video</Text>
                    </Button>
                  </View>
                </View>
              )}
            </View>

            {/* Interactive Section */}
            <View className="p-4">
              <Text className="text-lg font-semibold mb-4">Interactive Content</Text>
              <View className="flex-row items-center mb-2">
                <Text className="text-base">Enable Interactive Content</Text>
                <Switch
                  value={isInteractive}
                  onValueChange={setIsInteractive}
                />
              </View>
              {isInteractive && (
                <InteractiveContentSection
                  formData={formData}
                  selectedInteractiveType={formData.metadata?.interactiveType}
                  onTypeChange={(type) => handleFormDataChange({
                    metadata: {
                      ...formData.metadata,
                      interactiveType: type
                    }
                  })}
                  onFormDataChange={handleFormDataChange}
                />
              )}
            </View>
          </ScrollView>
        </View>

        {/* Center Section - Preview (30%) */}
        <View className="flex-[0.3] border-r border-gray-200 pr-4">
          <ScrollView className="p-4">
            <Card style={{ 
              padding: 16, 
              marginBottom: 16, 
              backgroundColor: colorScheme.colors.card,
              borderWidth: 1,
              borderColor: colorScheme.colors.border 
            }}>
              <FeedItem
                key={`preview-${previewKey}`}
                data={previewData}
                showHeader={previewData.metadata?.visibility?.header ?? true}
                showFooter={previewData.metadata?.visibility?.footer ?? false}
              />
            </Card>
          </ScrollView>
        </View>

        {/* Right Section - Feed Items List (40%) */}
        <View className="flex-[0.4]">
          <Text className="text-sm font-medium mb-4">
            Total Messages: {messageCount}
          </Text>
          
          <ScrollView className="p-4">
            {messages.map((message) => (
              <View key={message.id} className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
                <FeedItem
                  data={message}
                  showHeader={message.metadata?.visibility?.header ?? true}
                  showFooter={message.metadata?.visibility?.footer ?? false}
                />
                <TouchableOpacity
                  className="p-3 rounded-lg bg-primary mt-2 items-center"
                  onPress={() => handleEditMessage(message)}
                >
                  <Text className="text-white text-sm font-medium">Edit</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>

      <View className="p-4 border-t border-gray-200">
        <Button
          variant="default"
          onPress={() => handleCreateItem(formData)}
          disabled={isSubmitting}
        >
          <Text>{isSubmitting ? 'Creating...' : 'Create'}</Text>
        </Button>
      </View>
    </View>
  );
}