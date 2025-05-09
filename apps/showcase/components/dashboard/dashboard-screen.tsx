import { useScrollToTop } from '@react-navigation/native';
import * as React from 'react';
import { View, ScrollView, TouchableOpacity, useWindowDimensions, SafeAreaView, useColorScheme } from 'react-native';
import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { PREMIUM_CONFIGS } from '~/lib/in-app-db/states/telangana/premium-data';
import { useAuth } from '~/lib/core/contexts/AuthContext';

interface DashboardScreenProps {
  username: string;
}

export function DashboardScreen({ username }: DashboardScreenProps) {
  const ref = React.useRef(null);
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  
  const premiumConfig = PREMIUM_CONFIGS[username];
  const hasAccess = premiumConfig?.super_admins?.includes(user?.email);
  
  useScrollToTop(ref);

  const isDesktop = width >= 768;
  const bgColor = colorScheme === 'dark' ? 'bg-gray-900' : 'bg-white';
  const cardBg = colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const textColor = colorScheme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const subtitleColor = colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600';

  return (
    <SafeAreaView className={`flex-1 ${bgColor}`}>
      <ScrollView 
        ref={ref}
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className={`flex-1 p-4 ${isDesktop ? 'max-w-[1200px] self-center w-full' : ''}`}>
          {/* Current User Info */}
          <Card className={`mb-4 p-4 ${cardBg} shadow-sm rounded-xl`}>
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full justify-center items-center mr-3 bg-blue-50 dark:bg-blue-900/30">
                <MaterialIcons name="person" size={20} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className={`text-base font-medium ${textColor}`}>
                  {user?.email || 'Guest'}
                </Text>
                <View className="flex-row items-center gap-2">
                  <Text className={subtitleColor}>
                    {hasAccess ? 'Super Admin' : 'User'}
                  </Text>
                  <View className={`px-2 py-0.5 rounded-full ${hasAccess ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                    <Text className={hasAccess ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                      {hasAccess ? 'Has Access' : 'No Access'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </Card>

          {/* User Info Card */}
          <Card className={`mb-4 p-4 ${cardBg} shadow-sm rounded-xl`}>
            <View className="flex-row items-center mb-3">
              <View className="w-12 h-12 rounded-full justify-center items-center mr-3 bg-blue-50 dark:bg-blue-900/30">
                <MaterialIcons name="person" size={24} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className={`text-lg font-semibold ${textColor}`}>
                  {username}
                </Text>
                <Text className={subtitleColor}>
                  {premiumConfig?.tenant_supabase_url ? 'Telangana' : 'No location set'}
                </Text>
              </View>
            </View>

            {/* Super Admins */}
            {premiumConfig?.super_admins && premiumConfig.super_admins.length > 0 && (
              <View className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <Text className={`text-sm font-medium mb-2 ${textColor}`}>Super Admins:</Text>
                <View className="flex-row flex-wrap gap-2">
                  {premiumConfig.super_admins.map((email) => (
                    <View key={email} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                      <Text className={subtitleColor}>{email}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Card>

          {/* Related Channels */}
          {premiumConfig?.related_channels && premiumConfig.related_channels.length > 0 && (
            <Card className={`mb-4 p-4 ${cardBg} shadow-sm rounded-xl`}>
              <Text className={`text-lg font-semibold mb-4 ${textColor}`}>Related Channels</Text>
              <View className="flex-row flex-wrap gap-2">
                {premiumConfig.related_channels.map((channel) => (
                  <TouchableOpacity 
                    key={channel.username}
                    className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full"
                    onPress={() => router.push(`/dashboard/${channel.username}/create-message`)}
                  >
                    <Text className="text-blue-700 dark:text-blue-400">{channel.username}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 