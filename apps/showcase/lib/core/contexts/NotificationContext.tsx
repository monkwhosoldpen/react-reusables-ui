// 'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '~/lib/core/supabase';
import { useAuth } from '~/lib/core/contexts/AuthContext';
import { ChannelActivity } from '~/lib/core/types/notifications';
import {
  setupPushSubscription,
  registerServiceWorker,
  cleanupPushSubscription,
} from '~/utils/register-sw';
import { useInAppDB } from '~/lib/core/providers/InAppDBProvider';

// Types --------------------------------------------------------------------
type NotificationPermissionStatus = 'default' | 'granted' | 'denied';

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

interface NotificationProviderInterface {
  init(): Promise<boolean>;
  requestPermission(): Promise<NotificationPermissionStatus>;
  getPermissionStatus(): Promise<NotificationPermissionStatus>;
  isEnabled(): Promise<boolean>;
  sendNotification(title: string, message: string, options?: any): void;
  cleanup?(): void;
  getSubscription(): Promise<PushSubscription | null>;
}

// ---------------------------------------------------------------------------
// NativeWebPushProvider ------------------------------------------------------
// ---------------------------------------------------------------------------
class NativeWebPushProvider implements NotificationProviderInterface {
  private initialized = false;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  /* Detect browser type */
  static detectBrowserType(): string {
    if (typeof window === 'undefined') return 'unknown';
    const ua = window.navigator.userAgent.toLowerCase();
    return ua.includes('firefox')
      ? 'firefox'
      : ua.includes('edg')
      ? 'edge'
      : ua.includes('chrome')
      ? 'chrome'
      : ua.includes('safari')
      ? 'safari'
      : 'other';
  }

  /* Detect private browsing */
  static async detectPrivateBrowsing(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      localStorage.setItem('pb-test', '1');
      localStorage.removeItem('pb-test');
      return false;
    } catch (_) {
      return true;
    }
  }

  async init(): Promise<boolean> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return false;
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      this.serviceWorkerRegistration = reg || null;
      this.initialized = !!reg;
      return !!reg;
    } catch (e) {
      this.serviceWorkerRegistration = null;
      this.initialized = false;
      return false;
    }
  }

  async requestPermission() {
    return (await Notification.requestPermission()) as NotificationPermissionStatus;
  }
  async getPermissionStatus() {
    return Notification.permission as NotificationPermissionStatus;
  }
  async isEnabled() {
    if (!this.serviceWorkerRegistration) return false;
    const sub = await this.serviceWorkerRegistration.pushManager.getSubscription();
    return !!sub && Notification.permission === 'granted';
  }
  async getSubscription() {
    if (!this.serviceWorkerRegistration) return null;
    return this.serviceWorkerRegistration.pushManager.getSubscription();
  }
  sendNotification(title: string, message: string, options: any = {}) {
    new Notification(title, { body: message, icon: '/icons/icon-192x192.png', ...options });
  }
  cleanup() {
    this.initialized = false;
    this.serviceWorkerRegistration = null;
  }
}

// Context -------------------------------------------------------------------
interface NotificationContextType {
  permissionStatus: NotificationPermissionStatus;
  showNotification: (title: string, message: string) => void;
  unreadCount: number;
  markAllAsRead: () => void;
  notifications: ChannelActivity[];
  setNotifications: React.Dispatch<React.SetStateAction<ChannelActivity[]>>;
  requestPermission: () => Promise<NotificationPermissionStatus>;
  browserType: string;
  isPrivateBrowsing: boolean;
  hasActiveSubscription: boolean;
}
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
};

