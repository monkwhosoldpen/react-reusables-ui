import { Tabs } from 'expo-router';
import { Menu, Settings } from 'lucide-react-native';
import { ModalToggle } from '~/components/ModalToggle';
import { ThemeToggle } from '~/components/ThemeToggle';
import { LayoutPanelLeft } from '~/lib/icons/LayoutPanelLeft';
import { MenuSquare } from '~/lib/icons/MenuSquare';
import { CommonHeader } from '~/components/CommonHeader';

export default function TabsLayout() {
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
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'Demo',
          tabBarIcon({ color, size }) {
            return <LayoutPanelLeft color={color} size={size} />;
          },
        }}
      />
      <Tabs.Screen
        name='components'
        options={{
          title: 'Components',
          tabBarIcon({ color, size }) {
            return <MenuSquare color={color} size={size} />;
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
      <Tabs.Screen
        name='supermenu'
        options={{
          title: 'Supermenu',
          tabBarIcon({ color, size }) {
            return <Menu color={color} size={size} />;
          },
        }}
      />
    </Tabs>
  );
}
