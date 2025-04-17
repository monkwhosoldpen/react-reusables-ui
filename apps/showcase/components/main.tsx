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
  timeStamp: TextStyle;
  messageCount: ViewStyle;
  messageCountText: TextStyle;
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
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    marginVertical: 0.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 0,
  },
  itemSelected: {
    backgroundColor: 'rgba(128,128,128,0.1)',
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    backgroundColor: '#E8EEF2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
  },
  itemContent: {
    flex: 1,
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 3,
    color: '#1E293B',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 18,
  },
  timeStamp: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
    opacity: 0.8,
  },
  messageCount: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    backgroundColor: '#25D366',
    shadowOpacity: 0,
    elevation: 0,
  },
  messageCountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
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
    color: '#64748B',
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
    borderRadius: 8,
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
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
    paddingHorizontal: 16,
    marginTop: 8,
    backgroundColor: 'transparent',
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    padding: 20,
    borderRadius: 8,
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1E293B',
  },
  settingDescription: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 12,
    backgroundColor: '#3B82F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});

export function MainScreen({ initialData }: MainScreenProps) {
  const { colorScheme, themeName } = useColorScheme();
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
              isPrivate: false,
              id: follow.id || follow.username // Ensure id is set
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
              isPrivate: true,
              id: request.id || request.username, // Ensure id is set
              username: request.username || request.tenant_name // Ensure username is set
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

    const channelActivity = item.channelActivity?.[0];
    const lastMessage = channelActivity?.last_message;
    const messageCount = channelActivity?.message_count || 0;
    const lastUpdated = channelActivity?.last_updated_at || item.updated_at || item.created_at;
    
    const formattedDate = lastUpdated ? new Date(lastUpdated).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    }) : '';

    return (
      <>
        {isFirstPrivateChannel && (
          <View style={[styles.sectionHeader, { backgroundColor: colorScheme.colors.background }]}>
            <Text style={[styles.sectionHeaderText, { color: colorScheme.colors.text, opacity: Number(design.opacity.subtle) }]}>
              PRIVATE CHANNELS
            </Text>
          </View>
        )}
        {isFirstPublicChannel && (
          <View style={[styles.sectionHeader, { backgroundColor: colorScheme.colors.background }]}>
            <Text style={[styles.sectionHeaderText, { color: colorScheme.colors.text, opacity: Number(design.opacity.subtle) }]}>
              PUBLIC CHANNELS
            </Text>
          </View>
        )}
        <TouchableOpacity
          key={item.id || index}
          style={[
            styles.item,
            { 
              backgroundColor: colorScheme.colors.card,
              borderColor: colorScheme.colors.border,
              borderRadius: Number(design.radius.lg),
              padding: Number(design.spacing.padding.item),
              shadowColor: colorScheme.colors.text,
              shadowOffset: { width: 0, height: themeName === 'material' ? 1 : 0 },
              shadowOpacity: themeName === 'material' ? 0.15 : Number(design.opacity.subtle),
              shadowRadius: themeName === 'material' ? 4 : 0,
              elevation: themeName === 'material' ? 1 : 0,
            },
            selectedItem?.id === item.id && [
              styles.itemSelected, 
              { 
                backgroundColor: colorScheme.colors.notification,
                shadowOffset: { width: 0, height: themeName === 'material' ? 2 : 0 },
                shadowOpacity: themeName === 'material' ? 0.2 : 0.1,
                shadowRadius: themeName === 'material' ? 8 : 0,
                elevation: themeName === 'material' ? 2 : 0,
              }
            ],
          ]}
          onPress={() => {
            setSelectedItem(item);
            router.push(`/${item.username}` as any);
          }}
        >
          <View style={[
            styles.avatar, 
            { 
              width: Number(design.spacing.avatarSize),
              height: Number(design.spacing.avatarSize),
              borderRadius: Number(design.radius.full) / 2,
              backgroundColor: colorScheme.colors.notification,
              shadowColor: colorScheme.colors.text,
              shadowOpacity: Number(design.opacity.subtle),
              elevation: Number(design.elevation.sm),
            }
          ]}>
            <Text style={[styles.avatarText, { color: colorScheme.colors.background }]}>
              {item.username?.[0]?.toUpperCase() || '#'}
            </Text>
          </View>
          <View style={styles.itemContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Text style={[styles.itemTitle, { color: colorScheme.colors.text }]} numberOfLines={1}>
                {item.username || 'Unknown'}
              </Text>
              <Text style={[styles.timeStamp, { color: colorScheme.colors.text, opacity: Number(design.opacity.subtle) }]}>{formattedDate}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              {lastMessage ? (
                <Text style={[styles.itemSubtitle, { color: colorScheme.colors.text, opacity: Number(design.opacity.medium) }]} numberOfLines={1}>
                  {lastMessage.message_text}
                </Text>
              ) : (
                <Text style={[styles.itemSubtitle, { color: colorScheme.colors.text, opacity: Number(design.opacity.subtle) }]} numberOfLines={1}>
                  No messages yet
                </Text>
              )}
              {messageCount > 0 && (
                <View style={[
                  styles.messageCount, 
                  { 
                    minWidth: Number(design.spacing.iconSize),
                    height: Number(design.spacing.iconSize),
                    borderRadius: Number(design.radius.full) / 2,
                    backgroundColor: colorScheme.colors.primary,
                    elevation: Number(design.elevation.sm),
                  }
                ]}>
                  <Text style={[styles.messageCountText, { color: colorScheme.colors.background }]}>
                    {messageCount}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </>
    );
  }, [selectedItem, colorScheme, router, tenantRequests, design, themeName]);

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
        style={[
          styles.fab,
          { 
            width: Number(design.spacing.buttonHeight),
            height: Number(design.spacing.buttonHeight),
            borderRadius: Number(design.radius.full) / 2,
            backgroundColor: colorScheme.colors.primary,
            elevation: Number(design.elevation.lg),
            shadowOpacity: Number(design.opacity.medium),
          }
        ]}
        onPress={() => router.push('/explore')}
      >
        <Text style={{
          color: colorScheme.colors.background,
          fontSize: Number(design.spacing.fontSize.xl),
          fontWeight: '600',
        }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}