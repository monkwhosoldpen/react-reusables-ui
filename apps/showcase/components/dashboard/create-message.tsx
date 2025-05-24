import React, { useState, useCallback, useEffect } from 'react';
import { View, ScrollView, TextInput, Switch, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Plus } from 'lucide-react-native';
import { QuickActionButtons } from './quick-action-buttons';
import {
  FormDataType,
  FeedItemType,
  DEFAULT_METADATA,
} from '~/lib/enhanced-chat/types/superfeed';
import { useFeedForm } from '~/lib/enhanced-chat/hooks/useFeedForm';
import { FeedItem } from '~/lib/enhanced-chat/components/feed/FeedItem';
import { useInteractiveContent } from '~/lib/enhanced-chat/hooks/useInteractiveContent';
import { InteractiveContentSection } from '~/components/dashboard/InteractiveContentSection';
import { QUICK_ACTION_TEMPLATES } from '~/lib/enhanced-chat/utils/quickActionTemplates';
import { MEDIA_LAYOUTS, getMediaLayoutLabel } from '~/lib/enhanced-chat/utils/mediaLayouts';
import { usePreviewData } from '~/lib/enhanced-chat/hooks/usePreviewData';
import { useMessageHandling } from '~/lib/enhanced-chat/hooks/useMessageHandling';
import { useMediaHandling } from '~/lib/enhanced-chat/hooks/useMediaHandling';
import { handleQuickAction } from '~/lib/enhanced-chat/utils/quickActionHandlers';
import {
  generateBulkShortMessages,
  generateBulkLongMessages,
  generateBulkPollMessages,
  generateBulkQuizMessages,
  generateBulkSurveyMessages,
} from '~/lib/enhanced-chat/utils/bulkCreateTemplates';

const createItem = (hookHandler) => async (item) => {
  if (item) await hookHandler(item);
};

interface CreateMessageScreenProps {
  username: string;
  clientType: 'basic' | 'pro' | 'public';
  isPublic: boolean;
  hasAccess: boolean;
  userRole: {
    role: string;
  } | null;
}

