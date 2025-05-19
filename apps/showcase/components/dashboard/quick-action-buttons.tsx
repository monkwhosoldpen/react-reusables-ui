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
  messageCount: number;
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
  messageCount,
}: QuickActionButtonsProps) {
  return (
    <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 flex-row items-center space-x-2">
      <View className="w-[100%]">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {clientType === 'basic' && (
            <>
              <Button variant="outline" onPress={() => handleQuickActionClick("small")} className="min-w-[120px]">
                <Text className="text-gray-900 dark:text-white text-xs">Short Text</Text>
              </Button>
              <Button variant="outline" onPress={() => handleQuickActionClick("long")} className="min-w-[120px]">
                <Text className="text-gray-900 dark:text-white text-xs">Long Text</Text>
              </Button>
              <Button variant="outline" onPress={handleBulkCreateShort} className="min-w-[160px]">
                <Text className="text-gray-900 dark:text-white text-xs text-center">Bulk Create Short</Text>
              </Button>
              <Button variant="outline" onPress={handleBulkCreateLong} className="min-w-[160px]">
                <Text className="text-gray-900 dark:text-white text-xs text-center">Bulk Create Long</Text>
              </Button>
            </>
          )}
          {clientType === 'pro' && (
            <>
              <Button variant="outline" onPress={() => handleQuickActionClick("small")} className="min-w-[120px]">
                <Text className="text-gray-900 dark:text-white text-xs">Short Text</Text>
              </Button>
              <Button variant="outline" onPress={() => handleQuickActionClick("long")} className="min-w-[120px]">
                <Text className="text-gray-900 dark:text-white text-xs">Long Text</Text>
              </Button>
              <Button variant="outline" onPress={() => handleQuickActionClick("superfeed")} className="min-w-[160px]">
                <Text className="text-gray-900 dark:text-white text-xs text-center">Create Superfeed Item</Text>
              </Button>
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
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
