import React from "react";
import { ScrollView, View } from "react-native";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";

interface QuickActionButtonsProps {
  /* existing handlers */
  handleQuickActionClick: (type: "small" | "long" | "superfeed") => void;
  handleBulkCreateShort: () => Promise<void>;
  handleBulkCreateLong: () => Promise<void>;
  handleBulkCreatePolls: () => Promise<void>;
  handleBulkCreateQuizzes: () => Promise<void>;
  handleBulkCreateSurveys: () => Promise<void>;
  /* NEW — required, mirrors StatusBar */
  isPublic: boolean;
  clientType: string;
  hasAccess: boolean;
  userRole?: {
    role: string;
  } | null;
}

export function QuickActionButtons({
  handleQuickActionClick,
  handleBulkCreateShort,
  handleBulkCreateLong,
  handleBulkCreatePolls,
  handleBulkCreateQuizzes,
  handleBulkCreateSurveys,
  isPublic,
  clientType,
  hasAccess,
  userRole,
}: QuickActionButtonsProps) {
  return (
    <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 space-y-2">
      {/* Row 1: Horizontal scrollable toolbar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {/* Quick Action Buttons */}
        <Button variant="outline" onPress={() => handleQuickActionClick("small")}
          className="min-w-[120px]">
          <Text className="text-gray-900 dark:text-white text-xs">Short Text</Text>
        </Button>
        <Button variant="outline" onPress={() => handleQuickActionClick("long")}
          className="min-w-[120px]">
          <Text className="text-gray-900 dark:text-white text-xs">Long Text</Text>
        </Button>
        <Button variant="outline" onPress={() => handleQuickActionClick("superfeed")}
          className="min-w-[160px]">
          <Text className="text-gray-900 dark:text-white text-xs text-center">Create Superfeed Item</Text>
        </Button>
        {/* Interactive Bulk Create Buttons */}
        <Button variant="outline" onPress={handleBulkCreateShort} className="min-w-[160px]">
          <Text className="text-gray-900 dark:text-white text-xs text-center">Bulk Create Short</Text>
        </Button>
        <Button variant="outline" onPress={handleBulkCreateLong} className="min-w-[160px]">
          <Text className="text-gray-900 dark:text-white text-xs text-center">Bulk Create Long</Text>
        </Button>
        <Button variant="outline" onPress={handleBulkCreatePolls} className="min-w-[160px]">
          <Text className="text-gray-900 dark:text-white text-xs text-center">Bulk Create Polls</Text>
        </Button>
        <Button variant="outline" onPress={handleBulkCreateQuizzes} className="min-w-[160px]">
          <Text className="text-gray-900 dark:text-white text-xs text-center">Bulk Create Quizzes</Text>
        </Button>
        <Button variant="outline" onPress={handleBulkCreateSurveys} className="min-w-[160px]">
          <Text className="text-gray-900 dark:text-white text-xs text-center">Bulk Create Surveys</Text>
        </Button>
      </ScrollView>

      {/* Row 2: Status pills (mirrors StatusBar right‑side) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {/* Public / Private */}
        <View className={`px-2 py-1 rounded-full ${isPublic ? 'bg-green-100 dark:bg-green-900' : 'bg-blue-100 dark:bg-blue-900'}`}>
          <Text className={`text-xs font-medium ${isPublic ? 'text-green-800 dark:text-green-200' : 'text-blue-800 dark:text-blue-200'}`}>
            {isPublic ? 'Public' : 'Private'}
          </Text>
        </View>
        {/* Client Type */}
        <View className="px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900">
          <Text className="text-xs font-medium text-yellow-800 dark:text-yellow-200">{clientType}</Text>
        </View>
        {/* Access */}
        <View className={`px-2 py-1 rounded-full ${hasAccess ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
          <Text className={`text-xs font-medium ${hasAccess ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
            {hasAccess ? 'Has Access' : 'No Access'}
          </Text>
        </View>
        {/* Role (only if access) */}
        {hasAccess && userRole && (
          <View className="px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900">
            <Text className="text-xs font-medium text-purple-800 dark:text-purple-200">{userRole.role}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
