import Constants from 'expo-constants';
import { useChat } from '@ai-sdk/react';
import { fetch as expoFetch } from 'expo/fetch';
import {
  View,
  TextInput,
  ScrollView,
  Text,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { useState } from 'react';
import { defaultModel } from '~/lib/ai/providers';

export const generateAPIUrl = (relativePath: string) => {
  const isDevelopment = __DEV__;
  const url = !isDevelopment 
    ? 'https://ai.fixd.ai/api/chat'
    : 'https://ai.fixd.ai/api/chat';
  console.log('API URL:', url);
  return url;
};

export default function AiChat() {
  const [selectedModel] = useState(defaultModel);

  const { messages, error, handleInputChange, input, handleSubmit, status } = useChat({
    fetch: (async (url: RequestInfo | URL, options?: RequestInit) => {
      const origin = __DEV__ ? 'https://showcase.fixd.ai' : 'https://showcase.fixd.ai';

      const response = await expoFetch(url as string, {
        ...options,
        headers: {
          ...options?.headers,
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Origin': origin,
          'X-Requested-With': 'XMLHttpRequest'
        },
        mode: 'cors',
        credentials: 'include'
      });

      return response as unknown as Response;
    }) as typeof globalThis.fetch,
    api: generateAPIUrl('/api/chat'),
    body: { selectedModel },
    onError: error => {
      console.error('Chat error:', error.message);
    },
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  const suggestedPrompts = [
    'What can you do?',
    'Tell me a fun fact!',
    'Give me some productivity tips.'
  ];

  const onPromptPress = (prompt: string) => {
    const event = {
      preventDefault: () => {},
      target: {
        value: prompt,
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    handleInputChange(event);

    // Trigger submit immediately
    handleSubmit({
      ...event,
      nativeEvent: { text: prompt },
      preventDefault: () => {},
    } as unknown as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ flex: 1, padding: 16 }}>
        <ScrollView style={{ flex: 1 }}>
          {messages.length === 0 ? (
            <View style={{ padding: 20 }}>
              <Text style={{ fontSize: 18, textAlign: 'center' }}>
                Welcome to the Chat Interface
              </Text>
              <Text style={{ marginTop: 10, textAlign: 'center' }}>
                Start a conversation by typing a message below.
              </Text>

              <View style={{ marginTop: 20 }}>
                {suggestedPrompts.map((prompt, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => onPromptPress(prompt)}
                    style={{
                      backgroundColor: '#eee',
                      padding: 10,
                      borderRadius: 8,
                      marginBottom: 10
                    }}
                  >
                    <Text style={{ textAlign: 'center' }}>{prompt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            messages.map(m => (
              <View key={m.id} style={{ marginVertical: 8, padding: 10, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>{m.role}</Text>
                <Text>{m.content}</Text>
              </View>
            ))
          )}
          {isLoading && (
            <View style={{ padding: 10 }}>
              <ActivityIndicator size="small" color="#0000ff" />
            </View>
          )}
        </ScrollView>

        {/* Input + Send Button */}
        <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            style={{
              flex: 1,
              backgroundColor: '#f5f5f5',
              padding: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#ddd'
            }}
            placeholder="Type your message..."
            value={input}
            onChange={e =>
              handleInputChange({
                ...e,
                target: {
                  ...e.target,
                  value: e.nativeEvent.text,
                },
              } as unknown as React.ChangeEvent<HTMLInputElement>)
            }
            editable={!isLoading}
          />
          <TouchableOpacity
            onPress={() =>
              handleSubmit({
                preventDefault: () => {},
                nativeEvent: { text: input }
              } as any)
            }
            style={{
              marginLeft: 10,
              backgroundColor: '#007bff',
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 8
            }}
            disabled={isLoading || !input.trim()}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
