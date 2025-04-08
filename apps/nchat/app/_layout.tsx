import React from 'react';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { Providers } from '@/lib/providers/Providers';
import { CommonHeader } from '@/components/CommonHeader';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function Layout() {
  return (
    <Providers>
      <RootLayout />
    </Providers>
  );
}

function RootLayout() {
  const { user, loading } = useAuth();

  return (
    <View style={{ flex: 1 }}>
      {user && <CommonHeader />}
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        {!user ? (
          <Stack.Screen
            name="login"
            options={{
              headerShown: false,
            }}
          />
        ) : (
          <>
            <Stack.Screen
              name="(tabs)"
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
          </>
        )}
      </Stack>
    </View>
  );
}
