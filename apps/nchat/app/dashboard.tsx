import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from '~/components/ui/text';
import { useTheme } from '~/lib/providers/theme/ThemeProvider';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';
import Overview from '~/components/dashboard/overview';
import TenantRequests from '~/components/dashboard/tenant-requests';
import AIDashboard from '~/components/dashboard/ai-dashboard';
import { BarChart, Home, Users as UsersIcon, Cpu, Newspaper } from 'lucide-react-native';
import FeedScreen from '~/components/dashboard/feed';

type Tab = 'overview' | 'users' | 'tenant-requests' | 'ai-dashboard' | 'feed';

const tabs: { id: Tab; label: string; icon: React.ComponentType<any> }[] = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'tenant-requests', label: 'Tenant Requests', icon: UsersIcon },
  { id: 'feed', label: 'Feed', icon: Newspaper },
  { id: 'ai-dashboard', label: 'AI Dashboard', icon: Cpu },
];

export default function DashboardScreen() {
  const { theme } = useTheme();
  const { colorScheme } = useColorScheme();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />;
      case 'ai-dashboard':
        return <AIDashboard />;
      case 'feed':
        return <FeedScreen />;
      case 'tenant-requests':
        return <TenantRequests />;
      default:
        return <Overview />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
      {/* Sidebar */}
      <View style={[styles.sidebar, { backgroundColor: colorScheme.colors.card }]}>
        <View style={styles.logo}>
          <BarChart size={24} color={colorScheme.colors.primary} />
          <Text 
            style={[styles.logoText, { color: colorScheme.colors.text }]}
            className="font-bold"
          >
            Dashboard
          </Text>
        </View>

        <View style={styles.nav}>
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <Pressable
                key={tab.id}
                style={[
                  styles.navItem,
                  activeTab === tab.id && {
                    backgroundColor: colorScheme.colors.primary,
                  },
                ]}
                onPress={() => setActiveTab(tab.id)}
              >
                <IconComponent 
                  size={20} 
                  color={activeTab === tab.id ? '#FFFFFF' : colorScheme.colors.text} 
                />
                <Text 
                  style={[
                    styles.navText,
                    { color: activeTab === tab.id ? '#FFFFFF' : colorScheme.colors.text },
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 240,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.1)',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  logoText: {
    fontSize: 20,
  },
  nav: {
    gap: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  navText: {
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
}); 