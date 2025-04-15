import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '~/components/ui/text';
import { useTheme } from '~/lib/providers/theme/ThemeProvider';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import Overview from '~/components/dashboard/overview';
import TenantRequests from '~/components/dashboard/tenant-requests';
import AIDashboard from '~/components/dashboard/ai-dashboard';
import { BarChart, Home, Users as UsersIcon, Cpu, Newspaper } from 'lucide-react-native';
import ChatScreen from '~/components/dashboard/chat';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

type Tab = 'overview' | 'users' | 'tenant-requests' | 'ai-dashboard' | 'chat';

const Tab = createMaterialTopTabNavigator();

const tabs: { id: Tab; label: string; icon: React.ComponentType<any> }[] = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'tenant-requests', label: 'Tenant Requests', icon: UsersIcon },
  { id: 'chat', label: 'Chat', icon: UsersIcon },
  { id: 'ai-dashboard', label: 'AI Dashboard', icon: Cpu },
];

export default function DashboardScreen() {
  const { theme } = useTheme();
  const { colorScheme } = useColorScheme();

  return (
    <View style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
      <View style={styles.header}>
        <View style={styles.logo}>
          <BarChart size={24} color={colorScheme.colors.primary} />
          <Text 
            style={[styles.logoText, { color: colorScheme.colors.text }]}
            className="font-bold"
          >
            Dashboard
          </Text>
        </View>
      </View>

      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: colorScheme.colors.primary,
          tabBarInactiveTintColor: colorScheme.colors.text,
          tabBarLabelStyle: {
            fontSize: 14,
            textTransform: 'capitalize',
            fontWeight: '500',
          },
          tabBarIndicatorStyle: {
            backgroundColor: colorScheme.colors.primary,
          },
          tabBarScrollEnabled: true,
          tabBarItemStyle: { 
            width: 'auto', 
            minWidth: 100,
            padding: 8,
          },
          tabBarStyle: {
            backgroundColor: colorScheme.colors.card,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colorScheme.colors.border,
          },
        }}
      >
        {tabs.map((tab) => (
          <Tab.Screen
            key={tab.id}
            name={tab.id}
            options={{
              title: tab.label,
            }}
          >
            {() => {
              switch (tab.id) {
                case 'overview':
                  return <Overview />;
                case 'ai-dashboard':
                  return <AIDashboard />;
                case 'chat':
                  return <ChatScreen />;
                case 'tenant-requests':
                  return <TenantRequests />;
                default:
                  return <Overview />;
              }
            }}
          </Tab.Screen>
        ))}
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 20,
  },
}); 