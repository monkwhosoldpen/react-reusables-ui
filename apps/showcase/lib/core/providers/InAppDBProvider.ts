import { create } from 'zustand';
import { DBSchema } from 'idb';

// Constants
export const DB_NAME = 'nchat_guest_db';
export const DB_VERSION = 9;

// Types and Interfaces
export interface LastMessage {
  id: string;
  created_at: string;
  message_text: string;
}

export interface ChannelActivityRecord {
  username: string;
  last_updated_at: string;
  message_count: number;
  last_message: LastMessage;
}

export interface TenantRequest {
  id: string;
  requestInfo: any;
  type: string;
  uid: string;
  username: string;
  status: string;
  created_at: string;
  updated_at: string;
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

export interface UserChannelFollow {
  user_id: string;
  username: string;
  followed_at: string;
}

export interface UserChannelLastViewed {
  user_id: string;
  username: string;
  last_viewed_at: string;
}

export interface PushSubscriptionData {
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
}

// Database Schema
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
  user_channel_follow: {
    key: [string, string]; // Composite key of user_id + username
    value: UserChannelFollow;
    indexes: { 'by-user': string };
  };
  user_channel_last_viewed: {
    key: [string, string]; // Composite key of user_id + username
    value: UserChannelLastViewed;
    indexes: { 'by-user': string };
  };
}

// Store State Interface
interface InAppDBState {
  // Store data
  users: Map<string, NchatDB['users']['value']>;
  channels_messages: Map<string, NchatDB['channels_messages']['value']>;
  channels_activity: Map<string, NchatDB['channels_activity']['value']>;
  user_language: Map<string, NchatDB['user_language']['value']>;
  user_notifications: Map<string, NchatDB['user_notifications']['value']>;
  tenant_requests: Map<string, NchatDB['tenant_requests']['value']>;
  user_location: Map<string, NchatDB['user_location']['value']>;
  push_subscriptions: Map<string, NchatDB['push_subscriptions']['value']>;
  user_channel_follow: Map<string, NchatDB['user_channel_follow']['value']>;
  user_channel_last_viewed: Map<string, NchatDB['user_channel_last_viewed']['value']>;

  // Basic CRUD operations
  put: (storeName: keyof NchatDB, key: string | [string, string], value: any) => void;
  get: (storeName: keyof NchatDB, key: string | [string, string]) => any;
  getAll: (storeName: keyof NchatDB) => any[];
  delete: (storeName: keyof NchatDB, key: string | [string, string]) => void;
  clear: (storeName: keyof NchatDB) => void;
  clearAll: () => void;

  // User operations
  createUser: (user: NchatDB['users']['value']) => void;
  getUser: (id: string) => NchatDB['users']['value'] | undefined;
  getAllUsers: () => NchatDB['users']['value'][];

  // User Language operations
  setUserLanguage: (userId: string, language: string) => void;
  getUserLanguage: (userId: string) => string | undefined;

  // User Notifications operations
  setUserNotifications: (userId: string, enabled: boolean) => void;
  getUserNotifications: (userId: string) => boolean;

  // User Location operations
  setUserLocation: (userId: string, location: NchatDB['user_location']['value']) => void;
  getUserLocation: (userId: string) => NchatDB['user_location']['value'] | null;

  // Push Subscription operations
  savePushSubscription: (subscription: NchatDB['push_subscriptions']['value']) => void;
  getPushSubscriptions: (userId: string) => NchatDB['push_subscriptions']['value'][];

  // Tenant Request operations
  saveTenantRequests: (userId: string, requests: NchatDB['tenant_requests']['value'][]) => void;
  getTenantRequests: (userId: string) => NchatDB['tenant_requests']['value'][];

  // Raw data operations
  saveRawApiData: (userId: string, apiData: any) => void;
  getAllRawData: (userId: string) => Record<string, any>;
}

