'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '~/lib/core/contexts/AuthContext';
import { ChannelActivity } from '~/lib/core/types/notifications';

// Types
type NotificationPermissionStatus = 'default' | 'granted' | 'denied';

interface NotificationContextType {
  notificationsEnabled: boolean;
  permissionStatus: NotificationPermissionStatus;
  notifications: ChannelActivity[];
  unreadCount: number;
  hasActiveSubscription: boolean;
  accountPreference: boolean | null;
  isLoading: boolean;
  toggleNotifications: (enable: boolean) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, userInfo, updateNotificationPreference } = useAuth();
  
  // States for notification management
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus>('default');
  const [notifications, setNotifications] = useState<ChannelActivity[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [accountPreference, setAccountPreference] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Process notification data from userInfo
  useEffect(() => {
    if (userInfo && user) {
      // Check if user has notifications enabled from userInfo
      const notificationsData = userInfo.notifications;
      const isEnabled = notificationsData?.enabled === true;
      
      // Get notification preference from user preferences
      const notificationPreference = userInfo.notifications_enabled;
      
      // Set account preference based on user preferences if available
      setAccountPreference(notificationPreference !== undefined ? notificationPreference : isEnabled);
      
      // Set notifications enabled based on preference
      setNotificationsEnabled(notificationPreference !== undefined ? notificationPreference : isEnabled);
      
    } else if (!user) {
      // Reset state when user is logged out
      setAccountPreference(null);
      setNotificationsEnabled(false);
      setHasActiveSubscription(false);
    }
  }, [userInfo, user]);

  const toggleNotifications = async (enable: boolean) => {
    if (!user) {
      toast.error('Please sign in to manage notifications');
      return;
    }
    
    setIsLoading(true);
    try {
      // Update preference in AuthContext
      await updateNotificationPreference(enable);
      
      setNotificationsEnabled(enable);
      toast.success(enable ? 'Notifications enabled' : 'Notifications disabled');
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast.error('Failed to update notification settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notificationsEnabled,
        permissionStatus,
        notifications,
        unreadCount,
        hasActiveSubscription,
        accountPreference,
        isLoading,
        toggleNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}; 