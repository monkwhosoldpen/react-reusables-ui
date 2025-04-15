import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Text } from '~/components/ui/text';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';
import { Card } from '~/components/ui/card';
import { mockTenant } from '../../components/dashboard/mocktenant';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChannelMessages } from '~/lib/hooks/useChannelMessages';
import { ChannelMessage } from '~/lib/types/channel.types';

const windowWidth = Dimensions.get('window').width;

function ChatList({ title, description, username }: { title: string; description: string; username: string }) {
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();

  // Initialize the hook to fetch messages
  const {
    isLoading,
    error,
    channelDetails,
    messages
  } = useChannelMessages({ 
    username,
  });

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
        {isLoading && (
          <Text style={[styles.description, { color: colorScheme.colors.text }]}>
            Loading channel details...
          </Text>
        )}
        {error && (
          <Text style={[styles.description, { color: colorScheme.colors.notification }]}>
            Error: {error}
          </Text>
        )}
        {channelDetails && (
          <Text style={[styles.description, { color: colorScheme.colors.text }]}>
            Channel details loaded
          </Text>
        )}
      </Card>

      {/* Messages Section */}
      {isLoading ? (
        <Text style={[styles.statusText, { color: colorScheme.colors.text }]}>
          Loading messages...
        </Text>
      ) : error ? (
        <Text style={[styles.statusText, { color: colorScheme.colors.notification }]}>
          Error loading messages: {error}
        </Text>
      ) : messages && messages.length > 0 ? (
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
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();
  const insets = useSafeAreaInsets();
  const [selectedChannel, setSelectedChannel] = useState<typeof mockTenant.related_channels[0] | null>(null);

  const handleChannelSelect = (channel: typeof mockTenant.related_channels[0]) => {
    console.log('Selected channel:', {
      username: channel.username,
      is_agent: channel.is_agent,
      is_premium: channel.is_premium,
      is_public: channel.is_public
    });
    setSelectedChannel(channel);
  };

  return (
    <View style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
      {/* Sidebar */}
      <View style={[styles.sidebar, { backgroundColor: colorScheme.colors.card }]}>
        <ScrollView style={styles.sidebarScroll}>
          {mockTenant.related_channels.map((channel) => (
            <TouchableOpacity
              key={channel.username}
              style={[
                styles.sidebarItem,
                selectedChannel?.username === channel.username && styles.selectedSidebarItem,
                { backgroundColor: selectedChannel?.username === channel.username ? colorScheme.colors.primary : 'transparent' }
              ]}
              onPress={() => handleChannelSelect(channel)}
            >
              <Text
                style={[
                  styles.sidebarText,
                  { color: selectedChannel?.username === channel.username ? '#fff' : colorScheme.colors.text }
                ]}
              >
                {channel.username.replace('janedoe_', '').replace(/_/g, ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {selectedChannel ? (
          <ChatList 
            title={selectedChannel.username.replace('janedoe_', '').replace(/_/g, ' ')}
            description={`Channel type: ${selectedChannel.is_agent ? 'Agent' : 'Regular'} | Premium: ${selectedChannel.is_premium ? 'Yes' : 'No'} | Public: ${selectedChannel.is_public ? 'Yes' : 'No'}`}
            username={selectedChannel.username}
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={[styles.placeholderText, { color: colorScheme.colors.text }]}>
              Select a channel to start chatting
            </Text>
          </View>
        )}
      </View>
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
    borderRightColor: '#ccc',
  },
  sidebarScroll: {
    flex: 1,
  },
  sidebarItem: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  selectedSidebarItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  sidebarText: {
    fontSize: 14,
    fontWeight: '500',
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
}); 