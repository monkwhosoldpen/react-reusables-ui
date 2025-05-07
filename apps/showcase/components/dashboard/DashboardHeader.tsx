import { View, TouchableOpacity, useWindowDimensions, useColorScheme, ScrollView } from 'react-native';
import { Text } from '~/components/ui/text';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '~/lib/core/contexts/AuthContext';

interface DashboardHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

export function DashboardHeader({ title, showBackButton, onBackPress }: DashboardHeaderProps) {
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const isDesktop = width >= 768;
  const iconColor = colorScheme === 'dark' ? '#fff' : '#111827';
  const bgColor = colorScheme === 'dark' ? 'bg-gray-900' : 'bg-white';
  const borderColor = colorScheme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const textColor = colorScheme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const hoverBg = colorScheme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100';

  const navItems = [
    { label: 'Overview', path: '/dashboard' },
    { label: 'Requests', path: '/dashboard/requests' },
    { label: 'AI Dashboard', path: '/dashboard/ai-dashboard' }
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <View className={`py-3 border-b ${borderColor} ${bgColor}`}>
      <View className={`px-4 flex-row items-center justify-between ${isDesktop ? 'max-w-[1200px] self-center w-full' : ''}`}>
        {/* Left Section */}
        <View className="flex-row items-center">
          {showBackButton && (
            <TouchableOpacity
              className="mr-3"
              onPress={onBackPress}
            >
              <MaterialIcons name="arrow-back" size={24} color={iconColor} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            className="py-2"
            onPress={() => router.push('/')}
          >
            <Text className={`text-base font-medium ${textColor}`}>{title}</Text>
          </TouchableOpacity>
        </View>

        {/* Navigation Links - Now visible on all screen sizes */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-1 mx-4"
        >
          <View className="flex-row items-center gap-4">
            {navItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                className={`py-2 px-3 rounded-lg ${hoverBg}`}
                onPress={() => router.push(item.path)}
              >
                <Text className={`text-base font-medium ${textColor} whitespace-nowrap`}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Right Section - User Info */}
        <View className="flex-row items-center gap-3">
          {user && (
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full justify-center items-center mr-2 bg-blue-50 dark:bg-blue-900/30">
                <MaterialIcons name="person" size={20} color="#3B82F6" />
              </View>
              {isDesktop && (
                <Text className={`text-sm font-medium ${textColor}`}>
                  {user.email || 'Guest'}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
} 