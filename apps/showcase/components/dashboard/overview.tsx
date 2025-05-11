import React from 'react';
import { View, ScrollView, useColorScheme, TouchableOpacity } from 'react-native';
import { Text } from '~/components/ui/text';
import { Avatar, AvatarImage } from '~/components/ui/avatar';
import { MaterialIcons } from "@expo/vector-icons";
import { Card } from '~/components/ui/card';
import { useRouter } from 'expo-router';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion';

interface OverviewTabProps {
  username: string;
  user: {
    email?: string;
    id?: string;
  } | null;
  userRole?: {
    email: string;
    role: string;
    channelUsername?: string;
  };
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
  relatedChannelsCount 
}: OverviewTabProps) {
  const colorScheme = useColorScheme();
  const router = useRouter();

  // Color scheme based styles
  const iconColor = colorScheme === 'dark' ? '#fff' : '#111827';
  const avatarBg = colorScheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200';
  const subtitleColor = colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const borderColor = colorScheme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const bgColor = colorScheme === 'dark' ? 'bg-gray-900' : 'bg-white';
  const cardBg = colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white';

  return (
    <ScrollView 
      className={`flex-1 ${bgColor}`}
      contentContainerClassName="p-4"
    >
      {/* User Info Accordion */}
      <Accordion
        type="single"
        collapsible
        defaultValue="user-info"
        className="mb-4"
      >
        <AccordionItem value="user-info">
          <AccordionTrigger>
            <View className="flex-row items-center justify-between w-full">
              <View className="flex-row items-center">
                <Avatar 
                  className="h-10 w-10 mr-3"
                  style={{ borderWidth: 2, borderColor: colorScheme === 'dark' ? '#1F2937' : '#F3F4F6' }}
                  alt={username}
                >
                  <AvatarImage source={{ uri: 'https://placehold.co/150' }} />
                </Avatar>
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
                  <Avatar 
                    className="h-12 w-12 mr-3"
                    style={{ borderWidth: 2, borderColor: colorScheme === 'dark' ? '#1F2937' : '#F3F4F6' }}
                    alt={username}
                  >
                    <AvatarImage source={{ uri: 'https://placehold.co/150' }} />
                  </Avatar>
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
    </ScrollView>
  );
} 