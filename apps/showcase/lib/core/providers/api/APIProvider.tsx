import React, { createContext, useContext } from 'react';
import { supabase } from '../../supabase';
import { Channel } from '../../models/Channel';

export type ChannelData = Channel;

export interface APIContextType {
  getChannels: () => Promise<{ data: ChannelData[] }>;
  createChannel: (channel: Omit<ChannelData, 'created_at' | 'updated_at'>) => Promise<ChannelData>;
  deleteAllChannels: () => Promise<void>;
}

const APIContext = createContext<APIContextType | undefined>(undefined);

export function APIProvider({ children }: { children: React.ReactNode }) {
  const api: APIContextType = {
    getChannels: async () => {
      const { data, error } = await supabase
        .from('channels')
        .select('*');

      if (error) throw error;

      return { data };
    },
    createChannel: async (channel) => {
      const { data, error } = await supabase
        .from('channels')
        .insert([{
          username: channel.username,
          name: channel.name,
          description: channel.description,
          avatar_url: channel.avatar_url,
          category: channel.category,
          premium: channel.premium
        }])
        .select()
        .single();

      if (error) throw error;

      return data;
    },
    deleteAllChannels: async () => {
      const { error } = await supabase
        .from('channels')
        .delete()
        .neq('username', 'elonmusk'); // Protect kmocka channel

      if (error) throw error;
    }
  };

  return (
    <APIContext.Provider value={api}>
      {children}
    </APIContext.Provider>
  );
}

export function useAPI() {
  const context = useContext(APIContext);
  if (context === undefined) {
    throw new Error('useAPI must be used within an APIProvider');
  }
  return context;
} 