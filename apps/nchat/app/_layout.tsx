import { Stack } from 'expo-router';
import { View } from 'react-native';
import { Providers } from '~/lib/providers/Providers';
import { useTheme } from '~/lib/providers/theme/ThemeProvider';

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
      <Stack
        screenOptions={{
          headerStyle: {
          },
          headerShadowVisible: false,
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
          },
          animation: 'fade',
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </View>
  );
}
