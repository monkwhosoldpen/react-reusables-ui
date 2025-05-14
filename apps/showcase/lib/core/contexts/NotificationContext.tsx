'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '~/lib/core/supabase';
import { useAuth } from '~/lib/core/contexts/AuthContext';
import { ChannelActivity } from '~/lib/core/types/notifications';
import { setupPushSubscription, registerServiceWorker, cleanupPushSubscription } from '~/utils/register-sw';
import { Image } from 'react-native-svg';

// Types
type NotificationPermissionStatus = 'default' | 'granted' | 'denied';

// Toast notification type
interface ToastNotification {
  title: string;
  message: string;
  icon?: string;
  image?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

// Provider interface for abstraction
interface NotificationProviderInterface {
  init(): Promise<boolean>;
  requestPermission(): Promise<NotificationPermissionStatus>;
  getPermissionStatus(): Promise<NotificationPermissionStatus>;
  isEnabled(): Promise<boolean>;
  sendNotification(title: string, message: string, options?: any): void;
  cleanup?(): void;
  getSubscription(): Promise<PushSubscription | null>;
}

// Add at top with other constants

// Native Web Push implementation
class NativeWebPushProvider implements NotificationProviderInterface {
  private initialized = false;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  // Detect browser type
  static detectBrowserType(): string {
    if (typeof window === 'undefined') return 'unknown';

    const userAgent = window.navigator.userAgent.toLowerCase();

    if (userAgent.indexOf('firefox') !== -1) {
      return 'firefox';
    } else if (userAgent.indexOf('edg') !== -1) {
      return 'edge';
    } else if (userAgent.indexOf('chrome') !== -1) {
      return 'chrome';
    } else if (userAgent.indexOf('safari') !== -1) {
      return 'safari';
    } else {
      return 'other';
    }
  }

  // Detect private browsing mode
  static async detectPrivateBrowsing(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      // Try to use localStorage as a test
      const testKey = 'test';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);

      // Try to use IndexedDB as a more reliable test
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('test');
        request.onerror = () => reject(new Error('Private browsing detected'));
        request.onsuccess = () => {
          const db = request.result;
          resolve(db);
        };
      });

      // Close and delete the test database
      db.close();
      indexedDB.deleteDatabase('test');

      return false; // Not in private browsing
    } catch (error) {
      return true; // Likely in private browsing
    }
  }

  async init(): Promise<boolean> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return false;
    }

    try {
      // Handle the case where getRegistration returns undefined
      const registration = await navigator.serviceWorker.getRegistration();
      this.serviceWorkerRegistration = registration || null;
      this.initialized = !!registration;
      return !!registration;
    } catch (error) {
      console.error('Failed to initialize push provider:', error);
      this.serviceWorkerRegistration = null;
      this.initialized = false;
      return false;
    }
  }

  async requestPermission(): Promise<NotificationPermissionStatus> {
    return await Notification.requestPermission() as NotificationPermissionStatus;
  }

  async getPermissionStatus(): Promise<NotificationPermissionStatus> {
    return Notification.permission as NotificationPermissionStatus;
  }

  async isEnabled(): Promise<boolean> {
    if (!this.serviceWorkerRegistration) return false;
    const subscription = await this.serviceWorkerRegistration.pushManager.getSubscription();
    return !!subscription && Notification.permission === 'granted';
  }

  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.serviceWorkerRegistration) return null;
    return await this.serviceWorkerRegistration.pushManager.getSubscription();
  }

  sendNotification(title: string, message: string, options: any = {}): void {
    new Notification(title, {
      body: message,
      icon: '/icons/icon-192x192.png',
      ...options
    });
  }

  cleanup(): void {
    this.initialized = false;
    this.serviceWorkerRegistration = null;
  }
}

