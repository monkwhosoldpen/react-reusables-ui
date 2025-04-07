import Constants from "expo-constants";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Platform,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useTheme } from '~/lib/providers/theme/ThemeProvider';
import { useAuth } from '~/lib/contexts/AuthContext';
import { FollowButton } from '@/components/common/FollowButton';
import { LogIn, LogOut } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { indexedDB } from '@/lib/services/indexedDB';
import { StoreNames } from 'idb';
import { NchatDB } from '@/lib/services/indexedDBSchema';

// Mock usernames for testing follow functionality
const MOCK_USERNAMES = ['elonmusk', 'testusername'];

// Type definitions
interface TenantRequest {
  type: string;
  username: string;
  status: string;
  created_at?: string;
}

interface UserInfo {
  tenantRequests?: TenantRequest[];
  // Add other user info properties as needed
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.manifest.splash.backgroundColor,
  },
  videoContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: Constants.manifest.splash.backgroundColor,
  },
  contentContainer: {
    padding: 20,
    width: '100%',
    maxWidth: 400,
    marginHorizontal: 'auto',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#FFFFFF',
  },
  startButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  startButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  followSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  followText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 10,
  },
  card: {
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
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
  channelsList: {
    gap: 8,
  },
  channelItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  channelInfo: {
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
  tenantRequestsTable: {
    gap: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
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
});

export function MainScreen() {
  const { theme } = useTheme();
  const { user, signOut, userInfo } = useAuth();
  const router = useRouter();
  const [followedChannels, setFollowedChannels] = useState<any[]>([]);
  const [tenantRequests, setTenantRequests] = useState<TenantRequest[]>([]);
  const [dbInitialized, setDbInitialized] = useState(false);
  const initializationStarted = useRef(false);

  // Initialize IndexedDB
  useEffect(() => {
    if (!initializationStarted.current) {
      initializationStarted.current = true;
      console.log('Initializing IndexedDB on mount');
      
      indexedDB.initialize()
        .then(() => {
          console.log('IndexedDB initialized successfully');
          setDbInitialized(true);
        })
        .catch(err => {
          console.error('Error initializing IndexedDB:', err);
        });
    }
  }, []);

  // Fetch followed channels
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

  // Fetch tenant requests
  const fetchTenantRequests = async () => {
    if (!user?.id || !dbInitialized) return [];
    
    try {
      const requests = await indexedDB.getAllFromIndex('tenant_requests', 'by-user', user.id);
      console.log('Tenant requests:', requests);
      return requests || [];
    } catch (err) {
      console.error('Error fetching tenant requests:', err);
      return [];
    }
  };

  // Load data when DB is initialized and user is available
  useEffect(() => {
    if (dbInitialized && user?.id) {
      console.log('Database initialized and user available, loading data');
      
      // Fetch followed channels
      fetchUserFollows()
        .then(follows => {
          setFollowedChannels(follows);
        })
        .catch(error => {
          console.error('Error loading followed channels:', error);
        });
      
      // Fetch tenant requests
      fetchTenantRequests()
        .then(requests => {
          setTenantRequests(requests);
        })
        .catch(error => {
          console.error('Error loading tenant requests:', error);
        });
    }
  }, [dbInitialized, user?.id]);

  const handleStart = useCallback(() => {
    console.log('User:', user);
  }, [user]);

  return (
    <ScrollView 
      style={styles.mainContainer}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>Hello Universe!</Text>
      <TouchableOpacity 
        style={styles.startButton}
        onPress={handleStart}
      >
        <Text style={styles.startButtonText}>Start</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.startButton, { marginTop: 10 }]}
        onPress={() => router.push('/home' as any)}
      >
        <Text style={styles.startButtonText}>Go to Home</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.startButton, { marginTop: 10 }]}
        onPress={() => router.push('/settings' as any)}
      >
        <Text style={styles.startButtonText}>Go to Settings</Text>
      </TouchableOpacity>
      <View style={styles.followSection}>
        <Text style={styles.followText}>Follow Elon Musk</Text>
        <FollowButton username="elonmusk" showIcon />
      </View>
      
      {/* Followed Channels Section */}
      <View style={[styles.card, { backgroundColor: theme.colorScheme.colors.background }]}>
        <Text style={[styles.sectionTitle, { color: theme.colorScheme.colors.text }]}>
          Followed Channels
        </Text>
        <View style={styles.channelsList}>
          {followedChannels.length > 0 ? (
            followedChannels.map((channel: any, index: number) => (
              <TouchableOpacity
                key={`channel-${channel.username || 'unknown'}-${index}`} 
                style={[styles.channelItem, { 
                  borderColor: theme.colorScheme.colors.border,
                  backgroundColor: theme.colorScheme.colors.card 
                }]}
                onPress={() => router.push(`/${channel.username}` as any)}
              >
                <View style={styles.channelInfo}>
                  <View style={[styles.avatar, { backgroundColor: theme.colorScheme.colors.primary }]}>
                    <Text style={{ color: theme.colorScheme.colors.background }}>
                      {channel.username[0].toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={[styles.username, { color: theme.colorScheme.colors.text }]}>
                      @{channel.username}
                    </Text>
                    <Text style={[styles.userType, { color: theme.colorScheme.colors.text }]}>
                      {channel.type || 'Channel'}
                    </Text>
                  </View>
                </View>
                <FollowButton username={channel.username} showIcon />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={[styles.noRequests, { color: theme.colorScheme.colors.text }]}>
              No followed channels
            </Text>
          )}
        </View>
      </View>

      {/* Tenant Requests Section */}
      <View style={[styles.card, { backgroundColor: theme.colorScheme.colors.background }]}>
        <Text style={[styles.sectionTitle, { color: theme.colorScheme.colors.text }]}>
          Tenant Requests
        </Text>
        {tenantRequests.length > 0 ? (
          <View style={styles.channelsList}>
            {tenantRequests.map((request: TenantRequest, index: number) => (
              <TouchableOpacity
                key={`request-${request.username || 'unknown'}-${index}`} 
                style={[styles.channelItem, { 
                  borderColor: theme.colorScheme.colors.border,
                  backgroundColor: theme.colorScheme.colors.card 
                }]}
                onPress={() => router.push(`/${request.username}` as any)}
              >
                <View style={styles.channelInfo}>
                  <View style={[styles.avatar, { backgroundColor: theme.colorScheme.colors.primary }]}>
                    <Text style={{ color: theme.colorScheme.colors.background }}>
                      {request.username?.[0]?.toUpperCase() || '?'}
                    </Text>
                  </View>
                  <View>
                    <Text style={[styles.username, { color: theme.colorScheme.colors.text }]}>
                      @{request.username}
                    </Text>
                    <Text style={[styles.userType, { color: theme.colorScheme.colors.text }]}>
                      {request.type} - {request.status}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={[styles.noRequests, { color: theme.colorScheme.colors.text }]}>
            No tenant requests
          </Text>
        )}
      </View>
      
      {/* Account Section */}
      <View style={[styles.card, { backgroundColor: theme.colorScheme.colors.background }]}>
        <Text style={[styles.sectionTitle, { color: theme.colorScheme.colors.text }]}>
          Account
        </Text>
        
        {user ? (
          <TouchableOpacity
            style={[styles.settingsItem, {
              backgroundColor: theme.colorScheme.colors.card,
              borderBottomColor: theme.colorScheme.colors.border,
            }]}
            onPress={signOut}
          >
            <View style={styles.settingsItemContent}>
              <LogOut 
                size={24} 
                color={theme.colorScheme.colors.notification} 
              />
              <View style={styles.settingsItemText}>
                <Text style={[styles.settingsItemTitle, { color: theme.colorScheme.colors.notification }]}>
                  Sign Out
                </Text>
                <Text style={[styles.settingsItemDescription, { color: theme.colorScheme.colors.text }]}>
                  Sign out of your account
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.settingsItem, {
              backgroundColor: theme.colorScheme.colors.card,
              borderBottomColor: theme.colorScheme.colors.border,
            }]}
            onPress={() => router.push('/login')}
          >
            <View style={styles.settingsItemContent}>
              <LogIn 
                size={24} 
                color={theme.colorScheme.colors.text} 
              />
              <View style={styles.settingsItemText}>
                <Text style={[styles.settingsItemTitle, { color: theme.colorScheme.colors.text }]}>
                  Sign In
                </Text>
                <Text style={[styles.settingsItemDescription, { color: theme.colorScheme.colors.text }]}>
                  Sign in to your account
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

