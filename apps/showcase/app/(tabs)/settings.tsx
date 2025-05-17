'use client';

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Animated, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from "@expo/vector-icons";
import { router } from 'expo-router';
import { useAuth } from '~/lib/core/contexts/AuthContext';
import { NotificationPreference } from '~/components/common/NotificationPreference';
import LanguageChanger from '~/components/common/LanguageChanger';
import { ThemeToggle } from '~/components/ThemeToggle';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSignIn = () => {
    router.push('/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{
          maxWidth: 1200,
          alignSelf: 'center',
          width: '100%',
          paddingTop: 20,
          paddingBottom: insets.bottom + 20,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row flex-wrap">
          {/* Left Column */}
          <View className="w-full md:w-1/2 md:pr-4 mb-8">
            {/* Account Section */}
            <View className="py-3 px-1">
              <Text className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                ACCOUNT
              </Text>
            </View>
            <View className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              {user ? (
                <>
                  <View className="flex-row items-center p-4 border-b border-gray-100 dark:border-gray-700">
                    <View className="w-12 h-12 rounded-full justify-center items-center mr-3 bg-blue-50 dark:bg-blue-900/30">
                      <MaterialIcons 
                        name="person" 
                        size={24} 
                        color={isDark ? '#fff' : '#111827'}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900 dark:text-white">
                        Signed in as
                      </Text>
                      <Text className="text-sm text-gray-600 dark:text-gray-400">
                        {user.email || 'Guest'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    className="m-4 py-3.5 px-6 rounded-xl bg-red-500 flex-row items-center justify-center shadow-sm"
                    onPress={handleSignOut}
                  >
                    <MaterialIcons name="logout" size={20} color="#FFFFFF" />
                    <Text className="ml-2 text-base font-semibold text-white">Sign Out</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  className="flex-row items-center p-4 bg-blue-500"
                  onPress={handleSignIn}
                >
                  <View className="w-12 h-12 rounded-full justify-center items-center mr-3 bg-white/20">
                    <MaterialIcons name="login" size={24} color="#FFFFFF" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-white">
                      Sign In
                    </Text>
                    <Text className="text-sm text-white/80">
                      Sign in to sync your preferences
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* Notifications Section */}
            <View className="py-3 px-1 mt-6">
              <Text className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                NOTIFICATIONS
              </Text>
            </View>
            <View className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden p-4">
              <NotificationPreference />
            </View>

            {/* Appearance Section */}
            <View className="py-3 px-1 mt-6">
              <Text className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                APPEARANCE
              </Text>
            </View>
            <View className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <View className="flex-row items-center p-4 border-b border-gray-100 dark:border-gray-700">
                <View className="w-12 h-12 rounded-full justify-center items-center mr-3 bg-blue-50 dark:bg-blue-900/30">
                  <MaterialIcons 
                    name="dark-mode" 
                    size={24} 
                    color={isDark ? '#fff' : '#111827'}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900 dark:text-white">
                    Dark Mode
                  </Text>
                  <Text className="text-sm text-gray-600 dark:text-gray-400">
                    Use dark theme
                  </Text>
                </View>
                <ThemeToggle />
              </View>
            </View>
          </View>

          {/* Right Column */}
          <View className="w-full md:w-1/2 md:pl-4 mb-8">
            {/* Language Section */}
            <View className="py-3 px-1">
              <Text className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                LANGUAGE
              </Text>
            </View>
            <View className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <View className="flex-row items-center p-4">
                <View className="w-12 h-12 rounded-full justify-center items-center mr-3 bg-blue-50 dark:bg-blue-900/30">
                  <MaterialIcons 
                    name="language" 
                    size={24} 
                    color={isDark ? '#fff' : '#111827'}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900 dark:text-white">
                    App Language
                  </Text>
                  <Text className="text-sm text-gray-600 dark:text-gray-400">
                    Choose your preferred language
                  </Text>
                </View>
                <LanguageChanger variant="settings" />
              </View>
            </View>

            {/* Demo Section */}
            <View className="py-3 px-1 mt-6">
              <Text className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                DEMO
              </Text>
            </View>
            <View className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <TouchableOpacity
                className="flex-row items-center p-4 bg-blue-500"
                onPress={() => router.push('/demo')}
              >
                <View className="w-12 h-12 rounded-full justify-center items-center mr-3 bg-white/20">
                  <MaterialIcons name="dashboard" size={24} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-white">
                    Open Demo
                  </Text>
                  <Text className="text-sm text-white/80">
                    View demo features
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
