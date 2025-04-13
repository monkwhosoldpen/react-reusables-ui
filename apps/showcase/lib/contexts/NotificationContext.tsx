'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { useAuth } from '@/lib/contexts/AuthContext';
import { ChannelActivity } from '@/lib/types/notifications';
import { supabase } from '../supabase';

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
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 
  'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

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
  const { user, userInfo, updateNotificationPreference, updatePushSubscription } = useAuth();
  
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
  const [providerType, setProviderType] = useState<string>('web');
  
  // Provider instance
  const [provider] = useState<NotificationProviderInterface>(new NativeWebPushProvider());
  const [isProviderInitialized, setIsProviderInitialized] = useState(false);
  
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
          setNotifications(prev => [{...channelActivity, read: false}, ...prev]);
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

  // Helper function to get or register service worker
  const getOrRegisterServiceWorker = async () => {
    // Check if service workers are supported at all
    if (!('serviceWorker' in navigator)) {
      toast.error('Service workers are not supported in this browser');
      return null;
    }

    // Check if push manager is supported
    if (!('PushManager' in window)) {
      toast.error('Push notifications are not supported in this browser');
      return null;
    }

    try {
      // Try to get existing registration
      let registration = await navigator.serviceWorker.getRegistration();
      
      // If no registration exists, try to register
      if (!registration) {
        registration = await navigator.serviceWorker.register('/sw.js');
        if (!registration) {
          toast.error('Failed to register service worker');
          return null;
        }
      }

      // Wait for the service worker to be ready
      if (registration.waiting) {
        // If there's a waiting service worker, wait for it to become active
        await new Promise<void>((resolve) => {
          if (registration) {
            registration.addEventListener('activate', () => {
              resolve();
            });
          } else {
            // If registration is not available, resolve immediately
            resolve();
          }
        });
      }

      // Ensure the service worker is active
      if (registration.active) {
        // If there's an active service worker, we're good to go
        return registration;
      }

      // If we get here, we need to wait for the service worker to become active
      await new Promise<void>((resolve) => {
        if (registration) {
          registration.addEventListener('activate', () => {
            resolve();
          });
        } else {
          // If registration is not available, resolve immediately
          resolve();
        }
      });

      // Check if push manager is supported in the registration
      if (!registration.pushManager) {
        toast.error('Push notifications are not supported in this browser');
        return null;
      }

      // Check if we can subscribe to push notifications
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          toast.error('Please allow notifications in your browser settings');
          return null;
        }
      } catch (error) {
        toast.error('Failed to check notification permission');
        return null;
      }

      return registration;
    } catch (error) {
      toast.error('Failed to initialize service worker');
      return null;
    }
  };

  // Request permission
  const requestPermission = async (): Promise<NotificationPermissionStatus> => {
    try {
      const permission = await provider.requestPermission();
      setPermissionStatus(permission);
      // After requesting permission, check if the user has an active subscription
      if (permission === 'granted' && user) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          const subscription = await registration.pushManager.getSubscription();
          if (subscription) {
            setHasActiveSubscription(true);
            setNotificationsEnabled(true);
            setAccountPreference(true);
            
            // Update subscription with device info and notification preference
            await updatePushSubscription(subscription, true);
            await updateNotificationPreference(true);
          } else {
          }
        }
      }
      
      if (permission === 'granted') {
        toast.success('Notifications enabled');
      } else if (permission === 'denied') {
        toast.error('Notifications blocked');
      }

      return permission;
    } catch (error) {
      toast.error('Failed to request notification permission');
      return 'denied';
    }
  };

  // Toggle notifications
  const toggleNotifications = async (enable: boolean) => {
    if (!user) {
      toast.error('Please sign in to enable notifications');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // If enabling notifications
      if (enable) {
        // Check permission first
        if (permissionStatus !== 'granted') {
          const newPermission = await requestPermission();
          if (newPermission !== 'granted') {
            // User denied permission
            setNotificationsEnabled(false);
            setHasActiveSubscription(false);
            return;
          }
        }

        // Get or register service worker
        const registration = await getOrRegisterServiceWorker();
        if (!registration) {
          return;
        }

        // IMPORTANT: Always unsubscribe from any existing subscription first
        // This ensures we don't have a stale subscription from a different user
        let subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          try {
            // Unsubscribe from the existing subscription
            await subscription.unsubscribe();
            console.log('Unsubscribed from existing push subscription');
          } catch (error) {
            console.error('Error unsubscribing from existing push subscription:', error);
            // Continue anyway, as we'll try to create a new subscription
          }
        }
        
        // Create a new subscription
        try {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: vapidPublicKey
          });
        } catch (error) {
          console.error('Error subscribing to push notifications:', error);
          toast.error('Failed to enable push notifications');
          return;
        }

        // Update subscription and preference
        await updatePushSubscription(subscription, true);
        await updateNotificationPreference(true);
        
        setHasActiveSubscription(true);
        setNotificationsEnabled(true);
        toast.success('Notifications enabled successfully');

      } else {
        // Disabling notifications
        // Get the current push subscription from service worker
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          const subscription = await registration.pushManager.getSubscription();
          if (subscription) {
            // Unsubscribe from push
            await subscription.unsubscribe();
            // Update backend
            await updatePushSubscription(subscription, false);
          }
        }

        // Update preference in AuthContext
        await updateNotificationPreference(false);
        
        setNotificationsEnabled(false);
        setHasActiveSubscription(false);
        toast.success('Notifications disabled successfully');
      }
      
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast.error('Failed to update notification settings');
    } finally {
      setIsLoading(false);
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

        setNotifications(prev => [{...newActivity, read: false}, ...prev]);
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