import { DBSchema } from 'idb';

// Interfaces
export interface LastMessage {
  id: string;
  created_at: string;
  message_text: string;
}

export interface ChannelActivityRecord {
  username: string;
  last_message: LastMessage;
  last_updated_at: string;
  message_count: number;
}

export interface ChannelViewedRecord {
  user_id: string;
  username: string;
  last_viewed: string;
  message_count: number;
}

export interface TenantRequest {
  id: string;
  uid: string;
  status: string;
  requestInfo?: any;
  type?: string;
  username?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserLocation {
  user_id: string;
  state: string;
  district: string;
  mp_constituency: string;
  assembly_constituency: string;
  mandal: string;
  village: string;
  ward: string;
  pincode: string;
  latitude: number;
  longitude: number;
  last_updated: string;
}

// New interfaces for missing fields
export interface UserChannelFollow {
  id?: string;
  user_id: string;
  username: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserChannelLastViewed {
  id?: string;
  user_id: string;
  username: string;
  last_viewed: string;
  message_count?: number;
}

// Define the database schema
export interface NchatDB extends DBSchema {
  users: {
    key: string;
    value: {
      id: string;
      email: string;
      role: string;
      created_at: string;
      last_sign_in_at: string;
      updated_at: string;
    };
    indexes: { 'by-email': string };
  };
  channels_messages: {
    key: string;
    value: {
      id: string;
      username: string;
      message_text: string;
      created_at: string;
      updated_at: string;
      translations: any;
      is_translated: boolean;
      message_count: number;
    };
    indexes: { 'by-username': string };
  };
  channels_activity: {
    key: string;
    value: {
      username: string;
      last_updated_at: string;
      message_count: number;
      last_message: any;
    };
    indexes: { 'by-username': string };
  };
  user_language: {
    key: string;
    value: {
      user_id: string;
      language: string;
    };
    indexes: { 'by-user': string };
  };
  user_notifications: {
    key: string;
    value: {
      user_id: string;
      notifications_enabled: boolean;
      last_viewed?: string;
    };
    indexes: { 'by-user': string };
  };
  tenant_requests: {
    key: string;
    value: {
      id: string;
      requestInfo: any;
      type: string;
      uid: string;
      username: string;
      status: string;
      created_at: string;
      updated_at: string;
    };
    indexes: { 'by-username': string; 'by-user': string };
  };
  user_location: {
    key: string;
    value: {
      user_id: string;
      state: string;
      district: string;
      mp_constituency: string;
      assembly_constituency: string;
      mandal: string;
      village: string;
      ward: string;
      pincode: string;
      latitude: number;
      longitude: number;
      last_updated: string;
    };
    indexes: { 'by-user': string };
  };
  push_subscriptions: {
    key: string;
    value: {
      user_id: string;
      endpoint: string;
      keys: any;
      device_type: string;
      browser: string;
      os: string;
      platform: string;
      device_id: string;
      app_version: string;
      notifications_enabled: boolean;
      created_at: string;
      updated_at: string;
    };
    indexes: { 'by-user': string };
  };
  // New stores for missing data
  user_channel_follow: {
    key: string; // Composite key of user_id + username
    value: UserChannelFollow;
    indexes: { 'by-user': string };
  };
  user_channel_last_viewed: {
    key: string; // Composite key of user_id + username
    value: UserChannelLastViewed;
    indexes: { 'by-user': string };
  };
} 