'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { indexedDB } from '@/lib/services/indexedDB';
import { StoreNames } from 'idb';
import { NchatDB } from '@/lib/services/indexedDBSchema';
import LanguageChanger from '@/components/common/LanguageChanger';
import { UserLocation } from '@/components/common/UserLocation';
import { FollowButton } from '@/components/common/FollowButton';
import { LogIn, LogOut, ChevronRight, Bell, RefreshCw, Save, Database, CheckCircle, XCircle, DownloadCloud, AlertTriangle, Smartphone, Home, Users, Settings, Activity, PanelLeft, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { LoginDialog } from '@/components/ui/LoginDialog';
import { NotificationPreference } from '@/components/notifications/NotificationPreference';
import { useNotification } from '@/lib/contexts/NotificationContext';

// Type alias for store names to match the one in the indexedDB service
type ValidStoreNames = StoreNames<NchatDB>;

// Define available stores (updated to match actual schema names)
const STORE_NAMES: ValidStoreNames[] = [
  'users',
  'user_language',
  'user_notifications',
  'push_subscriptions',
  'tenant_requests',
  'user_location',
  'channels_messages',
  'channels_activity',
  'user_channel_follow',
  'user_channel_last_viewed'
];

// VAPID key for push notifications
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 
  'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

// Mock usernames for testing follow functionality
const MOCK_USERNAMES = ['elonmusk', 'testusername'];

export default function TestPage() {
  const { user, userInfo, loading: userLoading, signOut } = useAuth();
  const router = useRouter();
  const [dbContent, setDbContent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<ValidStoreNames>('channels_messages');
  const [storeRecords, setStoreRecords] = useState<any[]>([]);
  const [rawApiResponse, setRawApiResponse] = useState<any | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [dbInitialized, setDbInitialized] = useState(false);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const initializationStarted = useRef(false);
  const [logs, setLogs] = useState<Array<{timestamp: string, message: string, type: 'info' | 'success' | 'error' | 'warning'}>>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('database');
  const { 
    notificationsEnabled, 
    permissionStatus, 
    requestPermission, 
    toggleNotifications,
    accountPreference,
    hasActiveSubscription,
    updatePushSubscription
  } = useNotification();

  // Initialize IndexedDB as early as possible, even before user is loaded
  useEffect(() => {
    if (!initializationStarted.current) {
      initializationStarted.current = true;
      console.log('Initializing IndexedDB on mount');
      
      // Initialize IndexedDB right away, don't wait for anything else
      indexedDB.initialize()
        .then(() => {
          console.log('IndexedDB initialized successfully');
          setDbInitialized(true);
        })
        .catch(err => {
          console.error('Error initializing IndexedDB:', err);
          setError(`IndexedDB initialization error: ${err instanceof Error ? err.message : String(err)}`);
        });
    }
  }, []);

  // Function to fetch specific store records without changing selected store
  // This can be used to load data in the background
  const fetchStoreData = async (storeName: ValidStoreNames): Promise<any[]> => {
    try {
      // Skip re-initialization since we already initialized on mount
      if (!dbInitialized) {
        console.log('Waiting for IndexedDB to initialize before loading data');
        return [];
      }
      
      // Get all records from the store
      const records = await indexedDB.getAll(storeName);
      console.log(`Loaded ${records.length} records from ${storeName}`);
      return records;
    } catch (err) {
      console.error(`Error fetching store ${storeName}:`, err);
      return [];
    }
  };

  // Function to fetch and display records for a specific store when user clicks
  const fetchStoreRecords = async (storeName: ValidStoreNames) => {
    setRecordsLoading(true);
    try {
      setError(null);
      setSelectedStore(storeName);
      
      // Get records from the store
      const records = await fetchStoreData(storeName);
      
      // Update the UI with the records
      setStoreRecords(records);
    } catch (err) {
      console.error(`Error fetching store ${storeName}:`, err);
      setStoreRecords([]);
      setError(`Error fetching store ${storeName}: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setRecordsLoading(false);
    }
  };

  // Function to fetch raw API response - lower priority
  const fetchRawApiResponse = async () => {
    if (!user?.id) return;
    
    try {
      setApiLoading(true);
      setError(null);
      
      const response = await fetch(`/api/myinfo?userId=${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isGuest: false
        })
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      setRawApiResponse(data);
      console.log('Raw API Response:', data);
    } catch (err) {
      console.error('Error fetching raw API response:', err);
      // Don't show API errors as primary errors since we're offline-first
      console.warn(`API data error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setApiLoading(false);
    }
  };

  // Function to save raw API response to IndexedDB
  const saveRawApiToIndexedDB = async () => {
    if (!user?.id || !rawApiResponse) return;
    
    try {
      setSaveLoading(true);
      setError(null);
      
      await indexedDB.saveRawApiData(user.id, rawApiResponse);
      
      // After saving, fetch the updated content
      await fetchIndexedDBContent();
      
      // Also update the currently selected store
      const records = await fetchStoreData(selectedStore);
      setStoreRecords(records);
      
      console.log('Successfully saved API data to IndexedDB');
    } catch (err) {
      console.error('Error saving API data to IndexedDB:', err);
      setError(`Error saving API data: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSaveLoading(false);
    }
  };

  // Function to fetch and display raw IndexedDB content
  const fetchIndexedDBContent = async () => {
    if (!user?.id || !dbInitialized) return;
    
    try {
      setError(null);
      
      // Skip initialization since we already initialized on mount
      
      // Get all raw data from IndexedDB
      const rawData = await indexedDB.getAllRawData(user.id);
      
      // Set raw data without transformation
      setDbContent(rawData);
      console.log('Raw IndexedDB Content loaded');
    } catch (err) {
      console.error('Error fetching IndexedDB content:', err);
      setError(`Error fetching IndexedDB content: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Fetch follows for a user to check follow status and update the UI
  const fetchUserFollows = async () => {
    if (!user?.id || !dbInitialized) return [];
    
    try {
      const follows = await indexedDB.getAllFromIndex('user_channel_follow', 'by-user', user.id);
      console.log('User follows:', follows);
      return follows || [];
    } catch (err) {
      console.error('Error fetching user follows:', err);
      return [];
    }
  };

  // Check if a specific username is followed
  const isFollowingUsername = async (username: string): Promise<boolean> => {
    if (!user?.id || !dbInitialized) return false;
    
    try {
      // Try direct lookup using composite key [user_id, username]
      const followRecord = await indexedDB.get('user_channel_follow', [user.id, username]);
      return !!followRecord;
    } catch (err) {
      console.error(`Error checking if following ${username}:`, err);
      
      // Fallback to index-based search
      try {
        const follows = await fetchUserFollows();
        return follows.some(follow => follow.username === username);
      } catch (error) {
        console.error(`Fallback error checking if following ${username}:`, error);
        return false;
      }
    }
  };

  // Function to refresh the currently selected store view
  const refreshCurrentStore = async () => {
    if (selectedStore === 'user_channel_follow') {
      const follows = await fetchUserFollows();
      setStoreRecords(follows);
    } else {
      fetchStoreRecords(selectedStore);
    }
  };

  // Load data as soon as DB is initialized and user is available
  useEffect(() => {
    if (dbInitialized && !userLoading && user?.id) {
      console.log('Database initialized and user available, loading data');
      
      // First load the selected store data (highest priority)
      setRecordsLoading(true);
      fetchStoreData('channels_messages')
        .then(records => {
          setStoreRecords(records);
          setRecordsLoading(false);
        })
        .catch(error => {
          console.error('Error loading store records:', error);
          setRecordsLoading(false);
        });
      
      // Then load the full IndexedDB content (second priority)
      fetchIndexedDBContent();
      
      // Also fetch user follows to see which channels are followed
      fetchUserFollows();
      
      // Finally, try to fetch from API in the background (lowest priority)
      setTimeout(() => {
        fetchRawApiResponse().catch(error => {
          console.warn('API fetch failed, but IndexedDB data is already displayed:', error);
        });
      }, 100);
    }
  }, [dbInitialized, userLoading, user?.id]);

  // Styled settings item similar to Settings page
  const SettingsItem = ({
    icon: Icon,
    title,
    description,
    onClick,
    destructive
  }: {
    icon: any,
    title: string,
    description?: string,
    onClick?: () => void,
    destructive?: boolean
  }) => (
    <div
      className={`w-full p-4 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-700 last:border-b-0 cursor-pointer ${destructive ? 'text-red-500' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <Icon className={`h-5 w-5 ${destructive ? 'text-red-500' : ''}`} />
        <div className="text-left">
          <h3 className={`font-medium ${destructive ? 'text-red-500' : ''}`}>{title}</h3>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-gray-400" />
    </div>
  );

  // Handle successful login
  const handleLoginSuccess = () => {
    setShowLoginDialog(false);
    // Refresh the page data
    if (dbInitialized) {
      fetchIndexedDBContent();
    }
  };

  // Add logging function
  const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const timestamp = new Date().toISOString().slice(11, 19); // HH:MM:SS format
    setLogs(prev => [{timestamp, message, type}, ...prev].slice(0, 100)); // Keep last 100 logs
    console.log(`[${timestamp}][${type.toUpperCase()}] ${message}`);
  };
  
  // Clear logs
  const clearLogs = () => {
    setLogs([]);
    addLog('Logs cleared', 'info');
  };
  
  // Log notification state on initial load
  useEffect(() => {
    addLog(`Notification state initialized`, 'info');
    addLog(`Permission status: ${permissionStatus}`, permissionStatus === 'granted' ? 'success' : permissionStatus === 'denied' ? 'error' : 'warning');
    addLog(`Notifications enabled: ${notificationsEnabled}`, notificationsEnabled ? 'success' : 'info');
    addLog(`Account preference: ${accountPreference === null ? 'Not set' : accountPreference ? 'Enabled' : 'Disabled'}`, 'info');
    addLog(`Active subscription: ${hasActiveSubscription ? 'Yes' : 'No'}`, hasActiveSubscription ? 'success' : 'info');
  }, [permissionStatus, notificationsEnabled, accountPreference, hasActiveSubscription]);

  // Log when user info changes
  useEffect(() => {
    if (userInfo) {
      addLog(`User info loaded: ${userInfo.id.slice(0, 8)}...`, 'success');
      if (userInfo.notifications) {
        addLog(`User has ${userInfo.notifications?.subscriptions?.length || 0} push subscription(s)`, 'info');
      }
    }
  }, [userInfo]);
  
  // Test notification permission
  const testRequestPermission = async () => {
    addLog('Requesting notification permission...', 'info');
    try {
      const permResult = await requestPermission();
      addLog(`Permission request result: ${permResult}`, permResult === 'granted' ? 'success' : permResult === 'denied' ? 'error' : 'warning');
    } catch (error) {
      addLog(`Permission request error: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
  };
  
  // Toggle notifications
  const testToggleNotifications = async (enable: boolean) => {
    addLog(`${enable ? 'Enabling' : 'Disabling'} notifications...`, 'info');
    try {
      await toggleNotifications(enable);
      addLog(`Notifications ${enable ? 'enabled' : 'disabled'} successfully`, 'success');
    } catch (error) {
      addLog(`Error toggling notifications: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
  };
  
  // Test sending a notification through the service worker
  const testServiceWorkerNotification = async () => {
    addLog('Testing service worker notification...', 'info');
    try {
      if (!('serviceWorker' in navigator)) {
        addLog('Service Worker not supported in this browser', 'error');
        return;
      }
      
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        addLog('No service worker registration found', 'error');
        return;
      }
      
      addLog('Service worker registration found', 'success');
      
      // Check if we have permission
      if (Notification.permission !== 'granted') {
        addLog('Notification permission not granted', 'error');
        return;
      }
      
      // Check subscription
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        addLog('No push subscription found', 'error');
        
        // Add diagnostic info about why subscription might not exist
        if (user && userInfo) {
          addLog(`User ID: ${user.id.substring(0, 8)}...`, 'info');
          addLog(`Notification preference: ${userInfo.notifications_enabled ? 'Enabled' : 'Disabled'}`, 'info');
          
          // Offer to create a subscription
          addLog('Attempting to create a subscription...', 'info');
          try {
            const newSubscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: vapidPublicKey
            });
            
            if (newSubscription) {
              addLog('Created new subscription successfully', 'success');
              addLog(`Endpoint: ${newSubscription.endpoint.slice(0, 30)}...`, 'info');
              
              // Update this subscription in the backend
              if (updatePushSubscription) {
                try {
                  await updatePushSubscription(newSubscription, true);
                  addLog('Saved subscription to backend', 'success');
                  
                  // Now try sending the notification again with the new subscription
                  if (navigator.serviceWorker.controller) {
                    navigator.serviceWorker.controller.postMessage({
                      type: 'MANUAL_NOTIFICATION',
                      notification: {
                        title: 'Test Notification (Auto-fixed)',
                        message: 'Created new subscription and sent test notification',
                        icon: '/icons/icon-192x192.png',
                        data: {
                          url: '/testpage',
                          timestamp: new Date().toISOString(),
                          testId: Math.random().toString(36).substring(7),
                          source: 'testpage-autofix'
                        }
                      }
                    });
                    addLog('Notification request sent with new subscription', 'success');
                    return;
                  }
                } catch (subError) {
                  addLog(`Error saving subscription: ${subError instanceof Error ? subError.message : String(subError)}`, 'error');
                }
              }
            }
          } catch (subError) {
            addLog(`Error creating subscription: ${subError instanceof Error ? subError.message : String(subError)}`, 'error');
            addLog('Please try disabling and re-enabling notifications', 'warning');
          }
        }
        
        return;
      }
      
      addLog('Active push subscription found', 'success');
      addLog(`Subscription endpoint: ${subscription.endpoint.slice(0, 30)}...`, 'info');
      
      // Verify this subscription exists in the backend for this user
      if (user && userInfo && userInfo.notifications) {
        const subscriptions = userInfo.notifications.subscriptions || [];
        const matchingSubscription = subscriptions.find(
          (sub: any) => sub.endpoint === subscription.endpoint
        );
        
        if (!matchingSubscription) {
          addLog('Warning: This subscription does not exist in the backend for this user', 'warning');
          addLog('This might be a subscription for a different user account', 'warning');
          addLog('Try disabling and re-enabling notifications', 'info');
          
          // Attempt to fix by registering this subscription for the current user
          try {
            if (updatePushSubscription) {
              await updatePushSubscription(subscription, true);
              addLog('Automatically registered subscription for current user', 'success');
            }
          } catch (regError) {
            addLog(`Error registering subscription: ${regError instanceof Error ? regError.message : String(regError)}`, 'error');
          }
        } else {
          addLog('Subscription verified in backend', 'success');
        }
      }
      
      // Manually trigger a notification via the service worker
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'MANUAL_NOTIFICATION',
          notification: {
            title: 'Test Notification',
            message: 'This is a test notification from the test page',
            icon: '/icons/icon-192x192.png',
            data: {
              url: '/testpage',
              timestamp: new Date().toISOString(),
              testId: Math.random().toString(36).substring(7),
              source: 'testpage'
            }
          }
        });
        addLog('Notification request sent to service worker', 'success');
      } else {
        addLog('Service worker not controlling this page', 'error');
      }
    } catch (error) {
      addLog(`Service worker notification error: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
  };
  
  // Function to generate test notification through the backend API
  const testBackendNotification = async () => {
    if (!user) {
      addLog('User not logged in', 'error');
      return;
    }
    
    addLog('Sending test notification request to backend...', 'info');
    
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          message: 'Test notification from API at ' + new Date().toLocaleTimeString(),
          testId: Math.random().toString(36).substring(7)
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      addLog(`Backend notification response: ${data.message || 'Success'}`, 'success');
    } catch (error) {
      addLog(`Backend notification error: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
  };
  
  // Function to test the simpler notification API
  const testSimpleNotification = async () => {
    if (!user) {
      addLog('User not logged in', 'error');
      return;
    }
    
    addLog('Sending simple notification request...', 'info');
    
    // First check if we have the necessary prerequisites
    try {
      // Check if we have permission
      if (Notification.permission !== 'granted') {
        addLog('Notification permission not granted', 'error');
        addLog('Please enable notification permissions in your browser', 'warning');
        return;
      }
      
      // Check if service worker is registered
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        addLog('No service worker registration found', 'error');
        return;
      }
      
      // Check subscription
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        addLog('No push subscription found', 'error');
        addLog('Try disabling and re-enabling notifications', 'warning');
        return;
      }
      
      // Verify if this subscription is registered for the current user
      if (userInfo?.notifications) {
        const subscriptions = userInfo.notifications.subscriptions || [];
        const matchingSubscription = subscriptions.find(
          (sub: any) => sub.endpoint === subscription.endpoint
        );
        
        if (!matchingSubscription) {
          addLog('Warning: Subscription not found for current user', 'warning');
          
          // Try to fix by registering the subscription
          addLog('Attempting to register subscription for current user...', 'info');
          try {
            await updatePushSubscription(subscription, true);
            addLog('Successfully registered subscription', 'success');
          } catch (subError) {
            addLog(`Error registering subscription: ${subError instanceof Error ? subError.message : String(subError)}`, 'error');
            addLog('Continuing with notification test anyway...', 'info');
          }
        } else {
          addLog('Subscription verified for current user', 'success');
        }
      }
    } catch (checkError) {
      addLog(`Error checking prerequisites: ${checkError instanceof Error ? checkError.message : String(checkError)}`, 'error');
      // Continue with the test anyway, as the backend will report what's wrong
    }
    
    // Proceed with the notification test
    try {
      const response = await fetch('/api/notifications/send-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          message: 'Simple notification test at ' + new Date().toLocaleTimeString(),
          testId: Math.random().toString(36).substring(7)
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      addLog(`Simple notification response: ${data.message || 'Success'}`, 'success');
      
      if (data.successCount === 0 && data.totalSubscriptions > 0) {
        addLog(`Warning: Sent to 0 of ${data.totalSubscriptions} devices`, 'warning');
        addLog('This may indicate a problem with the push subscription', 'warning');
        addLog('Try disabling and re-enabling notifications', 'info');
      } else if (data.successCount === 0 && data.totalSubscriptions === 0) {
        addLog('No subscriptions found for your account', 'error');
        addLog('Try disabling and re-enabling notifications', 'warning');
      } else {
        addLog(`Sent to ${data.successCount} of ${data.totalSubscriptions} devices`, 
          data.successCount > 0 ? 'success' : 'warning');
      }
    } catch (error) {
      addLog(`Simple notification error: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
  };
  
  // Function to inspect service worker state
  const inspectServiceWorker = async () => {
    addLog('Inspecting service worker state...', 'info');
    
    try {
      if (!('serviceWorker' in navigator)) {
        addLog('Service Worker not supported in this browser', 'error');
        return;
      }
      
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        addLog('No service worker registration found', 'error');
        return;
      }
      
      addLog(`Service worker state: ${registration.active ? 'Active' : registration.installing ? 'Installing' : registration.waiting ? 'Waiting' : 'Unknown'}`, 'success');
      
      // Check subscription
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        addLog('Push subscription found', 'success');
        addLog(`Endpoint: ${subscription.endpoint.slice(0, 30)}...`, 'info');
        
        const expirationTime = subscription.expirationTime;
        if (expirationTime) {
          const expDate = new Date(expirationTime);
          addLog(`Subscription expires: ${expDate.toLocaleString()}`, 'info');
        } else {
          addLog('Subscription has no expiration time', 'info');
        }
      } else {
        addLog('No push subscription found', 'warning');
      }
      
      // Check if controller is active
      if (navigator.serviceWorker.controller) {
        addLog('Service worker is controlling this page', 'success');
      } else {
        addLog('Service worker is not controlling this page', 'warning');
      }
    } catch (error) {
      addLog(`Service worker inspection error: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">IndexedDB Raw Data Explorer</h1>
      
      {/* Account Section */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-3 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
          Account
        </div>
        
        {user ? (
          <SettingsItem
            icon={LogOut}
            title="Sign Out"
            description="Sign out of your account"
            onClick={() => signOut()}
            destructive
          />
        ) : (
          <SettingsItem
            icon={LogIn}
            title="Sign In"
            description="Sign in to your account"
            onClick={() => setShowLoginDialog(true)}
          />
        )}
      </div>
      
      {/* Login Dialog */}
      {showLoginDialog && (
        <LoginDialog 
          isOpen={showLoginDialog} 
          onOpenChange={setShowLoginDialog} 
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      
      <div className="flex flex-wrap mb-4 space-x-2 items-center">
        <button 
          onClick={fetchIndexedDBContent}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-2"
          disabled={!dbInitialized}
        >
          Refresh Raw IndexedDB
        </button>
        <button 
          onClick={fetchRawApiResponse}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mb-2"
          disabled={apiLoading || !user?.id}
        >
          {apiLoading ? 'Loading...' : 'Fetch Raw API Response'}
        </button>
        <button 
          onClick={saveRawApiToIndexedDB}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 mb-2"
          disabled={saveLoading || !rawApiResponse || !dbInitialized}
        >
          {saveLoading ? 'Saving...' : 'Save API Data to IndexedDB'}
        </button>
        {user && (
          <button 
            onClick={() => console.log('Current User:', user)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 mb-2"
          >
            Log Current User
          </button>
        )}
        
        {/* Add the language changer component */}
        <div className="mb-2 ml-4">
          <div className="flex items-center">
            <span className="mr-2">Language:</span>
            <LanguageChanger variant="settings" />
          </div>
        </div>
      </div>
      
      {/* Notification Preferences Section */}
      {user && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-3 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
            <div className="flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              Notification Preferences
            </div>
          </div>
          <div className="p-4">
            <div className="mb-4">
              <NotificationPreference showDebug={true} />
            </div>
            
          </div>
        </div>
      )}
      
      {/* Mock usernames with Follow buttons */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-3 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
          Mock Usernames - Follow Testing
        </div>
        <div className="p-4 space-y-4">
          {MOCK_USERNAMES.map(username => (
            <div key={username} className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-300">
                  {username[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-medium">@{username}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Test account
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <FollowButton 
                  username={username} 
                  showIcon 
                />
              </div>
            </div>
          ))}
          
        </div>
      </div>
      
      {/* Add UserLocation component for testing */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">User Location</h2>
        <UserLocation />
      </div>
      
      {/* User Metadata Fields Section */}
      {userInfo && user && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-3 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
            User Profile Data
          </div>
          <div className="p-4">
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic User Info */}
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                <h3 className="font-medium mb-2">Basic Information</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-semibold">User ID:</span> <span className="font-mono text-xs break-all">{userInfo.id}</span></div>
                  <div><span className="font-semibold">Email:</span> {userInfo.email}</div>
                  <div><span className="font-semibold">Role:</span> {user?.role || 'Not set'}</div>
                  <div><span className="font-semibold">Created:</span> {new Date(userInfo.created_at).toLocaleString()}</div>
                  <div><span className="font-semibold">Last Sign In:</span> {userInfo.last_sign_in_at ? new Date(userInfo.last_sign_in_at).toLocaleString() : 'Never'}</div>
                </div>
              </div>
              
              {/* User Preferences */}
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                <h3 className="font-medium mb-2">User Preferences</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-semibold">Language:</span> {userInfo.language}</div>
                  <div><span className="font-semibold">Notifications:</span> {userInfo.notifications_enabled ? 'Enabled' : 'Disabled'}</div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium mb-2">Update Preferences</h4>
                  <div className="space-y-2">
                    <button
                      onClick={async () => {
                        if (user?.id) {
                          try {
                            // Toggle notifications
                            const newValue = !userInfo.notifications_enabled;
                            await indexedDB.put('user_notifications', {
                              user_id: user.id,
                              notifications_enabled: newValue
                            });
                            alert(`Notifications ${newValue ? 'enabled' : 'disabled'}`);
                            
                            // View the record
                            const record = await indexedDB.get('user_notifications', user.id);
                            setStoreRecords([record]);
                            setSelectedStore('user_notifications');
                          } catch (err) {
                            console.error('Error toggling notifications:', err);
                          }
                        }
                      }}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
                    >
                      Toggle Notifications
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tenant Requests */}
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
              <h3 className="font-medium mb-2">Tenant Requests</h3>
              {userInfo.tenantRequests && userInfo.tenantRequests.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr>
                        <th className="px-2 py-1 text-left">Type</th>
                        <th className="px-2 py-1 text-left">Username</th>
                        <th className="px-2 py-1 text-left">Status</th>
                        <th className="px-2 py-1 text-left">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userInfo.tenantRequests.map((request, index) => (
                        <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
                          <td className="px-2 py-1">{request.type}</td>
                          <td className="px-2 py-1">{request.username}</td>
                          <td className="px-2 py-1">{request.status}</td>
                          <td className="px-2 py-1">{request.created_at ? new Date(request.created_at).toLocaleString() : 'Unknown'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No tenant requests</p>
              )}
            </div>
            
            {/* User Actions */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={async () => {
                  if (!user?.id) return;
                  
                  try {
                    const allUserData = await Promise.all(STORE_NAMES.map(async store => {
                      // For stores that use user_id as key
                      if (['users', 'user_language', 'user_notifications', 'user_location'].includes(store)) {
                        const record = await indexedDB.get(store, user.id);
                        return { store, data: record ? [record] : [] };
                      }
                      // For stores that have a by-user index
                      else if (['tenant_requests', 'push_subscriptions', 'user_channel_follow', 'user_channel_last_viewed'].includes(store)) {
                        const records = await indexedDB.getAllFromIndex(store, 'by-user', user.id).catch(() => []);
                        return { store, data: records || [] };
                      }
                      return { store, data: [] };
                    }));
                    
                    // Filter out empty stores
                    const userData = allUserData.filter(item => item.data.length > 0);
                    
                    console.log('All user-related data:', userData);
                    
                    // Create a formatted display object
                    const formattedData = userData.reduce((acc, { store, data }) => {
                      acc[store] = data;
                      return acc;
                    }, {} as Record<string, any>);
                    
                    alert(`User data in IndexedDB: ${JSON.stringify(formattedData, null, 2)}`);
                  } catch (err) {
                    console.error('Error fetching all user data:', err);
                  }
                }}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
              >
                View All User Data
              </button>
              
              <button
                onClick={async () => {
                  if (!user?.id) return;
                  
                  try {
                    // Get metadata from auth.users
                    const userData = await indexedDB.get('users', user.id);
                    console.log('User metadata:', userData);
                    setStoreRecords([userData]);
                    setSelectedStore('users');
                  } catch (err) {
                    console.error('Error fetching user metadata:', err);
                  }
                }}
                className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm"
              >
                View User Record
              </button>
              
              <button
                onClick={async () => {
                  if (!user?.id) return;
                  
                  try {
                    await indexedDB.put('user_notifications', {
                      user_id: user.id,
                      notifications_enabled: Math.random() > 0.5
                    });
                    await indexedDB.setUserLanguage(user.id, Math.random() > 0.5 ? 'english' : 'hindi');
                    
                    alert('Randomized user preferences');
                    // Refresh user data
                    window.location.reload();
                  } catch (err) {
                    console.error('Error updating user preferences:', err);
                  }
                }}
                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
              >
                Randomize Preferences
              </button>
            </div>
          </div>
        </div>
      )}
      
      {!dbInitialized && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-3 rounded mb-4">
          Initializing IndexedDB... Please wait.
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Store List */}
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">IndexedDB Stores</h2>
          <div className="space-y-2">
            {STORE_NAMES.map(store => (
              <button
                key={store}
                onClick={() => fetchStoreRecords(store)}
                className={`block w-full text-left px-3 py-2 rounded ${
                  selectedStore === store ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-200'
                }`}
                disabled={!dbInitialized}
              >
                {store}
              </button>
            ))}
          </div>
        </div>
        
        {/* Raw Store Records */}
        <div className="md:col-span-2 bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">
            {selectedStore ? `Raw Records in "${selectedStore}"` : 'Select a store to view records'}
          </h2>
          <div className="bg-white p-3 rounded overflow-auto max-h-[60vh]">
            {!dbInitialized ? (
              <p>Initializing IndexedDB...</p>
            ) : recordsLoading ? (
              <p>Loading records...</p>
            ) : storeRecords.length > 0 ? (
                <pre className="whitespace-pre-wrap">{JSON.stringify(storeRecords, null, 2)}</pre>
              ) : (
                <p>No records found in this store</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Add Web Push Notification Testing Section */}
      <div className="mt-6 border p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Bell className="h-5 w-5 mr-2 text-blue-500" />
          Web Push Notification Testing
        </h2>
        
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={testRequestPermission}
              className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm flex items-center"
            >
              <Bell className="h-3.5 w-3.5 mr-1" /> Request Permission
            </button>
            
            <button 
              onClick={() => testToggleNotifications(true)}
              className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded text-sm flex items-center"
              disabled={permissionStatus !== 'granted'}
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1" /> Enable Notifications
            </button>
            
            <button 
              onClick={() => testToggleNotifications(false)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded text-sm flex items-center"
            >
              <XCircle className="h-3.5 w-3.5 mr-1" /> Disable Notifications
            </button>
            
            <button 
              onClick={testServiceWorkerNotification}
              className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm flex items-center"
              disabled={!notificationsEnabled}
            >
              <Smartphone className="h-3.5 w-3.5 mr-1" /> Test SW Notification
            </button>
            
            <button 
              onClick={testBackendNotification}
              className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded text-sm flex items-center"
              disabled={!notificationsEnabled || !user}
            >
              <DownloadCloud className="h-3.5 w-3.5 mr-1" /> Test API Notification
            </button>
            
            <button 
              onClick={testSimpleNotification}
              className="px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded text-sm flex items-center"
              disabled={!user}
            >
              <Bell className="h-3.5 w-3.5 mr-1" /> Simple Test
            </button>
            
            <button 
              onClick={inspectServiceWorker}
              className="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm flex items-center"
            >
              <AlertTriangle className="h-3.5 w-3.5 mr-1" /> Inspect Service Worker
            </button>
            
            <button 
              onClick={clearLogs}
              className="px-3 py-1.5 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded text-sm flex items-center"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" /> Clear Logs
            </button>
          </div>
          
          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md h-64 overflow-y-auto text-xs font-mono">
            {logs.length === 0 ? (
              <div className="text-gray-500 text-center py-4">No logs yet. Test notification features to see logs.</div>
            ) : (
              <div className="space-y-1">
                {logs.map((log, i) => (
                  <div key={i} className={`${
                    log.type === 'success' ? 'text-green-600 dark:text-green-400' :
                    log.type === 'error' ? 'text-red-600 dark:text-red-400' :
                    log.type === 'warning' ? 'text-amber-600 dark:text-amber-400' :
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    [{log.timestamp}] {log.message}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400 p-2 bg-gray-100 dark:bg-gray-800 rounded">
            <p>
              <span className="font-semibold">Current Status:</span>{' '}
              Permission: {permissionStatus},{' '}
              Enabled: {notificationsEnabled ? 'Yes' : 'No'},{' '}
              Account Pref: {accountPreference === null ? 'Not set' : accountPreference ? 'Enabled' : 'Disabled'},{' '}
              Active Sub: {hasActiveSubscription ? 'Yes' : 'No'}
            </p>
          </div>
        </div>
      </div>
      
      {/* End of Web Push Notification Testing Section */}
      
    </div>
  );
}

