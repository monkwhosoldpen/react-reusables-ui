import React from 'react';
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
import { useWindowDimensions, View } from 'react-native';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';
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
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();
  const { width } = useWindowDimensions();

  // Apply design system tokens
  const tabBarLabelStyle = {
    fontSize: Number(design.spacing.fontSize.sm),
    textTransform: 'none' as const,
    fontWeight: '600' as const,
  };

  const tabBarItemStyle = {
    width: width / 2,
  };

  return (
    <View style={{ flex: 1, backgroundColor: colorScheme.colors.background }}>
      <CommonHeader title="Dashboard" showBackButton />
      <MaterialTopTabs
        initialRouteName='index'
        screenOptions={{
          tabBarActiveTintColor: colorScheme.colors.primary,
          tabBarInactiveTintColor: colorScheme.colors.text,
          tabBarLabelStyle,
          tabBarIndicatorStyle: {
            backgroundColor: colorScheme.colors.primary,
          },
          tabBarScrollEnabled: true,
          tabBarItemStyle,
          tabBarStyle: {
            backgroundColor: colorScheme.colors.background,
            elevation: 0,
            shadowOpacity: 0,
          },
        }}
      >
        <MaterialTopTabs.Screen
          name='index'
          options={{
            title: 'UI',
          }}
        />
        <MaterialTopTabs.Screen
          name='primitives'
          options={{
            title: 'Primitives',
          }}
        />
      </MaterialTopTabs>
    </View>
  );
}
