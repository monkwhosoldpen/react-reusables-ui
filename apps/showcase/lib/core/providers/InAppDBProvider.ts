import { create } from 'zustand';
import { DBSchema } from 'idb';
import { StateCreator } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { persist, createJSONStorage, PersistOptions } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------
export const DB_NAME = 'nchat_guest_db';
export const DB_VERSION = 9;

// -----------------------------------------------------------------------------
// Types & Interfaces
// -----------------------------------------------------------------------------
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

// -----------------------------------------------------------------------------
// IndexedDB Schema
// -----------------------------------------------------------------------------
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
    key: [string, string];
    value: UserChannelFollow;
    indexes: { 'by-user': string };
  };
  user_channel_last_viewed: {
    key: [string, string];
    value: UserChannelLastViewed;
    indexes: { 'by-user': string };
  };
}

// -----------------------------------------------------------------------------
// Zustand Store State Interface
// -----------------------------------------------------------------------------
interface InAppDBState {
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

  subscribe: <T>(selector: (state: InAppDBState) => T, listener: (selectedState: T, previousSelectedState: T) => void) => () => void;

  put: (store: keyof NchatDB, key: string | [string, string], value: any) => void;
  get: (store: keyof NchatDB, key: string | [string, string]) => any;
  getAll: (store: keyof NchatDB) => any[];
  delete: (store: keyof NchatDB, key: string | [string, string]) => void;
  clear: (store: keyof NchatDB) => void;
  clearAll: () => void;

  createUser: (user: NchatDB['users']['value']) => void;
  getUser: (id: string) => NchatDB['users']['value'] | undefined;
  getAllUsers: () => NchatDB['users']['value'][];

  setUserLanguage: (userId: string, language: string) => void;
  getUserLanguage: (userId: string) => string | undefined;

  setUserNotifications: (userId: string, enabled: boolean) => void;
  getUserNotifications: (userId: string) => boolean;

  setUserLocation: (userId: string, location: NchatDB['user_location']['value']) => void;
  getUserLocation: (userId: string) => NchatDB['user_location']['value'] | null;

  savePushSubscription: (subscription: NchatDB['push_subscriptions']['value']) => void;
  getPushSubscriptions: (userId: string) => NchatDB['push_subscriptions']['value'][];

  saveTenantRequests: (userId: string, requests: NchatDB['tenant_requests']['value'][]) => void;
  getTenantRequests: (userId: string) => NchatDB['tenant_requests']['value'][];

  saveUserChannelFollow: (userId: string, follow: NchatDB['user_channel_follow']['value']) => void;
  getUserChannelFollow: (userId: string) => NchatDB['user_channel_follow']['value'][];

  saveUserChannelUnFollow: (userId: string, follow: NchatDB['user_channel_follow']['value']) => void;
  getUserChannelUnFollow: (userId: string) => NchatDB['user_channel_follow']['value'][];


  saveUserChannelLastViewed: (userId: string, lastViewed: NchatDB['user_channel_last_viewed']['value']) => void;
  getUserChannelLastViewed: (userId: string) => NchatDB['user_channel_last_viewed']['value'][];

  saveRawApiData: (userId: string, apiData: any) => void;
  getAllRawData: (userId: string) => Record<string, any>;

  getAllAsArray: (store: keyof StoreMaps) => any[];
  setFromArray: (store: keyof StoreMaps, data: any[]) => void;
}

// -----------------------------------------------------------------------------
// Utility
// -----------------------------------------------------------------------------
const compositeKey = (k: string | [string, string]) => (Array.isArray(k) ? k.join(':') : k);

// Define types for the state that will be persisted (just the maps)
type StoreMaps = {
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
};

// Define the persisted state type (arrays instead of maps)
type PersistedState = {
  [K in keyof StoreMaps]: [string, StoreMaps[K] extends Map<string, infer V> ? V : never][];
};

// Helper function to safely convert Map to array of entries with proper typing
function mapToArray<K extends string, V>(map: Map<K, V>): [K, V][] {
  return Array.from(map.entries()) as [K, V][];
}

