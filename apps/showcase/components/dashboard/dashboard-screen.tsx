import { useScrollToTop } from '@react-navigation/native';
import * as React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  SafeAreaView,
  useColorScheme,
  Animated
} from 'react-native';
import { Text } from '~/components/ui/text';
import {
  PREMIUM_CONFIGS,
  global_superadmin
} from '~/lib/in-app-db/states/telangana/premium-data';
import { useAuth } from '~/lib/core/contexts/AuthContext';
import { Sidebar } from './Sidebar';

// Import the route components
import AIDashboardTab from '~/components/dashboard/ai-dashboard';
import RequestsTab from '~/components/dashboard/requests';
import CreateMessageScreen from './create-message';
import OverviewTab from './overview';
import AIUserAnalyticsTab from './ai-user-analytics';

// Add fetch import
import fetch from 'node-fetch';

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

type Role = (typeof ROLES)[keyof typeof ROLES];

interface UserRole {
  email: string;
  role: Role;
  channelUsername?: string;
}

interface TabConfig {
  name: string;
  title: string;
  allowedRoles: Role[];
}

const TAB_CONFIGS: TabConfig[] = [
  {
    name: 'overview',
    title: 'Overview',
    allowedRoles: [
      ROLES.SUPER_ADMIN,
      ROLES.VIEWER,
      ROLES.VERIFIER,
      ROLES.ONBOARDER
    ]
  },
  {
    name: 'chat',
    title: 'Chat',
    allowedRoles: [
      ROLES.SUPER_ADMIN,
      ROLES.VIEWER,
      ROLES.VERIFIER,
      ROLES.ONBOARDER
    ]
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

// Define allowed tabs for each client type
const PRO_CLIENT_TABS = [
  'overview',
  'chat',
  'requests',
  'ai-user-analytics',
  'ai-dashboard'
];
const BASIC_CLIENT_TABS = [
  'overview',
  'requests',
  'chat',
];
const PUBLIC_CLIENT_TABS = ['overview'];

function TabContent({
  tabName,
  username
}: {
  tabName: string;
  username: string;
}) {
  const { user } = useAuth();

  // Add sendHelloWorldNotification function
  const sendHelloWorldNotification = async () => {
    try {
      const response = await fetch('https://demo.fixd.ai/api/alerts/elon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Hello World',
          message: 'This is a test notification from the dashboard!'
        })
      });
      
      const data = await response.json();
      console.log('Notification sent:', data);
      alert('Hello World notification sent successfully!');
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification. Please try again.');
    }
  };

  // util: find channel owner
  const findChannelOwner = () => {
    for (const [ownerUsername, config] of Object.entries(PREMIUM_CONFIGS)) {
      const channel = config?.related_channels?.find(
        ch => ch.username === username
      );
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

  const getAllUserRoles = (): UserRole[] => {
    const roles: UserRole[] = [];
    const channelInfo = findChannelOwner();
    const premiumConfig = channelInfo?.config || PREMIUM_CONFIGS[username];

    // public channel
    if (!premiumConfig || Object.keys(premiumConfig).length === 0) {
      if (user?.email === global_superadmin) {
        roles.push({
          email: user.email,
          role: ROLES.SUPER_ADMIN,
          channelUsername: username
        });
      }
      return roles;
    }

    if (premiumConfig?.roles) {
      Object.entries(premiumConfig.roles).forEach(([role, emails]) => {
        if (Array.isArray(emails)) {
          roles.push(
            ...emails.map(email => ({
              email,
              role: role as Role,
              channelUsername: username
            }))
          );
        }
      });
    }
    return roles;
  };

  const channelInfo = findChannelOwner();
  const premiumConfig = channelInfo?.config || PREMIUM_CONFIGS[username];
  const userRoles = getAllUserRoles();
  const hasAccess = !premiumConfig || Object.keys(premiumConfig).length === 0
    ? user?.email === global_superadmin
    : userRoles.some(r => r.email === user?.email);
  const userRole = userRoles.find(r => r.email === user?.email);
  const clientType = premiumConfig?.client_type || 'public';
  const relatedChannelsCount = premiumConfig?.related_channels?.length || 0;

  const components = {
    overview: () => (
      <View>
        <OverviewTab
          username={username}
          user={user}
          userRole={userRole}
          hasAccess={hasAccess}
          premiumConfig={premiumConfig}
          channelInfo={channelInfo}
          relatedChannelsCount={relatedChannelsCount}
        />
        <TouchableOpacity
          onPress={sendHelloWorldNotification}
          className="m-4 p-4 bg-blue-500 rounded-lg"
        >
          <Text className="text-white text-center font-bold">
            Send Hello World Notification
          </Text>
        </TouchableOpacity>
      </View>
    ),
    chat: () => (
      <CreateMessageScreen
        username={username}
        clientType={clientType}
        isPublic={false}
        hasAccess={hasAccess}
        userRole={userRole}
      />
    ),
    requests: () => <RequestsTab />,
    'ai-user-analytics': () => <AIUserAnalyticsTab />,
    'ai-dashboard': () => <AIDashboardTab />
  } as const;

  const Comp = components[tabName as keyof typeof components];
  return Comp ? <Comp /> : null;
}

// Add Material Design tab indicator component
const TabIndicator = React.memo(({ width, position }: { width: Animated.Value; position: Animated.Value }) => {
  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: width,
        height: 2,
        backgroundColor: '#2196F3',
        transform: [{ translateX: position }],
      }}
    />
  );
});

