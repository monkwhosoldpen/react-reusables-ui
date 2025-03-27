import { appSchema, tableSchema } from '@nozbe/watermelondb';

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

// Add Preference type and schema
export interface PreferenceType {
  _id: string;
  key: string;
  value: string;
  updatedAt: string;
}

// Define schemas
export const messageSchema = tableSchema({
  name: 'messages',
  columns: [
    { name: '_id', type: 'string', isIndexed: true },
    { name: 'msg', type: 'string' },
    { name: 'ts', type: 'string' },
    { name: 'userId', type: 'string', isIndexed: true },
    { name: 'channelId', type: 'string', isIndexed: true },
    { name: '_updatedAt', type: 'string' },
    { name: 'attachments', type: 'string', isOptional: true }, // JSON string
    { name: 'reactions', type: 'string', isOptional: true }, // JSON string
  ]
});

export const userSchema = tableSchema({
  name: 'users',
  columns: [
    { name: '_id', type: 'string', isIndexed: true },
    { name: 'username', type: 'string' },
    { name: 'name', type: 'string' },
    { name: 'avatar', type: 'string', isOptional: true },
    { name: 'status', type: 'string', isOptional: true }
  ]
});

export const channelSchema = tableSchema({
  name: 'channels',
  columns: [
    { name: '_id', type: 'string', isIndexed: true },
    { name: 'name', type: 'string' },
    { name: 'rid', type: 'string', isOptional: true },
    { name: 'type', type: 'string' },
    { name: 'members', type: 'string', isOptional: true }, // JSON array
    { name: 'lastMessage', type: 'string', isOptional: true },
    { name: 'unreadCount', type: 'number', isOptional: true }
  ]
});

export const attachmentSchema = tableSchema({
  name: 'attachments',
  columns: [
    { name: '_id', type: 'string', isIndexed: true },
    { name: 'type', type: 'string' },
    { name: 'url', type: 'string' },
    { name: 'name', type: 'string', isOptional: true },
    { name: 'size', type: 'number', isOptional: true },
    { name: 'messageId', type: 'string', isIndexed: true }
  ]
});

export const reactionSchema = tableSchema({
  name: 'reactions',
  columns: [
    { name: '_id', type: 'string', isIndexed: true },
    { name: 'emoji', type: 'string' },
    { name: 'userIds', type: 'string' }, // JSON array
    { name: 'messageId', type: 'string', isIndexed: true }
  ]
});

export const preferenceSchema = tableSchema({
  name: 'preferences',
  columns: [
    { name: '_id', type: 'string', isIndexed: true },
    { name: 'key', type: 'string', isIndexed: true },
    { name: 'value', type: 'string' },
    { name: 'updatedAt', type: 'string' }
  ]
});

export default appSchema({
  version: 1,
  tables: [
    messageSchema,
    userSchema,
    channelSchema,
    attachmentSchema,
    reactionSchema,
    preferenceSchema
  ]
}); 