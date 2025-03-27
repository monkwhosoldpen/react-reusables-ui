import React from 'react';
import { View } from 'react-native';
import { Button } from '~/components/ui/button';
import { MessageSquarePlus } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatListView } from './chat-list';
import { GoatSelectionDialog } from './goat-selection-dialog';

export function HomeContent() {
  const insets = useSafeAreaInsets();

  // Mock data
  const displayedChatList = [{ id: 1, name: 'Chat 1' }, { id: 2, name: 'Chat 2' }];
  const loading = false;
  const dialogOpen = false;
  const selectedGoats = [];
  const goats = [];

  return (
    <>
      <ChatListView
        onChatPress={(chat) => console.log('Chat pressed:', chat)}
        isLoading={loading}
        onEndReached={() => console.log('Load more')}
        onRefresh={() => console.log('Refresh')}
        refreshing={false} chats={[]}      />

      {/* FAB */}
      <View
        className="absolute"
        style={{
          right: 16,
          bottom: insets.bottom + 16
        }}
      >
        <Button
          className="h-14 w-14 rounded-full bg-primary shadow-lg"
          onPress={() => console.log('New Chat')}
        >
          <MessageSquarePlus className="h-6 w-6 text-primary-foreground" />
        </Button>
      </View>

      {/* Goat Selection Dialog */}
      <GoatSelectionDialog
        open={dialogOpen}
        onOpenChange={(open) => console.log('Dialog open state changed:', open)}
        onSelectGoat={(goat) => console.log('Goat selected:', goat)}
        onCancel={() => console.log('Dialog canceled')}
        onSave={() => console.log('Dialog saved')}
        goats={[]}      />
    </>
  );
} 