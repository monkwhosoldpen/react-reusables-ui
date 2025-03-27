import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { cn } from '~/lib/utils';
import { ChatListItem } from '~/lib/types/chat';
import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar';
import { format } from 'date-fns';

type ChatListItemProps = {
  item: ChatListItem;
  onPress: (username: string) => void;
};

export const ChatListItemView = React.memo(({ item, onPress }: ChatListItemProps) => {
  if (!item?.goatInfo) {
    return null;
  }

  const displayName = item.goatInfo.metadata_with_translations.name.english || item.name;
  const avatarText = displayName.charAt(0).toUpperCase();
  const color = Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
  const placeholderUrl = `https://placehold.co/200x200/${color}/ffffff?text=${avatarText}`;
  const avatarUrl = item.goatInfo.img_url || placeholderUrl;
  const isPremium = item.goatInfo.premium;

  return (
    <Pressable 
      onPress={() => onPress(item.username)}
      className={cn(
        "active:bg-muted/50",
        "android:overflow-hidden",
        "bg-background",
        "px-4 py-3",
      )}
      style={({ pressed }) => ({
        backgroundColor: pressed ? 'hsl(var(--muted))' : undefined,
      })}
    >
      <View className="flex-row items-center gap-4">
        <Avatar className="h-14 w-14" alt={displayName}>
          <AvatarImage 
            source={{ uri: avatarUrl }}
            defaultSource={{ uri: placeholderUrl }}
            onError={(e) => console.log('Avatar image error:', e.nativeEvent.error)}
          />
          <AvatarFallback>
            <Text className="text-lg">{avatarText}</Text>
          </AvatarFallback>
        </Avatar>

        <View className="flex-1">
          <Text 
            className={cn(
              "text-base font-medium",
              isPremium ? "text-[#FFD700]" : "text-foreground"
            )}
            numberOfLines={1}
          >
            {displayName}
          </Text>
          {item.lastMessage && (
            <Text className="text-sm text-muted-foreground" numberOfLines={1}>
              {item.lastMessage}
            </Text>
          )}
        </View>

        <View className="items-end">
          {item.timestamp && (
            <Text className="text-xs text-muted-foreground mb-1">
              {format(new Date(item.timestamp), 'HH:mm')}
            </Text>
          )}
          {item.unreadCount > 0 && (
            <View className="bg-primary rounded-full min-w-[20px] h-5 items-center justify-center px-1.5">
              <Text className="text-xs font-medium text-primary-foreground">
                {item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}); 