export default function CreateMessageScreen({ username, clientType, isPublic, hasAccess, userRole }: CreateMessageScreenProps) {
  const [isInteractive, setIsInteractive] = useState(false);
  const [includeMedia, setIncludeMedia] = useState(false);
  const [includeContent, setIncludeContent] = useState(true);
  const [previewKey, setPreviewKey] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const { formData, handleFormDataChange } = useFeedForm({ user: { email: username } });
  useInteractiveContent(formData as FormDataType);

  const {
    messageCount,
    messages,
    isSubmitting,
    error: messageError,
    handleCreateItem: hookCreateItem,
    handleEditMessage,
  } = useMessageHandling({ username, formData, handleFormDataChange });
  const createItemUtil = useCallback(createItem(hookCreateItem), [hookCreateItem]);

  const {
    error: mediaError,
    handleMediaLayoutChange,
    handleMediaUrlChange,
    handleMediaCaptionChange,
    handleAddImage,
    handleAddVideo,
  } = useMediaHandling({ formData, handleFormDataChange });

  const handleQuickActionClick = useCallback(
    (type: keyof typeof QUICK_ACTION_TEMPLATES) => {
      try {
        const template = QUICK_ACTION_TEMPLATES[type];
        handleQuickAction({
          template,
          handleFormDataChange,
          setIsInteractive,
          setIncludeMedia,
          setIncludeContent,
          setPreviewKey,
          setSelectedType: (type) => handleFormDataChange({ metadata: { ...formData.metadata, interactiveType: type } }),
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed quick action'));
      }
    },
    [handleFormDataChange],
  );

  const previewData = usePreviewData({
    formData,
    mediaLayout: formData.metadata?.mediaLayout,
    isInteractive,
    selectedInteractiveType: formData.metadata?.interactiveType,
    username,
    includeMedia,
    includeContent,
  });

  const makeBulk = (gen, total) => async () => {
    try {
      const all = gen(total);
      const batch = 5;
      for (let i = 0; i < all.length; i += batch) {
        await Promise.all(all.slice(i, i + batch).map(createItemUtil));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Bulk create failed'));
    }
  };

  const handleBulkCreateShort = useCallback(makeBulk(generateBulkShortMessages, 20), [createItemUtil]);
  const handleBulkCreateLong = useCallback(makeBulk(generateBulkLongMessages, 20), [createItemUtil]);
  const handleBulkCreatePolls = useCallback(makeBulk(generateBulkPollMessages, 10), [createItemUtil]);
  const handleBulkCreateQuizzes = useCallback(makeBulk(generateBulkQuizMessages, 10), [createItemUtil]);
  const handleBulkCreateSurveys = useCallback(makeBulk(generateBulkSurveyMessages, 10), [createItemUtil]);

  const combinedError = error || messageError || mediaError;

  return (
    <SafeAreaView className="bg-white dark:bg-gray-900">
        <View style={{ flex: 1 }}>
          <ScrollView style={{ flex: 1 }}>
            {combinedError && (
              <View className="p-4 m-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                <Text className="text-red-600 dark:text-red-400 text-sm font-medium">
                  {combinedError.message}
                </Text>
              </View>
            )}

            <QuickActionButtons
              handleQuickActionClick={handleQuickActionClick}
              handleBulkCreateShort={handleBulkCreateShort}
              handleBulkCreateLong={handleBulkCreateLong}
              handleBulkCreatePolls={handleBulkCreatePolls}
              handleBulkCreateQuizzes={handleBulkCreateQuizzes}
              handleBulkCreateSurveys={handleBulkCreateSurveys}
              isPublic={isPublic}
              clientType={clientType}
              hasAccess={hasAccess}
              userRole={userRole}
              messageCount={messageCount}
            />

            <View className="flex-1 flex-row p-0 gap-4">

              {/* Editor + Preview */}
              <View className="flex-1 border-2 border-blue-500 rounded-lg p-0 flex-row">
                {/* Editor */}
                <View className="flex-[0.5] pr-0 border border-yellow-400">
                  <ScrollView className="p-4">
                    {/* Content Section */}
                    <View className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                      <Text className="text-lg font-semibold mb-4">Content</Text>
                      <View className="flex-row items-center mb-2">
                        <Text className="text-base">Make Content Collapsible</Text>
                        <Switch
                          value={formData.metadata?.isCollapsible ?? true}
                          onValueChange={(v) =>
                            handleFormDataChange({ metadata: { ...DEFAULT_METADATA, ...formData.metadata, isCollapsible: v } })
                          }
                        />
                      </View>
                      <View className="flex-row items-center mb-2">
                        <Text className="text-base">Include Content</Text>
                        <Switch value={includeContent} onValueChange={setIncludeContent} />
                      </View>
                      <View className="flex-row items-center mb-2">
                        <Text className="text-base">Show Footer</Text>
                        <Switch
                          value={formData.metadata?.visibility?.footer ?? true}
                          onValueChange={(v) =>
                            handleFormDataChange({ metadata: { ...formData.metadata, visibility: { ...formData.metadata?.visibility, footer: v } } })
                          }
                        />
                      </View>
                      {includeContent && (
                        <TextInput
                          className="p-3 border rounded-lg bg-white dark:bg-gray-900"
                          value={formData.content}
                          onChangeText={(t) => handleFormDataChange({ ...formData, content: t })}
                          placeholder="Enter your content"
                          multiline
                        />
                      )}
                    </View>

                    {/* Media Section */}
                    <View className="p-4 mt-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                      <Text className="text-lg font-semibold mb-4">Media</Text>
                      <View className="flex-row items-center mb-2">
                        <Text className="text-base">Include Media</Text>
                        <Switch value={includeMedia} onValueChange={setIncludeMedia} />
                      </View>
                      {includeMedia && (
                        <View>
                          <View className="mb-4">
                            <Text className="text-base font-semibold mb-2">Layout Style</Text>
                            <View className="flex-row gap-2">
                              {MEDIA_LAYOUTS.map((layout) => (
                                <TouchableOpacity
                                  key={layout}
                                  className={`flex-1 p-3 border rounded-lg ${formData.metadata?.mediaLayout === layout ? 'border-black bg-primary' : 'border-gray-200'
                                    }`}
                                  onPress={() => handleMediaLayoutChange(layout)}
                                >
                                  <Text className={formData.metadata?.mediaLayout === layout ? 'text-white' : 'text-gray-700'}>
                                    {getMediaLayoutLabel(layout)}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          </View>

                          <View className="mb-4">
                            {formData.media?.map((item, idx) => (
                              <View key={idx} className="p-3 border rounded-lg mb-2">
                                <Text className="text-sm font-medium mb-2">
                                  {item.type === 'image' ? `Image ${idx + 1}` : `Video ${idx + 1}`}
                                </Text>
                                <TextInput
                                  className="p-3 border rounded-lg bg-white dark:bg-gray-900"
                                  value={item.url}
                                  onChangeText={(t) => handleMediaUrlChange(idx, t)}
                                  placeholder={`https://placeholder.co/800x600?text=${item.type}+${idx + 1}`}
                                />
                                <TextInput
                                  className="p-3 border rounded-lg bg-white dark:bg-gray-900"
                                  value={item.caption}
                                  onChangeText={(t) => handleMediaCaptionChange(idx, t)}
                                  placeholder={`Caption for ${item.type} ${idx + 1}`}
                                />
                              </View>
                            ))}
                          </View>

                          <View className="flex-row gap-2">
                            <Button onPress={handleAddImage} className="flex-1">
                              <Text>Add Image</Text>
                            </Button>
                            <Button onPress={handleAddVideo} className="flex-1">
                              <Text>Add Video</Text>
                            </Button>
                          </View>
                        </View>
                      )}
                    </View>

                    {/* Interactive Section */}
                    <View className="p-4 mt-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                      <Text className="text-lg font-semibold mb-4">Interactive Content</Text>
                      <View className="flex-row items-center mb-2">
                        <Text className="text-base">Enable Interactive Content</Text>
                        <Switch value={isInteractive} onValueChange={setIsInteractive} />
                      </View>
                      {isInteractive && (
                        <InteractiveContentSection
                          formData={formData}
                          selectedInteractiveType={formData.metadata?.interactiveType}
                          onTypeChange={(type) => handleFormDataChange({ metadata: { ...formData.metadata, interactiveType: type } })}
                          onFormDataChange={handleFormDataChange}
                        />
                      )}
                    </View>

                    <Button onPress={() => createItemUtil(formData)} disabled={isSubmitting}>
                      <Text>Create</Text>
                    </Button>
                  </ScrollView>
                </View>

                {/* Preview */}
                <View className="flex-[0.5] ">
                  <ScrollView className="p-4 border border-pink-400">


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
  );
}
