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
  });

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
      <SafeAreaView style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
        <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: insets.top }}>
          <View style={{ padding: 20, borderRadius: 16, backgroundColor: colorScheme.colors.card, marginTop: 24 }}>
            <Text style={[styles.itemTitle, { color: colorScheme.colors.text, fontSize: 24 }]}>
              Loading...
            </Text>
            <Text style={[styles.itemSubtitle, { color: subtitleColor, marginTop: 8 }]}>
              Please wait while we initialize the app.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
        <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: insets.top }}>
          <View style={{ padding: 20, borderRadius: 16, backgroundColor: colorScheme.colors.card, marginTop: 24 }}>
            <Text style={[styles.itemTitle, { color: colorScheme.colors.text, fontSize: 24 }]}>
              Welcome to NChat
            </Text>
            <Text style={[styles.itemSubtitle, { color: subtitleColor, marginTop: 8 }]}>
              Sign in to access your channels, follow users, and manage your tenant requests.
            </Text>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 14,
                paddingHorizontal: 20,
                borderRadius: 12,
                marginTop: 16,
                backgroundColor: colorScheme.colors.primary,
              }}
              onPress={() => router.push('/login')}
            >
              <LogIn size={20} color="white" style={{ marginRight: 8 }} />
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
        <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: insets.top }}>
          <View style={{ padding: 20, borderRadius: 16, backgroundColor: colorScheme.colors.card, marginTop: 24 }}>
            <Text style={[styles.itemTitle, { color: colorScheme.colors.text, fontSize: 24 }]}>
              Loading...
            </Text>
            <Text style={[styles.itemSubtitle, { color: subtitleColor, marginTop: 8 }]}>
              Please wait while we load your data.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const data = [...tenantRequests, ...followedChannels];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
      
      <ScrollView 
        style={{ flex: 1, backgroundColor: colorScheme.colors.background }}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {data.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
            <Text style={[styles.itemSubtitle, { color: subtitleColor, textAlign: 'center' }]}>
              No channels or requests yet. Start by following some channels!
            </Text>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 16 }}>
            <FlashList
              data={data}
              estimatedItemSize={72}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={{
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
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
        }}
        onPress={() => router.push('/explore')}
      >
        <Plus size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}