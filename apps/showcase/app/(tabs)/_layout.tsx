import { Tabs, useRouter } from 'expo-router';
import { Menu, Settings } from 'lucide-react-native';
import { LayoutPanelLeft } from '~/lib/icons/LayoutPanelLeft';
import { CommonHeader } from '~/components/common/CommonHeader';
import { useColorScheme } from '~/lib/core/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/core/providers/theme/DesignSystemProvider';
import { StyleSheet, View, useWindowDimensions, Pressable } from 'react-native';
import { Text } from '~/components/ui/text';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import type { NavigationProp } from '@react-navigation/native';
import type { LucideIcon } from 'lucide-react-native';

interface NavigationItem {
  name: string;
  icon: LucideIcon;
  route: string;
}

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();
  const { width } = useWindowDimensions();
  const isMdAndAbove = width >= 768;
  const router = useRouter();

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
      backgroundColor: colorScheme.colors.card,
      borderTopColor: colorScheme.colors.border,
      borderTopWidth: StyleSheet.hairlineWidth,
      height: 60,
      paddingBottom: 4,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      display: isMdAndAbove ? 'none' : 'flex',
    },
    tabBarActiveTintColor: colorScheme.colors.primary,
    tabBarInactiveTintColor: colorScheme.colors.text,
    tabBarLabelStyle: {
      fontSize: Number(design.spacing.fontSize.xs),
      marginBottom: 0,
      fontWeight: '600',
    },
    tabBarIconStyle: {
      marginBottom: -4,
    },
  };

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

  if (isMdAndAbove) {
    return (
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {/* Sidebar */}
        <View style={[
          styles.sidebar,
          {
            backgroundColor: colorScheme.colors.card,
            borderRightColor: colorScheme.colors.border,
          }
        ]}>
          <View style={styles.sidebarContent}>
            <View style={styles.sidebarHeader}>
              <Text style={[styles.sidebarTitle, { color: colorScheme.colors.text }]}>
                nchat
              </Text>
            </View>

            <View style={styles.sidebarItems}>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Pressable
                    key={item.name}
                    onPress={() => router.push(item.route === 'index' ? '/' : `/(tabs)/${item.route}`)}
                    style={({ pressed }) => [
                      styles.sidebarItem,
                      {
                        backgroundColor: pressed ? colorScheme.colors.muted : 'transparent',
                      }
                    ]}
                  >
                    <Icon color={colorScheme.colors.text} size={24} />
                    <Text style={[
                      styles.sidebarText,
                      { color: colorScheme.colors.text }
                    ]}>
                      {item.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View style={{ flex: 1 }}>
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

const styles = StyleSheet.create({
  sidebar: {
    width: 240,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  sidebarContent: {
    flex: 1,
    paddingTop: 32,
  },
  sidebarHeader: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sidebarTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sidebarItems: {
    gap: 4,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  sidebarText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
