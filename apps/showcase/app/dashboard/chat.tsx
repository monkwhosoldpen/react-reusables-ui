import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Modal, Pressable, TextInput, Switch, ActivityIndicator } from 'react-native';
import { Text } from '~/components/ui/text';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';
import { Card } from '~/components/ui/card';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChannelMessages } from '~/lib/hooks/useChannelMessages';
import { ChannelMessage, Channel } from '~/lib/types/channel.types';
import FeedScreen from './feed';
import { useChannels } from '~/lib/hooks/useChannels';
import { Button } from '~/components/ui/button';
import { FormDataType, PollData, QuizData, MediaItem, MediaType, SurveyData } from '~/lib/enhanced-chat/types/superfeed';
import { useFeedForm } from '~/lib/hooks/useFeedForm';
import { FeedItem } from '~/lib/enhanced-chat/components/feed/FeedItem';
import { DEFAULT_METADATA } from '~/lib/utils/feedData';
import { useInteractiveContent } from '~/lib/hooks/useInteractiveContent';
import { useRouter } from 'expo-router';

const windowWidth = Dimensions.get('window').width;

function ChatList({ 
  title, 
  description, 
  username, 
  messages, 
  isLoading, 
  error 
}: { 
  title: string; 
  description: string; 
  username: string;
  messages: ChannelMessage[];
  isLoading: boolean;
  error: string | null;
}) {
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const renderMessage = (message: ChannelMessage) => {
    const isCurrentUser = message.username === username;

    return (
      <View
        key={message.id}
        style={[
          styles.messageWrapper,
          isCurrentUser ? styles.sentMessageWrapper : styles.receivedMessageWrapper
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isCurrentUser ?
              { backgroundColor: colorScheme.colors.primary } :
              { backgroundColor: colorScheme.colors.card },
            isCurrentUser ? styles.sentBubble : styles.receivedBubble
          ]}
        >
          {!isCurrentUser && (
            <Text style={[styles.sender, { color: colorScheme.colors.text }]}>
              {message.username || 'Anonymous'}
            </Text>
          )}
          <Text
            style={[
              styles.messageText,
              { color: isCurrentUser ? '#fff' : colorScheme.colors.text }
            ]}
          >
            {message.message_text}
          </Text>
          <Text
            style={[
              styles.timestamp,
              { color: isCurrentUser ? 'rgba(255,255,255,0.7)' : colorScheme.colors.text }
            ]}
          >
            {formatMessageTime(message.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colorScheme.colors.background }]}>
        <ActivityIndicator size="large" color={colorScheme.colors.primary} />
        <Text style={[styles.loadingText, { color: colorScheme.colors.text }]}>
          Loading messages...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colorScheme.colors.background }]}>
        <Text style={[styles.errorText, { color: colorScheme.colors.notification }]}>
          Error: {error}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colorScheme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <Card style={[styles.card, { backgroundColor: colorScheme.colors.background }]}>
        <Text style={[styles.cardTitle, { color: colorScheme.colors.primary }]}>
          {title}
        </Text>
        <Text style={[styles.description, { color: colorScheme.colors.text }]}>
          {description}
        </Text>
      </Card>

      {/* Messages Section */}
      {messages && messages.length > 0 ? (
        messages.map(renderMessage)
      ) : (
        <Text style={[styles.statusText, { color: colorScheme.colors.text }]}>
          No messages yet
        </Text>
      )}
    </ScrollView>
  );
}

export default function ChatScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();
  const insets = useSafeAreaInsets();
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const { channels, isLoading: channelsLoading, error: channelsError } = useChannels('janedoe');
  
  // Fetch messages for the selected channel
  const { 
    messages: channelMessages, 
    isLoading: messagesLoading, 
    error: messagesError,
    channelDetails
  } = useChannelMessages({
    username: selectedChannel?.username || '',
  });

  const transformChannel = (channel: any): Channel => {
    return {
      ...channel,
      is_enhanced_chat: false,
      custom_properties: {},
      related_channels: channel.related_channels?.map((related: any) => ({
        ...related,
        is_enhanced_chat: false,
        custom_properties: {}
      })) || []
    };
  };

  return (
    <View style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
      {/* Sidebar */}
      <View style={[styles.sidebar, { borderRightColor: colorScheme.colors.border }]}>
        <ScrollView style={styles.sidebarScroll}>
          {channelsLoading ? (
            <View style={styles.sidebarLoading}>
              <ActivityIndicator size="small" color={colorScheme.colors.primary} />
              <Text style={[styles.sidebarText, { color: colorScheme.colors.text }]}>
                Loading channels...
              </Text>
            </View>
          ) : channelsError ? (
            <Text style={[styles.sidebarText, { color: colorScheme.colors.notification }]}>
              Error: {channelsError}
            </Text>
          ) : channels.length > 0 ? (
            channels.map((channel) => (
              <TouchableOpacity
                key={channel.username}
                style={[
                  styles.sidebarItem,
                  selectedChannel?.username === channel.username && styles.selectedSidebarItem,
                  { borderBottomColor: colorScheme.colors.border }
                ]}
                onPress={() => {
                  console.log('Channel selected:', channel);
                  setSelectedChannel(transformChannel(channel));
                }}
              >
                <Text style={[styles.sidebarText, { color: colorScheme.colors.text }]}>
                  {channel.username}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={[styles.sidebarText, { color: colorScheme.colors.text }]}>
              No channels available
            </Text>
          )}
        </ScrollView>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {selectedChannel ? (
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <FeedScreen 
              username={selectedChannel.username} 
              messages={channelMessages || []}
            />
          </View>
        ) : (
          <View style={styles.placeholder}>
            <Text style={[styles.placeholderText, { color: colorScheme.colors.text }]}>
              Select a channel to start chatting
            </Text>
          </View>
        )}
      </View>

      {/* Floating Create Button */}
      <TouchableOpacity
        style={[styles.createButton, { right: insets.right + 16, bottom: insets.bottom + 16 }]}
        onPress={() => router.push('/dashboard/create-message')}
      >
        <Text style={styles.createButtonText}>Create</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 200,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  sidebarScroll: {
    flex: 1,
  },
  sidebarItem: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  selectedSidebarItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  sidebarText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sidebarLoading: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mainContent: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    opacity: 0.7,
  },
  scrollContent: {
    padding: 16,
  },
  statusText: {
    textAlign: 'center',
    marginTop: 20,
    opacity: 0.7,
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    lineHeight: 20,
  },
  messageWrapper: {
    marginVertical: 4,
    maxWidth: windowWidth * 0.75,
  },
  sentMessageWrapper: {
    alignSelf: 'flex-end',
  },
  receivedMessageWrapper: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    minWidth: 80,
    maxWidth: '100%',
  },
  sentBubble: {
    borderTopRightRadius: 4,
  },
  receivedBubble: {
    borderTopLeftRadius: 4,
  },
  sender: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    opacity: 0.8,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
    opacity: 0.7,
  },
  createButton: {
    position: 'absolute',
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
}); 