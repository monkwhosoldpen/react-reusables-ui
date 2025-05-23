'use client';

import { useEffect, useState, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '~/lib/core/supabase';
import { UserInfo } from '../types/channel.types';
import { config } from '~/lib/core/config';
import { useInAppDB } from '../providers/InAppDBProvider';

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
  cleanup: () => void;
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
  const inappDb = useInAppDB();

  // Add refs inside the function
  const signInTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // place inside AuthHelper
  const signOut = async () => {
    try {
      setLoading(true);            // 1. keep UI responsive

      // 2. Stop local timers / listeners ------------------------------------
      if (signInTimeoutRef.current) clearTimeout(signInTimeoutRef.current);
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
      signInTimeoutRef.current = null;
      refreshIntervalRef.current = null;

      // Abort any in-flight fetch for userInfo
      pendingFetchPromise.current = null;
      fetchingUserInfo.current = false;

      // Remove Supabase onAuthStateChange listener
      authInitializer.current.cleanup();

      // 3. Supabase sign-out (server session & RT listeners)
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      await inappDb.clearAll();   // <-- create helper that deletes by userId

      // 5. Reset in-memory caches & React state ------------------------------
      userInfoCache.current = {};
      lastFetchTime.current = 0;
      setUser(null);
      setUserInfo(null);
      setIsGuest(false);

    } catch (err) {
      console.error('Error during sign-out:', err);
      throw err;                  // let UI layer show toast / alert
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);

        // First check InAppDB for any existing user
        const users = await inappDb.getAllUsers();

        const existingUser = users[0]; // Get the first user if exists

        if (existingUser && mounted) {
          // Set user from InAppDB - IMMEDIATELY set basic data
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

          // Get additional data from InAppDB
          const [userLanguage, notificationPreference, tenantRequests, userLocation] = await Promise.all([
            inappDb.getUserLanguage(existingUser.id),
            inappDb.getUserNotifications(existingUser.id),
            Promise.resolve(inappDb.getTenantRequests(existingUser.id)).catch(() => []),
            Promise.resolve(inappDb.getUserLocation(existingUser.id)).catch(() => null)
          ]);

          // Set initial userInfo from InAppDB
          const initialUserInfo: UserInfo = {
            id: existingUser.id,
            email: existingUser.email,
            phone: null,
            created_at: existingUser.created_at,
            updated_at: existingUser.updated_at,
            last_sign_in_at: existingUser.last_sign_in_at,
            app_metadata: {},
            user_metadata: {},
          };

          setUserInfo(initialUserInfo);

          setLoading(false);

          // For non-guest users, fetch from backend and update
          if (!isGuestUser) {
            try {
              await fetchUserInfo(existingUser.id);
            } catch (error) {
            }
          }
        } else if (mounted) {
          // No user in InAppDB, initialize Supabase auth
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
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // Function to fetch user info
  const fetchUserInfo = async (userId: string) => {
    let savedUser; // Declare savedUser outside try block

    try {
      // Get all data from InAppDB in parallel
      const [
        user,
        userLanguage,
        pushSubscriptions,
        notificationPreference,
        tenantRequests,
        userLocation
      ] = await Promise.all([
        inappDb.getUser(userId),
        inappDb.getUserLanguage(userId),
        inappDb.getPushSubscriptions(userId),
        inappDb.getUserNotifications(userId),
        Promise.resolve(inappDb.getTenantRequests(userId)).catch(() => []),
        Promise.resolve(inappDb.getUserLocation(userId)).catch(() => null)
      ]);

      savedUser = user;

      if (savedUser) {
        // Set initial state from InAppDB
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

      // Create a new promise for this fetch
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

              const toSave = data.rawRecords;

              // Save all raw API data to InAppDB
              await inappDb.saveRawApiData(userId, transformedData);

              // Save to Zustand store
              inappDb.setUserLanguage(userId, toSave.user_language);
              inappDb.setUserNotifications(userId, toSave.user_notifications);
              inappDb.setUserLocation(userId, toSave.user_location);
              inappDb.saveTenantRequests(userId, toSave.tenant_requests);
              inappDb.savePushSubscription(toSave.push_subscriptions);
              inappDb.saveUserChannelFollow(userId, toSave.user_channel_follow);
              inappDb.saveUserChannelLastViewed(userId, toSave.user_channel_last_viewed);

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

              // Extract tenant requests
              const tenantRequests = preferences?.tenant_requests || preferences?.tena || [];

              // Create complete user info object
              const updatedUserInfo = {
                ...data.user,
                language: language,
                notifications_enabled: notificationsEnabled,
                tenantRequests: tenantRequests,
                userLocation: userLocation
              };

              // Update cache
              userInfoCache.current[userId] = {
                data: updatedUserInfo,
                timestamp: Date.now()
              };

              // Update state with API data
              setUserInfo(updatedUserInfo);
              lastFetchTime.current = Date.now();

            } catch (dbError) {
            }
          }
        } catch (error) {
        } finally {
          fetchingUserInfo.current = false;
          pendingFetchPromise.current = null;
        }
      })();

      return pendingFetchPromise.current;

    } catch (error) {
      // Now savedUser is accessible here
      if (savedUser) {
        const fallbackUserInfo = {
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
        };
        setUserInfo(fallbackUserInfo);
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
    cleanup: authInitializer.current.cleanup,
  };

  // Rest of the functions
  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }

    if (data.user) {
      try {
        // First save basic user data to InAppDB
        await inappDb.createUser({
          id: data.user.id,
          email: data.user.email ?? '',
          role: 'authenticated',
          created_at: data.user.created_at || new Date().toISOString(),
          last_sign_in_at: data.user.last_sign_in_at || new Date().toISOString(),
          updated_at: data.user.updated_at || new Date().toISOString()
        });

        // Set user state first
        setUser(data.user);

        // Then fetch user info from API
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

        if (apiData.success) {
         const user_language = apiData.rawRecords?.user_language || [];
         const user_notifications = apiData.rawRecords?.user_notifications || [];
         const push_subscriptions = apiData.rawRecords?.push_subscriptions || [];
         const tenant_requests = apiData.rawRecords?.tenant_requests || [];
         const user_location = apiData.rawRecords?.user_location || [];
         const user_channel_follow = apiData.rawRecords?.user_channel_follow || [];
         const user_channel_last_viewed = apiData.rawRecords?.user_channel_last_viewed || [];

          // Save all raw API data to InAppDB
          await inappDb.savePushSubscription(push_subscriptions);
          await inappDb.saveUserChannelFollow(data.user.id, user_channel_follow);
          await inappDb.saveUserChannelLastViewed(data.user.id, user_channel_last_viewed);
          await inappDb.saveTenantRequests(data.user.id, tenant_requests);
          await inappDb.setUserLanguage(data.user.id, user_language);
          await inappDb.setUserNotifications(data.user.id, user_notifications);
          await inappDb.setUserLocation(data.user.id, user_location);

          // Create complete user info object
          const updatedUserInfo = {
            ...apiData.user,
          };

          // Update cache
          userInfoCache.current[data.user.id] = {
            data: updatedUserInfo,
            timestamp: Date.now()
          };

          // Update state with API data
          setUserInfo(updatedUserInfo);
        }
      } catch (error) {
        // Even if API call fails, try to get data from InAppDB
        try {
          await fetchUserInfo(data.user.id);
        } catch (infoError) {
        }
      }
    }
  }

  async function signInAnonymously() {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      throw error;
    }

    if (data.user) {
      try {
        // Save basic user data to InAppDB first
        await inappDb.createUser({
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
        };

        // Set initial state
        setUserInfo(initialUserInfo);

        // Cache the initial state
        userInfoCache.current[data.user.id] = {
          data: initialUserInfo,
          timestamp: Date.now()
        };

        // Save language preference
        await inappDb.setUserLanguage(data.user.id, 'english');
      } catch (error) {
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

      // Store guest user in InAppDB
      await inappDb.createUser(guestUser);
      await inappDb.setUserLanguage(guestUser.id, 'english'); // Set default language

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
      };

      setUserInfo(guestUserInfo);
      setIsGuest(true);
    } catch (error) {
      throw error;
    }
  }
}
