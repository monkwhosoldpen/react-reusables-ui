import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { FeedItem } from '~/lib/enhanced-chat/components/feed/FeedItem';
import { FormDataType } from '~/lib/enhanced-chat/types/superfeed';
import { Text } from '~/components/ui/text';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';

interface ChannelSuperfeedProps {
  messages: FormDataType[] | null;
  messagesLoading: boolean;
  messagesError?: string | null;
  messagesEndRef?: React.RefObject<View>;
}

export function ChannelSuperfeed({
  messages,
  messagesLoading,
  messagesError,
  messagesEndRef
}: ChannelSuperfeedProps) {
  const { colorScheme } = useColorScheme();

  if (messagesLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading messages...</Text>
      </View>
    );
  }

  if (messagesError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{messagesError}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {(messages || []).map((message, index) => (
        <View 
          key={message.id || index} 
          style={[
            styles.messageItem, 
            { 
              borderColor: colorScheme.colors.border,
              backgroundColor: colorScheme.colors.background,
            }
          ]}
        >
          <FeedItem
            data={message}
            showHeader={message.metadata?.visibility?.header ?? true}
            showFooter={message.metadata?.visibility?.footer ?? false}
          />
        </View>
      ))}
      <View ref={messagesEndRef} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '500',
  },
  messageItem: {
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  }
}); 