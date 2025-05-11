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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion';

// Import the route components
import AIDashboardTab from '~/components/dashboard/ai-dashboard';
import RequestsTab from '~/components/dashboard/requests';
import CreateMessageScreen from './create-message';

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
function TabContent({ tabName }: { tabName: string }) {
  const params = useLocalSearchParams();
  const router = useRouter();

  // Map tab names to their components
  const tabComponents = {
    'chat': () => <CreateMessageScreen />,
    'ai-dashboard': () => <AIDashboardTab />,
    'requests': () => <RequestsTab />
  };

  const TabComponent = tabComponents[tabName as keyof typeof tabComponents];

  React.useEffect(() => {
    // Log the current route and params for debugging
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
          {/* User Info Accordion */}
          <Accordion
            type="single"
            collapsible
            className="mb-4"
          >
            <AccordionItem value="user-info">
              <AccordionTrigger>
                <View className="flex-row items-center justify-between w-full">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-full justify-center items-center mr-3 bg-blue-50 dark:bg-blue-900/30">
                      <MaterialIcons name="person" size={20} color={colorScheme === 'dark' ? '#93C5FD' : '#3B82F6'} />
                    </View>
                    <View>
                      <Text className="text-base font-medium text-gray-900 dark:text-gray-100">
                        {username}
                      </Text>
                      <Text className="text-sm text-gray-600 dark:text-gray-400">
                        {relatedChannelsCount} Related Channels
                      </Text>
                    </View>
                  </View>
                </View>
              </AccordionTrigger>
              <AccordionContent>
                <Card className="p-4 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
                  {/* Current User Info */}
                  <View className="mb-4">
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 rounded-full justify-center items-center mr-3 bg-blue-50 dark:bg-blue-900/30">
                        <MaterialIcons name="person" size={20} color={colorScheme === 'dark' ? '#93C5FD' : '#3B82F6'} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-medium text-gray-900 dark:text-gray-100">
                          {user?.email || 'Guest'}
                        </Text>
                        <View className="flex-row items-center gap-2">
                          <Text className="text-gray-600 dark:text-gray-300">
                            {userRole ? userRole.role.replace('_', ' ').toUpperCase() : 'No Role'}
                          </Text>
                          <View className={`px-2 py-0.5 rounded-full ${hasAccess ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                            <Text className={hasAccess ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                              {hasAccess ? 'Has Access' : 'No Access'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* User Info Card */}
                  <View className="mb-4">
                    <View className="flex-row items-center mb-3">
                      <View className="w-12 h-12 rounded-full justify-center items-center mr-3 bg-blue-50 dark:bg-blue-900/30">
                        <MaterialIcons name="person" size={24} color={colorScheme === 'dark' ? '#93C5FD' : '#3B82F6'} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {username}
                        </Text>
                        <Text className="text-gray-600 dark:text-gray-300">
                          {premiumConfig?.tenant_supabase_url ? 'Telangana' : 'No location set'}
                        </Text>
                        <View className="flex-row items-center mt-1">
                          <Text className="text-sm text-gray-500 dark:text-gray-400">Owner: </Text>
                          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {channelInfo?.ownerUsername || 'N/A'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Related Channels */}
                  {premiumConfig?.related_channels && premiumConfig.related_channels.length > 0 && (
                    <View>
                      <Text className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Related Channels</Text>
                      <View className="flex-row flex-wrap gap-2">
                        {premiumConfig.related_channels.map((channel) => (
                          <TouchableOpacity 
                            key={channel.username}
                            className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full"
                            onPress={() => router.push(`/dashboard/${channel.username}`)}
                          >
                            <Text className="text-blue-700 dark:text-blue-400">{channel.username}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}
                </Card>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Tab Navigation */}
          {hasAccess && filteredTabs.length > 0 && (
            <View className="flex-1 mt-4">
              <Tab.Navigator
                id={undefined}
                screenOptions={{
                  tabBarStyle: {
                    backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF',
                  },
                  tabBarIndicatorStyle: {
                    backgroundColor: colorScheme === 'dark' ? '#3B82F6' : '#2563EB',
                  },
                  tabBarLabelStyle: {
                    color: colorScheme === 'dark' ? '#E5E7EB' : '#374151',
                    textTransform: 'none',
                  },
                }}
              >
                {filteredTabs.map((tab) => (
                  <Tab.Screen
                    key={tab.name}
                    name={tab.name}
                    options={{
                      title: tab.title,
                    }}
                  >
                    {() => <TabContent tabName={tab.name} />}
                  </Tab.Screen>
                ))}
              </Tab.Navigator>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 