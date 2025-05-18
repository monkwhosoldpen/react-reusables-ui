'use client';

import { Tabs, useRouter } from 'expo-router';
import { Menu, Settings } from 'lucide-react-native';
import { LayoutPanelLeft } from '~/lib/icons/LayoutPanelLeft';
import { CommonHeader } from '~/components/common/CommonHeader';
import { View, useWindowDimensions, TouchableOpacity, ActivityIndicator, SafeAreaView, useColorScheme } from 'react-native';
import { Text } from '~/components/ui/text';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import type { NavigationProp } from '@react-navigation/native';
import type { LucideIcon } from 'lucide-react-native';
import { cn } from '~/lib/utils';

interface NavigationItem {
  name: string;
  icon: LucideIcon;
  route: string;
}

export default function TabsLayout() {
  const { width } = useWindowDimensions();
  const isMdAndAbove = width >= 768;
  const router = useRouter();

  const navigationItems: NavigationItem[] = [
    {
      name: 'Chats',
      icon: LayoutPanelLeft,
      route: 'index',
    },
    {
      name: 'Settings',
      icon: Settings,
      route: 'settings',
    },
  ];

  const tabBarOptions: BottomTabNavigationOptions = {
    header: ({ navigation, route, options }: { 
      navigation: NavigationProp<any>; 
      route: any; 
      options: any; 
    }) => (
      isMdAndAbove ? null : (
        <CommonHeader
          title={options.title || route.name}
          showBackButton={navigation.canGoBack()}
          onBackPress={() => navigation.goBack()}
        />
      )
    ),
    tabBarStyle: {
      borderTopWidth: 1,
      height: 60,
      paddingBottom: 4,
      elevation: 3,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      display: isMdAndAbove ? 'none' : 'flex',
    },
    tabBarLabelStyle: {
      marginBottom: 0,
      fontWeight: '600',
    },
    tabBarIconStyle: {
      marginBottom: -4,
    },
  };

  const renderSidebarItem = (item: NavigationItem) => {
    const Icon = item.icon;
    return (
      <TouchableOpacity
        key={item.name}
        onPress={() => router.push(item.route === 'index' ? '/' : `/(tabs)/${item.route}`)}
        className={cn(
          "flex-row items-center py-3 px-4 gap-3 rounded-lg mx-2",
          "active:bg-gray-100 dark:active:bg-gray-800"
        )}
      >
        <Icon 
          size={24} 
        />
        <Text 
          className="text-base font-medium text-gray-900 dark:text-white"
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  if (isMdAndAbove) {
    return (
      <View className="flex-1 flex-row">
        {/* Sidebar */}
        <View className={cn(
          "w-60 border-r",
          "bg-white dark:bg-gray-900",
          "border-gray-200 dark:border-gray-800"
        )}>
          <SafeAreaView className="flex-1 pt-8">
            <View className="px-4 pb-6">
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                nchat
              </Text>
            </View>

            <View className="gap-1">
              {navigationItems.map(renderSidebarItem)}
            </View>
          </SafeAreaView>
        </View>

        {/* Main Content */}
        <View className="flex-1">
          <Tabs screenOptions={tabBarOptions}>
            {navigationItems.map((item) => (
              <Tabs.Screen
                key={item.route}
                name={item.route}
                options={{
                  title: item.name,
                  tabBarIcon({ color, size }) {
                    return <item.icon color={color} size={size} />;
                  },
                }}
              />
            ))}
          </Tabs>
        </View>
      </View>
    );
  }

  // Mobile view with bottom tabs
  return (
    <Tabs screenOptions={tabBarOptions}>
      {navigationItems.map((item) => (
        <Tabs.Screen
          key={item.route}
          name={item.route}
          options={{
            title: item.name,
            tabBarIcon({ color, size }) {
              return <item.icon color={color} size={size} />;
            },
          }}
        />
      ))}
    </Tabs>
  );
}
