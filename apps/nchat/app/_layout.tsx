import { Stack } from 'expo-router';
import { View } from 'react-native';
import { Providers } from '@/lib/providers/Providers';
import { CommonHeader } from '@/components/CommonHeader';

export default function Layout() {
  return (
    <Providers>
      <RootLayout />
    </Providers>
  );
}

function RootLayout() {
  return (
    <View style={{ flex: 1 }}>
      <CommonHeader />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
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
      </Stack>
    </View>
  );
}
