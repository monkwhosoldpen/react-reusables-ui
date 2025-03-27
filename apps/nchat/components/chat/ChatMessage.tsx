import { View, Image } from 'react-native';
import { Text } from '~/components/ui/text';
import { Message } from '~/lib/types/message';
import { Check, CheckCheck, MoreVertical } from 'lucide-react-native';
import { format } from 'date-fns';

type ChatMessageProps = {
  message: Message;
};

export function ChatMessage({ message }: ChatMessageProps) {
  const isGoat = message.sender === 'goat';
  const formattedTime = format(message.timestamp, 'HH:mm');

  return (
    <View className="flex-row mb-3">
      {/* Avatar - always on left */}
      <View className="h-8 w-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
        <Image
          source={{ 
            uri: isGoat 
              ? 'https://api.dicebear.com/7.x/bottts/png?seed=' + message.sender
              : 'https://api.dicebear.com/7.x/avataaars/png?seed=' + message.sender
          }}
          className="h-full w-full"
        />
      </View>
      
      {/* Message content - takes remaining width */}
      <View className="flex-1">
        {/* Message bubble */}
        <View 
          className={`
            px-3 py-2 rounded-2xl max-w-[85%]
            ${isGoat 
              ? 'bg-card rounded-tl-none border border-border self-start' 
              : 'bg-primary rounded-tl-none self-end'
            }
          `}
        >
          {/* Sender name */}
          {isGoat && (
            <Text className="text-xs font-medium text-primary mb-1">
              {message.sender}
            </Text>
          )}
          
          {/* Message text */}
          <Text 
            className={`${isGoat ? 'text-foreground' : 'text-primary-foreground'}`}
          >
            {message.text}
          </Text>

          {/* Timestamp and status */}
          <View className="flex-row items-center justify-end mt-1 gap-1">
            <Text 
              className={`text-[10px] ${
                isGoat ? 'text-muted-foreground' : 'text-primary-foreground/70'
              }`}
            >
              {formattedTime}
            </Text>
            {!isGoat && (
              message.status === 'read' ? (
                <CheckCheck className="w-3 h-3 text-primary-foreground/70" />
              ) : (
                <Check className="w-3 h-3 text-primary-foreground/70" />
              )
            )}
          </View>
        </View>

        {/* Options button */}
        <View 
          className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="w-4 h-4 text-muted-foreground" />
        </View>
      </View>
    </View>
  );
} 