// Helper function to convert array back to Map with proper typing
function arrayToMap<K extends string, V>(arr: readonly [K, V][]): Map<K, V> {
  return new Map(arr);
}

// Helper to serialize state for storage
function serializeState(state: InAppDBState): unknown {
  const serialized = {
    users: mapToArray(state.users),
    channels_messages: mapToArray(state.channels_messages),
    channels_activity: mapToArray(state.channels_activity),
    user_language: mapToArray(state.user_language),
    user_notifications: mapToArray(state.user_notifications),
    tenant_requests: mapToArray(state.tenant_requests),
    user_location: mapToArray(state.user_location),
    push_subscriptions: mapToArray(state.push_subscriptions),
    user_channel_follow: mapToArray(state.user_channel_follow),
    user_channel_last_viewed: mapToArray(state.user_channel_last_viewed),
  };
  return serialized;
}

// Helper to deserialize state from storage
function deserializeState(persistedState: any): Partial<StoreMaps> {
  const state = persistedState as PersistedState;
  return {
    users: arrayToMap(state.users),
    channels_messages: arrayToMap(state.channels_messages),
    channels_activity: arrayToMap(state.channels_activity),
    user_language: arrayToMap(state.user_language),
    user_notifications: arrayToMap(state.user_notifications),
    tenant_requests: arrayToMap(state.tenant_requests),
    user_location: arrayToMap(state.user_location),
    push_subscriptions: arrayToMap(state.push_subscriptions),
    user_channel_follow: arrayToMap(state.user_channel_follow),
    user_channel_last_viewed: arrayToMap(state.user_channel_last_viewed),
  };
}

// Debounce helper
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function (...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

// Custom storage object with debounced saves
const customStorage = {
  lastSavedState: null as string | null,
  debouncedSetItem: debounce(async (name: string, value: string) => {
    try {
      // Only save if the state has actually changed
      if (value !== customStorage.lastSavedState) {
        await AsyncStorage.setItem(name, value);
        customStorage.lastSavedState = value;
      } else {
      }
    } catch (error) {
    }
  }, 1000), // Debounce for 1 second

  getItem: async (name: string): Promise<string | null> => {
    try {
      const value = await AsyncStorage.getItem(name);
      customStorage.lastSavedState = value;
      return value;
    } catch (error) {
      return null;
    }
  },

  setItem: (name: string, value: string): Promise<void> => {
    return Promise.resolve(customStorage.debouncedSetItem(name, value));
  },

  removeItem: async (name: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(name);
      customStorage.lastSavedState = null;
    } catch (error) {
    }
  },
};

// Helper to check if state has actually changed
function hasStateChanged(oldState: Partial<StoreMaps>, newState: Partial<StoreMaps>): boolean {
  return Object.keys(newState).some(key => {
    const oldMap = oldState[key as keyof StoreMaps];
    const newMap = newState[key as keyof StoreMaps];
    
    if (!oldMap || !newMap) return true;
    if (oldMap.size !== newMap.size) return true;
    
    for (const [k, v] of newMap) {
      if (!oldMap.has(k) || JSON.stringify(oldMap.get(k)) !== JSON.stringify(v)) {
        return true;
      }
    }
    return false;
  });
}

// Helper to convert Map to Array for external consumers
function mapToArrayForExternal<V>(map: Map<string, V>): V[] {
  return Array.from(map.values());
}

// Helper to convert Array to Map for storage
function arrayToMapForStorage<K extends string, V extends { id?: string; user_id?: string }>(arr: V[]): Map<string, V> {
  return new Map(arr.map(item => [item.id || item.user_id || '', item]));
}

