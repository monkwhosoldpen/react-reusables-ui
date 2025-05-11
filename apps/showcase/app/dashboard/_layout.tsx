import React from 'react';
import { Stack } from 'expo-router';
import { View, Text } from 'react-native';

export default function DashboardLayout() {
  return (
    <>
      <View className="py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <View className="px-4">
          <Text className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Dashboard
          </Text>
        </View>
      </View>
      <Stack screenOptions={{
        headerShown: false,
      }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="label-primitive" />
      </Stack>
    </>
  );
}
