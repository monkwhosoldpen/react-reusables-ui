import React, { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Text } from '~/components/ui/text';
import { Input } from '~/components/ui/input';
import { Channel } from '~/lib/types/channel.types';
import { ArrowUp } from 'lucide-react-native';

interface AgentChatProps {
  username: string;
  channelDetails: Channel;
}

interface SuggestedPrompt {
  title: string;
  description: string;
}

export function AgentChat({ username, channelDetails }: AgentChatProps) {
  const [message, setMessage] = useState('');

  const suggestedPrompts: SuggestedPrompt[] = [
    {
      title: "What are the advantages",
      description: "of using Next.js?"
    },
    {
      title: "Write code to",
      description: "demonstrate dijkstra's algorithm"
    },
    {
      title: "Help me write an essay",
      description: "about silicon valley"
    },
    {
      title: "What is the weather",
      description: "in San Francisco?"
    }
  ];

  const handleSendMessage = () => {
    if (!message.trim()) return;
    // TODO: Implement message sending
    setMessage('');
  };

  return (
    <View className="flex-1 flex-col h-full">
      {/* Chat Content */}
      <ScrollView className="flex-1 px-4">
        {/* Welcome Message */}
        <View className="mb-8">
          <Text className="text-2xl font-bold mb-2">Hello there!</Text>
          <Text className="text-lg text-muted-foreground">How can I help you today?</Text>
        </View>

        {/* Suggested Prompts Grid */}
        <View className="flex-row flex-wrap gap-4">
          {suggestedPrompts.map((prompt, index) => (
            <Pressable
              key={index}
              className="flex-col p-4 rounded-lg border border-border bg-card w-[calc(50%-8px)]"
              onPress={() => setMessage(prompt.title + " " + prompt.description)}
            >
              <Text className="font-medium mb-1">{prompt.title}</Text>
              <Text className="text-sm text-muted-foreground">{prompt.description}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Message Input */}
      <View className="p-4 border-t border-border">
        <View className="flex-row items-center gap-2">
          <Input
            value={message}
            onChangeText={setMessage}
            placeholder="Send a message..."
            style={{ flex: 1 }}
            multiline
          />
          <Pressable
            onPress={handleSendMessage}
            className="w-10 h-10 rounded-full bg-primary items-center justify-center"
            disabled={!message.trim()}
          >
            <ArrowUp size={20} color="white" />
          </Pressable>
        </View>
      </View>
    </View>
  );
} 