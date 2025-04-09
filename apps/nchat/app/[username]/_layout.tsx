import React from 'react';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { CommonHeader } from '@/components/CommonHeader';

export default function UsernameLayout() {
  return (
    <View style={{ flex: 1 }}>
      <CommonHeader />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </View>
  );
} 