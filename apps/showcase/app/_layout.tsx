import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Theme, ThemeProvider, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { DeprecatedUi } from '@rnr/reusables';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { Platform, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Text } from '~/components/ui/text';
import { setAndroidNavigationBar } from '~/lib/android-navigation-bar';
import { NAV_THEME } from '~/lib/core/constants/constants';
import { Providers } from '~/lib/core/providers/Providers';
import { registerServiceWorker } from '../lib/core/utils/register-sw';
import { useEffect } from 'react';
import { ThemeToggle } from '~/components/ThemeToggle';

const { ToastProvider } = DeprecatedUi;

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const hasMounted = React.useRef(false);
  const colorScheme = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

  useEffect(() => {
    registerServiceWorker();
  }, []);
  
  useIsomorphicLayoutEffect(() => {
    if (hasMounted.current) {
      return;
    }

    if (Platform.OS === 'web') {
      // Adds the background color to the html element to prevent white background on overscroll.
      document.documentElement.classList.add('bg-background');
    }
    setAndroidNavigationBar(colorScheme);
    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
  }, []);

  if (!isColorSchemeLoaded) {
    return null;
  }

  return (
    <>
      <Providers>
        <ThemeProvider value={colorScheme === 'dark' ? DARK_THEME : LIGHT_THEME}>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <GestureHandlerRootView style={{ flex: 1 }}>
            <BottomSheetModalProvider>
              <Stack
                initialRouteName='(tabs)'
                screenOptions={{
                  headerShown: false,
                  headerBackTitle: 'Back',
                  headerTitle(props) {
                    return <Text className='text-xl font-semibold'>{toOptions(props.children)}</Text>;
                  },
                  headerRight: () => <ThemeToggle />,
                }}
              >
                <Stack.Screen
                  name='(tabs)'
                  options={{
                    headerShown: false,
                  }}
                />
              </Stack>
            </BottomSheetModalProvider>
            <PortalHost />
          </GestureHandlerRootView>
          <ToastProvider />
        </ThemeProvider>
      </Providers>
    </>
  );
}

const useIsomorphicLayoutEffect =
  Platform.OS === 'web' && typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;

function toOptions(name: string) {
  const title = name
    .split('-')
    .map(function (str: string) {
      return str.replace(/\b\w/g, function (char) {
        return char.toUpperCase();
      });
    })
    .join(' ');
  return title;
}
