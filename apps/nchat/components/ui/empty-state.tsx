import { View } from 'react-native';
import { Text } from './text';
import { Button } from './button';

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  icon?: React.ReactNode;
};

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-4">
      {icon && <View className="mb-4">{icon}</View>}
      <Text className="text-lg font-semibold mb-2">{title}</Text>
      {description && (
        <Text className="text-center text-muted-foreground mb-6">
          {description}
        </Text>
      )}
      {action && (
        <Button variant="outline" onPress={action.onPress}>
          <Text>{action.label}</Text>
        </Button>
      )}
    </View>
  );
} 