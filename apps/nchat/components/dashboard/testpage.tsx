'use client';

import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
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
import { Button } from '~/components/ui/button';
import { config } from '@/lib/config';
import { useRouter } from 'expo-router';

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

// Mock usernames for testing follow functionality
const MOCK_USERNAMES = ['elonmusk', 'testusername'];

// SettingsItem component for React Native
const SettingsItem = ({
  icon: Icon,
  title,
  description,
  onPress,
  destructive
}: {
  icon: any,
  title: string,
  description?: string,
  onPress?: () => void,
  destructive?: boolean
}) => {
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.settingsItem,
        {
          backgroundColor: colorScheme.colors.card,
          borderBottomColor: colorScheme.colors.border,
        }
      ]}
    >
      <View style={styles.settingsItemContent}>
        <Icon 
          size={Number(design.spacing.iconSize)} 
          color={destructive ? colorScheme.colors.notification : colorScheme.colors.text} 
        />
        <View style={styles.settingsItemText}>
          <Text style={[
            styles.settingsItemTitle,
            { color: destructive ? colorScheme.colors.notification : colorScheme.colors.text }
          ]}>
            {title}
          </Text>
          {description && (
            <Text style={[styles.settingsItemDescription, { color: colorScheme.colors.text }]}>
              {description}
            </Text>
          )}
        </View>
      </View>
      <ChevronRight size={Number(design.spacing.iconSize)} color={colorScheme.colors.text} />
    </TouchableOpacity>
  );
};

