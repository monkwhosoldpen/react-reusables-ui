import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Constants from "expo-constants";
import {
  StyleSheet,
  Text,
  View,
  Platform,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useTheme } from '~/lib/providers/theme/ThemeProvider';
import { ThemeName, useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';
import { TenantRequest, useAuth } from '~/lib/contexts/AuthContext';
import { FollowButton } from '@/components/common/FollowButton';
import { LogIn, LogOut } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { indexedDB } from '@/lib/services/indexedDB';
import LanguageChanger from '@/components/common/LanguageChanger';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Switch } from '~/components/ui/switch';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, type Option } from '~/components/ui/select';

interface MainScreenProps {
  initialData?: {
    follows: any[];
    requests: TenantRequest[];
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.manifest.splash.backgroundColor,
  },
  splitContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  leftSection: {
    width: '35%',
    maxWidth: 420,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  rightSection: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  chatItemSelected: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '500',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    marginRight: 40,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0084ff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
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
    padding: 8,
    width: '100%',
    maxWidth: "100%",
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
  languageChanger: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
  },
  label: {
    marginRight: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginCard: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    gap: 16,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  loginDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },
  loginButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loginIcon: {
    marginRight: 8,
  },
  sectionHeader: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  noMessageSelected: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  trendsSection: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  trendsHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  trendsList: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 8,
    overflow: 'scroll',
  },
  trendItem: {
    alignItems: 'center',
    width: 72,
  },
  trendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  showMoreText: {
    color: '#1DA1F2',
    fontSize: 14,
    marginTop: 8,
  },
});

