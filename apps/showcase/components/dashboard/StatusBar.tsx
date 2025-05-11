import React from 'react';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';

interface StatusBarProps {
  isPublic: boolean;
  clientType: string;
  hasAccess: boolean;
  userRole?: {
    role: string;
  } | null;
}

export function StatusBar({ isPublic, clientType, hasAccess, userRole }: StatusBarProps) {
  return (
    <View className="mb-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            Channel Status
          </Text>
          <View className="flex-row items-center space-x-2">
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Status: {isPublic ? 'Public' : 'Private'}
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              • Type: {clientType}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <View className={`px-2 py-1 rounded-full ${isPublic ? 'bg-green-100 dark:bg-green-900' : 'bg-blue-100 dark:bg-blue-900'}`}>
            <Text className={`text-xs font-medium ${isPublic ? 'text-green-800 dark:text-green-200' : 'text-blue-800 dark:text-blue-200'}`}>
              {isPublic ? 'Public' : 'Private'}
            </Text>
          </View>
          <View className="ml-2 px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900">
            <Text className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
              {clientType}
            </Text>
          </View>
          <View className={`ml-2 px-2 py-1 rounded-full ${hasAccess ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
            <Text className={`text-xs font-medium ${hasAccess ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
              {hasAccess ? 'Has Access' : 'No Access'}
            </Text>
          </View>
          {hasAccess && userRole && (
            <View className="ml-2 px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900">
              <Text className="text-xs font-medium text-purple-800 dark:text-purple-200">
                {userRole.role}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
} 