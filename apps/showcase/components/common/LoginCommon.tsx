'use client';

import React from 'react';
import { View, Animated } from 'react-native';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import { ActivityIndicator } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";

export default function LoginCommon({
  email,
  setEmail,
  password,
  setPassword,
  error,
  isLoading,
  handleSubmit,
  handleAnonymousSignIn,
  handleGuestSignIn,
  onCancel,
}: {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  error: string;
  isLoading: boolean;
  handleSubmit: () => void;
  handleAnonymousSignIn: () => void;
  handleGuestSignIn: () => void;
  onCancel: () => void;
}) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const [isEmailLoading, setIsEmailLoading] = React.useState(false);
  const [isAnonymousLoading, setIsAnonymousLoading] = React.useState(false);
  const [isGuestLoading, setIsGuestLoading] = React.useState(false);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleEmailSubmit = async () => {
    setIsEmailLoading(true);
    try {
      await handleSubmit();
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleAnonymousSubmit = async () => {
    setIsAnonymousLoading(true);
    try {
      await handleAnonymousSignIn();
    } finally {
      setIsAnonymousLoading(false);
    }
  };

  const handleGuestSubmit = async () => {
    setIsGuestLoading(true);
    try {
      await handleGuestSignIn();
    } finally {
      setIsGuestLoading(false);
    }
  };

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <View className="p-6">
        <View className="space-y-4">
          <Input
            placeholder="Email"
            placeholderTextColor="#64748B"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isEmailLoading}
            accessibilityLabel="Email input"
            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          />

          <Input
            placeholder="Password"
            placeholderTextColor="#64748B"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isEmailLoading}
            accessibilityLabel="Password input"
            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          />
        </View>

        {error ? (
          <Text className="mt-3 text-sm text-red-500">{error}</Text>
        ) : null}

        <Button
          onPress={handleEmailSubmit}
          disabled={isEmailLoading || isAnonymousLoading || isGuestLoading}
          accessibilityLabel="Sign in with email button"
          className="mt-4 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          <View className="flex-row items-center gap-2">
            {isEmailLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <MaterialIcons name="email" size={20} color="white" />
            )}
            <Text className="text-base font-semibold text-white">
              {isEmailLoading ? 'Signing in...' : 'Sign in with Email'}
            </Text>
          </View>
        </Button>

        <View className="my-6 h-px bg-gray-200 dark:bg-gray-700" />

        <View className="space-y-3">
          <Button
            onPress={handleAnonymousSubmit}
            disabled={isEmailLoading || isAnonymousLoading || isGuestLoading}
            accessibilityLabel="Continue anonymously button"
            className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            <View className="flex-row items-center gap-2">
              {isAnonymousLoading ? (
                <ActivityIndicator size="small" color="#64748B" />
              ) : (
                <MaterialIcons name="person" size={20} color="#64748B" />
              )}
              <Text className="text-base font-semibold text-gray-700 dark:text-gray-200">
                {isAnonymousLoading ? 'Signing in...' : 'Continue Anonymously'}
              </Text>
            </View>
          </Button>

          <Button
            onPress={handleGuestSubmit}
            disabled={isEmailLoading || isAnonymousLoading || isGuestLoading}
            accessibilityLabel="Continue as guest button"
            className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            <View className="flex-row items-center gap-2">
              {isGuestLoading ? (
                <ActivityIndicator size="small" color="#64748B" />
              ) : (
                <MaterialIcons name="person-outline" size={20} color="#64748B" />
              )}
              <Text className="text-base font-semibold text-gray-700 dark:text-gray-200">
                {isGuestLoading ? 'Signing in...' : 'Continue as Guest'}
              </Text>
            </View>
          </Button>

          <Button
            onPress={() => {
              setEmail('monkwhosoldpen@gmail.com');
              setPassword('password');
              handleSubmit();
            }}
            disabled={isEmailLoading || isAnonymousLoading || isGuestLoading}
            accessibilityLabel="Demo login button"
            className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            <View className="flex-row items-center gap-2">
              {isEmailLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <MaterialIcons name="play-circle-outline" size={20} color="white" />
              )}
              <Text className="text-base font-semibold text-white">
                {isEmailLoading ? 'Signing in...' : 'Demo Login'}
              </Text>
            </View>
          </Button>
        </View>
      </View>
    </Animated.View>
  );
}