export function MainScreen({ initialData }: MainScreenProps) {
  const { theme } = useTheme();
  const { colorScheme, updateTheme } = useColorScheme();
  const { design } = useDesign();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [followedChannels, setFollowedChannels] = useState<any[]>(initialData?.follows || []);
  const [tenantRequests, setTenantRequests] = useState<TenantRequest[]>(initialData?.requests || []);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isMediumOrAbove, setIsMediumOrAbove] = useState(Platform.OS === 'web' && window.innerWidth >= 768);
  const [dbInitialized, setDbInitialized] = useState(false);
  const initializationStarted = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

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
      return requests || [];
    } catch (err) {
      console.error('Error fetching tenant requests:', err);
      return [];
    }
  };

  // Load data when DB is initialized and user is available
  useEffect(() => {
    const loadData = async () => {
      if (dbInitialized && user?.id && !isDataLoaded) {
        setIsLoading(true);
        try {
          const [follows, requests] = await Promise.all([
            fetchUserFollows(),
            fetchTenantRequests()
          ]);
          setFollowedChannels(follows);
          setTenantRequests(requests);
          setIsDataLoaded(true);
        } catch (error) {
          console.error('Error loading data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadData();
  }, [dbInitialized, user?.id, isDataLoaded]);

  // Reset data loaded state when user changes
  useEffect(() => {
    setIsDataLoaded(false);
  }, [user?.id]);

  // Handle window resize on web
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleResize = () => {
        setIsMediumOrAbove(window.innerWidth >= 768);
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);


  if (authLoading) {
    return (
      <View style={[styles.loginContainer, { backgroundColor: colorScheme.colors.background }]}>
        <View style={[
          styles.loginCard,
          {
            backgroundColor: colorScheme.colors.card,
            boxShadow: '0 1px 1px rgba(0, 0, 0, 0.1)',
          }
        ]}>
          <Text style={[styles.loginTitle, { color: colorScheme.colors.text }]}>
            Loading...
          </Text>
          <Text style={[styles.loginDescription, { color: colorScheme.colors.text }]}>
            Please wait while we initialize the app.
          </Text>
        </View>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.loginContainer, { backgroundColor: colorScheme.colors.background }]}>
        <View style={[
          styles.loginCard,
          {
            backgroundColor: colorScheme.colors.card,
            boxShadow: '0 1px 1px rgba(0, 0, 0, 0.1)',
          }
        ]}>
          <Text style={[styles.loginTitle, { color: colorScheme.colors.text }]}>
            Welcome to NChat
          </Text>
          <Text style={[styles.loginDescription, { color: colorScheme.colors.text }]}>
            Sign in to access your channels, follow users, and manage your tenant requests.
          </Text>
          <TouchableOpacity
            style={[
              styles.loginButton,
              {
                backgroundColor: colorScheme.colors.primary,
                boxShadow: '0 1px 1px rgba(0, 0, 0, 0.1)',
              }
            ]}
            onPress={() => router.push('/login')}
          >
            <LogIn
              size={20}
              color={colorScheme.colors.background}
              style={styles.loginIcon}
            />
            <Text style={[styles.loginButtonText, { color: colorScheme.colors.background }]}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.loginContainer, { backgroundColor: colorScheme.colors.background }]}>
        <View style={[
          styles.loginCard,
          {
            backgroundColor: colorScheme.colors.card,
            boxShadow: '0 1px 1px rgba(0, 0, 0, 0.1)',
          }
        ]}>
          <Text style={[styles.loginTitle, { color: colorScheme.colors.text }]}>
            Loading...
          </Text>
          <Text style={[styles.loginDescription, { color: colorScheme.colors.text }]}>
            Please wait while we load your data.
          </Text>
        </View>
      </View>
    );
  }

  const renderChatList = () => (
    <ScrollView style={styles.chatList}>

      {/* Followed Channels Section */}
      <View style={[styles.sectionHeader, { backgroundColor: colorScheme.colors.border + '20' }]}>
        <Text style={[styles.sectionHeaderText, { color: colorScheme.colors.text }]}>
          Followed Channels
        </Text>
      </View>
      {followedChannels.map((channel, index) => (
        <TouchableOpacity
          key={channel.id || index}
          style={[
            styles.chatItem,
            { borderBottomColor: colorScheme.colors.border },
            selectedItem?.id === channel.id && styles.chatItemSelected
          ]}
          onPress={() => {
            setSelectedItem(channel);
            router.push(`/${channel.username}` as any);
          }}
        >
          <View style={[styles.avatar, { backgroundColor: colorScheme.colors.border }]}>
            <Text style={[styles.avatarText, { color: colorScheme.colors.text }]}>
              {channel.username?.[0]?.toUpperCase() || '#'}
            </Text>
          </View>
          <View style={styles.chatContent}>
            <View style={styles.chatHeader}>
              <Text style={[styles.chatName, { color: colorScheme.colors.text }]}>
                {channel.username || 'Unknown Channel'}
              </Text>
              <Text style={[styles.timestamp, { color: colorScheme.colors.text, opacity: 0.6 }]}>
                {channel.last_message_at ? new Date(channel.last_message_at).toLocaleDateString() : ''}
              </Text>
            </View>
            <Text
              style={[styles.lastMessage, { color: colorScheme.colors.text, opacity: 0.6 }]}
              numberOfLines={1}
            >
              {channel.last_message || 'No messages yet'}
            </Text>
          </View>
        </TouchableOpacity>
      ))}

      {/* Tenant Requests Section */}
      <View style={[styles.sectionHeader, { backgroundColor: colorScheme.colors.border + '20' }]}>
        <Text style={[styles.sectionHeaderText, { color: colorScheme.colors.text }]}>
          Tenant Requests
        </Text>
      </View>
      {tenantRequests.map((request, index) => (
        <TouchableOpacity
          key={request.id || index}
          style={[
            styles.chatItem,
            { borderBottomColor: colorScheme.colors.border },
            selectedItem?.id === request.id && styles.chatItemSelected
          ]}
          onPress={() => {
            setSelectedItem(request);
            router.push(`/${request.username}` as any);
          }}
        >
          <View style={[styles.avatar, { backgroundColor: colorScheme.colors.border }]}>
            <Text style={[styles.avatarText, { color: colorScheme.colors.text }]}>
              {request.username?.[0]?.toUpperCase() || '#'}
            </Text>
          </View>
          <View style={styles.chatContent}>
            <View style={styles.chatHeader}>
              <Text style={[styles.chatName, { color: colorScheme.colors.text }]}>
                {request.username || 'Unknown Request'}
              </Text>
              <Text style={[styles.timestamp, { color: colorScheme.colors.text, opacity: 0.6 }]}>
                {request.created_at ? new Date(request.created_at).toLocaleDateString() : ''}
              </Text>
            </View>
            <Text
              style={[styles.lastMessage, { color: colorScheme.colors.text, opacity: 0.6 }]}
              numberOfLines={1}
            >
              {`${request.type} - ${request.status}`}
            </Text>
          </View>
        </TouchableOpacity>
      ))}

      <View style={[styles.trendsSection, { borderBottomColor: colorScheme.colors.border }]}>
        <TouchableOpacity onPress={() => router.push('/explore')}>
          <Text style={styles.showMoreText}>Explore</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.trendsSection, { borderBottomColor: colorScheme.colors.border }]}>
        <TouchableOpacity onPress={() => router.push('/dashboard')}>
          <Text style={styles.showMoreText}>Dashboard</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
      <>
        {renderChatList()}

        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colorScheme.colors.primary }]}
          onPress={() => router.push('/new-chat')}
        >
          <Text style={{ color: colorScheme.colors.background, fontSize: 24 }}>+</Text>
        </TouchableOpacity>
      </>

    </View>
  );
}

