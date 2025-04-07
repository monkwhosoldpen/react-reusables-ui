import type {
  MaterialTopTabNavigationEventMap,
  MaterialTopTabNavigationOptions,
} from '@react-navigation/material-top-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';

type TabNavigationState = {
  index: number;
  routes: Array<{ key: string; name: string }>;
};

type ParamListBase = {
  [key: string]: object | undefined;
};

const { Navigator } = createMaterialTopTabNavigator();

const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState,
  MaterialTopTabNavigationEventMap
>(Navigator);

export default function SupermenuTabsLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <MaterialTopTabs
      initialRouteName='index'
      screenOptions={{
        tabBarActiveTintColor: colorScheme.colors.primary,
        tabBarInactiveTintColor: colorScheme.colors.text,
        tabBarLabelStyle: {
          fontSize: 14,
          textTransform: 'capitalize',
          fontWeight: 'bold',
        },
        tabBarIndicatorStyle: {
          backgroundColor: colorScheme.colors.primary,
        },
        tabBarScrollEnabled: true,
        tabBarItemStyle: { width: 'auto', minWidth: 100 },
        tabBarStyle: {
          backgroundColor: colorScheme.colors.card,
        },
      }}
    >
      <MaterialTopTabs.Screen
        name='index'
        options={{
          title: 'Home',
        }}
      />
      <MaterialTopTabs.Screen
        name='store'
        options={{
          title: 'Store',
        }}
      />
      <MaterialTopTabs.Screen
        name='services'
        options={{
          title: 'Services',
        }}
      />
    </MaterialTopTabs>
  );
} 