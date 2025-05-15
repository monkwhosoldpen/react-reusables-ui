import React, { useState, useCallback, useEffect } from 'react';
import { View, ScrollView, TextInput, Switch, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Plus } from 'lucide-react-native';
import { 
  FormDataType, 
  FeedItemType, 
  DEFAULT_METADATA,
  DEFAULT_INTERACTIVE_CONTENT
} from '~/lib/enhanced-chat/types/superfeed';
import { useFeedForm } from '~/lib/enhanced-chat/hooks/useFeedForm';
import { FeedItem } from '~/lib/enhanced-chat/components/feed/FeedItem';
import { useInteractiveContent } from '~/lib/enhanced-chat/hooks/useInteractiveContent';
import { createMessageStyles } from '~/lib/enhanced-chat/utils/createMessageStyles';
import { InteractiveContentSection } from '~/components/dashboard/InteractiveContentSection';
import { QUICK_ACTION_TEMPLATES, INTERACTIVE_TYPES } from '~/lib/enhanced-chat/utils/quickActionTemplates';
import { MEDIA_LAYOUTS, getMediaLayoutLabel, getMediaLayoutIcon } from '~/lib/enhanced-chat/utils/mediaLayouts';
import { calculateMaxHeight, logHeightCalculation } from '~/lib/enhanced-chat/utils/heightCalculations';
import { usePreviewData } from '~/lib/enhanced-chat/hooks/usePreviewData';
import { useMessageHandling } from '~/lib/enhanced-chat/hooks/useMessageHandling';
import { useMediaHandling } from '~/lib/enhanced-chat/hooks/useMediaHandling';
import { handleQuickAction } from '~/lib/enhanced-chat/utils/quickActionHandlers';
import { 
  generateBulkShortMessages, 
  generateBulkLongMessages,
  generateBulkPollMessages,
  generateBulkQuizMessages,
  generateBulkSurveyMessages
} from '~/lib/enhanced-chat/utils/bulkCreateTemplates';
import { PREMIUM_CONFIGS } from '~/lib/in-app-db/states/telangana/premium-data';

interface CreateMessageScreenProps {
  username: string;
}

