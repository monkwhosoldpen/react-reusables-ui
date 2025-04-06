import React from 'react';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { useLocalSearchParams } from 'expo-router';

export default function UserProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text>User Profile: {username}</Text>
    </View>
  );
} 