export function DashboardScreen({
  username,
  tabname
}: DashboardScreenProps) {
  const ref = React.useRef(null);
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState(tabname || 'overview');
  const colorScheme = useColorScheme();
  const [tabLayouts, setTabLayouts] = React.useState<{ [key: string]: { width: number; x: number } }>({});
  const indicatorPosition = React.useRef(new Animated.Value(0)).current;
  const indicatorWidth = React.useRef(new Animated.Value(0)).current;

  // Initialize tab indicator position when layouts are available
  React.useEffect(() => {
    if (tabLayouts[activeTab]) {
      indicatorPosition.setValue(tabLayouts[activeTab].x);
      indicatorWidth.setValue(tabLayouts[activeTab].width);
    }
  }, [tabLayouts, activeTab]);

  // channel helpers
  const findChannelOwner = () => {
    for (const [ownerUsername, config] of Object.entries(PREMIUM_CONFIGS)) {
      const channel = config?.related_channels?.find(
        ch => ch.username === username
      );
      if (channel) return { ownerUsername, channel, config };
    }
    return null;
  };

  const channelInfo = findChannelOwner();
  const premiumConfig = channelInfo?.config || PREMIUM_CONFIGS[username];

  const getAllUserRoles = (): UserRole[] => {
    const roles: UserRole[] = [];
    const channelInfo = findChannelOwner();
    const premiumConfig = channelInfo?.config || PREMIUM_CONFIGS[username];
    if (!premiumConfig || Object.keys(premiumConfig).length === 0) {
      if (user?.email === global_superadmin) {
        roles.push({ email: user.email, role: ROLES.SUPER_ADMIN });
      }
      return roles;
    }
    if (premiumConfig?.roles) {
      Object.entries(premiumConfig.roles).forEach(([role, emails]) => {
        if (Array.isArray(emails)) {
          roles.push(...emails.map(email => ({ email, role: role as Role })));
        }
      });
    }
    return roles;
  };

  const userRoles = getAllUserRoles();
  const hasAccess = !premiumConfig || Object.keys(premiumConfig).length === 0
    ? user?.email === global_superadmin
    : userRoles.some(r => r.email === user?.email);
  const userRole = userRoles.find(r => r.email === user?.email);
  const clientType = premiumConfig?.client_type || 'public';
  const relatedChannelsCount = premiumConfig?.related_channels?.length || 0;
  const isPublic =
    !premiumConfig || Object.keys(premiumConfig).length === 0 || premiumConfig.is_public;

  React.useEffect(() => {}, [username, clientType, relatedChannelsCount]);

  useScrollToTop(ref);

  // client-type filtering
  const isBasicClient = clientType === 'basic';
  const isProClient = clientType === 'pro';

  const roleBasedTabs = !premiumConfig || Object.keys(premiumConfig).length === 0
    ? TAB_CONFIGS
    : TAB_CONFIGS.filter(tab =>
        userRole ? tab.allowedRoles.includes(userRole.role) : false
      );

  const filteredTabs = roleBasedTabs.filter(tab => {
    if (isProClient) return PRO_CLIENT_TABS.includes(tab.name);
    if (isBasicClient) return BASIC_CLIENT_TABS.includes(tab.name);
    return PUBLIC_CLIENT_TABS.includes(tab.name);
  });

  const navItemsBase = [
    { name: 'overview', label: 'Overview' },
    { name: 'requests', label: 'Requests' },
    { name: 'chat', label: 'Chat' },
    { name: 'ai-user-analytics', label: 'AI User Analytics' },
    { name: 'ai-dashboard', label: 'AI Dashboard' }
  ];

  const navItems = navItemsBase.filter(item => {
    if (isProClient) return PRO_CLIENT_TABS.includes(item.name);
    if (isBasicClient) return BASIC_CLIENT_TABS.includes(item.name);
    return PUBLIC_CLIENT_TABS.includes(item.name);
  });

  const getBorderColorClass = () => {
    if (clientType === 'basic') return 'border-red-500 dark:border-red-600';
    if (clientType === 'pro') return 'border-blue-500 dark:border-blue-600';
    return 'border-gray-500 dark:border-gray-600';
  };

  // Function to handle tab press with animation
  const handleTabPress = (tabName: string) => {
    setActiveTab(tabName);
    if (tabLayouts[tabName]) {
      Animated.parallel([
        Animated.timing(indicatorPosition, {
          toValue: tabLayouts[tabName].x,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(indicatorWidth, {
          toValue: tabLayouts[tabName].width,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }
  };

  // Function to measure tab layout
  const onTabLayout = (tabName: string, event: any) => {
    const { width, x } = event.nativeEvent.layout;
    setTabLayouts(prev => ({
      ...prev,
      [tabName]: { width, x }
    }));
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      {/* Outer frame */}
      <View className="flex-1 m-0 border border-gray-200 dark:border-gray-700">
        <View className="flex-1 flex-row">
          {/* Sidebar with right border */}
          <Sidebar
            username={username}
            ownerUsername={channelInfo?.ownerUsername || username}
            clientType={clientType}
            relatedChannels={premiumConfig?.related_channels}
          />

          {/* Main section with left border */}
          <ScrollView
            ref={ref}
            className="flex-1 border-l border-gray-200 dark:border-gray-700"
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {/* Tabs header */}
            <View className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-t border-gray-200 dark:border-gray-700">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="relative">
                <View className="flex-row items-center px-2">
                  {navItems.map(item => (
                    <TouchableOpacity
                      key={item.name}
                      onLayout={(e) => onTabLayout(item.name, e)}
                      className="px-4 py-3"
                      onPress={() => handleTabPress(item.name)}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          activeTab === item.name
                            ? clientType === 'basic'
                              ? 'text-red-500 dark:text-red-400'
                              : clientType === 'pro'
                              ? 'text-blue-500 dark:text-blue-400'
                              : 'text-gray-900 dark:text-gray-100'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TabIndicator 
                  width={indicatorWidth} 
                  position={indicatorPosition} 
                />
              </ScrollView>
            </View>

            {/* Main content */}
            <View className="flex-1">
              {hasAccess && filteredTabs.length > 0 && (
                <TabContent tabName={activeTab} username={username} />
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}