// -----------------------------------------------------------------------------
// Store Factory (with persistence)
// -----------------------------------------------------------------------------
export const useInAppDB = create<InAppDBState>()(
  persist(
    subscribeWithSelector((set, get) => {

      // -----------------------------------------------------------------------
      // helpers
      // -----------------------------------------------------------------------
      const updateMap = <K, V>(map: Map<K, V>, key: K, val: V) => {
        const next = new Map(map);
        next.set(key, val);
        return next;
      };

      const filterMap = <T extends { [k: string]: any }>(map: Map<string, T>, fn: (v: T) => boolean) =>
        Array.from(map.values()).filter(fn);

      // -----------------------------------------------------------------------
      // store implementation
      // -----------------------------------------------------------------------
      return {
        // maps
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

        // Method to set data from Array format
        setFromArray: (store: keyof StoreMaps, data: any[]) => {
          set({ [store]: arrayToMapForStorage(data) } as any);
        },

        // generic CRUD
        put(store, key, value) {
          set(state => ({ [store]: updateMap(state[store] as any, compositeKey(key), value) } as any));
        },
        get(store, key) {
          return get()[store].get(compositeKey(key));
        },
        getAll(store) {
          return Array.from(get()[store].values());
        },
        getAllAsArray(store: keyof StoreMaps) {
          return mapToArrayForExternal(get()[store] as Map<string, any>);
        },
        delete(store, key) {
          set(state => {
            const next = new Map(state[store]);
            next.delete(compositeKey(key));
            return { [store]: next } as any;
          });
        },
        clear(store) {
          set({ [store]: new Map() } as any);
        },
        clearAll() {
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
            user_channel_last_viewed: new Map()
          });
        },

        // domain helpers (logic unchanged)
        createUser(user) {
          set(state => ({ users: updateMap(state.users, user.id, user) }));
        },
        getUser(id) {
          return get().users.get(id);
        },
        getAllUsers() {
          return Array.from(get().users.values());
        },
        setUserLanguage(userId, language) {
          const lang = Array.isArray(language) ? language[0]?.language ?? 'english' : language;
          set(state => ({ user_language: updateMap(state.user_language, userId, { user_id: userId, language: lang }) }));
        },
        getUserLanguage(userId) {
          return get().user_language.get(userId)?.language;
        },
        setUserNotifications(userId, enabled) {
          const val = Array.isArray(enabled) ? enabled[0]?.notifications_enabled ?? false : enabled;
          set(state => ({ user_notifications: updateMap(state.user_notifications, userId, { user_id: userId, notifications_enabled: val }) }));
        },
        getUserNotifications(userId) {
          return get().user_notifications.get(userId)?.notifications_enabled ?? true;
        },
        setUserLocation(userId, location) {
          if (Array.isArray(location) && location.length) {
            set(state => ({ user_location: updateMap(state.user_location, userId, location[0]) }));
          }
        },
        getUserLocation(userId) {
          return get().user_location.get(userId) ?? null;
        },
        savePushSubscription(subscription) {
          const subs = Array.isArray(subscription) ? subscription : [subscription];
          set(state => {
            const next = new Map(state.push_subscriptions);
            subs.forEach(s => {
              if (s?.endpoint) next.set(s.endpoint, s);
            });
            return { push_subscriptions: next };
          });
        },
        getPushSubscriptions(userId) {
          return filterMap(get().push_subscriptions, s => s.user_id === userId);
        },
        saveTenantRequests(userId, requests) {
          const reqs = Array.isArray(requests) ? requests : [requests];
          set(state => {
            const next = new Map(state.tenant_requests);
            // remove old
            filterMap(next, r => (r as TenantRequest).uid === userId).forEach(r => next.delete((r as TenantRequest).id));
            reqs.forEach(r => r?.id && next.set(r.id, r));
            return { tenant_requests: next };
          });
        },
        getTenantRequests(userId) {
          return filterMap(get().tenant_requests, r => r.uid === userId);
        },
        getUserChannelFollow(userId) {
          return filterMap(get().user_channel_follow, f => f.user_id === userId);
        },
        getUserChannelLastViewed(userId) {
          return filterMap(get().user_channel_last_viewed, v => v.user_id === userId);
        },
        saveUserChannelLastViewed(userId, lastViewed) {
          const views = Array.isArray(lastViewed) ? lastViewed : [lastViewed];
          set(state => {
            const next = new Map(state.user_channel_last_viewed);
            views.forEach(v => v?.user_id && next.set(`${v.user_id}:${v.username}`, v));
            return { user_channel_last_viewed: next };
          });
        },
        saveUserChannelFollow(userId, follow) {
          const follows = Array.isArray(follow) ? follow : [follow];
          set(state => {
            const next = new Map(state.user_channel_follow);
            follows.forEach(f => f?.user_id && next.set(`${f.user_id}:${f.username}`, f));
            return { user_channel_follow: next };
          });
        },
        saveUserChannelUnFollow(userId, follow) {
          const follows = Array.isArray(follow) ? follow : [follow];
          set(state => {
            const next = new Map(state.user_channel_follow);
            follows.forEach(f => f?.user_id && next.delete(`${f.user_id}:${f.username}`));
            return { user_channel_follow: next };
          });
        },
        getUserChannelUnFollow(userId) {
          return filterMap(get().user_channel_follow, f => f.user_id === userId);
        },
        
        saveRawApiData(userId, apiData) {
          if (!apiData || !apiData.userPreferences) return;
          const prefs = apiData.userPreferences;
          if (apiData.user) {
            get().createUser({
              id: apiData.user.id,
              email: apiData.user.email ?? '',
              role: 'authenticated',
              created_at: apiData.user.created_at ?? new Date().toISOString(),
              last_sign_in_at: apiData.user.last_sign_in_at ?? new Date().toISOString(),
              updated_at: apiData.user.updated_at ?? new Date().toISOString()
            });
          }
          const saveArr = <T>(store: keyof NchatDB, arr: T[]) => {
            if (!Array.isArray(arr)) return;
            get().clear(store);
            arr.forEach(item => get().put(store, (item as any).id || (item as any).user_id || (item as any).endpoint, item));
          };
          saveArr('channels_messages', prefs.channels_messages);
          saveArr('channels_activity', prefs.channels_activity);
          saveArr('user_language', prefs.user_language);
          saveArr('user_notifications', prefs.user_notifications);
          saveArr('push_subscriptions', prefs.push_subscriptions);
          saveArr('tenant_requests', prefs.tenant_requests ?? []);
          saveArr('user_location', prefs.user_location);
          saveArr('user_channel_follow', prefs.user_channel_follow);
          saveArr('user_channel_last_viewed', prefs.user_channel_last_viewed);
        },
        getAllRawData(userId) {
          const s = get();
          return {
            users: Array.from(s.users.values()),
            channels_messages: Array.from(s.channels_messages.values()),
            channels_activity: Array.from(s.channels_activity.values()),
            user_language: Array.from(s.user_language.values()),
            user_notifications: Array.from(s.user_notifications.values()),
            tenant_requests: Array.from(s.tenant_requests.values()),
            user_location: Array.from(s.user_location.values()),
            push_subscriptions: Array.from(s.push_subscriptions.values()),
            user_channel_follow: Array.from(s.user_channel_follow.values()),
            user_channel_last_viewed: Array.from(s.user_channel_last_viewed.values())
          };
        },
        subscribe: <T>(selector: (state: InAppDBState) => T, listener: (selectedState: T, previousSelectedState: T) => void) => {
          // Use the subscribeWithSelector middleware directly
          return get().subscribe(selector, listener);
        }
      };
    }),
    {
      name: 'inapp-db-storage',
      storage: createJSONStorage(() => customStorage),
      partialize: (state) => {
        const serialized = serializeState(state);
        return serialized;
      },
      onRehydrateStorage: () => (persistedState) => {
        if (persistedState) {
          try {
            const rehydratedState = deserializeState(persistedState);
            const currentState = useInAppDB.getState();
            
            // Only update state if there are actual changes
            if (hasStateChanged(currentState, rehydratedState)) {
              useInAppDB.setState(rehydratedState as Partial<InAppDBState>);
            } else {
            }
          } catch (error) {
          }
        } else {
        }
      },
      version: 1,
    }
  )
);
