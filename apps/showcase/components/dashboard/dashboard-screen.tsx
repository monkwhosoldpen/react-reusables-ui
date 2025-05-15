import { useScrollToTop } from '@react-navigation/native';
import * as React from 'react';
import { View, ScrollView, TouchableOpacity, useWindowDimensions, SafeAreaView, useColorScheme } from 'react-native';
import { Text } from '~/components/ui/text';
import { PREMIUM_CONFIGS, global_superadmin } from '~/lib/in-app-db/states/telangana/premium-data';
import { useAuth } from '~/lib/core/contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from './StatusBar';

// Import the route components
import AIDashboardTab from '~/components/dashboard/ai-dashboard';
import RequestsTab from '~/components/dashboard/requests';
import CreateMessageScreen from './create-message';
import OverviewTab from './overview';

interface DashboardScreenProps {
  username: string;
  tabname?: string;
}

// Define available roles
const ROLES = {
  SUPER_ADMIN: 'super_admin',
  VIEWER: 'viewer',
  VERIFIER: 'verifier',
  ONBOARDER: 'onboarder'
} as const;

type Role = typeof ROLES[keyof typeof ROLES];

interface UserRole {
  email: string;
  role: Role;
  channelUsername?: string;
}

// Add this after the existing interfaces
interface TabConfig {
  name: string;
  title: string;
  allowedRoles: Role[];
}

const TAB_CONFIGS: TabConfig[] = [
  {
    name: 'overview',
    title: 'Overview',
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.VIEWER, ROLES.VERIFIER, ROLES.ONBOARDER]
  },
  {
    name: 'chat',
    title: 'Chat',
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.VIEWER, ROLES.VERIFIER, ROLES.ONBOARDER]
  },
  {
    name: 'ai-dashboard',
    title: 'AI-Dashboard',
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.VERIFIER]
  },
  {
    name: 'requests',
    title: 'Requests',
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ONBOARDER]
  }
];

// Replace the TabContent component with this
function TabContent({ tabName, username }: { tabName: string; username: string }) {
  const { user } = useAuth();

  // Find the channel in all configs to get owner
  const findChannelOwner = () => {
    for (const [ownerUsername, config] of Object.entries(PREMIUM_CONFIGS)) {
      const channel = config?.related_channels?.find(ch => ch.username === username);
      if (channel) {
        return {
          ownerUsername,
          channel,
          config
        };
      }
    }
    return null;
  };

  // Get all user roles across all channels
  const getAllUserRoles = (): UserRole[] => {
    const allRoles: UserRole[] = [];
    const channelInfo = findChannelOwner();
    const premiumConfig = channelInfo?.config || PREMIUM_CONFIGS[username];
    
    // For public channels (empty config), add global super admin role
    if (!premiumConfig || Object.keys(premiumConfig).length === 0) {
      if (user?.email && user.email === global_superadmin) {
        allRoles.push({
          email: user.email,
          role: ROLES.SUPER_ADMIN,
          channelUsername: username
        });
      }
      return allRoles;
    }
    
    // Check current channel only
    if (premiumConfig?.roles) {
      Object.entries(premiumConfig.roles).forEach(([role, emails]) => {
        if (Array.isArray(emails)) {
          allRoles.push(...emails.map(email => ({
            email,
            role: role as Role,
            channelUsername: username
          })));
        }
      });
    }

    return allRoles;
  };

  const channelInfo = findChannelOwner();
  const premiumConfig = channelInfo?.config || PREMIUM_CONFIGS[username];
  const userRoles = getAllUserRoles();
  const hasAccess = !premiumConfig || Object.keys(premiumConfig).length === 0 
    ? (user?.email ? user.email === global_superadmin : false) 
    : userRoles.some(ur => ur.email === user?.email);
  const userRole = userRoles.find(ur => ur.email === user?.email);
  const relatedChannelsCount = premiumConfig?.related_channels?.length || 0;

  // Map tab names to their components
  const tabComponents = {
    'overview': () => (
      <OverviewTab 
        username={username}
        user={user}
        userRole={userRole}
        hasAccess={hasAccess}
        premiumConfig={premiumConfig}
        channelInfo={channelInfo}
        relatedChannelsCount={relatedChannelsCount}
      />
    ),
    'chat': () => <CreateMessageScreen username={username as string} />,
    'ai-dashboard': () => <AIDashboardTab />,
    'requests': () => <RequestsTab />
  };

  const TabComponent = tabComponents[tabName as keyof typeof tabComponents];

  return TabComponent ? <TabComponent /> : null;
}

