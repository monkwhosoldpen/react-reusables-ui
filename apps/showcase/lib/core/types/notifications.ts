import { ChannelActivity } from './channel.types';

export type { ChannelActivity }

export interface NotificationMessage {
  id: string;
  message_text?: string;
  created_at: string;
}

export interface ActiveNotification {
  id: string;
  title: string;
  body: string;
  icon?: string;
  image?: string;
  badge?: string;
  tag?: string;
  data?: {
    channelActivity?: ChannelActivity;
    url?: string;
    [key: string]: any;
  };
  actions?: {
    action: string;
    title: string;
    icon?: string;
  }[];
  showInApp?: boolean;
  silent?: boolean;
  timestamp: number;
  isRead?: boolean;
  seen?: boolean;
} 