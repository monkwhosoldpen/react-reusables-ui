import type {
  MaterialTopTabNavigationEventMap,
  MaterialTopTabNavigationOptions,
} from '@react-navigation/material-top-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import {
  useTheme,
  type ParamListBase,
  type TabNavigationState,
} from '@react-navigation/native';
import { Stack, withLayoutContext } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import { CommonHeader } from '~/components/CommonHeader';

const { Navigator } = createMaterialTopTabNavigator();

const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

export default function MaterialTopTabsLayout() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  return (
    <>
      <CommonHeader showBackButton />
      <Stack.Screen options={{ headerShadowVisible: false }} />
      <MaterialTopTabs
        initialRouteName='index'
        options={{}}
        screenOptions={{
          tabBarStyle: {
            backgroundColor: colors.background,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.text,
        }}
      >
        <MaterialTopTabs.Screen
          name='index'
          options={{
            title: 'UI',
          }}
        />
        <MaterialTopTabs.Screen
          name='sample'
          options={{
            title: 'Sample',
          }}
        />
      </MaterialTopTabs>
    </>
  );
}
