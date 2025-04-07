import { Tabs } from 'expo-router';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';
import { Home, Settings, Bell, MessageSquare, Menu } from 'lucide-react-native';

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colorScheme.colors.card,
          borderTopColor: colorScheme.colors.border,
          borderTopWidth: 1,
          height: Number(design.spacing.iconSize) * 2.5,
          paddingBottom: Number(design.spacing.padding.item),
          paddingTop: Number(design.spacing.padding.item),
        },
        tabBarActiveTintColor: colorScheme.colors.primary,
        tabBarInactiveTintColor: colorScheme.colors.text,
        tabBarLabelStyle: {
          fontSize: Number(design.spacing.fontSize.sm),
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          headerShown: true,
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          headerShown: true,
          tabBarIcon: ({ color, size }) => (
            <MessageSquare size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="supermenu"
        options={{
          title: 'Supermenu',
          headerShown: true,
          tabBarIcon: ({ color, size }) => (
            <Menu size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerShown: true,
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />

    </Tabs>
  );
} 