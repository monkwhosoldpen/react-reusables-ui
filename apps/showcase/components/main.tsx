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
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
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
    letterSpacing: 1,
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
  chatItemStyle: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  chatItemSelectedStyle: {
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  avatarStyle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarTextStyle: {
    fontSize: 20,
    fontWeight: '500',
    color: 'rgba(0,0,0,0.8)',
  },
  chatNameStyle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.8)',
  },
  timestampStyle: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
  },
  lastMessageStyle: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.8)',
    marginRight: 40,
  },
  fabStyle: {
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
  followedListStyle: {
    marginTop: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    overflow: 'hidden',
    boxShadow: '0 0 0 1px rgba(0,0,0,0.05)',
  },
  followedItemStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  followedItemLastStyle: {
    borderBottomWidth: 0,
  },
  followedAvatarStyle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  followedAvatarTextStyle: {
    fontSize: 20,
    fontWeight: '500',
    color: 'rgba(0,0,0,0.8)',
  },
  followedNameStyle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.8)',
    flex: 1,
  },
  followedTypeStyle: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
  },
  followedEmptyStyle: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followedEmptyTextStyle: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.5)',
    textAlign: 'center',
  },
  trendsSectionStyle: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  trendsHeaderStyle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: 'rgba(0,0,0,0.8)',
  },
  trendsListStyle: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 8,
    overflow: 'scroll',
  },
  trendItemStyle: {
    alignItems: 'center',
    width: 72,
  },
  trendAvatarStyle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendLabelStyle: {
    fontSize: 12,
    textAlign: 'center',
    color: 'rgba(0,0,0,0.8)',
  },
  showMoreTextStyle: {
    color: '#1DA1F2',
    fontSize: 14,
    marginTop: 8,
    fontWeight: '600',
  },
});

