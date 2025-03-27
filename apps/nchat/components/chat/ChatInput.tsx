import { View } from 'react-native';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Send } from 'lucide-react-native';

type ChatInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  channelName?: string;
  isConnected: boolean;
};

export default function ChatInput({ value, onChangeText, onSend, channelName, isConnected }: ChatInputProps) {
  return (
    <View className="border-t border-border bg-background">
      <View className="p-4 flex-row items-center gap-2 max-w-[1200px] mx-auto w-full">
        <Input
          placeholder={`Message ${channelName || 'channel'}...`}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSend}
          className="flex-1"
        />
        <Button
          size="icon"
          disabled={!value.trim() || !isConnected}
          onPress={onSend}
        >
          <Send className="h-4 w-4" />
        </Button>
      </View>
    </View>
  );
}
