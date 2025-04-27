import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Constants from "expo-constants";
import {
  Text,
  View,
  Platform,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { ThemeName, useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';
import { TenantRequest, useAuth } from '~/lib/contexts/AuthContext';
import { LogIn, LogOut, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { indexedDB } from '@/lib/services/indexedDB';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { MaterialIcons } from "@expo/vector-icons";

interface MainScreenProps {
  initialData?: {
    follows: any[];
    requests: TenantRequest[];
  };
}

export function MainScreen({ initialData }: MainScreenProps) {
  const { colorScheme, themeName } = useColorScheme();
  const { user, loading: authLoading, userInfo } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const isDesktop = width >= 768;

  const [followedChannels, setFollowedChannels] = useState<any[]>(initialData?.follows || []);
  const [tenantRequests, setTenantRequests] = useState<TenantRequest[]>(initialData?.requests || []);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isMediumOrAbove, setIsMediumOrAbove] = useState(Platform.OS === 'web' && window.innerWidth >= 768);
  const [dbInitialized, setDbInitialized] = useState(false);
  const initializationStarted = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to determine if dark mode
  const isDarkMode = colorScheme.colors.text === '#ffffff' || colorScheme.colors.background === '#000000';
  const avatarBgColor = isDarkMode ? 'rgba(255,255,255,0.1)' : '#E8EEF2';
  const subtitleColor = isDarkMode ? 'rgba(255,255,255,0.7)' : '#64748B';
  const timestampColor = isDarkMode ? 'rgba(255,255,255,0.5)' : '#64748B';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme.colors.background,
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: insets.bottom + 20,
    },
    desktopContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      maxWidth: 1200,
      alignSelf: 'center',
      width: '100%',
      paddingTop: insets.top + 20,
      paddingBottom: insets.bottom + 20,
      paddingHorizontal: 20,
    },
    sectionContainer: {
      marginBottom: 32,
      paddingHorizontal: 4,
      width: isDesktop ? '50%' : '100%',
    },
    sectionContainerLeft: {
      paddingRight: isDesktop ? 16 : 0,
    },
    sectionContainerRight: {
      paddingLeft: isDesktop ? 16 : 0,
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colorScheme.colors.border,
      backgroundColor: colorScheme.colors.primary,
    },
    headerContent: {
      width: '100%',
      maxWidth: 1200,
      alignSelf: 'center',
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: 'transparent',
      borderRadius: 12,
      marginVertical: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    itemSelected: {
      backgroundColor: 'rgba(128,128,128,0.05)',
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      backgroundColor: '#E8EEF2',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    itemContent: {
      flex: 1,
      marginRight: 12,
    },
    itemTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
      color: '#1E293B',
    },
    itemSubtitle: {
      fontSize: 14,
      color: '#64748B',
      lineHeight: 20,
    },
    timeStamp: {
      fontSize: 12,
      color: '#94A3B8',
      marginBottom: 4,
    },
    messageCount: {
      minWidth: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 8,
      backgroundColor: colorScheme.colors.primary,
    },
    messageCountText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
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
    sectionTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: '#1E293B',
    },
    loadingCard: {
      padding: 24,
      borderRadius: 12,
      backgroundColor: colorScheme.colors.card,
      marginTop: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4
    },
    loadingText: {
      color: colorScheme.colors.text,
      fontSize: 24,
      fontWeight: '700',
      textAlign: 'center'
    },
    loadingSubtext: {
      color: colorScheme.colors.text,
      opacity: 0.7,
      marginTop: 8,
      fontSize: 16,
      textAlign: 'center'
    },
    signInButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      marginTop: 24,
      backgroundColor: colorScheme.colors.primary,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4
    },
    signInButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700'
    },
    cardContainer: {
      padding: 16,
      borderRadius: 12,
      backgroundColor: colorScheme.colors.card,
      marginTop: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    emptyStateContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    emptyStateCard: {
      padding: 24,
      borderRadius: 12,
      backgroundColor: colorScheme.colors.card,
      width: '100%',
      maxWidth: 400,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4
    },
    emptyStateTitle: {
      color: colorScheme.colors.text,
      fontSize: 24,
      fontWeight: '700',
      textAlign: 'center'
    },
    emptyStateSubtext: {
      color: colorScheme.colors.text,
      opacity: 0.7,
      marginTop: 8,
      fontSize: 16,
      textAlign: 'center'
    },
    exploreButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      marginTop: 24,
      backgroundColor: colorScheme.colors.primary,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4
    },
    exploreButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700'
    },
    channelsContainer: {
      padding: 16,
      borderRadius: 12,
      backgroundColor: colorScheme.colors.card,
      marginTop: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    fab: {
      position: 'absolute',
      right: 16,
      bottom: 16,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colorScheme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 6
    },
  });

  // Initialize IndexedDB
  useEffect(() => {
    if (!initializationStarted.current) {
      initializationStarted.current = true;

      indexedDB.initialize()
        .then(() => {
          setDbInitialized(true);
        })
        .catch(err => {
          setError('Failed to initialize database');
        });
    }
  }, []);

  // Fetch followed channels
  const fetchUserFollows = async () => {
    if (!user?.id || !dbInitialized) {
      return [];
    }

    try {
      const follows = await indexedDB.getAllFromIndex('user_channel_follow', 'by-user', user.id);
      return follows || [];
    } catch (err) {
      return [];
    }
  };

  // Fetch tenant requests
  const fetchTenantRequests = async () => {
    if (!user?.id || !dbInitialized) {
      return [];
    }

    try {
      const requests = await indexedDB.getAllFromIndex('tenant_requests', 'by-user', user.id);
      return requests || [];
    } catch (err) {
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
              id: follow.id || follow.username
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
              id: request.id || request.username,
              username: request.username || request.tenant_name
            };
          });

          setFollowedChannels(followsWithActivity);
          setTenantRequests(requestsWithActivity);
          setIsDataLoaded(true);
        } catch (error) {
          setError('Failed to load data');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadData();
  }, [dbInitialized, user?.id, isDataLoaded]);

  // Reset data loaded state when user or userInfo changes
  useEffect(() => {
    if (user?.id || userInfo) {
      setIsDataLoaded(false);
    }
  }, [user?.id, userInfo]);

  // Handle window resize on web
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleResize = () => {
        const newIsMediumOrAbove = window.innerWidth >= 768;
        setIsMediumOrAbove(newIsMediumOrAbove);
      };
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
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
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionHeaderText, { color: subtitleColor }]}>PRIVATE CHANNELS</Text>
          </View>
        )}
        {isFirstPublicChannel && (
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionHeaderText, { color: subtitleColor }]}>PUBLIC CHANNELS</Text>
          </View>
        )}
        <TouchableOpacity
          key={item.id || index}
          style={[
            styles.item,
            { backgroundColor: colorScheme.colors.card },
            selectedItem?.id === item.id && styles.itemSelected
          ]}
          onPress={() => {
            setSelectedItem(item);
            router.push(`/${item.username}` as any);
          }}
        >
          <View style={[styles.avatar, { backgroundColor: avatarBgColor }]}>
            <Text style={[styles.itemTitle, { color: colorScheme.colors.primary }]}>
              {item.username?.[0]?.toUpperCase() || '#'}
            </Text>
          </View>
          <View style={styles.itemContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Text style={[styles.itemTitle, { color: colorScheme.colors.text }]} numberOfLines={1}>
                {item.username || 'Unknown'}
              </Text>
              <Text style={[styles.timeStamp, { color: timestampColor }]}>{formattedDate}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              {lastMessage ? (
                <Text style={[styles.itemSubtitle, { color: subtitleColor }]} numberOfLines={1}>
                  {lastMessage.message_text}
                </Text>
              ) : (
                <Text style={[styles.itemSubtitle, { color: subtitleColor }]} numberOfLines={1}>
                  No messages yet
                </Text>
              )}
              {messageCount > 0 && (
                <View style={styles.messageCount}>
                  <Text style={styles.messageCountText}>{messageCount}</Text>
                </View>
              )}
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={colorScheme.colors.text} style={{ opacity: 0.6 }} />
        </TouchableOpacity>
      </>
    );
  }, [selectedItem, router, tenantRequests, colorScheme, styles]);

  if (authLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.contentContainer, { justifyContent: 'center' }]}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={colorScheme.colors.primary} />
            <Text style={styles.loadingText}>Loading...</Text>
            <Text style={styles.loadingSubtext}>Please wait while we initialize the app</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.contentContainer, { justifyContent: 'center' }]}>
          <View style={styles.loadingCard}>
            <Text style={styles.loadingText}>Welcome to NChat</Text>
            <Text style={styles.loadingSubtext}>
              Sign in to access your channels and manage your requests
            </Text>
            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => router.push('/login')}
            >
              <LogIn size={20} color="white" style={{ marginRight: 8 }} />
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.contentContainer, { justifyContent: 'center' }]}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={colorScheme.colors.primary} />
            <Text style={styles.loadingText}>Loading Your Data</Text>
            <Text style={styles.loadingSubtext}>Please wait while we load your channels</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const bannersData = [
    {
      icon: "forum",
      title: "Community",
      subtitle: "Join discussions with citizens",
      color: colorScheme.colors.primary
    },
    {
      icon: "event",
      title: "Events Hub",
      subtitle: "Discover local events and meetups",
      color: colorScheme.colors.primary
    },
    {
      icon: "groups",
      title: "Interest Groups",
      subtitle: "Connect with like-minded people",
      color: colorScheme.colors.primary
    },
    {
      icon: "campaign",
      title: "Announcements",
      subtitle: "Stay updated with important news",
      color: colorScheme.colors.primary
    },
  ];

  const data = [...tenantRequests, ...followedChannels];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={isDesktop ? styles.desktopContainer : styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Left Column */}
        <View style={[styles.sectionContainer, styles.sectionContainerLeft]}>
          {/* Banners Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>FEATURES</Text>
          </View>
          <View style={styles.cardContainer}>
            {bannersData.map((banner, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.item, { backgroundColor: banner.color }]}
                onPress={() => router.push('/explore')}
              >
                <View style={[styles.avatar, { backgroundColor: `${colorScheme.colors.background}1A` }]}>
                  <MaterialIcons name={banner.icon as any} size={24} color={colorScheme.colors.background} />
                </View>
                <View style={styles.itemContent}>
                  <Text style={[styles.itemTitle, { color: colorScheme.colors.background }]}>
                    {banner.title}
                  </Text>
                  <Text style={[styles.itemSubtitle, { color: colorScheme.colors.background, opacity: 0.8 }]}>
                    {banner.subtitle}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Right Column */}
        <View style={[styles.sectionContainer, styles.sectionContainerRight]}>
          {/* Channels Section */}
          {data.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyStateCard}>
                <Text style={styles.emptyStateTitle}>No Channels Yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Start by following some channels or creating new ones!
                </Text>
                <TouchableOpacity
                  style={styles.exploreButton}
                  onPress={() => router.push('/explore')}
                >
                  <Plus size={20} color="white" style={{ marginRight: 8 }} />
                  <Text style={styles.exploreButtonText}>Explore Channels</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.channelsContainer}>
              <FlashList
                data={data}
                estimatedItemSize={72}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/explore')}
      >
        <Plus size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}