export default function CreateMessageScreen({ username }: CreateMessageScreenProps) {

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
    }
  }, [formData.metadata?.isCollapsible, formData.metadata?.maxHeight, formData.metadata?.mediaLayout, formData.media]);

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
    }
  }, [handleCreateItem]);

  const handleBulkCreatePolls = useCallback(async () => {
    try {
      const messages = generateBulkPollMessages(10);
      const batchSize = 5;
      
      for (let i = 0; i < messages.length; i += batchSize) {
        const batch = messages.slice(i, i + batchSize);
        await Promise.all(batch.map(message => handleCreateItem(message)));
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to bulk create poll messages');
      setError(error);
    }
  }, [handleCreateItem]);

  const handleBulkCreateQuizzes = useCallback(async () => {
    try {
      const messages = generateBulkQuizMessages(10);
      const batchSize = 5;
      
      for (let i = 0; i < messages.length; i += batchSize) {
        const batch = messages.slice(i, i + batchSize);
        await Promise.all(batch.map(message => handleCreateItem(message)));
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to bulk create quiz messages');
      setError(error);
    }
  }, [handleCreateItem]);

  const handleBulkCreateSurveys = useCallback(async () => {
    try {
      const messages = generateBulkSurveyMessages(10);
      const batchSize = 5;
      
      for (let i = 0; i < messages.length; i += batchSize) {
        const batch = messages.slice(i, i + batchSize);
        await Promise.all(batch.map(message => handleCreateItem(message)));
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to bulk create survey messages');
      setError(error);
    }
  }, [handleCreateItem]);

  // Combine all errors
  const combinedError = error || messageError || mediaError;

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} className="bg-white dark:bg-gray-900">
        <View style={{ flex: 1 }}>
          <ScrollView style={{ flex: 1 }}>
            {combinedError && (
              <View className="p-4 m-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                <Text className="text-red-600 dark:text-red-400 text-sm font-medium">{combinedError.message}</Text>
              </View>
            )}
            
            {/* Quick Action Buttons */}
            <View className="flex-row gap-2 p-4 border-2 border-pink-500 rounded-lg">
              <Button
                variant="outline"
                onPress={() => handleQuickActionClick('small')}
                className="flex-1"
              >
                <Text className="text-gray-900 dark:text-white">Short Text</Text>
              </Button>
              <Button
                variant="outline"
                onPress={() => handleQuickActionClick('long')}
                className="flex-1"
              >
                <Text className="text-gray-900 dark:text-white">Long Text</Text>
              </Button>
              <Button
                variant="outline"
                onPress={() => handleQuickActionClick('superfeed')}
                className="flex-1"
              >
                <Text className="text-gray-900 dark:text-white">Create SuperfeedItem</Text>
              </Button>
              <Button
                variant="outline"
                onPress={handleBulkCreateShort}
                className="flex-1"
              >
                <Text className="text-gray-900 dark:text-white">Bulk Create Short</Text>
              </Button>
              <Button
                variant="outline"
                onPress={handleBulkCreateLong}
                className="flex-1"
              >
                <Text className="text-gray-900 dark:text-white">Bulk Create Long</Text>
              </Button>
            </View>

            {/* Interactive Bulk Create Buttons */}
            <View className="flex-row gap-2 p-4 border-2 border-pink-500 rounded-lg mt-2">
              <Button
                variant="outline"
                onPress={handleBulkCreatePolls}
                className="flex-1"
              >
                <Text className="text-gray-900 dark:text-white">Bulk Create Polls</Text>
              </Button>
              <Button
                variant="outline"
                onPress={handleBulkCreateQuizzes}
                className="flex-1"
              >
                <Text className="text-gray-900 dark:text-white">Bulk Create Quizzes</Text>
              </Button>
              <Button
                variant="outline"
                onPress={handleBulkCreateSurveys}
                className="flex-1"
              >
                <Text className="text-gray-900 dark:text-white">Bulk Create Surveys</Text>
              </Button>
            </View>

            <View className="flex-1 flex-row p-4 gap-4">

              <View className="flex-[0.4] border-2 border-green-500 rounded-lg p-2">
                <Text className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                  Total Messages: {messageCount}
                </Text>
                
                <ScrollView className="p-4">
                  {messages.map((message) => (
                    <View key={message.id} className="mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                      <FeedItem
                        data={message}
                        showHeader={message.metadata?.visibility?.header ?? true}
                        showFooter={message.metadata?.visibility?.footer ?? false}
                      />
                      <TouchableOpacity
                        className="p-3 rounded-lg bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 mt-2 items-center"
                        onPress={() => handleEditMessage(message)}
                      >
                        <Text className="text-white text-sm font-medium">Edit</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>

              <View className="flex-[0.6] border-2 border-blue-500 rounded-lg p-2 flex-row">
                <View className="flex-[0.5] pr-4">
                  <ScrollView className="p-4">
                    {/* Content Section */}
                    <View className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                      <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Content</Text>
                      <View className="flex-row items-center mb-2">
                        <Text className="text-base text-gray-700 dark:text-gray-300">Make Content Collapsible</Text>
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
                        <Text className="text-base text-gray-700 dark:text-gray-300">Include Content</Text>
                        <Switch
                          value={includeContent}
                          onValueChange={setIncludeContent}
                        />
                      </View>
                      <View className="flex-row items-center mb-2">
                        <Text className="text-base text-gray-700 dark:text-gray-300">Show Footer</Text>
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
                          className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                          value={formData.content}
                          onChangeText={(text) => handleFormDataChange({ ...formData, content: text })}
                          placeholder="Enter your content"
                          multiline
                          numberOfLines={4}
                        />
                      )}
                    </View>

                    {/* Media Section */}
                    <View className="p-4 mt-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                      <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Media</Text>
                      <View className="flex-row items-center mb-2">
                        <Text className="text-base text-gray-700 dark:text-gray-300">Include Media</Text>
                        <Switch
                          value={includeMedia}
                          onValueChange={setIncludeMedia}
                        />
                      </View>
                      {includeMedia && (
                        <View>
                          <View className="mb-4">
                            <Text className="text-base font-semibold mb-2 text-gray-900 dark:text-white">Layout Style</Text>
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
                              <View key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg mb-2">
                                <Text className="text-sm font-medium mb-2 text-gray-900 dark:text-white">
                                  {item.type === 'image' ? `Image ${index + 1}` : `Video ${index + 1}`}
                                </Text>
                                <TextInput
                                  className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                  value={item.url}
                                  onChangeText={(text) => handleMediaUrlChange(index, text)}
                                  placeholder={`https://placeholder.co/800x600?text=${item.type}+${index + 1}`}
                                />
                                <TextInput
                                  className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
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
                              className="flex-1"
                            >
                              <Text className="text-gray-900 dark:text-white">Add Image</Text>
                            </Button>
                            <Button
                              onPress={handleAddVideo}
                              variant="default"
                              size="default"
                              className="flex-1"
                            >
                              <Text className="text-gray-900 dark:text-white">Add Video</Text>
                            </Button>
                          </View>
                        </View>
                      )}
                    </View>

                    {/* Interactive Section */}
                    <View className="p-4 mt-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                      <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Interactive Content</Text>
                      <View className="flex-row items-center mb-2">
                        <Text className="text-base text-gray-700 dark:text-gray-300">Enable Interactive Content</Text>
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

                <View className="flex-[0.5]">
                  <ScrollView className="p-4">
                    <Card className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                      <FeedItem
                        key={`preview-${previewKey}`}
                        data={previewData}
                        showHeader={previewData.metadata?.visibility?.header ?? true}
                        showFooter={previewData.metadata?.visibility?.footer ?? false}
                      />
                    </Card>
                  </ScrollView>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>

      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#3B82F6',
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          zIndex: 1000,
        }}
        onPress={() => handleCreateItem(formData)}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Plus size={24} color="white" />
        )}
      </TouchableOpacity>
    </View>
  );
}