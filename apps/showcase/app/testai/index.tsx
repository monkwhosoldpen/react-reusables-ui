import Constants from 'expo-constants';
import { useChat } from '@ai-sdk/react';
import { fetch as expoFetch } from 'expo/fetch';
import { View, TextInput, ScrollView, Text, SafeAreaView, ActivityIndicator } from 'react-native';
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

export default function App() {
  const [selectedModel] = useState(defaultModel);

  const { messages, error, handleInputChange, input, handleSubmit, status } = useChat({
    fetch: (async (url: RequestInfo | URL, options?: RequestInit) => {
      console.log('Making request to:', url);
      console.log('Request options:', JSON.stringify(options, null, 2));
      
      try {
        const origin = __DEV__ ? 'https://showcase.fixd.ai' : 'https://showcase.fixd.ai';
        console.log('Using origin:', origin);

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

        console.log('Response status:', response.status);
        console.log('Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
        
        return response as unknown as Response;
      } catch (error) {
        console.error('Fetch error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        throw error;
      }
    }) as typeof globalThis.fetch,
    api: generateAPIUrl('/api/chat'),
    body: {
      selectedModel,
    },
    onError: error => {
      console.error('Chat error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      if (error instanceof Error) {
        if (error.message.includes("Rate limit")) {
          console.error("Rate limit exceeded. Please try again later.");
        }
      }
    },
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  if (error) return <Text style={{ color: 'red' }}>{error.message}</Text>;

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

        <View style={{ marginTop: 16 }}>
          <TextInput
            style={{
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
            onSubmitEditing={e => {
              handleSubmit(e);
              e.preventDefault();
            }}
            editable={!isLoading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}