// ---------------------------------------------------------------------------
export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, updatePushSubscription } = useAuth();
  const inAppDB = useInAppDB();

  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus>('default');
  const [notifications, setNotifications] = useState<ChannelActivity[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [browserType, setBrowserType] = useState('unknown');
  const [isPrivateBrowsing, setIsPrivateBrowsing] = useState(false);

  const [provider] = useState<NotificationProviderInterface>(new NativeWebPushProvider());
  const [providerReady, setProviderReady] = useState(false);

  // -------------------------------------------------------------------------
  // Verify existing subscription -------------------------------------------
  // -------------------------------------------------------------------------
  useEffect(() => {
    const verify = async () => {
      if (!user?.id || !providerReady || permissionStatus !== 'granted') {
        setHasActiveSubscription(false);
        return;
      }

      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (!reg) {
          return setHasActiveSubscription(false);
        }
        
        let browserSub = await reg.pushManager.getSubscription();
        const stored = inAppDB.getPushSubscriptions(user.id);

        // If we have stored subscriptions but no browser subscription, try to resubscribe ONCE
        if (!browserSub && stored.length > 0) {
          
          // Get the most recent enabled subscription first
          const lastEnabledSub = [...stored]
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            .find(s => s.notifications_enabled);

          if (!lastEnabledSub) {
            return setHasActiveSubscription(false);
          }

          // Try to create a new subscription
          browserSub = await setupPushSubscription();
          if (!browserSub) {
            return setHasActiveSubscription(false);
          }

          await updatePushSubscription(browserSub, lastEnabledSub.notifications_enabled);
          return setHasActiveSubscription(lastEnabledSub.notifications_enabled);
        }

        // Normal subscription verification for existing browser subscription
        if (browserSub) {
          const match = stored.find(s => 
            s.endpoint === browserSub.endpoint && 
            s.notifications_enabled
          );
          
          if (match) {
            setHasActiveSubscription(true);
          } else {
            await browserSub.unsubscribe();
            setHasActiveSubscription(false);
          }
        } else {
          setHasActiveSubscription(false);
        }
      } catch (e) {
        setHasActiveSubscription(false);
      }
    };

    verify();
  }, [user, providerReady, permissionStatus]);

  // -------------------------------------------------------------------------
  // Init provider -----------------------------------------------------------
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined') return;
    (async () => {
      const ok = await provider.init();
      setProviderReady(ok);
      const status = await provider.getPermissionStatus();
      setPermissionStatus(status);
    })();
    return () => provider.cleanup?.();
  }, [provider]);

  // -------------------------------------------------------------------------
  // Request permission + (re)subscribe --------------------------------------
  // -------------------------------------------------------------------------
  const requestPermission = async () => {
    try {
      const perm = await Notification.requestPermission();
      setPermissionStatus(perm);

      if (perm === 'granted' && user?.id) {
        const reg = await registerServiceWorker();
        if (!reg) {
          return perm;
        }

        // Always try to get a fresh subscription
        let sub = await reg.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
        }

        sub = await setupPushSubscription();
        
        if (sub) {
          await updatePushSubscription(sub, true);
          setHasActiveSubscription(true);
          toast.success('Notifications enabled');
        } else {
          toast.error('Failed to enable notifications');
        }
      } else if (perm === 'denied') {
        toast.error('Notifications blocked');
      }

      return perm as NotificationPermissionStatus;
    } catch (e) {
      toast.error('Failed to request notification permission');
      return 'denied';
    }
  };

  // -------------------------------------------------------------------------
  // SW message listener -----------------------------------------------------
  // -------------------------------------------------------------------------
  useEffect(() => {
    const handler = (ev: MessageEvent) => {
      const { data } = ev;
      if (data?.type !== 'TOAST_NOTIFICATION') return;
      const n: ToastNotification = data.notification;
      toast(n.title, {
        description: n.message,
        icon: n.icon ? <img src={n.icon} alt="" width={20} height={20} /> : undefined,
      });
      setUnreadCount(c => c + 1);
      if (n.data?.channelActivity) {
        setNotifications(p => [{ ...n.data.channelActivity, read: false }, ...p]);
      }
    };
    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
  }, []);

  // Detect browser + private mode -------------------------------------------
  useEffect(() => {
    setBrowserType(NativeWebPushProvider.detectBrowserType());
    NativeWebPushProvider.detectPrivateBrowsing().then(setIsPrivateBrowsing);
  }, []);

  // Badge updates -----------------------------------------------------------
  useEffect(() => {
    if ('setAppBadge' in navigator && unreadCount) navigator.setAppBadge(unreadCount).catch(() => {});
    if ('clearAppBadge' in navigator && !unreadCount) navigator.clearAppBadge().catch(() => {});
  }, [unreadCount]);

  const markAllAsRead = () => {
    setNotifications(n => n.map(x => ({ ...x, read: true })));
    setUnreadCount(0);
    if ('clearAppBadge' in navigator) navigator.clearAppBadge().catch(() => {});
  };

  const showNotification = (title: string, message: string) => {
    toast(title, { description: message });
    if (permissionStatus === 'granted') provider.sendNotification(title, message);
  };

  return (
    <NotificationContext.Provider
      value={{
        permissionStatus,
        showNotification,
        unreadCount,
        markAllAsRead,
        notifications,
        setNotifications,
        requestPermission,
        browserType,
        isPrivateBrowsing,
        hasActiveSubscription,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
