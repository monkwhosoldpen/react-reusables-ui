import { openDB, IDBPDatabase, StoreNames } from 'idb';

// Import from new module files
import { DB_NAME, DB_VERSION } from './indexedDBConstants';
import { 
  NchatDB, 
  ChannelActivityRecord, 
  TenantRequest, 
  UserLocation,
  UserChannelFollow,
  UserChannelLastViewed
} from './indexedDBSchema';

// Define interfaces needed for the missing methods
interface PushSubscriptionData {
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

// Type alias for the store names to correctly type the IDB operations
type ValidStoreNames = StoreNames<NchatDB>;

class IndexedDBService {
  private static instance: IndexedDBService;
  private db: IDBPDatabase<NchatDB> | null = null;
  private dbName = DB_NAME;
  private version = DB_VERSION;

  private constructor() { }

  static getInstance(): IndexedDBService {
    if (!IndexedDBService.instance) {
      IndexedDBService.instance = new IndexedDBService();
    }
    return IndexedDBService.instance;
  }

  async initialize(): Promise<void> {
    if (this.db) return;

    try {
      this.db = await openDB<NchatDB>(this.dbName, this.version, {
        upgrade(db: IDBPDatabase<NchatDB>, oldVersion: number, newVersion: number) {
          // Create stores only if they don't exist
          if (!db.objectStoreNames.contains('users')) {
            const store = db.createObjectStore('users', { keyPath: 'id' });
            store.createIndex('by-email', 'email');
          }

          if (!db.objectStoreNames.contains('channels_messages')) {
            const store = db.createObjectStore('channels_messages', { keyPath: 'id' });
            store.createIndex('by-username', 'username');
          }

          if (!db.objectStoreNames.contains('channels_activity')) {
            const store = db.createObjectStore('channels_activity', { keyPath: 'username' });
            store.createIndex('by-username', 'username');
          }

          if (!db.objectStoreNames.contains('user_language')) {
            const store = db.createObjectStore('user_language', { keyPath: 'user_id' });
            store.createIndex('by-user', 'user_id');
          }

          if (!db.objectStoreNames.contains('user_notifications')) {
            const store = db.createObjectStore('user_notifications', { keyPath: 'user_id' });
            store.createIndex('by-user', 'user_id');
          }

          if (!db.objectStoreNames.contains('tenant_requests')) {
            const store = db.createObjectStore('tenant_requests', { keyPath: 'id' });
            store.createIndex('by-username', 'username');
            // Add index for fetching by user ID if not exists
            if (!store.indexNames.contains('by-user')) {
              store.createIndex('by-user', 'uid');
            }
          }

          if (!db.objectStoreNames.contains('user_location')) {
            const store = db.createObjectStore('user_location', { keyPath: 'user_id' });
            store.createIndex('by-user', 'user_id');
          }

          if (!db.objectStoreNames.contains('push_subscriptions')) {
            const store = db.createObjectStore('push_subscriptions', { keyPath: 'endpoint' });
            store.createIndex('by-user', 'user_id');
          }

          // Create new stores for user channel follow and last viewed
          if (!db.objectStoreNames.contains('user_channel_follow')) {
            // Use a composite key for user_channel_follow
            const store = db.createObjectStore('user_channel_follow', { 
              keyPath: ['user_id', 'username'] 
            });
            store.createIndex('by-user', 'user_id');
          }

          if (!db.objectStoreNames.contains('user_channel_last_viewed')) {
            // Use a composite key for user_channel_last_viewed
            const store = db.createObjectStore('user_channel_last_viewed', { 
              keyPath: ['user_id', 'username'] 
            });
            store.createIndex('by-user', 'user_id');
          }
        },
      });
    } catch (error) {
      this.db = null;
      throw error;
    }
  }

  // Make getDB public for direct access in test tools
  async getDB() {
    if (!this.db) {
      await this.initialize();
    }
    return this.db!;
  }

  // Basic CRUD operations for any store
  async put(storeName: ValidStoreNames, value: any): Promise<void> {
    await this.initialize();
    await this.db!.put(storeName, value);
  }

  async get(storeName: ValidStoreNames, key: any): Promise<any> {
    await this.initialize();
    return await this.db!.get(storeName, key);
  }

  async getAll(storeName: ValidStoreNames): Promise<any[]> {
    await this.initialize();
    return await this.db!.getAll(storeName);
  }

