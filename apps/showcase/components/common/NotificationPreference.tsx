'use client';

import React, { useState } from 'react';
import { useNotification } from '~/lib/core/contexts/NotificationContext';
import { useAuth } from '~/lib/core/contexts/AuthContext';
import { Switch } from '~/components/ui/switch';
import { Globe, TabletSmartphone, Bell, BellOff, AlertTriangle, Database, Check, X, Smartphone, Code } from 'lucide-react-native';
import { cn } from '~/lib/utils';
import { useColorScheme } from 'react-native';

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
    isPrivateBrowsing
  } = useNotification();
  
  const { userInfo } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();

  // Color variables
  const bgColor = colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const textColor = colorScheme === 'dark' ? 'text-white' : 'text-gray-900';
  const subtitleColor = colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  const borderColor = colorScheme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const cardBg = colorScheme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100/70';
  const debugBg = colorScheme === 'dark' ? 'bg-gray-800/70' : 'bg-gray-100';

  // Get push subscription information from userInfo
  const pushSubscriptions = userInfo?.notifications?.subscriptions || [];
  
  // Count subscriptions by type
  const webSubscriptionsCount = pushSubscriptions.filter((sub: any) => sub.device_type === 'web').length;
  const mobileSubscriptionsCount = pushSubscriptions.filter((sub: any) => sub.device_type === 'expo').length;
  const pushSubscriptionsCount = pushSubscriptions.length;
  const hasPushSubscriptions = pushSubscriptionsCount > 0;
  
  // Handle notification toggle
  const handleToggle = async (checked: boolean) => {
    setIsLoading(true);
    try {
      await toggleNotifications(checked);
    } finally {
      setIsLoading(false);
    }
  };

  // Get status message based on current state
  const getStatusMessage = () => {
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

  // Provider-specific instructions for enabling notifications
  const getProviderInstructions = () => {
    if (providerType === 'web') {
      if (browserType === 'firefox') {
        return (
          <ol className="list-decimal pl-5 space-y-1 text-gray-600 dark:text-gray-400">
            <li>Click the lock/shield icon in your browser address bar</li>
            <li>Select &quot;Connection Secure&quot; → &quot;More Information&quot;</li>
            <li>Go to &quot;Permissions&quot; tab</li>
            <li>Find &quot;Receive Notifications&quot; and change to &quot;Allow&quot;</li>
            <li>Refresh this page</li>
          </ol>
        );
      } else if (browserType === 'safari') {
        return (
          <ol className="list-decimal pl-5 space-y-1 text-gray-600 dark:text-gray-400">
            <li>Click Safari in the menu bar</li>
            <li>Select &quot;Preferences&quot; → &quot;Websites&quot;</li>
            <li>Click on &quot;Notifications&quot; in the sidebar</li>
            <li>Find this website and select &quot;Allow&quot;</li>
            <li>Refresh this page</li>
          </ol>
        );
      } else {
        // Default Chrome/Edge instructions
        return (
          <ol className="list-decimal pl-5 space-y-1 text-gray-600 dark:text-gray-400">
            <li>Click the lock/info icon in your browser address bar</li>
            <li>Find &quot;Notifications&quot; permissions</li>
            <li>Change the setting from &quot;Block&quot; to &quot;Allow&quot;</li>
            <li>Refresh this page</li>
          </ol>
        );
      }
    } else {
      // Expo/Mobile instructions
      return (
        <ol className="list-decimal pl-5 space-y-1 text-gray-600 dark:text-gray-400">
          <li>Open your device Settings</li>
          <li>Go to Notifications</li>
          <li>Find this app and enable notifications</li>
          <li>Return to the app and try again</li>
        </ol>
      );
    }
  };

  // Check if permission is denied
  const isPermissionDenied = permissionStatus === 'denied';
  
  // Check if preference is saved in backend
  const isPreferenceSaved = accountPreference !== null;
  
  // Determine if notifications are actually enabled (permission granted + preference enabled)
  const areNotificationsEnabled = notificationsEnabled && permissionStatus === 'granted';

  // Device icon based on provider type
  const DeviceIcon = providerType === 'web' ? Globe : TabletSmartphone;

  return (
    <div className={cn("flex flex-col space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {areNotificationsEnabled ? (
            <Bell className={cn("h-5 w-5", colorScheme === 'dark' ? "text-emerald-400" : "text-emerald-600")} />
          ) : (
            <BellOff className={cn("h-5 w-5", subtitleColor)} />
          )}
          <div>
            <h3 className={cn("font-medium", textColor)}>Notifications</h3>
            {showDescription && (
              <p className={cn("text-sm", subtitleColor)}>
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
            checked={accountPreference !== null ? accountPreference : notificationsEnabled}
            onCheckedChange={handleToggle}
            disabled={isLoading || contextLoading || isPermissionDenied}
          />
        )}
      </div>
      
      {/* Backend status indicator */}
      <div className={cn("flex items-center justify-between text-xs", subtitleColor, cardBg, "rounded-md p-2")}>
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
        <div className={cn("flex flex-col gap-2 text-xs", cardBg, "rounded-md p-2")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <DeviceIcon className={cn("h-3.5 w-3.5", subtitleColor)} />
              <span className={subtitleColor}>Device type:</span>
            </div>
            <div className={cn("font-medium", textColor)}>
              {providerType === 'web' ? 'Web Browser' : 'Mobile App'}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Smartphone className={cn("h-3.5 w-3.5", subtitleColor)} />
              <span className={subtitleColor}>Registered devices:</span>
            </div>
            <div className={cn("font-medium", textColor)}>
              {pushSubscriptionsCount}
              {webSubscriptionsCount > 0 && mobileSubscriptionsCount > 0 && (
                <span className={cn("text-xs ml-1", subtitleColor)}>
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
      
      {isPermissionDenied && !compact && (
        <div className={cn("rounded-md p-3 text-sm border", debugBg, borderColor)}>
          <p className={cn("mb-2", textColor)}>
            Notifications are blocked. To enable notifications, you need to:
          </p>
          {getProviderInstructions()}
        </div>
      )}

      {/* Show debug info if enabled */}
      {showDebug && (
        <div className={cn("rounded-md p-3 text-xs border mt-2", debugBg, borderColor)}>
          <div className="flex items-center space-x-1.5 mb-2">
            <Code className={cn("h-3.5 w-3.5", subtitleColor)} />
            <span className={cn("font-medium", textColor)}>Debug Information</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <span className={subtitleColor}>Provider Type:</span>
            <span className={textColor}>{providerType}</span>
            
            <span className={subtitleColor}>Browser:</span>
            <span className={textColor}>{browserType}</span>
            
            <span className={subtitleColor}>Permission:</span>
            <span className={textColor}>{permissionStatus}</span>
            
            <span className={subtitleColor}>Active Sub:</span>
            <span className={textColor}>{hasActiveSubscription ? 'Yes' : 'No'}</span>
            
            <span className={subtitleColor}>Account Pref:</span>
            <span className={textColor}>
              {accountPreference === null ? 'Not set' : accountPreference ? 'Enabled' : 'Disabled'}
            </span>
            
            <span className={subtitleColor}>Private Mode:</span>
            <span className={textColor}>{isPrivateBrowsing ? 'Yes' : 'No'}</span>
          </div>
        </div>
      )}
    </div>
  );
} 