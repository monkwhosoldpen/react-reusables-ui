import { View } from 'react-native';
import { Text } from '~/components/ui/text';

export default function AIDashboardTab() {
  return (
    <View className="p-4">
      <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        AI Dashboard Content
      </Text>
      <Text className="text-sm text-gray-600 dark:text-gray-400">
        This is the AI Dashboard
      </Text>
    </View>
  );
} 