// Context type
interface NotificationContextType {
  notificationsEnabled: boolean;
  permissionStatus: NotificationPermissionStatus;
  showNotification: (title: string, message: string) => void;
  unreadCount: number;
  markAllAsRead: () => void;
  notifications: ChannelActivity[];
  setNotifications: React.Dispatch<React.SetStateAction<ChannelActivity[]>>;
  requestPermission: () => Promise<NotificationPermissionStatus>;
  toggleNotifications: (enable: boolean) => Promise<void>;
  accountPreference: boolean | null;
  hasActiveSubscription: boolean;
  isLoading: boolean;
  providerType: string;
  browserType: string;
  isPrivateBrowsing: boolean;
  updatePushSubscription: (subscription: PushSubscription, enabled: boolean) => Promise<void>;
}

// Context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  
  const { user, userInfo, updatePushSubscription } = useAuth();

  // States for notification management
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus>('default');
  const [notifications, setNotifications] = useState<ChannelActivity[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [accountPreference, setAccountPreference] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Browser detection states
  const [browserType, setBrowserType] = useState<string>('unknown');
  const [isPrivateBrowsing, setIsPrivateBrowsing] = useState<boolean>(false);

  // Provider instance
  const [provider] = useState<NotificationProviderInterface>(new NativeWebPushProvider());
  const [isProviderInitialized, setIsProviderInitialized] = useState(false);

  // Add state to track initialization attempts
  const [isUserInfoLoading, setIsUserInfoLoading] = useState(true);
  const [initializationStatus, setInitializationStatus] = useState<'idle' | 'pending' | 'complete' | 'error'>('idle');
  const initializationAttempted = useRef(false);
  const lastInitializedUserId = useRef<string | null>(null);
  const userInfoCheckTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastUserInfo = useRef(userInfo);

  // Detect browser and private browsing mode on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect browser type
    const detectedBrowserType = NativeWebPushProvider.detectBrowserType();
    setBrowserType(detectedBrowserType);

    // Detect private browsing mode
    NativeWebPushProvider.detectPrivateBrowsing()
      .then(isPrivate => {
        setIsPrivateBrowsing(isPrivate);
        if (isPrivate) {
          console.warn('Private browsing mode detected. Push notifications may not work correctly.');
        }
      })
      .catch(() => {
        // Silently fail if detection fails
      });
  }, []);

  // Listen for toast notifications from service worker
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleServiceWorkerMessage = (event: MessageEvent) => {
      const data = event.data;

      if (data && data.type === 'TOAST_NOTIFICATION') {
        const notification = data.notification as ToastNotification;

        // Show toast notification
        toast(notification.title, {
          description: notification.message,
          icon: notification.icon ? <img src={notification.icon} alt="" width={20} height={20} /> : undefined,
          duration: 5000,
          action: notification.actions && notification.actions.length > 0 ? {
            label: notification.actions[0].title,
            onClick: () => {
              // Log for end-to-end testing
              // Handle action click (e.g., navigate to a page)
              if (notification.data?.url) {
                window.location.href = notification.data.url;
              }
            }
          } : undefined,
          onDismiss: () => {
          }
        });

        // Update badge count
        setUnreadCount(prev => prev + 1);

        // Add to notifications list if it contains channel activity data
        if (notification.data?.channelActivity) {
          const channelActivity = notification.data.channelActivity as ChannelActivity;
          setNotifications(prev => [{ ...channelActivity, read: false }, ...prev]);
        }
      }
    };

    // Add event listener for messages from service worker
    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

    // Clean up event listener
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, [user, toast, setNotifications, setUnreadCount]);

  // Log when user changes
  useEffect(() => {
    if (user) {
      // Inform service worker about authentication status
      updateServiceWorkerAuthStatus(true);
    } else {
      setAccountPreference(null);

      // Inform service worker about authentication status
      updateServiceWorkerAuthStatus(false);
    }
  }, [user]);

  // Process notification data from userInfo
  useEffect(() => {
    if (userInfo && user) {
      // Check if user has notifications enabled from userInfo
      const notificationsData = userInfo.notifications;
      const hasSubscriptions = notificationsData?.subscriptions?.length > 0;
      const isEnabled = notificationsData?.enabled === true;

      // Get notification preference from user preferences
      const notificationPreference = userInfo.notifications_enabled;

      // Set account preference based on user preferences if available, otherwise use subscription status
      setAccountPreference(notificationPreference !== undefined ? notificationPreference : hasSubscriptions);

      // Set notifications enabled based on both preference and permission status
      if (permissionStatus === 'granted') {
        // If permission is granted, use the preference from the database
        setNotificationsEnabled(notificationPreference !== undefined ? notificationPreference : isEnabled);
      } else {
        // If permission is not granted, notifications cannot be enabled
        setNotificationsEnabled(false);
      }

      setHasActiveSubscription(hasSubscriptions);

    } else if (!user) {
      // Reset state when user is logged out
      setAccountPreference(null);
      setNotificationsEnabled(false);
      setHasActiveSubscription(false);
    }
  }, [userInfo, user, permissionStatus]);

  // Update service worker about authentication status
  const updateServiceWorkerAuthStatus = async (isAuthenticated: boolean) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      try {
        navigator.serviceWorker.controller.postMessage({
          type: 'AUTH_STATUS',
          isAuthenticated
        });
      } catch (error) {
      }
    }
  };

  // Check if current user has an active subscription
  useEffect(() => {
    const checkUserSubscription = async () => {
      if (!user || !isProviderInitialized) {
        return;
      }

      try {
        // Check permission status first - if not granted, can't have active subscription
        if (permissionStatus !== 'granted') {
          setHasActiveSubscription(false);
          setNotificationsEnabled(false);
          return;
        }

        // Get current browser subscription
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
          console.log('No service worker registration found during subscription check');
          setHasActiveSubscription(false);
          setNotificationsEnabled(false);
          return;
        }

        const browserSubscription = await registration.pushManager.getSubscription();

        if (!browserSubscription) {
          console.log('No push subscription found in browser');
          setHasActiveSubscription(false);
          setNotificationsEnabled(false);

          // If user has preference enabled but no subscription, we should create one
          if (userInfo?.notifications_enabled === true) {
            console.log('User preferences indicate notifications should be enabled, but no subscription exists');
            // We'll attempt to create a subscription when they interact with notifications next
          }
          return;
        }

        // Use userInfo from AuthContext instead of fetching it again
        if (!userInfo || !userInfo.notifications) {
          console.log('No user info or notification data available');
          setHasActiveSubscription(false);
          setNotificationsEnabled(false);
          return;
        }

        // Check if this subscription exists in the user's subscriptions
        const subscriptions = userInfo.notifications.subscriptions || [];
        const matchingSubscription = subscriptions.find(
          (sub: any) => sub.endpoint === browserSubscription.endpoint
        );

        if (matchingSubscription) {
          console.log('Found matching subscription for current user');
          setHasActiveSubscription(true);
          setNotificationsEnabled(matchingSubscription.notifications_enabled);
          setAccountPreference(userInfo.notifications.enabled);
        } else {
          // We have a browser subscription, but it doesn't match any in our database
          // This likely means we have a subscription from a different user account
          console.log('Found browser subscription but it does not match current user');

          // Keep the UI accurate - we don't have a subscription for this user
          setHasActiveSubscription(false);
          setNotificationsEnabled(false);

          // If user's preference is to have notifications enabled, we'll need to set up a new subscription
          if (userInfo.notifications_enabled === true) {
            console.log('User preference indicates notifications should be enabled');
            // We could auto-enable here, but it's better to let the user explicitly enable again
          }
        }
      } catch (error) {
        console.error('Error checking subscription status:', error);
        // Default to disabled state on error
        setHasActiveSubscription(false);
        setNotificationsEnabled(false);
      }
    };

    checkUserSubscription();
  }, [user, isProviderInitialized, userInfo, permissionStatus]);

  // Initialize provider
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initProvider = async () => {
      const initialized = await provider.init();
      if (initialized) {
        setIsProviderInitialized(true);

        // Check initial status
        const status = await provider.getPermissionStatus();
        setPermissionStatus(status);

        const enabled = await provider.isEnabled();
        setNotificationsEnabled(enabled);
      } else {
      }
    };

    initProvider();

    // Cleanup when component unmounts
    return () => {
      if (provider.cleanup) {
        provider.cleanup();
      }
    };
  }, [provider]);

  // Request permission
  const requestPermission = async (): Promise<NotificationPermissionStatus> => {
    try {
      console.log('[App] Requesting notification permission...');
      const permission = await Notification.requestPermission();
      console.log('[App] Notification permission status:', permission);

      setPermissionStatus(permission);

      if (permission === 'granted') {
        // Initialize service worker and subscription after permission is granted
        const registration = await registerServiceWorker();
        if (registration) {
          const subscription = await setupPushSubscription();
          if (subscription) {
            setHasActiveSubscription(true);
            setNotificationsEnabled(true);

            // Update subscription in Supabase
            const subscriptionJson = subscription.toJSON();
            await supabase
              .from('push_subscriptions')
              .upsert({
                user_id: user?.id,
                endpoint: subscription.endpoint,
                keys: JSON.stringify(subscriptionJson.keys),
                device_type: 'web',
                browser: navigator.userAgent,
                os: navigator.platform,
                platform: 'web',
                device_id: window.navigator.userAgent,
                app_version: '1.0.0',
                notifications_enabled: true
              }, {
                onConflict: 'endpoint'
              });
          }
        }
        toast.success('Notifications enabled');
      } else if (permission === 'denied') {
        toast.error('Notifications blocked');
      }

      return permission;
    } catch (error) {
      console.error('[App] Error requesting notification permission:', error);
      toast.error('Failed to request notification permission');
      return 'denied';
    }
  };

  // Replace fetchNotifications effect with userInfo sync
  useEffect(() => {
    if (userInfo?.notifications) {
      setNotificationsEnabled(userInfo.notifications.enabled);
      setHasActiveSubscription(userInfo.notifications.subscriptions.length > 0);
    }
  }, [userInfo]);

  // Update effect to sync with userInfo - make it more robust
  useEffect(() => {
    if (userInfo) {
      // Only update if permission is granted to avoid UI inconsistency
      if (permissionStatus === 'granted') {
        setNotificationsEnabled(!!userInfo.notifications_enabled);
        setAccountPreference(userInfo.notifications_enabled ?? null);
        // Check both subscription existence and enabled state
        setHasActiveSubscription(
          userInfo.notifications?.subscriptions?.some((sub: any) => sub.notifications_enabled) ?? false
        );
      } else {
        // If permission not granted, notifications should be disabled
        setNotificationsEnabled(false);
        setHasActiveSubscription(false);
        // Keep account preference as is for when permission is granted
      }
    } else {
      // Reset all states when no userInfo
      setNotificationsEnabled(false);
      setAccountPreference(null);
      setHasActiveSubscription(false);
    }
  }, [userInfo, permissionStatus]);

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);

    // Clear badge when all notifications are read
    if ('clearAppBadge' in navigator) {
      navigator.clearAppBadge().catch(error => {
        console.error('Failed to clear app badge:', error);
      });
    }
  };

  // Show notification
  const showNotification = (title: string, message: string) => {
    // Show in-app toast notification
    toast(title, {
      description: message,
      duration: 5000,
    });

    // Show push notification if enabled and app is not focused
    if (notificationsEnabled && permissionStatus === 'granted' && document.visibilityState !== 'visible') {
      provider.sendNotification(title, message);
    }

  };

  // Update badge count when unread count changes
  useEffect(() => {
    if ('setAppBadge' in navigator && unreadCount > 0) {
      navigator.setAppBadge(unreadCount).catch(error => {
        console.error('Failed to set app badge:', error);
      });
    } else if ('clearAppBadge' in navigator && unreadCount === 0) {
      navigator.clearAppBadge().catch(error => {
        console.error('Failed to clear app badge:', error);
      });
    }
  }, [unreadCount]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!isProviderInitialized) {
      return;
    }

    const subscription = supabase
      .channel('channels_activity')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'channels_activity'
      }, (payload: RealtimePostgresChangesPayload<ChannelActivity>) => {
        const newActivity = payload.new as ChannelActivity;
        if (!newActivity) return;

        const title = `New message from @${newActivity.username}`;
        const message = newActivity.last_message?.message_text || 'New message';

        setNotifications(prev => [{ ...newActivity, read: false }, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Show notification based on app visibility
        if (document.visibilityState === 'visible') {
          // Show toast for visible app
          toast(title, {
            description: message,
            action: {
              label: 'View',
              onClick: () => {
                window.location.href = `/${newActivity.username}`;
              }
            },
            onDismiss: () => {
            }
          });
        } else {
          // Show push notification for background app
          provider.sendNotification(title, message, {
            data: {
              url: `/${newActivity.username}`,
              channelActivity: newActivity,
              sentTimestamp: new Date().toISOString(),
              deliveryMethod: 'push',
              testInfo: {
                source: 'client-notification-context',
                endpoint: 'realtime-push',
                component: 'NotificationContext',
                status: 'sent'
              }
            },
            requireInteraction: true
          });
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [isProviderInitialized, notificationsEnabled, permissionStatus, provider, user]);

  // Add permission change monitoring 
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Function to check if permission has changed
    const checkPermissionStatus = async () => {
      const currentPermission = Notification.permission as NotificationPermissionStatus;
      if (currentPermission !== permissionStatus) {
        console.log(`Permission status changed from ${permissionStatus} to ${currentPermission}`);
        setPermissionStatus(currentPermission);

        // If permission was revoked, we need to update state
        if (currentPermission !== 'granted' && notificationsEnabled) {
          setNotificationsEnabled(false);
          setHasActiveSubscription(false);

          // We'll keep accountPreference as is, since that represents user intent
          console.log('Notification permission was revoked, disabling notifications');
        }
      }
    };

    // Listen for visibility changes to refresh subscription status when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Check if permission has changed
        checkPermissionStatus();

        // If user is authenticated and permission is granted, verify subscription state
        if (user && permissionStatus === 'granted') {
          // Check subscription again
          navigator.serviceWorker.getRegistration().then(registration => {
            if (!registration) return;

            registration.pushManager.getSubscription().then(subscription => {
              if (!subscription && notificationsEnabled) {
                // We thought notifications were enabled, but subscription is gone
                console.log('Subscription disappeared, disabling notifications UI');
                setNotificationsEnabled(false);
                setHasActiveSubscription(false);
              }
            }).catch(error => {
              console.error('Error checking subscription on visibility change:', error);
            });
          }).catch(error => {
            console.error('Error getting service worker registration:', error);
          });
        }
      }
    };

    // Check once on mount
    checkPermissionStatus();

    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, permissionStatus, notificationsEnabled]);

  // Handle user info loading state with debounce
  useEffect(() => {
    // Clear any existing timeout
    if (userInfoCheckTimeout.current) {
      clearTimeout(userInfoCheckTimeout.current);
    }

    // Reset state when user changes
    if (!user) {
      setIsUserInfoLoading(true);
      setInitializationStatus('idle');
      lastUserInfo.current = null;
      console.log('[App] No user, resetting notification states');
      return;
    }

    // Skip if userInfo hasn't actually changed
    if (userInfo && userInfo === lastUserInfo.current) {
      return;
    }

    // Update last known userInfo
    lastUserInfo.current = userInfo;

    // Set a timeout to wait for userInfo to stabilize
    userInfoCheckTimeout.current = setTimeout(() => {
      if (userInfo) {
        console.log('[App] User info available, proceeding with initialization');
        setIsUserInfoLoading(false);
      } else {
        console.log('[App] User info not yet available');
        setIsUserInfoLoading(true);
      }
    }, 1000); // Wait 1 second for userInfo to stabilize

    return () => {
      if (userInfoCheckTimeout.current) {
        clearTimeout(userInfoCheckTimeout.current);
      }
    };
  }, [user, userInfo]);

  // Separate effect for handling user info changes
  useEffect(() => {
    if (!user || isUserInfoLoading) {
      // Reset states when user/userInfo is not available
      if (!user) {
        console.log('[App] No user, resetting notification states');
      } else if (isUserInfoLoading) {
        console.log('[App] User info still loading');
      }
      setInitializationStatus('idle');
      setHasActiveSubscription(false);
      setNotificationsEnabled(false);
      return;
    }

    // Skip if userInfo hasn't changed
    if (userInfo === lastUserInfo.current && initializationStatus !== 'idle') {
      return;
    }

    // Update notification states based on user preferences
    if (userInfo?.notifications_enabled !== undefined) {
      console.log('[App] Updating notification preferences from user info');
      setAccountPreference(userInfo.notifications_enabled);
    }
  }, [user, userInfo, isUserInfoLoading, initializationStatus]);

  // Main initialization effect with retry mechanism
  useEffect(() => {
    let retryTimeout: NodeJS.Timeout | null = null;
    let retryCount = 0;
    const MAX_RETRIES = 3;

    const initializeServiceWorker = async () => {
      // Skip if conditions aren't met
      if (!user || isUserInfoLoading || initializationStatus === 'pending' || initializationStatus === 'complete') {
        if (!user || isUserInfoLoading) {
          console.log('[App] Waiting for user info to be available...');
        }
        return;
      }

      // Skip if userInfo hasn't changed and we've already attempted initialization
      if (userInfo === lastUserInfo.current && initializationAttempted.current && user.id === lastInitializedUserId.current) {
        return;
      }

      if (!userInfo) {
        console.log('[App] User info not available, will retry');
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          retryTimeout = setTimeout(initializeServiceWorker, 1000);
          return;
        }
        console.error('[App] Max retries reached waiting for user info');
        setInitializationStatus('error');
        return;
      }

      try {
        console.log('[App] useEffect triggered - registering SW...');

        // Check if we've already attempted initialization for this user
        if (initializationAttempted.current && user.id === lastInitializedUserId.current) {
          console.log('[App] Service worker already initialized for current user');
          return;
        }

        setInitializationStatus('pending');

        // Check for existing subscription first
        const registration = await registerServiceWorker();
        if (!registration) {
          console.error('[App] Failed to register service worker');
          setInitializationStatus('error');
          return;
        }

        const existingSubscription = await registration.pushManager.getSubscription();

        // If we have an existing subscription, verify it belongs to current user
        if (existingSubscription) {
          const { data, error: subscriptionError } = await supabase
            .from('push_subscriptions')
            .select('user_id, notifications_enabled')
            .eq('endpoint', existingSubscription.endpoint)
            .single();

          if (subscriptionError) {
            console.error('[App] Error checking subscription:', subscriptionError);
            setInitializationStatus('error');
            return;
          }

          if (data?.user_id === user.id) {
            // Subscription belongs to current user, update state
            console.log('[App] Found matching subscription for current user');
            setHasActiveSubscription(true);
            setNotificationsEnabled(data.notifications_enabled);
            initializationAttempted.current = true;
            lastInitializedUserId.current = user.id;
            setInitializationStatus('complete');
            return;
          } else {
            // Subscription belongs to different user, clean up
            console.log('[App] Found subscription from different user, cleaning up');
            await cleanupPushSubscription();
          }
        }

        // Only proceed with new subscription if user preferences indicate it should be enabled
        if (!userInfo?.notifications_enabled) {
          console.log('[App] User preferences indicate notifications should be disabled');
          initializationAttempted.current = true;
          lastInitializedUserId.current = user.id;
          setInitializationStatus('complete');
          return;
        }

        // Create new subscription
        const subscription = await setupPushSubscription();
        if (!subscription) {
          console.warn('[App] Failed to set up push subscription');
          setInitializationStatus('error');
          return;
        }

        // Store subscription in Supabase
        const { error } = await supabase
          .from('push_subscriptions')
          .upsert({
            user_id: user.id,
            endpoint: subscription.endpoint,
            keys: JSON.stringify(subscription.toJSON().keys),
            device_type: 'web',
            browser: navigator.userAgent,
            os: navigator.platform,
            platform: 'web',
            device_id: window.navigator.userAgent,
            app_version: '1.0.0',
            notifications_enabled: true
          }, {
            onConflict: 'endpoint'
          });

        if (error) {
          console.error('[App] Failed to store push subscription:', error);
          setInitializationStatus('error');
          return;
        }

        initializationAttempted.current = true;
        lastInitializedUserId.current = user.id;
        setHasActiveSubscription(true);
        setNotificationsEnabled(true);
        setInitializationStatus('complete');
      } catch (error) {
        console.error('[App] Error in service worker initialization:', error);
        setInitializationStatus('error');
      }
    };

    initializeServiceWorker();

    // Cleanup function
    return () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [user, userInfo, isUserInfoLoading, initializationStatus]);

  // Reset initialization when user changes
  useEffect(() => {
    if (!user) {
      cleanupPushSubscription().catch(console.error);
      initializationAttempted.current = false;
      lastInitializedUserId.current = null;
      lastUserInfo.current = null;
      setHasActiveSubscription(false);
      setNotificationsEnabled(false);
      setInitializationStatus('idle');
      setIsUserInfoLoading(true);
    }
  }, [user]);

  // Toggle notifications
  const toggleNotifications = async (enable: boolean) => {
    if (!user) {
      toast.error('Please sign in to enable notifications');
      return;
    }

    try {
      setIsLoading(true);

      if (enable) {
        // Check permission first
        if (permissionStatus !== 'granted') {
          const newPermission = await requestPermission();
          if (newPermission !== 'granted') {
            setNotificationsEnabled(false);
            setHasActiveSubscription(false);
            return;
          }
        }

        // Get or create push subscription
        const registration = await registerServiceWorker();
        if (!registration) {
          toast.error('Failed to enable push notifications');
          return;
        }

        const subscription = await setupPushSubscription();
        if (!subscription) {
          toast.error('Failed to enable push notifications');
          setNotificationsEnabled(false);
          setHasActiveSubscription(false);
          return;
        }

        // Store subscription in Supabase
        const subscriptionJson = subscription.toJSON();
        const { error: upsertError } = await supabase
          .from('push_subscriptions')
          .upsert({
            user_id: user.id,
            endpoint: subscription.endpoint,
            keys: JSON.stringify(subscriptionJson.keys),
            device_type: 'web',
            browser: navigator.userAgent,
            os: navigator.platform,
            platform: 'web',
            device_id: window.navigator.userAgent,
            app_version: '1.0.0',
            notifications_enabled: true
          }, {
            onConflict: 'endpoint'
          });

        if (upsertError) {
          console.error('[App] Failed to store push subscription:', upsertError);
          toast.error('Failed to save notification preferences');
          return;
        }

        setNotificationsEnabled(true);
        setHasActiveSubscription(true);
        toast.success('Notifications enabled successfully');
      } else {
        // Disable notifications
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
          await subscription.unsubscribe();

          // Update Supabase
          const { error: updateError } = await supabase
            .from('push_subscriptions')
            .update({ notifications_enabled: false })
            .eq('endpoint', subscription.endpoint)
            .eq('user_id', user.id);

          if (updateError) {
            console.error('[App] Failed to update push subscription:', updateError);
            toast.error('Failed to save notification preferences');
            return;
          }
        }

        setNotificationsEnabled(false);
        setHasActiveSubscription(false);
        toast.success('Notifications disabled successfully');
      }
    } catch (error) {
      console.error('[App] Error toggling notifications:', error);
      toast.error('Failed to update notification preferences');
    } finally {
      setIsLoading(false);
    }
  };

  // Context value
  const value = {
    notificationsEnabled: notificationsEnabled && hasActiveSubscription,
    permissionStatus,
    showNotification,
    unreadCount,
    markAllAsRead,
    notifications,
    setNotifications,
    requestPermission,
    toggleNotifications,
    accountPreference,
    hasActiveSubscription,
    isLoading,
    providerType: 'web',
    browserType: typeof window !== 'undefined' ? NativeWebPushProvider.detectBrowserType() : 'unknown',
    isPrivateBrowsing: false,
    updatePushSubscription
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
} 