export default function TestPage() {
  const { user, userInfo, loading: userLoading, signOut } = useAuth();
  const { colorScheme, isDarkMode } = useColorScheme();
  const { design } = useDesign();
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
  const initializationStarted = useRef(false);
  const [logs, setLogs] = useState<Array<{timestamp: string, message: string, type: 'info' | 'success' | 'error' | 'warning'}>>([]);
  const router = useRouter();

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

  // Add logging function
  const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const timestamp = new Date().toISOString().slice(11, 19); // HH:MM:SS format
    setLogs(prev => [{timestamp, message, type}, ...prev].slice(0, 100)); // Keep last 100 logs
    console.log(`[${timestamp}][${type.toUpperCase()}] ${message}`);
  };

  // Log when user info changes
  useEffect(() => {
    if (userInfo) {
      addLog(`User info loaded: ${userInfo.id.slice(0, 8)}...`, 'success');
      if (userInfo.notifications) {
        addLog(`User has ${userInfo.notifications?.subscriptions?.length || 0} push subscription(s)`, 'info');
      }
    }
  }, [userInfo]);
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colorScheme.colors.background }]}
      contentContainerStyle={{
        paddingBottom: insets.bottom + Number(design.spacing.padding.card),
        paddingTop: Number(design.spacing.padding.card)
      }}
    >
      <View style={[styles.section, { backgroundColor: colorScheme.colors.card }]}>
        <Text style={[styles.title, { color: colorScheme.colors.primary }]}>
          IndexedDB Raw Data Explorer
        </Text>
        
        {/* Account Section */}
        <View style={[styles.card, { backgroundColor: colorScheme.colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colorScheme.colors.text }]}>
            Account
          </Text>
          
          {user ? (
            <SettingsItem
              icon={LogOut}
              title="Sign Out"
              description="Sign out of your account"
              onPress={signOut}
              destructive
            />
          ) : (
            <SettingsItem
              icon={LogIn}
              title="Sign In"
              description="Sign in to your account"
              onPress={() => router.push('/login')}
            />
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <Button 
            onPress={fetchIndexedDBContent}
            disabled={!dbInitialized}
            style={[styles.actionButton, { backgroundColor: colorScheme.colors.primary }]}
          >
            <Text style={[styles.buttonText, { color: colorScheme.colors.background }]}>Refresh Raw IndexedDB</Text>
          </Button>
          
          <Button 
            onPress={fetchRawApiResponse}
            disabled={apiLoading || !user?.id}
            style={[styles.actionButton, { backgroundColor: colorScheme.colors.primary }]}
          >
            <Text style={[styles.buttonText, { color: colorScheme.colors.background }]}>
              {apiLoading ? 'Loading...' : 'Fetch Raw API Response'}
            </Text>
          </Button>
          
          <Button 
            onPress={saveRawApiToIndexedDB}
            disabled={saveLoading || !rawApiResponse || !dbInitialized}
            style={[styles.actionButton, { backgroundColor: colorScheme.colors.primary }]}
          >
            <Text style={[styles.buttonText, { color: colorScheme.colors.background }]}>
              {saveLoading ? 'Saving...' : 'Save API Data to IndexedDB'}
            </Text>
          </Button>
          
          {user && (
            <Button 
              onPress={() => console.log('Current User:', user)}
              style={[styles.actionButton, { backgroundColor: colorScheme.colors.primary }]}
            >
              <Text style={[styles.buttonText, { color: colorScheme.colors.background }]}>Log Current User</Text>
            </Button>
          )}
          
          {/* Language Changer */}
          <View style={styles.languageChanger}>
            <Text style={[styles.label, { color: colorScheme.colors.text }]}>Language:</Text>
            <LanguageChanger variant="settings" />
          </View>
        </View>

        {/* Mock Usernames Section */}
        <View style={[styles.card, { backgroundColor: colorScheme.colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colorScheme.colors.text }]}>
            Mock Usernames - Follow Testing
          </Text>
          <View style={styles.mockUsersList}>
            {MOCK_USERNAMES.map(username => (
              <View 
                key={username} 
                style={[styles.mockUserItem, { 
                  borderColor: colorScheme.colors.border,
                  backgroundColor: colorScheme.colors.card 
                }]}
              >
                <View style={styles.mockUserInfo}>
                  <View style={[styles.avatar, { backgroundColor: colorScheme.colors.primary }]}>
                    <Text style={{ color: colorScheme.colors.background }}>
                      {username[0].toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={[styles.username, { color: colorScheme.colors.text }]}>
                      @{username}
                    </Text>
                    <Text style={[styles.userType, { color: colorScheme.colors.text }]}>
                      Test account
                    </Text>
                  </View>
                </View>
                <FollowButton username={username} showIcon />
              </View>
            ))}
          </View>
        </View>

        {/* User Location Section */}
        <View style={[styles.card, { backgroundColor: colorScheme.colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colorScheme.colors.text }]}>
            User Location
          </Text>
          <UserLocation />
        </View>

        {/* User Profile Data Section */}
        {userInfo && user && (
          <View style={[styles.card, { backgroundColor: colorScheme.colors.background }]}>
            <Text style={[styles.sectionTitle, { color: colorScheme.colors.text }]}>
              User Profile Data
            </Text>
            
            <View style={styles.profileGrid}>
              {/* Basic User Info */}
              <View style={[styles.profileCard, { backgroundColor: colorScheme.colors.card }]}>
                <Text style={[styles.profileCardTitle, { color: colorScheme.colors.text }]}>
                  Basic Information
                </Text>
                <View style={styles.profileInfo}>
                  <Text style={[styles.profileLabel, { color: colorScheme.colors.text }]}>
                    User ID:
                  </Text>
                  <Text style={[styles.profileValue, { color: colorScheme.colors.text }]}>
                    {userInfo.id}
                  </Text>
                  
                  <Text style={[styles.profileLabel, { color: colorScheme.colors.text }]}>
                    Email:
                  </Text>
                  <Text style={[styles.profileValue, { color: colorScheme.colors.text }]}>
                    {userInfo.email}
                  </Text>
                  
                  <Text style={[styles.profileLabel, { color: colorScheme.colors.text }]}>
                    Role:
                  </Text>
                  <Text style={[styles.profileValue, { color: colorScheme.colors.text }]}>
                    {user?.role || 'Not set'}
                  </Text>
                  
                  <Text style={[styles.profileLabel, { color: colorScheme.colors.text }]}>
                    Created:
                  </Text>
                  <Text style={[styles.profileValue, { color: colorScheme.colors.text }]}>
                    {new Date(userInfo.created_at).toLocaleString()}
                  </Text>
                  
                  <Text style={[styles.profileLabel, { color: colorScheme.colors.text }]}>
                    Last Sign In:
                  </Text>
                  <Text style={[styles.profileValue, { color: colorScheme.colors.text }]}>
                    {userInfo.last_sign_in_at ? new Date(userInfo.last_sign_in_at).toLocaleString() : 'Never'}
                  </Text>
                </View>
              </View>
              
              {/* User Preferences */}
              <View style={[styles.profileCard, { backgroundColor: colorScheme.colors.card }]}>
                <Text style={[styles.profileCardTitle, { color: colorScheme.colors.text }]}>
                  User Preferences
                </Text>
                <View style={styles.profileInfo}>
                  <Text style={[styles.profileLabel, { color: colorScheme.colors.text }]}>
                    Language:
                  </Text>
                  <Text style={[styles.profileValue, { color: colorScheme.colors.text }]}>
                    {userInfo.language}
                  </Text>
                  
                  <Text style={[styles.profileLabel, { color: colorScheme.colors.text }]}>
                    Notifications:
                  </Text>
                  <Text style={[styles.profileValue, { color: colorScheme.colors.text }]}>
                    {userInfo.notifications_enabled ? 'Enabled' : 'Disabled'}
                  </Text>
                </View>
                
                <View style={[styles.preferencesActions, { borderTopColor: colorScheme.colors.border }]}>
                  <Text style={[styles.preferencesTitle, { color: colorScheme.colors.text }]}>
                    Update Preferences
                  </Text>
                  <Button
                    onPress={async () => {
                      if (user?.id) {
                        try {
                          const newValue = !userInfo.notifications_enabled;
                          await indexedDB.put('user_notifications', {
                            user_id: user.id,
                            notifications_enabled: newValue
                          });
                          alert(`Notifications ${newValue ? 'enabled' : 'disabled'}`);
                          
                          const record = await indexedDB.get('user_notifications', user.id);
                          setStoreRecords([record]);
                          setSelectedStore('user_notifications');
                        } catch (err) {
                          console.error('Error toggling notifications:', err);
                        }
                      }
                    }}
                    style={[styles.preferenceButton, { backgroundColor: colorScheme.colors.primary }]}
                  >
                    <Text style={[styles.buttonText, { color: colorScheme.colors.background }]}>Toggle Notifications</Text>
                  </Button>
                </View>
              </View>
            </View>
            
            {/* Tenant Requests */}
            <View style={[styles.tenantRequests, { backgroundColor: colorScheme.colors.card }]}>
              <Text style={[styles.tenantRequestsTitle, { color: colorScheme.colors.text }]}>
                Tenant Requests
              </Text>
              {userInfo.tenantRequests && userInfo.tenantRequests.length > 0 ? (
                <View style={styles.tenantRequestsTable}>
                  <View style={[styles.tableHeader, { borderBottomColor: colorScheme.colors.border }]}>
                    <Text style={[styles.tableHeaderText, { color: colorScheme.colors.text }]}>Type</Text>
                    <Text style={[styles.tableHeaderText, { color: colorScheme.colors.text }]}>Username</Text>
                    <Text style={[styles.tableHeaderText, { color: colorScheme.colors.text }]}>Status</Text>
                    <Text style={[styles.tableHeaderText, { color: colorScheme.colors.text }]}>Created</Text>
                  </View>
                  {userInfo.tenantRequests.map((request, index) => (
                    <View 
                      key={index} 
                      style={[styles.tableRow, { borderTopColor: colorScheme.colors.border }]}
                    >
                      <Text style={[styles.tableCell, { color: colorScheme.colors.text }]}>{request.type}</Text>
                      <Text style={[styles.tableCell, { color: colorScheme.colors.text }]}>{request.username}</Text>
                      <Text style={[styles.tableCell, { color: colorScheme.colors.text }]}>{request.status}</Text>
                      <Text style={[styles.tableCell, { color: colorScheme.colors.text }]}>
                        {request.created_at ? new Date(request.created_at).toLocaleString() : 'Unknown'}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={[styles.noRequests, { color: colorScheme.colors.text }]}>
                  No tenant requests
                </Text>
              )}
            </View>
          </View>
        )}
        
        <View style={[styles.card, { backgroundColor: colorScheme.colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colorScheme.colors.text }]}>
            IndexedDB Stores
          </Text>
          <View style={styles.storeList}>
            {STORE_NAMES.map(store => (
              <Button
                key={store}
                onPress={() => fetchStoreRecords(store)}
                style={[
                  styles.storeButton,
                  { backgroundColor: colorScheme.colors.primary },
                  selectedStore === store && { backgroundColor: colorScheme.colors.primary }
                ]}
                disabled={!dbInitialized}
              >
                <Text 
                  style={[
                    styles.storeButtonText,
                    { color: colorScheme.colors.background }
                  ]}
                >
                  {store}
                </Text>
              </Button>
            ))}
          </View>
        </View>
        
        <View style={[styles.card, { backgroundColor: colorScheme.colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colorScheme.colors.text }]}>
            {selectedStore ? `Raw Records in "${selectedStore}"` : 'Select a store to view records'}
          </Text>
          <View style={[styles.recordsContainer, { backgroundColor: colorScheme.colors.card }]}>
            {!dbInitialized ? (
              <Text style={[styles.recordsText, { color: colorScheme.colors.text }]}>
                Initializing IndexedDB...
              </Text>
            ) : recordsLoading ? (
              <Text style={[styles.recordsText, { color: colorScheme.colors.text }]}>
                Loading records...
              </Text>
            ) : storeRecords.length > 0 ? (
              <Text style={[styles.recordsText, { color: colorScheme.colors.text }]}>
                {storeRecords.length} Records found in this store
              </Text>
            ) : (
              <Text style={[styles.recordsText, { color: colorScheme.colors.text }]}>
                No records found in this store
              </Text>
            )}
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
    padding: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  actionButton: {
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
  },
  languageChanger: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  label: {
    marginRight: 8,
  },
  notificationContent: {
    marginTop: 8,
  },
  mockUsersList: {
    gap: 8,
  },
  mockUserItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  mockUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontWeight: '500',
  },
  userType: {
    fontSize: 12,
    opacity: 0.7,
  },
  profileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  profileCard: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    borderRadius: 8,
  },
  profileCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  profileInfo: {
    gap: 4,
  },
  profileLabel: {
    fontWeight: '500',
    fontSize: 12,
  },
  profileValue: {
    fontSize: 12,
    marginBottom: 4,
  },
  preferencesActions: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  preferencesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  preferenceButton: {
    padding: 8,
    borderRadius: 4,
  },
  tenantRequests: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  tenantRequestsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  tenantRequestsTable: {
    gap: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableHeaderText: {
    flex: 1,
    fontWeight: '600',
    fontSize: 12,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
  },
  noRequests: {
    textAlign: 'center',
    padding: 16,
  },
  userActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  userActionButton: {
    padding: 8,
    borderRadius: 4,
  },
  storeList: {
    gap: 8,
  },
  storeButton: {
    padding: 8,
    borderRadius: 4,
  },
  storeButtonText: {
    fontWeight: '500',
  },
  recordsContainer: {
    padding: 12,
    borderRadius: 8,
    maxHeight: 300,
  },
  recordsText: {
    fontSize: 12,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  notificationButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  notificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 4,
  },
  logsContainer: {
    padding: 12,
    borderRadius: 8,
    maxHeight: 200,
    marginBottom: 16,
  },
  logsText: {
    textAlign: 'center',
    padding: 16,
  },
  logsList: {
    gap: 4,
  },
  logText: {
    fontSize: 12,
  },
  notificationStatus: {
    padding: 12,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
  },
  settingsItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsItemText: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  settingsItemDescription: {
    fontSize: 12,
    opacity: 0.7,
  },
  sectionContent: {
    marginTop: 16,
  },
  button: {
    padding: 8,
    borderRadius: 4,
  },
});
