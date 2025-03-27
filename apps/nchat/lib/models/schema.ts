// Type Definitions for NChat App
// These definitions can be used with your Supabase implementation

// Define type interfaces
export interface MessageType {
  _id: string;
  msg: string;
  ts: string;
  u: UserType;
  rid: string;
  _updatedAt: string;
  attachments?: AttachmentType[];
  reactions?: { [key: string]: ReactionType };
}

export interface UserType {
  _id: string;
  username: string;
  name: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'away';
}

export interface ChannelType {
  _id: string;
  name: string;
  rid?: string;
  type: 'direct' | 'group' | 'public';
  members?: string[];
  lastMessage?: string;
  unreadCount?: number;
}

export interface AttachmentType {
  _id: string;
  type: 'image' | 'file' | 'audio' | 'video';
  url: string;
  name?: string;
  size?: number;
  messageId: string;
}

export interface ReactionType {
  _id: string;
  emoji: string;
  userIds: string[];
  messageId: string;
}

export interface PreferenceType {
  _id: string;
  key: string;
  value: string;
  updatedAt: string;
}

// Database column definitions (for reference)
export const messageColumns = {
  _id: 'string',
  msg: 'string',
  ts: 'string',
  userId: 'string',
  channelId: 'string',
  _updatedAt: 'string',
  attachments: 'jsonb',
  reactions: 'jsonb'
};

export const userColumns = {
  _id: 'string',
  username: 'string',
  name: 'string',
  avatar: 'string',
  status: 'string'
};

export const channelColumns = {
  _id: 'string',
  name: 'string',
  rid: 'string',
  type: 'string',
  members: 'jsonb',
  lastMessage: 'string',
  unreadCount: 'number'
};

export const attachmentColumns = {
  _id: 'string',
  type: 'string',
  url: 'string',
  name: 'string',
  size: 'number',
  messageId: 'string'
};

export const reactionColumns = {
  _id: 'string',
  emoji: 'string',
  userIds: 'jsonb',
  messageId: 'string'
};

export const preferenceColumns = {
  _id: 'string',
  key: 'string',
  value: 'string',
  updatedAt: 'string'
}; 