export function DashboardScreen({ username, tabname }: DashboardScreenProps) {
  const ref = React.useRef(null);
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState(tabname || 'overview');
  const colorScheme = useColorScheme();
  
  // Find the channel in all configs to get owner
  const findChannelOwner = () => {
    for (const [ownerUsername, config] of Object.entries(PREMIUM_CONFIGS)) {
      const channel = config?.related_channels?.find(ch => ch.username === username);
      if (channel) {
        return {
          ownerUsername,
          channel,
          config
        };
      }
    }
    return null;
  };

  const channelInfo = findChannelOwner();
  const premiumConfig = channelInfo?.config || PREMIUM_CONFIGS[username];
  
  // Get all user roles across all channels
  const getAllUserRoles = (): UserRole[] => {
    const allRoles: UserRole[] = [];
    const channelInfo = findChannelOwner();
    const premiumConfig = channelInfo?.config || PREMIUM_CONFIGS[username];
    
    // For public channels (empty config), add global super admin role
    if (!premiumConfig || Object.keys(premiumConfig).length === 0) {
      if (user?.email && user.email === global_superadmin) {
        allRoles.push({
          email: user.email,
          role: ROLES.SUPER_ADMIN,
          channelUsername: username
        });
      }
      return allRoles;
    }
    
    // Check current channel only
    if (premiumConfig?.roles) {
      Object.entries(premiumConfig.roles).forEach(([role, emails]) => {
        if (Array.isArray(emails)) {
          allRoles.push(...emails.map(email => ({
            email,
            role: role as Role,
            channelUsername: username
          })));
        }
      });
    }

    return allRoles;
  };

  const userRoles = getAllUserRoles();
  const hasAccess = !premiumConfig || Object.keys(premiumConfig).length === 0 
    ? (user?.email ? user.email === global_superadmin : false) 
    : userRoles.some(ur => ur.email === user?.email);
  const userRole = userRoles.find(ur => ur.email === user?.email);
  const clientType = premiumConfig?.client_type || 'public';
  const relatedChannelsCount = premiumConfig?.related_channels?.length || 0;
  const isPublic = !premiumConfig || Object.keys(premiumConfig).length === 0 || premiumConfig.is_public;

  React.useEffect(() => {
  }, [username, clientType, relatedChannelsCount, hasAccess, userRoles, user, channelInfo, userRole, isPublic]);
  
  useScrollToTop(ref);

  const isDesktop = width >= 768;

  // Add this before the return statement
  const filteredTabs = !premiumConfig || Object.keys(premiumConfig).length === 0 
    ? TAB_CONFIGS // Show all tabs for public channels
    : TAB_CONFIGS.filter(tab => userRole ? tab.allowedRoles.includes(userRole.role) : false);

  const navItems = [
    { name: 'overview', label: 'Overview' },
    { name: 'chat', label: 'Chat' },
    { name: 'ai-dashboard', label: 'AI Dashboard' },
    { name: 'requests', label: 'Requests' }
  ];

  // Helper function to determine border color based on client type
  const getBorderColorClass = () => {
    if (clientType === 'basic') {
      return 'border-red-500 dark:border-red-600';
    }
    if (clientType === 'pro') {
      return 'border-blue-500 dark:border-blue-600';
    }
    return 'border-gray-500 dark:border-gray-600';
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="bg-white dark:bg-gray-900">
        {/* Status Bar Section */}
        <View className="px-4 py-2">
          <StatusBar 
            isPublic={isPublic}
            clientType={clientType}
            hasAccess={hasAccess}
            userRole={userRole}
          />
        </View>

        {/* Navigation Section */}
        <View className="border-t border-b border-gray-200 dark:border-gray-700">
          <View className={`px-4 py-4 flex-row items-center justify-between ${isDesktop ? 'max-w-[1200px] self-center w-full' : ''}`}>
            {/* Navigation Links */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-1"
            >
              <View className="flex-row items-center space-x-6">
                {navItems.map((item) => (
                  <TouchableOpacity
                    key={item.name}
                    className={`py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 border-b-2 ${
                      activeTab === item.name
                        ? getBorderColorClass()
                        : 'border-transparent'
                    }`}
                    onPress={() => setActiveTab(item.name)}
                  >
                    <Text className={`text-base font-medium whitespace-nowrap ${
                      activeTab === item.name
                        ? clientType === 'basic'
                          ? 'text-red-500 dark:text-red-400'
                          : clientType === 'pro'
                          ? 'text-blue-500 dark:text-blue-400'
                          : 'text-gray-900 dark:text-gray-100'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* User Icon */}
            <View className="ml-6">
              {user && (
                <View className={`w-8 h-8 rounded-full justify-center items-center ${
                  clientType === 'basic'
                    ? 'bg-red-50 dark:bg-red-900/30'
                    : clientType === 'pro'
                    ? 'bg-blue-50 dark:bg-blue-900/30'
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  <MaterialIcons 
                    name="person" 
                    size={20} 
                    color={
                      clientType === 'basic'
                        ? colorScheme === 'dark' ? '#FCA5A5' : '#EF4444'
                        : clientType === 'pro'
                        ? colorScheme === 'dark' ? '#93C5FD' : '#3B82F6'
                        : colorScheme === 'dark' ? '#E5E7EB' : '#4B5563'
                    }
                  />
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      <View className="flex-1 flex-row">
        {/* Sidebar - Only show on desktop */}
        {isDesktop && (
          <Sidebar
            username={username}
            ownerUsername={channelInfo?.ownerUsername || username}
            clientType={clientType}
            relatedChannels={premiumConfig?.related_channels}
          />
        )}
        
        {/* Main Content */}
        <ScrollView 
          ref={ref}
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className={`flex-1 p-4 ${isDesktop ? 'max-w-[1200px] self-center w-full' : ''}`}>
            {hasAccess && filteredTabs.length > 0 && (
              <View className="flex-1">
                <View className="flex-1">
                  <TabContent tabName={activeTab} username={username} />
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
} 