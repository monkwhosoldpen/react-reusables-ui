'use client';

import { useEffect, useState, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '~/lib/core/supabase';
import { indexedDB } from '~/lib/core/services/indexedDB';
import { UserInfo } from '../types/channel.types';
import { router } from 'expo-router';
import { config } from '~/lib/core/config';

// Singleton for auth initialization
export class AuthInitializer {
  private static instance: AuthInitializer;
  private static globalInitialized = false;
  private isInitialized = false;
  private currentSubscription: { unsubscribe: () => void } | null = null;

  private constructor() { }

  static getInstance(): AuthInitializer {
    if (!AuthInitializer.instance) {
      AuthInitializer.instance = new AuthInitializer();
    }
    return AuthInitializer.instance;
  }

  async initialize(callbacks: {
    setUser: (user: User | null) => void;
    setSession: (session: Session | null) => void;
    setLoading: (loading: boolean) => void;
  }) {
    if (AuthInitializer.globalInitialized) {
      return;
    }

    AuthInitializer.globalInitialized = true;
    if (this.isInitialized) {
      return;
    }

    this.isInitialized = true;

    try {
      // Use a more efficient approach to get the session
      const { data: { session: initialSession }, error } = await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      if (initialSession) {
        callbacks.setSession(initialSession);
        callbacks.setUser(initialSession.user);
      }

      // Clean up previous subscription if it exists
      if (this.currentSubscription) {
        this.currentSubscription.unsubscribe();
      }

      // Optimize the auth state change subscription
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
        // Only update if there's an actual change
        const isInitialSession = event === 'INITIAL_SESSION';

        if (!isInitialSession) {
          callbacks.setSession(currentSession);
          callbacks.setUser(currentSession?.user ?? null);
          callbacks.setLoading(false);
        }
      });

      this.currentSubscription = subscription;
    } catch (error) {
      console.error("Error initializing auth:", error);
    } finally {
      callbacks.setLoading(false);
    }
  }

  cleanup() {
    if (this.currentSubscription) {
      this.currentSubscription.unsubscribe();
      this.currentSubscription = null;
    }
    this.isInitialized = false;
  }
}

// Improved debounce function with better performance
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// Define the type for what AuthHelper returns
export interface AuthHelperReturn {
  user: User | null;
  userInfo: UserInfo | null;
  loading: boolean;
  isGuest: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInAnonymously: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserInfo: () => Promise<void>;
}

