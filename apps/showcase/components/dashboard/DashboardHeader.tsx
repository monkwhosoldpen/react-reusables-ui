import { View, TouchableOpacity, useWindowDimensions, useColorScheme, ScrollView } from 'react-native';
import { Text } from '~/components/ui/text';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '~/lib/core/contexts/AuthContext';
import { StatusBar } from './StatusBar';

interface DashboardHeaderProps {
  title: string;
  username: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  isPublic: boolean;
  clientType: string;
  hasAccess: boolean;
  userRole?: {
    role: string;
  } | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function DashboardHeader({ 
  title, 
  username, 
  showBackButton, 
  onBackPress,
  isPublic,
  clientType,
  hasAccess,
  userRole,
  activeTab,
  onTabChange
}: DashboardHeaderProps) {
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const isDesktop = width >= 768;

  const navItems = [
    { name: 'overview', label: 'Overview' },
    { name: 'chat', label: 'Chat' },
    { name: 'ai-dashboard', label: 'AI Dashboard' },
    { name: 'requests', label: 'Requests' }
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

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
                  onPress={() => onTabChange(item.name)}
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
  );
} 