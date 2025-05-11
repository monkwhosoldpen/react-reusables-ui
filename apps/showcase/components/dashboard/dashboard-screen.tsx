import { useScrollToTop } from '@react-navigation/native';
import * as React from 'react';
import { View, ScrollView, TouchableOpacity, useWindowDimensions, SafeAreaView, useColorScheme } from 'react-native';
import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { PREMIUM_CONFIGS } from '~/lib/in-app-db/states/telangana/premium-data';
import { useAuth } from '~/lib/core/contexts/AuthContext';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

// Import the route components
import AIDashboardTab from '~/components/dashboard/ai-dashboard';
import RequestsTab from '~/components/dashboard/requests';
import CreateMessageScreen from './create-message';
import OverviewTab from './overview';

const Tab = createMaterialTopTabNavigator();

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
  const params = useLocalSearchParams();
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
  const hasAccess = userRoles.some(ur => ur.email === user?.email);
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
    'chat': () => <CreateMessageScreen />,
    'ai-dashboard': () => <AIDashboardTab />,
    'requests': () => <RequestsTab />
  };

  const TabComponent = tabComponents[tabName as keyof typeof tabComponents];

  React.useEffect(() => {
    // Log the current tab for debugging
    console.log('[TabContent]', { tabName, params });
  }, [tabName, params]);

  return TabComponent ? <TabComponent /> : null;
}

export function DashboardScreen({ username, tabname }: DashboardScreenProps) {
  const ref = React.useRef(null);
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState(tabname || 'overview');
  
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
  const hasAccess = userRoles.some(ur => ur.email === user?.email);
  const userRole = userRoles.find(ur => ur.email === user?.email);
  const clientType = premiumConfig?.client_type || 'public';
  const relatedChannelsCount = premiumConfig?.related_channels?.length || 0;

  // Determine auth type
  const getAuthType = () => {
    if (!user) return 'guest';
    if (user.email) return 'email';
    if (user.id) return 'anonymous';
    return 'unknown';
  };

  React.useEffect(() => {
    console.log('[DashboardScreen]', { 
      username, 
      clientType,
      relatedChannelsCount,
      hasAccess,
      userRoles,
      currentUser: {
        id: user?.id,
        email: user?.email,
        authType: getAuthType(),
        role: userRole
      },
      channelInfo: channelInfo ? {
        ownerUsername: channelInfo.ownerUsername,
        isOwnerChannel: channelInfo.channel.is_owner_db,
        isPublic: channelInfo.channel.is_public,
        isPremium: channelInfo.channel.is_premium
      } : null
    });
  }, [username, clientType, relatedChannelsCount, hasAccess, userRoles, user, channelInfo, userRole]);
  
  useScrollToTop(ref);

  const isDesktop = width >= 768;

  // Add this before the return statement
  const filteredTabs = TAB_CONFIGS.filter(tab => 
    userRole ? tab.allowedRoles.includes(userRole.role) : false
  );

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView 
        ref={ref}
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className={`flex-1 p-4 ${isDesktop ? 'max-w-[1200px] self-center w-full' : ''}`}>
          {/* Tab Navigation */}
          {hasAccess && filteredTabs.length > 0 && (
            <View className="flex-1 mt-4">
              <View className="flex-row border-b border-gray-200 dark:border-gray-700">
                {filteredTabs.map((tab) => (
                  <TouchableOpacity
                    key={tab.name}
                    onPress={() => setActiveTab(tab.name)}
                    className={`flex-1 py-3 px-4 ${
                      activeTab === tab.name
                        ? 'border-b-2 border-blue-500'
                        : 'border-b-2 border-transparent'
                    }`}
                  >
                    <Text
                      className={`text-center font-medium ${
                        activeTab === tab.name
                          ? 'text-blue-500'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {tab.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View className="flex-1 mt-4">
                <TabContent tabName={activeTab} username={username} />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 