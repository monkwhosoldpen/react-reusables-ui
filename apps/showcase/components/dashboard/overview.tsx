import React from 'react';
import {
  View,
  ScrollView,
  useColorScheme,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import { Text } from '~/components/ui/text';
import { Avatar, AvatarImage } from '~/components/ui/avatar';
import { Card } from '~/components/ui/card';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface OverviewTabProps {
  username: string;
  user: { email?: string; id?: string } | null;
  userRole?: { email: string; role: string; channelUsername?: string };
  hasAccess: boolean;
  premiumConfig: any;
  channelInfo: {
    ownerUsername: string;
    channel: any;
    config: any;
  } | null;
  relatedChannelsCount: number;
}

export default function OverviewTab({
  username,
  user,
  userRole,
  hasAccess,
  premiumConfig,
  channelInfo,
  relatedChannelsCount,
}: OverviewTabProps) {
  const scheme = useColorScheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isMobile = width < 768;

  const iconColor = scheme === 'dark' ? '#93c5fd' : '#3b82f6';
  const cardBg = scheme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const borderClr = scheme === 'dark' ? 'border-gray-700' : 'border-gray-100';

  return (
    <SafeAreaView
      className="flex-1"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="p-6 gap-6"
        className={scheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}
      >
        {/* ——— user card ——— */}
        <Card
          className={`rounded-xl ${cardBg} shadow-sm ${borderClr} border p-4`}
        >
          <View className="flex-row items-center">
            {/* avatar */}
            <Avatar
              className="h-16 w-16 mr-4"
              style={{
                borderWidth: 2,
                borderColor: scheme === 'dark' ? '#374151' : '#e5e7eb',
              }}
              alt={username}
            >
              <AvatarImage source={{ uri: 'https://placehold.co/150' }} />
            </Avatar>

            {/* name + email / role */}
            <View className="flex-1">
              <Text className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {username}
              </Text>

              <Text className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                {user?.email ?? 'Guest'}
              </Text>

              <View className="flex-row items-center flex-wrap gap-2 mt-2">
                {/* role pill */}
                <View className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40">
                  <Text className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                    {userRole
                      ? userRole.role.replace('_', ' ').toUpperCase()
                      : 'NO ROLE'}
                  </Text>
                </View>

                {/* access pill */}
                <View
                  className={`px-2 py-0.5 rounded-full ${
                    hasAccess
                      ? 'bg-green-100 dark:bg-green-900/40'
                      : 'bg-red-100 dark:bg-red-900/40'
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      hasAccess
                        ? 'text-green-700 dark:text-green-400'
                        : 'text-red-700 dark:text-red-400'
                    }`}
                  >
                    {hasAccess ? 'Has Access' : 'No Access'}
                  </Text>
                </View>

                {/* channels count pill */}
                <View className="px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/40">
                  <Text className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
                    {relatedChannelsCount} channels
                  </Text>
                </View>
              </View>
            </View>

          </View>
        </Card>

        {/* more cards / content slots can go here */}
      </ScrollView>
    </SafeAreaView>
  );
}
