'use client';

import { useAuth } from '~/lib/core/contexts/AuthContext';
import { Button } from '~/components/ui/button';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Text, View, ScrollView, SafeAreaView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';
  
  // If still loading, show nothing to prevent flash
  if (loading) {
    return null;
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: insets.bottom + 16,
          paddingTop: 16
        }}
      >
        <View className={`mx-4 mb-4 p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <View className="items-center gap-4">
            <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              nchat
            </Text>
            <Text className={`text-lg text-center ${isDark ? 'text-gray-300' : 'text-gray-700'} opacity-80`}>
              Your messaging app for everyday communication
            </Text>
            <Text className={`text-base text-center ${isDark ? 'text-gray-400' : 'text-gray-600'} opacity-70`}>
              Connect with friends, family, and colleagues in a simple, secure environment.
              Share messages, media, and more with our intuitive platform.
            </Text>
            {user ? (
              <Button
                size="lg"
                onPress={() => router.push('/feed')}
                className="mt-4 bg-blue-500 rounded-xl w-full"
              >
                <Text className="text-base font-semibold text-white">
                  Feed
                </Text>
              </Button>
            ) : (
              <Button
                size="lg"
                onPress={() => router.push('/login')}
                className="mt-4 bg-blue-500 rounded-xl w-full"
              >
                <Text className="text-base font-semibold text-white">
                  Get Started
                </Text>
              </Button>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

