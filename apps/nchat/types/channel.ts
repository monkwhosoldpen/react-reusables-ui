export interface Channel {
  username: string;
  name: string;
  description?: string;
  category: string;
  is_related_channel: boolean;
  created_at: string;
  avatar_url?: string;
  owner_username: string;
  premium?: boolean;
  metadata?: Record<string, any>;
  onboarding_config?: Record<string, any>;
  is_realtime?: boolean;
  is_auto_approve?: boolean;
  last_message?: Record<string, any>;
  related_channels?: string[];
  updated_at?: string;
  access_status?: 'pending' | 'granted' | 'rejected' | 'none';
} 