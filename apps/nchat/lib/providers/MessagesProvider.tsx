import React, { createContext, useContext, ReactNode } from 'react';
import { useLiveChannelMessages } from '~/lib/hooks/useLiveChannelMessages';
import { useChannelMessages } from '~/lib/hooks/useChannelMessages';
import type { Message } from '~/lib/types/database.types';

interface MessagesContextType {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (text: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  editMessage: (messageId: string, newText: string) => Promise<void>;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

interface MessagesProviderProps {
  children: ReactNode;
  channelId: string;
  isRealtime?: boolean;
}

export function MessagesProvider({ children, channelId, isRealtime = false }: MessagesProviderProps) {
  // Use the appropriate hook based on isRealtime flag
  const liveHook = useLiveChannelMessages(channelId);
  const regularHook = useChannelMessages(channelId);
  
  const hook = isRealtime ? liveHook : regularHook;

  const value = {
    messages: hook.messages,
    isLoading: hook.isLoading,
    error: hook.error,
    sendMessage: hook.sendMessage,
    deleteMessage: hook.deleteMessage,
    editMessage: hook.editMessage,
  };

  return (
    <MessagesContext.Provider value={value}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessagesContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
} 