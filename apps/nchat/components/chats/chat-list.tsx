import React from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { ChatListItem } from '~/lib/types/chat';
import { ChatListItemView } from './chat-list-item';
import { MessageSquarePlus } from 'lucide-react-native';

type ChatListViewProps = {
  chats: ChatListItem[];
  onChatPress: (username: string) => void;
  isLoading?: boolean;
  onEndReached?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
};

export const ChatListView = React.memo(({ 
  chats, 
  onChatPress,
  isLoading,
  onEndReached,
  onRefresh,
  refreshing
}: ChatListViewProps) => {
  if (isLoading && chats.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <ActivityIndicator size="large" className="text-primary" />
      </View>
    );
  }

  if (!isLoading && chats.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <View className="items-center">
          <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
            <MessageSquarePlus size={32} className="text-primary" />
          </View>
          <Text className="text-lg font-semibold mb-2 text-foreground">No Chats Yet</Text>
          <Text className="text-center text-muted-foreground text-base">
            Start a new conversation{'\n'}to begin chatting
          </Text>
        </View>
      </View>
    );
  }

  return (
    <FlatList
      data={chats}
      renderItem={({ item }) => (
        <ChatListItemView item={item} onPress={onChatPress} />
      )}
      keyExtractor={item => item._id}
      contentContainerStyle={{ 
        flexGrow: 1,
      }}
      style={{
        flex: 1,
        backgroundColor: 'hsl(var(--background))'
      }}
      ItemSeparatorComponent={() => (
        <View style={{ 
          height: 1, 
          backgroundColor: 'hsl(var(--border))',
          opacity: 0.1,
          marginLeft: 80 // Aligns with the end of avatar
        }} />
      )}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      refreshing={refreshing}
      onRefresh={onRefresh}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={() => <View className="h-2" />}
      ListFooterComponent={() => <View className="h-2" />}
      // Improve scrolling performance
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
    />
  );
}); 