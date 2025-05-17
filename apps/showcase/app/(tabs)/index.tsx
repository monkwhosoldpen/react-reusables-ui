import { useAuth } from '~/lib/core/contexts/AuthContext';
import { MainScreen } from "~/components/home/main";
import { View, ActivityIndicator, Text } from 'react-native';
import React from 'react';
import { Landing } from '~/components/home/landing';

export default function Index() {
  const { user, loading, userInfo } = useAuth();

  if ((user)) {
    return <MainScreen/>;
  }

  // If no user and not loading, show landing
  if (!loading) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900">
        <Landing />
      </View>
    );
  }

  // During loading with no cache, show a blank screen with app background
  return (
    <View className="flex-1 justify-center items-center p-6 bg-white dark:bg-gray-900">
      <View className="w-full max-w-md mx-auto p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-xl">
        <ActivityIndicator size="large" className="text-blue-500" />
        <Text className="mt-6 text-2xl font-bold text-center text-gray-900 dark:text-white">
          Loading...
        </Text>
        <Text className="mt-3 text-base text-center text-gray-600 dark:text-gray-300">
          Getting your data ready
        </Text>
      </View>
    </View>
  );
}
