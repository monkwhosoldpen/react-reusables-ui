import { ActivityIndicator, View } from 'react-native';
import { Text } from './text';

type SpinnerProps = {
  text?: string;
  size?: 'small' | 'large';
};

export function Spinner({ text, size = 'large' }: SpinnerProps) {
  return (
    <View className="flex-1 items-center justify-center p-4">
      <ActivityIndicator size={size} className="text-primary mb-4" />
      {text && <Text className="text-muted-foreground">{text}</Text>}
    </View>
  );
} 