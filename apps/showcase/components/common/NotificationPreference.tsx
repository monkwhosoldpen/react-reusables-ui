'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, AlertTriangle, Database, Check, X, Smartphone, Code, Eye, Globe, TabletSmartphone } from 'lucide-react';
import { useNotification } from '~/lib/core/contexts/NotificationContext';
import { useAuth } from '~/lib/core/contexts/AuthContext';
import { cn } from '~/lib/utils';
import { Switch } from '../ui/switch';
import { supabase } from '~/lib/core/supabase';

interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  keys: string;
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

interface NotificationPreferenceProps {
  showDescription?: boolean;
  className?: string;
  compact?: boolean;
  showDebug?: boolean;
}

export function NotificationPreference({ 
  showDescription = true,
  className,
  compact = false,
  showDebug = false}: NotificationPreferenceProps) {
  const { 
    notificationsEnabled,
    permissionStatus,
    toggleNotifications,
    accountPreference,
    hasActiveSubscription,
    providerType,
    isLoading: contextLoading,
    browserType,
    isPrivateBrowsing,
    requestPermission
  } = useNotification();
  
  const { 
    userInfo,
    user
  } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [pushSubscriptions, setPushSubscriptions] = useState<PushSubscription[]>([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(true);
  const [localNotificationState, setLocalNotificationState] = useState(notificationsEnabled);

  // Sync local state with context
  useEffect(() => {
    setLocalNotificationState(notificationsEnabled);
  }, [notificationsEnabled]);

  // Refresh subscriptions periodically and on state changes
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    async function refreshSubscriptions() {
      if (!user) {
        setPushSubscriptions([]);
        setSubscriptionsLoading(false);
        return;
      }

      try {
        setSubscriptionsLoading(true);
        const { data, error } = await supabase
          .from('push_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('notifications_enabled', true);

        if (error) {
          return;
        }

        setPushSubscriptions(data || []);
      } catch (error) {
      } finally {
        setSubscriptionsLoading(false);
      }
    }

    // Initial fetch
    refreshSubscriptions();

    // Set up periodic refresh
    if (user) {
      intervalId = setInterval(refreshSubscriptions, 10000); // Refresh every 10 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [user, notificationsEnabled, accountPreference]);

  // Handle notification toggle with retry logic
  const handleToggle = async (checked: boolean) => {
    setIsLoading(true);
    try {
      // If enabling notifications and permission is not granted, request it first
      if (checked && permissionStatus !== 'granted') {
        const newPermission = await requestPermission();
        if (newPermission !== 'granted') {
          setLocalNotificationState(false);
          setIsLoading(false);
          return;
        }
      }

      // Try to toggle notifications
      await toggleNotifications(checked);
      
      // Verify the change was successful
      let retryCount = 0;
      const maxRetries = 3;
      
      const verifyChange = async () => {
        const { data } = await supabase
          .from('push_subscriptions')
          .select('*')
          .eq('user_id', user?.id)
          .eq('notifications_enabled', checked);

        return data && data.length > 0;
      };

      while (retryCount < maxRetries) {
        const isSuccess = await verifyChange();
        if (isSuccess) {
          // Update local state and subscriptions
          setLocalNotificationState(checked);
          const { data } = await supabase
            .from('push_subscriptions')
            .select('*')
            .eq('user_id', user?.id)
            .eq('notifications_enabled', true);

          setPushSubscriptions(data || []);
          break;
        }

        retryCount++;
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        }
      }

      if (retryCount === maxRetries) {
        // Revert local state if verification failed
        setLocalNotificationState(!checked);
      }
    } catch (error) {
      // Revert local state on error
      setLocalNotificationState(!checked);
    } finally {
      setIsLoading(false);
    }
  };

  // Count subscriptions by type
  const webSubscriptionsCount = pushSubscriptions.filter(sub => sub.device_type === 'web').length;
  const mobileSubscriptionsCount = pushSubscriptions.filter(sub => sub.device_type === 'expo').length;
  const pushSubscriptionsCount = pushSubscriptions.length;
  const hasPushSubscriptions = pushSubscriptionsCount > 0;
  
  // Get status message based on current state
  const getStatusMessage = () => {
    if (subscriptionsLoading) {
      return 'Loading notification status...';
    }

    if (permissionStatus === 'denied') {
      return 'Notifications are blocked in your browser settings';
    }
    
    if (permissionStatus === 'default') {
      return 'Notification permission not requested yet';
    }
    
    if (permissionStatus === 'granted' && !hasActiveSubscription) {
      return 'Notifications are allowed but not subscribed';
    }
    
    if (hasPushSubscriptions) {
      // Include device type information
      let message = `Notifications active on ${pushSubscriptionsCount} device${pushSubscriptionsCount !== 1 ? 's' : ''}`;
      
      if (webSubscriptionsCount > 0 && mobileSubscriptionsCount > 0) {
        message += ` (${webSubscriptionsCount} web, ${mobileSubscriptionsCount} mobile)`;
      }
      
      return message;
    }
    
    // If we have an account preference, use that to determine the status message
    if (accountPreference !== null) {
      return accountPreference 
        ? 'Notifications are enabled in your account' 
        : 'Notifications are disabled in your account';
    }
    
    return notificationsEnabled 
      ? 'Notifications are enabled' 
      : 'Notifications are disabled';
  };

  // Check if permission is denied
  const isPermissionDenied = permissionStatus === 'denied';
  
  // Check if preference is saved in backend
  const isPreferenceSaved = accountPreference !== null;
  
  // Device icon based on provider type
  const DeviceIcon = providerType === 'web' ? Globe : TabletSmartphone;

  return (
    <div className={cn("flex flex-col space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {localNotificationState ? (
            <Bell className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <BellOff className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          )}
          <div>
            <h3 className="font-medium text-gray-800 dark:text-gray-200">Notifications</h3>
            {showDescription && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {getStatusMessage()}
              </p>
            )}
          </div>
        </div>
        
        {isPermissionDenied ? (
          <div className="flex items-center space-x-2 text-amber-500">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs">Blocked</span>
          </div>
        ) : (
          <Switch
            checked={localNotificationState}
            onCheckedChange={handleToggle}
            disabled={isLoading || contextLoading || isPermissionDenied}
          />
        )}
      </div>
      
      {/* Backend status indicator */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 bg-gray-100/70 dark:bg-gray-800/50 rounded-md p-2">
        <div className="flex items-center space-x-1.5">
          <Database className="h-3.5 w-3.5" />
          <span>Saved to your account:</span>
        </div>
        <div className="flex items-center space-x-1">
          {isPreferenceSaved ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              <span className="font-medium text-emerald-500">Yes</span>
            </>
          ) : (
            <>
              <X className="h-3.5 w-3.5 text-amber-500" />
              <span className="font-medium text-amber-500">No</span>
            </>
          )}
        </div>
      </div>
      
      {/* Push subscriptions indicator */}
      {hasPushSubscriptions && (
        <div className="flex flex-col gap-2 text-xs bg-gray-100/70 dark:bg-gray-800/50 rounded-md p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <DeviceIcon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
              <span className="text-gray-500 dark:text-gray-400">Device type:</span>
            </div>
            <div className="font-medium text-gray-700 dark:text-gray-300">
              {providerType === 'web' ? 'Web Browser' : 'Mobile App'}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Smartphone className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
              <span className="text-gray-500 dark:text-gray-400">Registered devices:</span>
            </div>
            <div className="font-medium text-gray-700 dark:text-gray-300">
              {pushSubscriptionsCount}
              {webSubscriptionsCount > 0 && mobileSubscriptionsCount > 0 && (
                <span className="text-xs text-gray-500 ml-1">
                  ({webSubscriptionsCount} web, {mobileSubscriptionsCount} mobile)
                </span>
              )}
            </div>
          </div>
          
          {showDebug && isPrivateBrowsing && (
            <div className="flex items-center space-x-1.5 text-amber-500 mt-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Private browsing detected - notifications may not work</span>
            </div>
          )}
        </div>
      )}
      
      {/* Show loading state */}
      {subscriptionsLoading && (
        <div className="flex items-center justify-center py-2 text-sm text-gray-500">
          Loading subscriptions...
        </div>
      )}
      
      {/* Add loading indicator */}
      {(isLoading || contextLoading) && (
        <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center rounded-md">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
        </div>
      )}
    </div>
  );
} 