  async delete(storeName: ValidStoreNames, key: any): Promise<void> {
    await this.initialize();
    await this.db!.delete(storeName, key);
  }
  
  async getAllFromIndex(storeName: ValidStoreNames, indexName: string, key: any): Promise<any[]> {
    await this.initialize();
    const tx = this.db!.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    
    // TypeScript doesn't have a way to strongly type the index names for each store
    // This is a common issue with the idb library
    // @ts-ignore - Ignoring the typing issue as we know this will work at runtime
    const index = store.index(indexName);
    return await index.getAll(key);
  }

  async clear(storeName: ValidStoreNames): Promise<void> {
    await this.initialize();
    await this.db!.clear(storeName);
  }

  // Legacy methods maintained for backward compatibility
  // User operations
  async createUser(user: any): Promise<void> {
    await this.initialize();
    await this.db!.put('users', user);
  }

  async getUser(id: string): Promise<any> {
    await this.initialize();
    return await this.db!.get('users', id);
  }

  async getAllUsers(): Promise<any[]> {
    await this.initialize();
    return await this.db!.getAll('users');
  }

  // User Language operations
  async setUserLanguage(userId: string, language: string): Promise<void> {
    await this.initialize();
    await this.db!.put('user_language', { user_id: userId, language });
  }

  async getUserLanguage(userId: string): Promise<string | undefined> {
    await this.initialize();
    const userLanguage = await this.db!.get('user_language', userId);
    return userLanguage?.language;
  }

  // User Notifications operations
  async setUserNotifications(userId: string, enabled: boolean): Promise<void> {
    await this.initialize();
    await this.db!.put('user_notifications', { user_id: userId, notifications_enabled: enabled });
  }

  async getUserNotifications(userId: string): Promise<boolean> {
    await this.initialize();
    const result = await this.db!.get('user_notifications', userId);
    return result?.notifications_enabled ?? true; // Default to true if not set
  }

  // User Location operations
  async setUserLocation(userId: string, location: any): Promise<void> {
    await this.initialize();
    const locationWithUserId = { ...location, user_id: userId };
    await this.db!.put('user_location', locationWithUserId);
  }

  async getUserLocation(userId: string): Promise<any | null> {
    await this.initialize();
    const location = await this.db!.get('user_location', userId);
    return location || null;
  }

  // Push Subscription operations
  async savePushSubscription(subscription: any): Promise<void> {
    await this.initialize();
    await this.db!.put('push_subscriptions', subscription);
  }

  async getPushSubscriptions(userId: string): Promise<any[]> {
    await this.initialize();
    try {
      return await this.getAllFromIndex('push_subscriptions', 'by-user', userId);
    } catch (error) {
      console.error('Error getting push subscriptions:', error);
      return [];
    }
  }

  // Tenant Request operations
  async saveTenantRequests(userId: string, requests: any[]): Promise<void> {
    await this.initialize();
    const tx = this.db!.transaction('tenant_requests', 'readwrite');
    const store = tx.objectStore('tenant_requests');
    
    // First, delete existing tenant requests for this user
    const existingRequests = await this.getAllFromIndex('tenant_requests', 'by-user', userId);
    for (const request of existingRequests) {
      await store.delete(request.id);
    }
    
    // Then add new ones without transforming them
    for (const request of requests) {
      await store.add(request);
    }
  }

  async getTenantRequests(userId: string): Promise<any[]> {
    await this.initialize();
    return await this.getAllFromIndex('tenant_requests', 'by-user', userId);
  }

