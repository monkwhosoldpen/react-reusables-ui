'use client';

import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '~/components/ui/text';
import { useColorScheme, type ThemeName } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/contexts/AuthContext';
import { indexedDB } from '@/lib/services/indexedDB';
import { StoreNames } from 'idb';
import { NchatDB } from '@/lib/services/indexedDBSchema';
import LanguageChanger from '@/components/common/LanguageChanger';
import { UserLocation } from '@/components/common/UserLocation';
import { FollowButton } from '@/components/common/FollowButton';
import { LogIn, LogOut, ChevronRight, Bell, RefreshCw, Save, Database, CheckCircle, XCircle, DownloadCloud, AlertTriangle, Smartphone, Home, Users, Settings, Activity, PanelLeft, Menu, X } from 'lucide-react-native';
import { useNotification } from '@/lib/contexts/NotificationContext';
import { LoginDialog } from '~/components/common/LoginDialog';
import { NotificationPreference } from '~/components/common/NotificationPreference';
import { Button } from '~/components/ui/button';
import { config } from '@/lib/config';

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
  const { colorScheme, themeName, updateTheme, isDarkMode, toggleDarkMode } = useColorScheme();
  const { design, updateDesign } = useDesign();
  const insets = useSafeAreaInsets();
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
      
      const response = await fetch(`${config.api.endpoints.myinfo}?userId=${user.id}`, {
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

  // Apply design system tokens
  const sectionStyle = {
    ...styles.section,
    backgroundColor: colorScheme.colors.card,
    padding: Number(design.spacing.padding.card),
    borderRadius: Number(design.radius.lg),
  };

  const cardStyle = {
    backgroundColor: colorScheme.colors.background,
    padding: Number(design.spacing.padding.item),
    borderRadius: Number(design.radius.md),
  };

  const titleStyle = {
    color: colorScheme.colors.primary,
    fontSize: Number(design.spacing.fontSize.sm),
    marginBottom: Number(design.spacing.margin.card),
  };

  const textStyle = {
    color: colorScheme.colors.text,
    fontSize: Number(design.spacing.fontSize.base),
  };

  const labelStyle = {
    color: colorScheme.colors.text,
    fontSize: Number(design.spacing.fontSize.sm),
    opacity: 0.7,
  };

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
      const response = await fetch(`${config.api.endpoints.notifications.test}`, {
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
      const response = await fetch(`${config.api.endpoints.notifications.sendTest}`, {
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
    <ScrollView 
      style={[styles.container, { backgroundColor: colorScheme.colors.background }]}
      contentContainerStyle={{
        paddingBottom: insets.bottom + Number(design.spacing.padding.card),
        paddingTop: Number(design.spacing.padding.card)
      }}
    >
      <View style={sectionStyle}>
        <Text style={titleStyle} className="font-medium uppercase">
          IndexedDB Raw Data Explorer
        </Text>
        
        {/* Account Section */}
        <View style={cardStyle}>
          <Text style={labelStyle} className="font-medium uppercase mb-2">
            Account
          </Text>
          
          {user ? (
            <View style={{ gap: Number(design.spacing.gap) }}>
              <View style={cardStyle}>
                <Text style={labelStyle} className="mb-1">
                  Signed in as
                </Text>
                <Text style={textStyle} className="font-medium">
                  {user.email || 'Guest'}
                </Text>
              </View>
              
              <Button 
                variant="destructive" 
                onPress={signOut}
                className="w-full"
                style={{ borderRadius: Number(design.radius.md) }}
              >
                <Text className="font-medium">Sign Out</Text>
              </Button>
            </View>
          ) : (
            <View>
              <Text style={labelStyle} className="mb-4">
                Sign in to sync your preferences and access all features
              </Text>
              <Button 
                onPress={() => setShowLoginDialog(true)}
                style={{ 
                  backgroundColor: colorScheme.colors.primary,
                  borderRadius: Number(design.radius.md)
                }}
                className="w-full"
              >
                <Text className="font-medium text-white">Sign In</Text>
              </Button>
            </View>
          )}
        </View>

        {/* Notification Preferences Section */}
        {user && (
          <View style={cardStyle}>
            <Text style={labelStyle} className="font-medium uppercase mb-2">
              Notification Preferences
            </Text>
            <View style={{ gap: Number(design.spacing.gap) }}>
              <NotificationPreference showDebug={true} />
            </View>
          </View>
        )}

        {/* Mock Usernames Section */}
        <View style={cardStyle}>
          <Text style={labelStyle} className="font-medium uppercase mb-2">
            Mock Usernames - Follow Testing
          </Text>
          <View style={{ gap: Number(design.spacing.gap) }}>
            {MOCK_USERNAMES.map(username => (
              <View key={username} style={[cardStyle, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Number(design.spacing.gap) }}>
                  <View style={{ 
                    width: Number(design.spacing.iconSize), 
                    height: Number(design.spacing.iconSize), 
                    backgroundColor: colorScheme.colors.card,
                    borderRadius: Number(design.radius.full),
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <Text style={{ color: colorScheme.colors.text }}>{username[0].toUpperCase()}</Text>
                  </View>
                  <View>
                    <Text style={textStyle} className="font-medium">@{username}</Text>
                    <Text style={labelStyle}>Test account</Text>
                  </View>
                </View>
                <FollowButton username={username} showIcon />
              </View>
            ))}
          </View>
        </View>

        {/* User Location Section */}
        <View style={cardStyle}>
          <Text style={labelStyle} className="font-medium uppercase mb-2">
            User Location
          </Text>
          <UserLocation />
        </View>

        {/* IndexedDB Stores Section */}
        <View style={cardStyle}>
          <Text style={labelStyle} className="font-medium uppercase mb-2">
            IndexedDB Stores
          </Text>
          <View style={{ gap: Number(design.spacing.gap) }}>
            {STORE_NAMES.map(store => (
              <Button
                key={store}
                onPress={() => fetchStoreRecords(store)}
                style={{ 
                  backgroundColor: selectedStore === store ? colorScheme.colors.primary : colorScheme.colors.card,
                  borderRadius: Number(design.radius.md)
                }}
                className="w-full"
                disabled={!dbInitialized}
              >
                <Text style={{ color: selectedStore === store ? 'white' : colorScheme.colors.text }}>{store}</Text>
              </Button>
            ))}
          </View>
        </View>

        {/* Raw Store Records Section */}
        <View style={cardStyle}>
          <Text style={labelStyle} className="font-medium uppercase mb-2">
            {selectedStore ? `Raw Records in "${selectedStore}"` : 'Select a store to view records'}
          </Text>
          <View style={[cardStyle, { maxHeight: 300 }]}>
            {!dbInitialized ? (
              <Text style={textStyle}>Initializing IndexedDB...</Text>
            ) : recordsLoading ? (
              <Text style={textStyle}>Loading records...</Text>
            ) : storeRecords.length > 0 ? (
              <Text style={textStyle}>{JSON.stringify(storeRecords, null, 2)}</Text>
            ) : (
              <Text style={textStyle}>No records found in this store</Text>
            )}
          </View>
        </View>

        {/* Web Push Notification Testing Section */}
        <View style={cardStyle}>
          <Text style={labelStyle} className="font-medium uppercase mb-2">
            Web Push Notification Testing
          </Text>
          <View style={{ gap: Number(design.spacing.gap) }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Number(design.spacing.gap) }}>
              <Button 
                onPress={testRequestPermission}
                style={{ 
                  backgroundColor: colorScheme.colors.primary,
                  borderRadius: Number(design.radius.md)
                }}
              >
                <Bell size={Number(design.spacing.iconSize)} color="white" />
                <Text style={{ color: 'white', marginLeft: Number(design.spacing.gap) }}>Request Permission</Text>
              </Button>
              {/* Add other notification testing buttons similarly */}
            </View>

            <View style={[cardStyle, { maxHeight: 200 }]}>
              {logs.length === 0 ? (
                <Text style={textStyle} className="text-center py-4">No logs yet. Test notification features to see logs.</Text>
              ) : (
                <View style={{ gap: Number(design.spacing.gap) }}>
                  {logs.map((log, i) => (
                    <Text 
                      key={i} 
                      style={[
                        textStyle,
                        log.type === 'success' ? { color: colorScheme.colors.primary } :
                        log.type === 'error' ? { color: colorScheme.colors.notification } :
                        log.type === 'warning' ? { color: colorScheme.colors.primary } :
                        { color: colorScheme.colors.text }
                      ]}
                    >
                      [{log.timestamp}] {log.message}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
});

