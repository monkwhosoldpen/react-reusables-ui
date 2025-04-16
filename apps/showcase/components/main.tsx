import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Constants from "expo-constants";
import {
  StyleSheet,
  Text,
  View,
  Platform,
  TouchableOpacity,
  ScrollView,
  ViewStyle,
  TextStyle,
  useWindowDimensions,
} from "react-native";
import { ThemeName, useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';
import { TenantRequest, useAuth } from '~/lib/contexts/AuthContext';
import { LogIn, LogOut } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { indexedDB } from '@/lib/services/indexedDB';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';

interface MainScreenProps {
  initialData?: {
    follows: any[];
    requests: TenantRequest[];
  };
}

interface Styles {
  container: ViewStyle;
  contentContainer: ViewStyle;
  header: ViewStyle;
  headerText: TextStyle;
  list: ViewStyle;
  item: ViewStyle;
  itemSelected: ViewStyle;
  avatar: ViewStyle;
  avatarText: TextStyle;
  itemContent: ViewStyle;
  itemTitle: TextStyle;
  itemSubtitle: TextStyle;
  fab: ViewStyle;
  emptyState: ViewStyle;
  emptyStateText: TextStyle;
  loginContainer: ViewStyle;
  loginCard: ViewStyle;
  loginTitle: TextStyle;
  loginDescription: TextStyle;
  loginButton: ViewStyle;
  loginButtonText: TextStyle;
  loginIcon: ViewStyle;
  sectionHeader: ViewStyle;
  sectionHeaderText: TextStyle;
  card: ViewStyle;
  sectionTitle: TextStyle;
  settingDescription: TextStyle;
  button: ViewStyle;
  buttonText: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: Constants.manifest.splash.backgroundColor,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  itemSelected: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemContent: {
    flex: 1,
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0084ff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.6,
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
    paddingVertical: 12,
    paddingHorizontal: 0,
    marginTop: 8,
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  settingDescription: {
    fontSize: 16,
    opacity: 0.6,
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export function MainScreen({ initialData }: MainScreenProps) {
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();


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

          // Get all channel activity records
          const allChannelActivity = await indexedDB.getAll('channels_activity');

          // Merge channel activity into follows
          const followsWithActivity = follows.map(follow => {
            const channelActivity = allChannelActivity.find(
              activity => activity.username === follow.username
            );
            return {
              ...follow,
              channelActivity: channelActivity ? [channelActivity] : [],
              isPrivate: false
            };
          });

          // Merge channel activity into tenant requests
          const requestsWithActivity = requests.map(request => {
            const channelActivity = allChannelActivity.find(
              activity => activity.username === request.username
            );
            return {
              ...request,
              channelActivity: channelActivity ? [channelActivity] : [],
              isPrivate: true
            };
          });

          // Log combined records if needed for debugging
          console.log('Combined Records from IndexedDB:', {
            follows: followsWithActivity,
            tenant_requests: requestsWithActivity
          });

          setFollowedChannels(followsWithActivity);
          setTenantRequests(requestsWithActivity);
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

  const renderItem = useCallback(({ item, index }: { item: any; index: number }) => {
    const isPrivateChannel = item.isPrivate;
    const isFirstPrivateChannel = isPrivateChannel && index === 0;
    const isFirstPublicChannel = !isPrivateChannel && index === tenantRequests.length;

    // Get channel activity info
    const channelActivity = item.channelActivity?.[0];
    const lastMessage = channelActivity?.last_message;
    const messageCount = channelActivity?.message_count || 0;
    const lastUpdated = channelActivity?.last_updated_at || item.updated_at || item.created_at;

    // Get request status if it's a private channel
    const status = isPrivateChannel ? item.status : '';

    return (
      <>
        {isFirstPrivateChannel && (
          <View style={[styles.sectionHeader, { backgroundColor: colorScheme.colors.background }]}>
            <Text style={[styles.sectionHeaderText, { color: colorScheme.colors.text }]}>
              PRIVATE CHANNELS
            </Text>
          </View>
        )}
        {isFirstPublicChannel && (
          <View style={[styles.sectionHeader, { backgroundColor: colorScheme.colors.background }]}>
            <Text style={[styles.sectionHeaderText, { color: colorScheme.colors.text }]}>
              PUBLIC CHANNELS
            </Text>
          </View>
        )}
        <TouchableOpacity
          key={item.id || index}
          style={[
            styles.item,
            selectedItem?.id === item.id && styles.itemSelected,
            { backgroundColor: colorScheme.colors.card }
          ]}
          onPress={() => {
            setSelectedItem(item);
            router.push(`/${item.username}` as any);
          }}
        >
          <View style={[styles.avatar, { backgroundColor: colorScheme.colors.background }]}>
            <Text style={[styles.avatarText, { color: colorScheme.colors.text }]}>
              {item.username?.[0]?.toUpperCase() || '#'}
            </Text>
          </View>
          <View style={styles.itemContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Text style={[styles.itemTitle, { color: colorScheme.colors.text }]} numberOfLines={1}>
                {item.username || 'Unknown'}
              </Text>
              {status && (
                <Text style={[styles.itemSubtitle, { color: colorScheme.colors.text, fontSize: 12, opacity: 0.7 }]}>
                  {status}
                </Text>
              )}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
              <Text style={[styles.itemSubtitle, { color: colorScheme.colors.text, opacity: 0.7 }]}>
                {messageCount} messages
              </Text>
              <Text style={[styles.itemSubtitle, { color: colorScheme.colors.text, opacity: 0.7, marginHorizontal: 4 }]}>
                •
              </Text>
              <Text style={[styles.itemSubtitle, { color: colorScheme.colors.text, opacity: 0.7 }]}>
                {lastUpdated ? new Date(lastUpdated).toLocaleDateString() : 'Invalid Date'}
              </Text>
            </View>
            {lastMessage ? (
              <Text style={[styles.itemSubtitle, { color: colorScheme.colors.text, opacity: 0.8 }]} numberOfLines={2}>
                {lastMessage.message_text}
              </Text>
            ) : (
              <Text style={[styles.itemSubtitle, { color: colorScheme.colors.text, opacity: 0.6 }]} numberOfLines={1}>
                No messages yet
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </>
    );
  }, [selectedItem, colorScheme, router, tenantRequests]);

  if (authLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
        <View style={[styles.contentContainer, { paddingTop: insets.top }]}>
          <View style={[styles.card, { backgroundColor: colorScheme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colorScheme.colors.text }]}>
              Loading...
            </Text>
            <Text style={[styles.settingDescription, { color: colorScheme.colors.text }]}>
              Please wait while we initialize the app.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
        <View style={[styles.contentContainer, { paddingTop: insets.top }]}>
          <View style={[styles.card, { backgroundColor: colorScheme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colorScheme.colors.text }]}>
              Welcome to NChat
            </Text>
            <Text style={[styles.settingDescription, { color: colorScheme.colors.text }]}>
              Sign in to access your channels, follow users, and manage your tenant requests.
            </Text>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colorScheme.colors.primary }]}
              onPress={() => router.push('/login')}
            >
              <LogIn
                size={Number(design.spacing.iconSize)}
                color={colorScheme.colors.background}
                style={styles.loginIcon}
              />
              <Text style={[styles.buttonText, { color: colorScheme.colors.background }]}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
        <View style={[styles.contentContainer, { paddingTop: insets.top }]}>
          <View style={[styles.card, { backgroundColor: colorScheme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colorScheme.colors.text }]}>
              Loading...
            </Text>
            <Text style={[styles.settingDescription, { color: colorScheme.colors.text }]}>
              Please wait while we load your data.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const data = [...tenantRequests, ...followedChannels];

  return (
    <View style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
      <View style={[styles.contentContainer, { paddingTop: insets.top }]}>
        {data.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colorScheme.colors.background }]}>
            <Text style={[styles.emptyStateText, { color: colorScheme.colors.text }]}>
              No channels or requests yet. Start by following some channels!
            </Text>
          </View>
        ) : (
          <FlashList
            data={data}
            estimatedItemSize={72}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colorScheme.colors.primary }]}
        onPress={() => router.push('/explore')}
      >
        <Text style={{
          color: colorScheme.colors.background,
          fontSize: 24,
          fontWeight: '600',
        }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}