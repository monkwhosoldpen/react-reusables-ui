import { Tabs } from 'expo-router';
import { Menu, Settings } from 'lucide-react-native';
import { LayoutPanelLeft } from '~/lib/icons/LayoutPanelLeft';
import { CommonHeader } from '~/components/CommonHeader';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';
import { StyleSheet } from 'react-native';

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();

  return (
    <Tabs
      screenOptions={{
        header: ({ navigation, route, options }) => (
          <CommonHeader
            title={options.title || route.name}
            showBackButton={navigation.canGoBack()}
            onBackPress={() => navigation.goBack()}
          />
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
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'nchat',
          tabBarIcon({ color, size }) {
            return <LayoutPanelLeft color={color} size={size} />;
          },
        }}
      />
      <Tabs.Screen
        name='supermenu'
        options={{
          title: 'Supermenu',
          tabBarIcon({ color, size }) {
            return <Menu color={color} size={size} />;
          },
        }}
      />
      <Tabs.Screen
        name='settings'
        options={{
          title: 'Settings',
          tabBarIcon({ color, size }) {
            return <Settings color={color} size={size} />;
          },
        }}
      />

    </Tabs>
  );
}