// Create store
export const useInAppDB = create<InAppDBState>((set, get) => ({
  // Initialize store data
  users: new Map(),
  channels_messages: new Map(),
  channels_activity: new Map(),
  user_language: new Map(),
  user_notifications: new Map(),
  tenant_requests: new Map(),
  user_location: new Map(),
  push_subscriptions: new Map(),
  user_channel_follow: new Map(),
  user_channel_last_viewed: new Map(),

  // Basic CRUD operations
  put: (storeName, key, value) => {
    set((state) => {
      const store = state[storeName] as Map<any, any>;
      const newStore = new Map(store);
      newStore.set(Array.isArray(key) ? key.join(':') : key, value);
      return { [storeName]: newStore };
    });
  },

  get: (storeName, key) => {
    const store = get()[storeName] as Map<any, any>;
    return store.get(Array.isArray(key) ? key.join(':') : key);
  },

  getAll: (storeName) => {
    const store = get()[storeName] as Map<any, any>;
    return Array.from(store.values());
  },

  delete: (storeName, key) => {
    set((state) => {
      const store = state[storeName] as Map<any, any>;
      const newStore = new Map(store);
      newStore.delete(Array.isArray(key) ? key.join(':') : key);
      return { [storeName]: newStore };
    });
  },

  clear: (storeName) => {
    set((state) => ({ [storeName]: new Map() }));
  },

  clearAll: () => {
    set({
      users: new Map(),
      channels_messages: new Map(),
      channels_activity: new Map(),
      user_language: new Map(),
      user_notifications: new Map(),
      tenant_requests: new Map(),
      user_location: new Map(),
      push_subscriptions: new Map(),
      user_channel_follow: new Map(),
      user_channel_last_viewed: new Map(),
    });
  },

  // User operations
  createUser: (user) => {
    set((state) => {
      const newUsers = new Map(state.users);
      newUsers.set(user.id, user);
      return { users: newUsers };
    });
  },

  getUser: (id) => {
    return get().users.get(id);
  },

  getAllUsers: () => {
    return Array.from(get().users.values());
  },

  // User Language operations
  setUserLanguage: (userId, language) => {
    set((state) => {
      const newLanguages = new Map(state.user_language);
      newLanguages.set(userId, { user_id: userId, language });
      return { user_language: newLanguages };
    });
  },

  getUserLanguage: (userId) => {
    return get().user_language.get(userId)?.language;
  },

  // User Notifications operations
  setUserNotifications: (userId, enabled) => {
    set((state) => {
      const newNotifications = new Map(state.user_notifications);
      newNotifications.set(userId, { user_id: userId, notifications_enabled: enabled });
      return { user_notifications: newNotifications };
    });
  },

  getUserNotifications: (userId) => {
    return get().user_notifications.get(userId)?.notifications_enabled ?? true;
  },

  // User Location operations
  setUserLocation: (userId, location) => {
    set((state) => {
      const newLocations = new Map(state.user_location);
      newLocations.set(userId, location);
      return { user_location: newLocations };
    });
  },

  getUserLocation: (userId) => {
    return get().user_location.get(userId) || null;
  },

  // Push Subscription operations
  savePushSubscription: (subscription) => {
    set((state) => {
      const newSubscriptions = new Map(state.push_subscriptions);
      newSubscriptions.set(subscription.endpoint, subscription);
      return { push_subscriptions: newSubscriptions };
    });
  },

  getPushSubscriptions: (userId) => {
    return Array.from(get().push_subscriptions.values())
      .filter(sub => sub.user_id === userId);
  },

  // Tenant Request operations
  saveTenantRequests: (userId, requests) => {
    set((state) => {
      const newRequests = new Map(state.tenant_requests);
      // Clear existing requests for this user
      Array.from(newRequests.values())
        .filter(req => req.uid === userId)
        .forEach(req => newRequests.delete(req.id));
      // Add new requests
      requests.forEach(req => newRequests.set(req.id, req));
      return { tenant_requests: newRequests };
    });
  },

  getTenantRequests: (userId) => {
    return Array.from(get().tenant_requests.values())
      .filter(req => req.uid === userId);
  },

  // Raw data operations
  saveRawApiData: (userId, apiData) => {
    if (!apiData || !apiData.userPreferences) {
      console.error('Invalid API data format');
      return;
    }

    const prefs = apiData.userPreferences;

    // Save user info
    if (apiData.user) {
      get().createUser({
        id: apiData.user.id,
        email: apiData.user.email || '',
        role: 'authenticated',
        created_at: apiData.user.created_at || new Date().toISOString(),
        last_sign_in_at: apiData.user.last_sign_in_at || new Date().toISOString(),
        updated_at: apiData.user.updated_at || new Date().toISOString()
      });
    }

    // Save all raw data directly
    const saveData = (storeName: keyof NchatDB, data: any[]) => {
      if (Array.isArray(data)) {
        get().clear(storeName);
        data.forEach(item => get().put(storeName, item.id || item.user_id || item.endpoint, item));
      }
    };

    saveData('channels_messages', prefs.channels_messages);
    saveData('channels_activity', prefs.channels_activity);
    saveData('user_language', prefs.user_language);
    saveData('user_notifications', prefs.user_notifications);
    saveData('push_subscriptions', prefs.push_subscriptions);
    saveData('tenant_requests', prefs.tenant_requests || prefs.tena || []);
    saveData('user_location', prefs.user_location);
    saveData('user_channel_follow', prefs.user_channel_follow);
    saveData('user_channel_last_viewed', prefs.user_channel_last_viewed);
  },

  getAllRawData: (userId) => {
    const state = get();
    return {
      users: Array.from(state.users.values()),
      channels_messages: Array.from(state.channels_messages.values()),
      channels_activity: Array.from(state.channels_activity.values()),
      user_language: Array.from(state.user_language.values()),
      user_notifications: Array.from(state.user_notifications.values()),
      tenant_requests: Array.from(state.tenant_requests.values()),
      user_location: Array.from(state.user_location.values()),
      push_subscriptions: Array.from(state.push_subscriptions.values()),
      user_channel_follow: Array.from(state.user_channel_follow.values()),
      user_channel_last_viewed: Array.from(state.user_channel_last_viewed.values())
    };
  }
})); 