'use client';

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Animated, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from "@expo/vector-icons";
import { router } from 'expo-router';
import { useAuth } from '~/lib/core/contexts/AuthContext';
import { Switch } from '~/components/ui/switch';
import { cn } from '~/lib/utils';
import { NotificationPreference } from '~/components/common/NotificationPreference';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Button } from '~/components/ui/button';
import { ChevronDown } from '~/lib/icons/ChevronDown';
import { Muted } from '~/components/ui/typography';
import LanguageChanger from '~/components/common/LanguageChanger';

const contentInsets = {
  left: 12,
  right: 12,
};

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isDarkMode, setIsDarkMode] = React.useState(isDark);

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

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
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
              <Text className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                ACCOUNT
              </Text>
            </View>
            <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm overflow-hidden`}>
              {user ? (
                <>
                  <View className={`flex-row items-center p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                    <View className={`w-12 h-12 rounded-full justify-center items-center mr-3 ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                      <MaterialIcons 
                        name="person" 
                        size={24} 
                        color={isDark ? '#fff' : '#111827'}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Signed in as
                      </Text>
                      <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
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
              <Text className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                NOTIFICATIONS
              </Text>
            </View>
            <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm overflow-hidden p-4`}>
              <NotificationPreference showDescription={true} showDebug={false} />
            </View>

            {/* Appearance Section */}
            <View className="py-3 px-1 mt-6">
              <Text className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                APPEARANCE
              </Text>
            </View>
            <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm overflow-hidden`}>
              <View className={`flex-row items-center p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                <View className={`w-12 h-12 rounded-full justify-center items-center mr-3 ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                  <MaterialIcons 
                    name="dark-mode" 
                    size={24} 
                    color={isDark ? '#fff' : '#111827'}
                  />
                </View>
                <View className="flex-1">
                  <Text className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Dark Mode
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Use dark theme
                  </Text>
                </View>
                <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
              </View>
            </View>
          </View>

          {/* Right Column */}
          <View className="w-full md:w-1/2 md:pl-4 mb-8">
            {/* Language Section */}
            <View className="py-3 px-1">
              <Text className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                LANGUAGE
              </Text>
            </View>
            <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm overflow-hidden`}>
              <View className="flex-row items-center p-4">
                <View className={`w-12 h-12 rounded-full justify-center items-center mr-3 ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                  <MaterialIcons 
                    name="language" 
                    size={24} 
                    color={isDark ? '#fff' : '#111827'}
                  />
                </View>
                <View className="flex-1">
                  <Text className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    App Language
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Choose your preferred language
                  </Text>
                </View>
                <LanguageChanger variant="settings" />
              </View>
            </View>

            {/* Demo Section */}
            <View className="py-3 px-1 mt-6">
              <Text className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                DEMO
              </Text>
            </View>
            <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm overflow-hidden`}>
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

function ThemeDropdownSelect({ 
  defaultValue, 
  onValueChange 
}: { 
  defaultValue: string;
  onValueChange: (value: string) => void;
}) {
  const [value, setValue] = React.useState(defaultValue);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex-row items-center gap-2 pr-3"
        >
          <Text className={isDark ? 'text-white' : 'text-gray-900'}>{value}</Text>
          <ChevronDown size={18} className={isDark ? 'text-white' : 'text-gray-900'} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" insets={contentInsets} className="w-64 native:w-72">
        <DropdownMenuLabel>Select theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="gap-1">
          <DropdownMenuItem
            onPress={() => {
              setValue('whatsapp');
              onValueChange('whatsapp');
            }}
            className={cn(
              'flex-col items-start gap-1',
              value === 'whatsapp' ? 'bg-secondary/70' : ''
            )}
          >
            <Text>WhatsApp</Text>
            <Muted>Modern messaging theme</Muted>
          </DropdownMenuItem>
          <DropdownMenuItem
            onPress={() => {
              setValue('ghiblistudio');
              onValueChange('ghiblistudio');
            }}
            className={cn(
              'flex-col items-start gap-1',
              value === 'ghiblistudio' ? 'bg-secondary/70' : ''
            )}
          >
            <Text>Studio Ghibli</Text>
            <Muted>Animated movie inspired theme</Muted>
          </DropdownMenuItem>
          <DropdownMenuItem
            onPress={() => {
              setValue('redblack');
              onValueChange('redblack');
            }}
            className={cn(
              'flex-col items-start gap-1',
              value === 'redblack' ? 'bg-secondary/70' : ''
            )}
          >
            <Text>Red-Black</Text>
            <Muted>High contrast theme</Muted>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}