import React from 'react';
import { Tabs } from 'expo-router';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { Home, Settings, MessageSquare } from 'lucide-react-native';

export default function TabLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colorScheme.colors.card,
          borderTopColor: colorScheme.colors.border,
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarActiveTintColor: colorScheme.colors.primary,
        tabBarInactiveTintColor: colorScheme.colors.text,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
        tabBarItemStyle: {
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MessageSquare size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
} 