'use client';

import { View, SafeAreaView, useWindowDimensions, useColorScheme } from 'react-native';
import LoginCommon from '~/components/common/LoginCommon';
import { useAuth } from '~/lib/core/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { MaterialIcons } from "@expo/vector-icons";
import { Text } from '~/components/ui/text';

export default function LoginPage() {
  const { signIn, signInAnonymously, signInAsGuest, user, userInfo, loading } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width, height } = useWindowDimensions();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Check if user is already logged in
  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signInAnonymously();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in anonymously');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signInAsGuest();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in as guest');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1 justify-center items-center px-4">
        <View className="w-full max-w-[400px] rounded-xl bg-white dark:bg-gray-800 shadow-sm">
          <View className="p-6">
            <View className="mb-4">
              <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                SIGN IN
              </Text>
            </View>
            <View className="flex-row items-center mb-6">
              <View className="w-12 h-12 rounded-full justify-center items-center mr-3 bg-blue-100 dark:bg-blue-900/20 shadow-sm">
                <MaterialIcons name="login" size={24} color={isDark ? '#60A5FA' : '#3B82F6'} />
              </View>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Welcome back
                </Text>
                <Text className="text-base text-gray-600 dark:text-gray-300">
                  Sign in to access your account and continue where you left off
                </Text>
              </View>
            </View>

            <LoginCommon
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              error={error}
              isLoading={isLoading}
              handleSubmit={handleSubmit}
              handleAnonymousSignIn={handleAnonymousSignIn}
              handleGuestSignIn={handleGuestSignIn}
              onCancel={() => { }}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
} 