export function MainScreen({ initialData }: MainScreenProps) {
  const { theme } = useTheme();
  const { colorScheme, updateTheme } = useColorScheme();
  const { design } = useDesign();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isSmallScreen = width < 375;
  const isMediumScreen = width >= 375 && width < 768;
  const isLargeScreen = width >= 768;

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

  // Apply design system tokens
  const sectionStyle: ViewStyle = {
    ...styles.section,
    backgroundColor: colorScheme.colors.card,
    padding: Number(design.spacing.padding.card),
    borderRadius: Number(design.radius.lg),
    marginBottom: Number(design.spacing.margin.section),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colorScheme.colors.border,
  };

  const titleStyle: TextStyle = {
    color: colorScheme.colors.text,
    fontSize: Number(design.spacing.fontSize.lg),
    fontWeight: '600' as const,
    marginBottom: Number(design.spacing.margin.card),
    opacity: 1,
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

  const listItemStyle: ViewStyle = {
    backgroundColor: colorScheme.colors.card,
    borderBottomColor: colorScheme.colors.border,
    padding: Number(design.spacing.padding.item),
    borderRadius: Number(design.radius.md),
    marginBottom: Number(design.spacing.margin.item),
  };

  const avatarStyle: ViewStyle = {
    width: Number(design.spacing.avatarSize),
    height: Number(design.spacing.avatarSize),
    borderRadius: Number(design.radius.full),
    backgroundColor: colorScheme.colors.primary + '20',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: Number(design.spacing.margin.item),
  };

  const avatarTextStyle: TextStyle = {
    fontSize: Number(design.spacing.fontSize.lg),
    fontWeight: '500' as const,
    color: colorScheme.colors.primary,
  };

  const listItemTextStyle: TextStyle = {
    color: colorScheme.colors.text,
    fontSize: Number(design.spacing.fontSize.base),
    fontWeight: '500' as const,
    opacity: 1,
  };

  const listItemSecondaryTextStyle: TextStyle = {
    color: colorScheme.colors.text,
    fontSize: Number(design.spacing.fontSize.sm),
    opacity: 0.8,
  };

  const followedListStyle: ViewStyle = {
    marginTop: Number(design.spacing.margin.card),
    backgroundColor: colorScheme.colors.card,
    borderRadius: Number(design.radius.md),
    overflow: 'hidden' as const,
    boxShadow: design.shadow.sm,
  };

  const followedItemStyle: ViewStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: Number(design.spacing.padding.item),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colorScheme.colors.border,
    gap: Number(design.spacing.gap),
  };

  const trendsSectionStyle: ViewStyle = {
    padding: Number(design.spacing.padding.card),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colorScheme.colors.border,
    backgroundColor: colorScheme.colors.card,
    borderRadius: Number(design.radius.md),
  };

  const showMoreTextStyle: TextStyle = {
    color: colorScheme.colors.primary,
    fontSize: Number(design.spacing.fontSize.base),
    marginTop: Number(design.spacing.margin.text),
    fontWeight: '600' as const,
  };

  if (authLoading) {
    return (
      <View style={styles.loginContainer}>
        <View style={styles.loginCard}>
          <Text style={styles.loginTitle}>
            Loading...
          </Text>
          <Text style={styles.loginDescription}>
            Please wait while we initialize the app.
          </Text>
        </View>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loginContainer}>
        <View style={styles.loginCard}>
          <Text style={styles.loginTitle}>
            Welcome to NChat
          </Text>
          <Text style={styles.loginDescription}>
            Sign in to access your channels, follow users, and manage your tenant requests.
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/login')}
          >
            <LogIn
              size={Number(design.spacing.iconSize)}
              color={colorScheme.colors.background}
              style={styles.loginIcon}
            />
            <Text style={styles.loginButtonText}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loginContainer}>
        <View style={styles.loginCard}>
          <Text style={styles.loginTitle}>
            Loading...
          </Text>
          <Text style={styles.loginDescription}>
            Please wait while we load your data.
          </Text>
        </View>
      </View>
    );
  }

  const renderChatList = () => (
    <ScrollView style={styles.chatList}>
      {/* Followed Channels Section */}
      <View style={sectionStyle}>
        <Text style={titleStyle} className="font-medium uppercase">
          Followed Channels
        </Text>
        <View style={followedListStyle}>
          {followedChannels.length > 0 ? (
            followedChannels.map((channel, index) => (
              <TouchableOpacity
                key={channel.id || index}
                style={[
                  followedItemStyle,
                  index === followedChannels.length - 1 && { borderBottomWidth: 0 }
                ]}
                onPress={() => {
                  setSelectedItem(channel);
                  router.push(`/${channel.username}` as any);
                }}
              >
                <View style={avatarStyle}>
                  <Text style={avatarTextStyle}>
                    {channel.username?.[0]?.toUpperCase() || '#'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={listItemTextStyle}>
                    {channel.username || 'Unknown Channel'}
                  </Text>
                  <Text style={listItemSecondaryTextStyle}>
                    {channel.type || 'Channel'}
                  </Text>
                </View>
                <View style={{ marginLeft: Number(design.spacing.margin.card) }}>
                  <FollowButton
                    username={channel.username}
                    initialFollowing={true}
                  />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={[styles.followedEmptyStyle, { padding: Number(design.spacing.padding.card) }]}>
              <Text style={listItemSecondaryTextStyle}>
                No channels followed yet. Start following to see them here!
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Tenant Requests Section */}
      <View style={sectionStyle}>
        <Text style={titleStyle} className="font-medium uppercase">
          Tenant Requests
        </Text>
        {tenantRequests.map((request, index) => (
          <TouchableOpacity
            key={request.id || index}
            style={[
              listItemStyle,
              selectedItem?.id === request.id && { backgroundColor: colorScheme.colors.primary + '10' }
            ]}
            onPress={() => {
              setSelectedItem(request);
              router.push(`/${request.username}` as any);
            }}
          >
            <View style={avatarStyle}>
              <Text style={avatarTextStyle}>
                {request.username?.[0]?.toUpperCase() || '#'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={listItemTextStyle}>
                {request.username || 'Unknown Request'}
              </Text>
              <Text style={listItemSecondaryTextStyle}>
                {request.type || 'Request'}
              </Text>
            </View>
            <View style={{ marginLeft: Number(design.spacing.margin.card) }}>
              <FollowButton
                username={request.username}
                initialFollowing={false}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colorScheme.colors.background }]}
      contentContainerStyle={{
        paddingBottom: insets.bottom + Number(design.spacing.padding.card),
        paddingTop: Number(design.spacing.padding.card)
      }}
    >
      {renderChatList()}

      <TouchableOpacity
        style={[styles.fabStyle, { backgroundColor: colorScheme.colors.primary }]}
        onPress={() => router.push('/new-chat')}
      >
        <Text style={{ 
          color: colorScheme.colors.background, 
          fontSize: Number(design.spacing.fontSize.xl),
          fontWeight: '600' as const,
        }}>+</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}