import React, { useState, useCallback, useEffect } from 'react';
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
  SurveyData,
  DEFAULT_INTERACTIVE_CONTENT
} from '~/lib/enhanced-chat/types/superfeed';
import { useFeedForm } from '~/lib/hooks/useFeedForm';
import { FeedItem } from '~/lib/enhanced-chat/components/feed/FeedItem';
import { useInteractiveContent } from '~/lib/hooks/useInteractiveContent';
import { useLocalSearchParams } from 'expo-router';
import { debounce } from 'lodash';
import { createMessageStyles } from '~/lib/utils/createMessageStyles';
import { FeedItemPreview } from '~/lib/components/FeedItemPreview';
import { InteractiveContentSection } from '~/lib/components/InteractiveContentSection';
import { QUICK_ACTION_TEMPLATES, INTERACTIVE_TYPES } from '~/lib/utils/quickActionTemplates';
import { MEDIA_LAYOUTS, getMediaLayoutLabel, getMediaLayoutIcon } from '~/lib/utils/mediaLayouts';
import { calculateMaxHeight, logHeightCalculation } from '~/lib/utils/heightCalculations';
import { usePreviewData } from '~/lib/hooks/usePreviewData';
import { useMessageHandling } from '~/lib/hooks/useMessageHandling';
import { useMediaHandling } from '~/lib/hooks/useMediaHandling';
import { handleQuickAction } from '~/lib/utils/quickActionHandlers';

type InteractiveType = 'poll' | 'quiz' | 'survey';

interface CreateMessageScreenProps {
  username: string;
}

export default function CreateMessageScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const { colorScheme } = useColorScheme();
  const styles = createMessageStyles(colorScheme);

  // State declarations with proper types
  const [selectedType, setSelectedType] = useState<FeedItemType>('all');
  const [isInteractive, setIsInteractive] = useState<boolean>(false);
  const [includeMedia, setIncludeMedia] = useState<boolean>(false);
  const [includeContent, setIncludeContent] = useState<boolean>(true);
  const [mediaLayout, setMediaLayout] = useState<MediaLayout>('grid');
  const [selectedInteractiveType, setSelectedInteractiveType] = useState<InteractiveType>('poll');
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
        setSelectedInteractiveType,
        setMediaLayout,
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
    mediaLayout,
    isInteractive,
    selectedInteractiveType,
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
  }, [formData.metadata?.isCollapsible, formData.metadata?.maxHeight, mediaLayout, formData.media]);

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

  // Combine all errors
  const combinedError = error || messageError || mediaError;

  return (
    <View style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
      {combinedError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{combinedError.message}</Text>
        </View>
      )}
      
      {/* Quick Action Buttons */}
      <View style={styles.quickActions}>
        <Button
          variant="outline"
          onPress={() => handleQuickActionClick('small')}
          style={styles.quickActionButton}
        >
          <Text>Short Text</Text>
        </Button>
        <Button
          variant="outline"
          onPress={() => handleQuickActionClick('long')}
          style={styles.quickActionButton}
        >
          <Text>Long Text</Text>
        </Button>
        <Button
          variant="outline"
          onPress={() => handleQuickActionClick('superfeed')}
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
                      {MEDIA_LAYOUTS.map((layout) => (
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
                            {getMediaLayoutLabel(layout)}
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
                      onPress={handleAddImage}
                      variant="default"
                      size="default"
                      style={styles.mediaButton}
                    >
                      <Text>Add Image</Text>
                    </Button>
                    <Button
                      onPress={handleAddVideo}
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
                <InteractiveContentSection
                  formData={formData}
                  selectedInteractiveType={selectedInteractiveType}
                  onTypeChange={setSelectedInteractiveType}
                  onFormDataChange={handleFormDataChange}
                />
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

        <FeedItemPreview previewData={previewData} previewKey={previewKey} />
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