import React from 'react';
import { View } from 'react-native';
import Messages from '~/components/chat/Messages';
import ChatInput from '~/components/chat/ChatInput';

export function ChatContent({ username }: { username: string }) {
  // Mock data
  const channelMessages = [{ id: 1, text: 'Hello!' }, { id: 2, text: 'How are you?' }];
  const scrollViewRef = React.useRef(null);
  const loading = false;
  const goat = { is_premium: false };
  const activeChannelId = 'channel_1';
  const newMessage = '';
  const channel = { fname: 'General', name: 'general' };
  const wsStatus = 'connected';

  return (
    <>
      <View className="flex-1">
      </View>

      <ChatInput
        value={newMessage}
        onChangeText={(text) => console.log('Message changed:', text)}
        onSend={() => console.log('Message sent')}
        channelName={channel.fname || channel.name}
        isConnected={wsStatus === 'connected'}
      />
    </>
  );
}

export default ChatContent; 