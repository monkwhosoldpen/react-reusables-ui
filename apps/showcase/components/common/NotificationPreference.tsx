'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, AlertTriangle, Database, Check, X, Smartphone, Code, Eye, Globe, TabletSmartphone } from 'lucide-react';
import { useAuth } from '~/lib/core/contexts/AuthContext';
import { cn } from '~/lib/utils';
import { Switch } from '../ui/switch';
import { useInAppDB } from '~/lib/core/providers/InAppDBProvider';
import { setupPushSubscription } from '~/lib/core/utils/register-sw';
import { toast } from 'sonner';

export function NotificationPreference() {

  const {
    user,
    updateNotificationPreference,
    updatePushSubscription
  } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const inappDb = useInAppDB();

  // Get notification preference from InAppDB
  const userNotifications = user?.id ? inappDb.getUserNotifications(user.id) : false;

  const handleToggle = async (checked: boolean) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // First update notification preference
      await updateNotificationPreference(checked);

      if (checked) {
        // Request notification permission if enabling
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Setup push subscription
          const subscription = await setupPushSubscription();
          if (subscription) {
            // Update push subscription in backend
            await updatePushSubscription(subscription, true);
            toast.success('Notifications enabled successfully');
          } else {
            toast.error('Failed to setup push notifications');
            // Revert notification preference if push setup fails
            await updateNotificationPreference(false);
          }
        } else {
          toast.error('Notification permission denied');
          // Revert notification preference if permission denied
          await updateNotificationPreference(false);
        }
      } else {
        // If disabling notifications, we don't need to unsubscribe
        // The backend will handle this through the notifications_enabled flag
        toast.success('Notifications disabled');
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      toast.error('Failed to update notification settings');
      // Revert to previous state on error
      await updateNotificationPreference(!checked);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col space-y-3")}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {userNotifications ? (
            <Bell className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <BellOff className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          )}
        </div>

        <Switch
          checked={userNotifications}
          onCheckedChange={handleToggle}
          disabled={isLoading || !user?.id}
        />
      </div>

    </div>
  );
} 