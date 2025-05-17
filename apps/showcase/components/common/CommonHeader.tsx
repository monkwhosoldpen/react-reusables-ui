import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Link } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import LanguageChanger from '~/components/common/LanguageChanger';

interface CommonHeaderProps {
  title?: string;
  logoUrl?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  user?: {
    username?: string;
    avatar?: string;
  };
}

export function CommonHeader({
  title = 'nchat',
  logoUrl = 'https://placehold.co/32x32',
  showBackButton = false,
  onBackPress,
  user,
}: CommonHeaderProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <View className="w-full max-w-[1200px] self-center">
        <View className="flex-row items-center">
          {showBackButton && (
            <TouchableOpacity 
              onPress={handleBackPress} 
              className="mr-2 p-2"
            >
              <ChevronLeft size={24} color={isDark ? '#fff' : '#111827'} />
            </TouchableOpacity>
          )}
          {!showBackButton ? (
            <Link href="/" asChild>
              <TouchableOpacity className="flex-row items-center flex-1">
                <Image
                  source={{ uri: logoUrl }}
                  className="w-8 h-8 mr-2 rounded-full overflow-hidden"
                  resizeMode="contain"
                />
                <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                  {title}
                </Text>
              </TouchableOpacity>
            </Link>
          ) : (
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 rounded-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                {user?.avatar ? (
                  <Image
                    source={{ uri: user.avatar }}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </Text>
                )}
              </View>
              <View className="ml-3">
                <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                  {user?.username || title}
                </Text>
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  {user?.username ? 'Welcome back' : ''}
                </Text>
              </View>
            </View>
          )}
          <View className="ml-auto">
            <LanguageChanger variant="settings" />
          </View>
        </View>
      </View>
    </View>
  );
} 