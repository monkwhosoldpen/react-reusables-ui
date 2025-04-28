import React from 'react';
import { View, ScrollView } from 'react-native';
import { Card } from '~/components/ui/card';
import { FeedItem } from '~/lib/enhanced-chat/components/feed/FeedItem';
import { FormDataType } from '~/lib/enhanced-chat/types/superfeed';
import { createMessageStyles } from '~/lib/utils/createMessageStyles';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';

interface FeedItemPreviewProps {
  previewData: FormDataType;
  previewKey: number;
}

export const FeedItemPreview: React.FC<FeedItemPreviewProps> = ({ previewData, previewKey }) => {
  const { colorScheme } = useColorScheme();
  const styles = createMessageStyles(colorScheme);

  return (
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
  );
}; 