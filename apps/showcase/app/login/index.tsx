'use client';

import { View, SafeAreaView, useWindowDimensions, useColorScheme } from 'react-native';
import LoginCommon from '~/components/common/LoginCommon';
import { useAuth } from '~/lib/core/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';

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
        <View className="w-full max-w-[400px] rounded-2xl bg-white dark:bg-gray-800 shadow-md">
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
    </SafeAreaView>
  );
} 