export function AuthHelper(): AuthHelperReturn {
  const [user, setUser] = useState<User | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const authInitializer = useRef(AuthInitializer.getInstance());
  const fetchingUserInfo = useRef(false);
  const lastFetchTime = useRef(0);
  const pendingFetchPromise = useRef<Promise<void> | null>(null);
  const MIN_FETCH_INTERVAL = 30000; // 30 seconds
  const userInfoCache = useRef<Record<string, { data: any, timestamp: number }>>({});
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // First check IndexedDB for any existing user
        const users = await indexedDB.getAllUsers();
        
        const existingUser = users[0]; // Get the first user if exists

        if (existingUser && mounted) {
          // Set user from IndexedDB - IMMEDIATELY set basic data
          const isGuestUser = existingUser.email.includes('@guest.com');
          setIsGuest(isGuestUser);
          
          const mockUser: User = {
            id: existingUser.id,
            email: existingUser.email,
            role: existingUser.role,
            created_at: existingUser.created_at,
            aud: 'authenticated',
            app_metadata: {},
            user_metadata: {},
            phone: '',
            last_sign_in_at: existingUser.last_sign_in_at,
            updated_at: existingUser.updated_at,
            email_confirmed_at: new Date().toISOString(),
            phone_confirmed_at: undefined,
            confirmation_sent_at: undefined,
            recovery_sent_at: undefined,
            is_anonymous: false
          };

          // Set user immediately and stop loading
          setUser(mockUser);
          
          // Get additional data from IndexedDB
          const [userLanguage, notificationPreference, tenantRequests, userLocation] = await Promise.all([
            indexedDB.getUserLanguage(existingUser.id),
            indexedDB.getUserNotifications(existingUser.id),
            indexedDB.getTenantRequests(existingUser.id).catch(() => []),
            indexedDB.getUserLocation(existingUser.id).catch(() => null)
          ]);

          // Set initial userInfo from IndexedDB
          const initialUserInfo: UserInfo = {
            id: existingUser.id,
            email: existingUser.email,
            phone: null,
            created_at: existingUser.created_at,
            updated_at: existingUser.updated_at,
            last_sign_in_at: existingUser.last_sign_in_at,
            app_metadata: {},
            user_metadata: {},
            language: userLanguage || 'english',
            tenantRequests: tenantRequests || [],
            notifications_enabled: notificationPreference,
            userLocation: userLocation
          };

          setUserInfo(initialUserInfo);
          
          setLoading(false);

          // For non-guest users, fetch from backend and update
          if (!isGuestUser) {
            try {
              await fetchUserInfo(existingUser.id);
            } catch (error) {
              console.error("Error fetching user info:", error);
            }
          }
        } else if (mounted) {
          // No user in IndexedDB, initialize Supabase auth
          const callbacks = {
            setUser: (user: User | null) => {
              if (mounted) {
                setUser(user);
                if (user) {
                  // Set basic userInfo immediately when we get user
                  setUserInfo({
                    id: user.id,
                    email: user.email || '',
                    phone: null,
                    created_at: user.created_at,
                    updated_at: user.updated_at || new Date().toISOString(),
                    last_sign_in_at: user.last_sign_in_at || null,
                    app_metadata: {},
                    user_metadata: {},
                    language: 'english',
                    tenantRequests: [],
                    userLocation: null
                  });
                  setLoading(false);
                }
              }
            },
            setSession,
            setLoading: (loading: boolean) => {
              if (mounted) setLoading(loading);
            }
          };
          await authInitializer.current.initialize(callbacks);
        }
      } catch (error) {
        console.error("Error during auth initialization:", error);
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // Fetch user info from the API when user ID is resolved
  const fetchUserInfo = async (userId: string) => {
    let savedUser; // Declare savedUser outside try block
    
    try {
      // Get all data from IndexedDB in parallel
      const [
        user,
        userLanguage,
        pushSubscriptions,
        notificationPreference,
        tenantRequests,
        userLocation
      ] = await Promise.all([
        indexedDB.getUser(userId),
        indexedDB.getUserLanguage(userId),
        indexedDB.getPushSubscriptions(userId),
        indexedDB.getUserNotifications(userId),
        indexedDB.getTenantRequests(userId).catch(() => []),
        indexedDB.getUserLocation(userId).catch(() => null)
      ]);

      savedUser = user;

      if (savedUser) {
        // Set initial state from IndexedDB
        const localUserInfo = {
          id: savedUser.id,
          email: savedUser.email,
          phone: null,
          created_at: savedUser.created_at,
          updated_at: savedUser.updated_at,
          last_sign_in_at: savedUser.last_sign_in_at,
          app_metadata: {},
          user_metadata: {},
          language: userLanguage || 'english',
          tenantRequests: tenantRequests || [],
          notifications: {
            enabled: notificationPreference,
            subscriptions: pushSubscriptions || []
          },
          notifications_enabled: notificationPreference,
          userLocation: userLocation
        };

        setUserInfo(localUserInfo);
      }

      // Check cache for all users
      const cachedData = userInfoCache.current[userId];
      const now = Date.now();
      
      if (cachedData && (now - cachedData.timestamp < CACHE_TTL)) {
        // Use cached data directly
        setUserInfo(cachedData.data);
        return;
      }
      
      // If there's already a pending fetch, return that promise
      if (pendingFetchPromise.current) {
        return pendingFetchPromise.current;
      }

      // Prevent concurrent fetches and rate limit API calls
      if (fetchingUserInfo.current || (now - lastFetchTime.current < MIN_FETCH_INTERVAL)) {
        return;
      }

      fetchingUserInfo.current = true;
      
      // Create a new promise for this fetch - same API call for both guest and non-guest
      pendingFetchPromise.current = (async () => {
        try {
          const isGuestUser = savedUser?.role === 'guest' || isGuest;
          const response = await fetch(`${config.api.endpoints.myinfo}?userId=${userId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              isGuest: isGuestUser
            })
          });
          const data = await response.json();
          
          if (data.success) {
            try {
              // Transform the new API response structure into the old format
              const transformedData = {
                ...data,
                userPreferences: {
                  channels_messages: data.rawRecords?.channels_messages || [],
                  channels_activity: data.rawRecords?.channels_activity || [],
                  user_language: data.rawRecords?.user_language || [],
                  user_notifications: data.rawRecords?.user_notifications || [],
                  push_subscriptions: data.rawRecords?.push_subscriptions || [],
                  tenant_requests: data.rawRecords?.tenant_requests || [],
                  user_location: data.rawRecords?.user_location || [],
                  user_channel_follow: data.rawRecords?.user_channel_follow || [],
                  user_channel_last_viewed: data.rawRecords?.user_channel_last_viewed || []
                }
              };

              // Save all raw API data to IndexedDB in one call
              await indexedDB.saveRawApiData(userId, transformedData);

              // Create simplified user info for state - extract just what's needed for UI
              const preferences = transformedData.userPreferences;
              
              // Extract language
              const language = preferences?.user_language?.length > 0 
                ? preferences.user_language[0].language 
                : 'english';
              
              // Extract notification preference from user_notifications array
              const notificationsEnabled = preferences?.user_notifications?.length > 0 
                ? preferences.user_notifications[0].notifications_enabled 
                : false;
              
              // Extract user location from user_location array
              const userLocation = preferences?.user_location?.length > 0 
                ? preferences.user_location[0] 
                : null;
              
              // Extract tenant requests - handle both tenant_requests and tena fields
              const userTenantRequests = preferences?.tenant_requests || preferences?.tena || [];

              // Create final user info with extracted fields
              const updatedUserInfo = {
                ...data.user,
                language: language,
                notifications_enabled: notificationsEnabled,
                tenantRequests: userTenantRequests,
                userLocation: userLocation
              };

              userInfoCache.current[userId] = {
                data: updatedUserInfo,
                timestamp: Date.now()
              };
              setUserInfo(updatedUserInfo);
              lastFetchTime.current = Date.now();

            } catch (dbError) {
              console.error("[Auth] IndexedDB sync error:", dbError);
              // Even if sync fails, we should still update the state with API data
            }
          } else {
            console.error("[Auth] API call failed:", data);
          }
        } catch (error) {
          console.error("[Auth] API fetch error:", error);
        } finally {
          fetchingUserInfo.current = false;
          pendingFetchPromise.current = null;
        }
      })();
      
      return pendingFetchPromise.current;

    } catch (error) {
      console.error("[Auth] Error accessing IndexedDB:", error);
      // Now savedUser is accessible here
      if (savedUser) {
        setUserInfo({
          id: savedUser.id,
          email: savedUser.email,
          phone: null,
          created_at: savedUser.created_at,
          updated_at: savedUser.updated_at,
          last_sign_in_at: savedUser.last_sign_in_at,
          app_metadata: {},
          user_metadata: {},
          language: 'english',
          tenantRequests: [],
          userLocation: null
        });
      }
    }
  };

  // Debounced version of fetchUserInfo to prevent rapid successive calls
  const debouncedFetchUserInfo = useRef(
    debounce((userId: string) => fetchUserInfo(userId), 2000) // Increased from 1000ms to 2000ms
  ).current;

  // Function to refresh user info - can be called from components
  const refreshUserInfo = async () => {
    if (user) {
      // Force bypass cache for explicit refresh
      lastFetchTime.current = 0;
      return await fetchUserInfo(user.id);
    }
  };

  // Remove isGuest from dependencies since it's only needed for the fetch logic
  useEffect(() => {
    if (user?.id) {
      debouncedFetchUserInfo(user.id);
    } else {
      setUserInfo(null);
    }
  }, [user?.id, debouncedFetchUserInfo]);

  // Return all functions and state
  return {
    user,
    userInfo,
    loading,
    isGuest,
    signIn,
    signInAnonymously,
    signInAsGuest,
    signOut,
    refreshUserInfo,
  };

  // Rest of the functions
  async function signIn(email: string, password: string) {
    console.log('[AuthHelpers] Starting sign in with:', { email });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('[AuthHelpers] Sign in error:', error);
      throw error;
    }
    
    if (data.user) {
      console.log('[AuthHelpers] Sign in successful, user:', data.user);
      try {
        // First save basic user data to IndexedDB
        console.log('[AuthHelpers] Saving user to IndexedDB');
        await indexedDB.createUser({
          id: data.user.id,
          email: data.user.email ?? '',
          role: 'authenticated',
          created_at: data.user.created_at || new Date().toISOString(),
          last_sign_in_at: data.user.last_sign_in_at || new Date().toISOString(),
          updated_at: data.user.updated_at || new Date().toISOString()
        });

        // Set user state first
        console.log('[AuthHelpers] Setting user state');
        setUser(data.user);

        // Then fetch user info from API and save to IndexedDB
        console.log('[AuthHelpers] Fetching user info from API');
        const response = await fetch(`${config.api.endpoints.myinfo}?userId=${data.user.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            isGuest: false
          })
        });
        const apiData = await response.json();
        console.log('[AuthHelpers] API response:', apiData);

        if (apiData.success) {
          // Transform the API response into the expected format
          const transformedData = {
            ...apiData,
            userPreferences: {
              channels_messages: apiData.rawRecords?.channels_messages || [],
              channels_activity: apiData.rawRecords?.channels_activity || [],
              user_language: apiData.rawRecords?.user_language || [],
              user_notifications: apiData.rawRecords?.user_notifications || [],
              push_subscriptions: apiData.rawRecords?.push_subscriptions || [],
              tenant_requests: apiData.rawRecords?.tenant_requests || [],
              user_location: apiData.rawRecords?.user_location || [],
              user_channel_follow: apiData.rawRecords?.user_channel_follow || [],
              user_channel_last_viewed: apiData.rawRecords?.user_channel_last_viewed || []
            }
          };

          console.log('[AuthHelpers] Transformed API data:', transformedData);

          // Save all raw API data to IndexedDB in one call
          await indexedDB.saveRawApiData(data.user.id, transformedData);
          
          // Extract data for UI state
          const preferences = transformedData.userPreferences;
          
          // Extract language
          const language = preferences?.user_language?.length > 0 
            ? preferences.user_language[0].language 
            : 'english';
          
          // Extract notification settings
          const notificationsEnabled = preferences?.user_notifications?.length > 0 
            ? preferences.user_notifications[0].notifications_enabled 
            : false;
            
          // Extract user location
          const userLocation = preferences?.user_location?.length > 0 
            ? preferences.user_location[0] 
            : null;
          
          // Extract tenant requests - handle both possible fields
          const tenantRequests = preferences?.tenant_requests || preferences?.tena || [];

          // Create complete user info object from API response
          const updatedUserInfo = {
            ...apiData.user,
            language: language,
            notifications_enabled: notificationsEnabled,
            tenantRequests: tenantRequests,
            userLocation: userLocation
          };

          console.log('[AuthHelpers] Updating userInfo state with:', updatedUserInfo);

          // Update cache
          userInfoCache.current[data.user.id] = {
            data: updatedUserInfo,
            timestamp: Date.now()
          };

          // Update state with API data
          setUserInfo(updatedUserInfo);
          console.log('[AuthHelpers] userInfo state updated');
        } else {
          console.error('[AuthHelpers] API call failed:', apiData);
        }
      } catch (error) {
        console.error('[AuthHelpers] Error during sign in process:', error);
        // Even if API call fails, try to get data from IndexedDB
        try {
          console.log('[AuthHelpers] Falling back to IndexedDB data');
          await fetchUserInfo(data.user.id);
        } catch (infoError) {
          console.error('[AuthHelpers] Error fetching from IndexedDB:', infoError);
        }
      }
    }
  }

  async function signInAnonymously() {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.error("[Auth] Anonymous sign in error:", error);
      throw error;
    }
    
    if (data.user) {
      try {
        // Save basic user data to IndexedDB first
        await indexedDB.createUser({
          id: data.user.id,
          email: data.user.email ?? '',
          role: 'anonymous',
          created_at: data.user.created_at || new Date().toISOString(),
          last_sign_in_at: data.user.last_sign_in_at || new Date().toISOString(),
          updated_at: data.user.updated_at || new Date().toISOString()
        });

        // Set user state
        setUser(data.user);
        
        // Initialize with empty data
        const initialUserInfo: UserInfo = {
          id: data.user.id,
          email: data.user.email ?? '',
          phone: null,
          created_at: data.user.created_at || new Date().toISOString(),
          updated_at: data.user.updated_at || new Date().toISOString(),
          last_sign_in_at: data.user.last_sign_in_at || new Date().toISOString(),
          app_metadata: {},
          user_metadata: {},
          language: 'english',
          tenantRequests: [],
          userLocation: null
        };

        // Set initial state
        setUserInfo(initialUserInfo);
        
        // Cache the initial state
        userInfoCache.current[data.user.id] = {
          data: initialUserInfo,
          timestamp: Date.now()
        };

        // Save language preference
        await indexedDB.setUserLanguage(data.user.id, 'english');
      } catch (error) {
        console.error("[Auth] Error during anonymous sign in:", error);
      }
    }
  }

  async function signInAsGuest() {
    try {
      // Create a guest user object
      const guestUser = {
        id: `guest_${Date.now()}`,
        email: `guest_${Date.now()}@guest.com`,
        role: 'guest',
        created_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Store guest user in IndexedDB
      await indexedDB.createUser(guestUser);
      await indexedDB.setUserLanguage(guestUser.id, 'english'); // Set default language

      // Create a mock User object that matches Supabase User interface
      const mockUser: User = {
        id: guestUser.id,
        email: guestUser.email,
        role: guestUser.role,
        created_at: guestUser.created_at,
        aud: 'authenticated',
        app_metadata: {},
        user_metadata: {},
        phone: '',
        last_sign_in_at: guestUser.last_sign_in_at,
        updated_at: guestUser.updated_at,
        email_confirmed_at: new Date().toISOString(),
        phone_confirmed_at: undefined,
        confirmation_sent_at: undefined,
        recovery_sent_at: undefined,
        is_anonymous: false
      };

      setUser(mockUser);
      
      const guestUserInfo: UserInfo = {
        id: guestUser.id,
        email: guestUser.email,
        phone: null,
        created_at: guestUser.created_at,
        updated_at: guestUser.updated_at,
        last_sign_in_at: guestUser.last_sign_in_at,
        app_metadata: {},
        user_metadata: {},
        language: 'english',
        tenantRequests: [],
        userLocation: null
      };
      
      setUserInfo(guestUserInfo);
      setIsGuest(true);
    } catch (error) {
      console.error("Guest sign in error:", error);
      throw error;
    }
  }

  async function signOut() {
    try {
      // Clear IndexedDB including tenant requests
      await indexedDB.clearAll();

      if (isGuest) {
        setIsGuest(false);
      } else {
        // Regular user flow - unsubscribe from push notifications if service worker is registered
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
              // Delete the subscription from Supabase before unsubscribing
              const userId = user?.id;
              if (userId) {
                await supabase
                  .from('push_subscriptions')
                  .delete()
                  .eq('user_id', userId);
              }

              // Unsubscribe from push
              await subscription.unsubscribe();
            }
          }
        }

        // Then sign out from Supabase
        await supabase.auth.signOut();
      }

      setUser(null);
      setUserInfo(null);
      router.push('/');
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }

}
