import { View, TouchableOpacity, useWindowDimensions, useColorScheme, ScrollView } from 'react-native';
import { Text } from '~/components/ui/text';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '~/lib/core/contexts/AuthContext';

interface DashboardHeaderProps {
  title: string;
  username: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

export function DashboardHeader({ title, username, showBackButton, onBackPress }: DashboardHeaderProps) {
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const isDesktop = width >= 768;

  const navItems = [
    { label: 'Overview', path: `/dashboard/${username}` },
    { label: 'Requests', path: `/dashboard/${username}/requests` },
    { label: 'AI Dashboard', path: `/dashboard/${username}/ai-dashboard` }
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <View className="py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <View className={`px-4 flex-row items-center justify-between ${isDesktop ? 'max-w-[1200px] self-center w-full' : ''}`}>
        {/* Navigation Links */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-1"
        >
          <View className="flex-row items-center space-x-6">
            {navItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                className="py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                onPress={() => router.push(item.path)}
              >
                <Text className="text-base font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* User Icon */}
        <View className="ml-6">
          {user && (
            <View className="w-8 h-8 rounded-full justify-center items-center bg-blue-50 dark:bg-blue-900/30">
              <MaterialIcons name="person" size={20} color={colorScheme === 'dark' ? '#93C5FD' : '#3B82F6'} />
            </View>
          )}
        </View>
      </View>
    </View>
  );
} 