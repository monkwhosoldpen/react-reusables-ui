export interface Channel {
  username: string;
  name: string;
  description?: string;
  avatar_url?: string;
  category?: string;
  premium: boolean;
  owner_username?: string;
  is_realtime: boolean;
  is_related_channel: boolean;
  last_message?: string;
  related_channels?: string[];
  created_at: string;
  updated_at: string;
}

export type ChannelCreate = Omit<Channel, 'created_at' | 'updated_at'>;

export type ChannelUpdate = Partial<ChannelCreate>;
