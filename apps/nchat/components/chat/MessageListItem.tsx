import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { formatDistanceToNow, format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react-native';

type MessageListItemProps = {
  message: {
    text: string;
    timestamp: Date;
    sender: 'user' | 'goat';
    status?: 'sent' | 'delivered' | 'read';
  };
  isRocketChannel?: boolean;
};

export function MessageListItem({ message, isRocketChannel }: MessageListItemProps) {
  const isUser = message.sender === 'user';
  
  return (
    <View 
      className={`flex-row mb-1 ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {/* Message Bubble */}
      <View 
        className={`rounded-2xl px-3 py-2 max-w-[85%] ${
          isUser 
            ? 'bg-primary/10 rounded-tr-none' 
            : 'bg-background rounded-tl-none border border-border'
        }`}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 2
        }}
      >
        {/* Message Text */}
        <Text 
          className={`text-base ${
            isUser ? 'text-foreground' : 'text-foreground'
          }`}
          selectable
        >
          {message.text}
        </Text>

        {/* Time and Status */}
        <View className="flex-row items-center justify-end mt-1 gap-1">
          <Text className="text-xs text-muted-foreground">
            {format(message.timestamp, 'HH:mm')}
          </Text>
          {isUser && (
            <View className="flex-row">
              {message.status === 'read' ? (
                <CheckCheck size={14} className="text-blue-500" />
              ) : message.status === 'delivered' ? (
                <CheckCheck size={14} className="text-muted-foreground" />
              ) : (
                <Check size={14} className="text-muted-foreground" />
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
} 