import React from 'react';
import { Stack, Tabs } from 'expo-router';
import { View } from 'react-native';
import { Providers } from '@/lib/providers/Providers';
import { CommonHeader } from '@/components/CommonHeader';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';
import { Home, Settings, Bell, MessageSquare, Menu } from 'lucide-react-native';

export default function Layout() {
  return (
    <Providers>
      <RootLayout />
    </Providers>
  );
}

function RootLayout() {
  const { user, loading } = useAuth();
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();

  if (user) {
    return (
      <View style={{ flex: 1 }}>
        <CommonHeader />
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
          <Tabs.Screen
            name="[username]"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="(tabs)"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="(modals)"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="+not-found"
            options={{
              href: null,
            }}
          />
        </Tabs>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(modals)"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
      </Stack>
    </View>
  );
}
