import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import ChatScreen from '~/components/dashboard/chat';

export default function UserChatScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  
  return <ChatScreen username={username} />;
} 