  // Method to save all raw API data at once
  async saveRawApiData(userId: string, apiData: any): Promise<void> {
    await this.initialize();
    
    try {
      if (!apiData || !apiData.userPreferences) {
        console.error('Invalid API data format');
        return;
      }
      
      const prefs = apiData.userPreferences;
      
      // Save user info exactly as received
      if (apiData.user) {
        await this.db!.put('users', {
          id: apiData.user.id,
          email: apiData.user.email || '',
          role: 'authenticated',
          created_at: apiData.user.created_at || new Date().toISOString(),
          last_sign_in_at: apiData.user.last_sign_in_at || new Date().toISOString(),
          updated_at: apiData.user.updated_at || new Date().toISOString()
        });
      }
      
      // Save all raw data directly without any transformations
      
      // Save channels_messages as is
      if (Array.isArray(prefs.channels_messages)) {
        await this.db!.clear('channels_messages');
        const tx = this.db!.transaction('channels_messages', 'readwrite');
        for (const item of prefs.channels_messages) {
          await tx.store.put(item);
        }
        await tx.done;
      }
      
      // Save channels_activity as is
      if (Array.isArray(prefs.channels_activity)) {
        await this.db!.clear('channels_activity');
        const tx = this.db!.transaction('channels_activity', 'readwrite');
        for (const item of prefs.channels_activity) {
          await tx.store.put(item);
        }
        await tx.done;
      }
      
      // Save user_language as is
      if (Array.isArray(prefs.user_language)) {
        await this.db!.clear('user_language');
        const tx = this.db!.transaction('user_language', 'readwrite');
        for (const item of prefs.user_language) {
          await tx.store.put(item);
        }
        await tx.done;
      }
      
      // Save user_notifications as is
      if (Array.isArray(prefs.user_notifications)) {
        await this.db!.clear('user_notifications');
        const tx = this.db!.transaction('user_notifications', 'readwrite');
        for (const item of prefs.user_notifications) {
          await tx.store.put(item);
        }
        await tx.done;
      }
      
      // Save push_subscriptions as is
      if (Array.isArray(prefs.push_subscriptions)) {
        await this.db!.clear('push_subscriptions');
        const tx = this.db!.transaction('push_subscriptions', 'readwrite');
        for (const item of prefs.push_subscriptions) {
          await tx.store.put(item);
        }
        await tx.done;
      }
      
      // Save tenant_requests as is - handle both tenant_requests and tena
      const tenantRequests = prefs.tenant_requests || prefs.tena || [];
      if (Array.isArray(tenantRequests)) {
        await this.db!.clear('tenant_requests');
        const tx = this.db!.transaction('tenant_requests', 'readwrite');
        for (const item of tenantRequests) {
          await tx.store.put(item);
        }
        await tx.done;
      }
      
      // Save user_location as is
      if (Array.isArray(prefs.user_location)) {
        await this.db!.clear('user_location');
        const tx = this.db!.transaction('user_location', 'readwrite');
        for (const item of prefs.user_location) {
          await tx.store.put(item);
        }
        await tx.done;
      }
      
      // Save user_channel_follow as is
      if (Array.isArray(prefs.user_channel_follow)) {
        await this.db!.clear('user_channel_follow');
        const tx = this.db!.transaction('user_channel_follow', 'readwrite');
        for (const item of prefs.user_channel_follow) {
          await tx.store.put(item);
        }
        await tx.done;
      }
      
      // Save user_channel_last_viewed as is
      if (Array.isArray(prefs.user_channel_last_viewed)) {
        await this.db!.clear('user_channel_last_viewed');
        const tx = this.db!.transaction('user_channel_last_viewed', 'readwrite');
        for (const item of prefs.user_channel_last_viewed) {
          await tx.store.put(item);
        }
        await tx.done;
      }
      
    } catch (error) {
      console.error('Error saving raw API data:', error);
      throw error;
    }
  }

  // Method to get all raw data from IndexedDB
  async getAllRawData(userId: string): Promise<Record<string, any>> {
    await this.initialize();
    
    try {
      // Get all data from all stores without any transformation
      const rawData: Record<string, any> = {};
      
      const storeNames: ValidStoreNames[] = [
        'users', 
        'channels_messages', 
        'channels_activity', 
        'user_language',
        'user_notifications', 
        'tenant_requests', 
        'user_location',
        'push_subscriptions', 
        'user_channel_follow', 
        'user_channel_last_viewed'
      ];
      
      for (const store of storeNames) {
        rawData[store] = await this.getAll(store);
      }
      
      return rawData;
    } catch (error) {
      console.error('Error getting all raw data:', error);
      throw error;
    }
  }

  // Clear everything from IndexedDB
  async clearAll(): Promise<void> {
    await this.initialize();
    
    const storeNames: ValidStoreNames[] = [
      'users', 
      'channels_messages', 
      'channels_activity', 
      'user_language',
      'user_notifications', 
      'tenant_requests', 
      'user_location',
      'push_subscriptions', 
      'user_channel_follow', 
      'user_channel_last_viewed'
    ];
    
    for (const store of storeNames) {
      await this.clear(store);
    }
  }
}

export const indexedDB = IndexedDBService.getInstance(); 