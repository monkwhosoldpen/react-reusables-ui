import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Image, ScrollView, TextInput, Dimensions, Platform } from 'react-native';
import { Text } from '~/components/ui/text';
import { useLocalSearchParams, router } from 'expo-router';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';
import { createClient } from '@supabase/supabase-js';
import { Ionicons } from '@expo/vector-icons';
import ChannelSidebar from '~/components/chat/ChannelSidebar';
import { useGlobalSupabase } from '~/lib/hooks/useGlobalSupabase';
import { useAuth } from '~/lib/providers/auth/AuthProvider';
import { Channel } from '~/lib/types/channel';

export default function ChatScreen() {
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();
  const { username: rawUsername } = useLocalSearchParams();
  const username = Array.isArray(rawUsername) ? rawUsername[0] : rawUsername || '';
  const [isLoading, setIsLoading] = useState(true);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeChannel, setActiveChannel] = useState(username);
  const { globalSupabase } = useGlobalSupabase();
  const { user } = useAuth();
  const [accessMap, setAccessMap] = useState<Record<string, 'pending' | 'granted' | 'rejected' | 'none'>>({});
  const [channelData, setChannelData] = useState<Channel | null>(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
  const isMobile = windowWidth < 768; // Match MOBILE_BREAKPOINT from ChannelSidebar
  const MOBILE_ICON_WIDTH = 60; // Match MOBILE_ICON_WIDTH from ChannelSidebar

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWindowWidth(window.width);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Keep helper functions for access button
  const getAccessButtonColor = (status: string) => {
    switch (status) {
      case 'granted':
        return colorScheme.colors.notification;
      case 'pending':
        return '#f59e0b';
      case 'rejected':
        return '#ef4444';
      default:
        return colorScheme.colors.primary;
    }
  };

  const getAccessButtonText = (channelUsername: string) => {
    const status = accessMap[channelUsername];
    switch (status) {
      case 'pending':
        return 'Request Pending';
      case 'granted':
        return 'Access Granted';
      case 'rejected':
        return 'Request Rejected';
      case 'none':
      default:
        return 'Request Access';
    }
  };

  useEffect(() => {
    let mounted = true;
    const abortController = new AbortController();

    const fetchChannel = async () => {
      if (!user?.id || !username || !globalSupabase) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: channel, error: channelError } = await globalSupabase
          .from('channels')
          .select('*')
          .eq('username', username)
          .abortSignal(abortController.signal)
          .single();

        if (!mounted) return;

        if (channelError) {
          throw new Error(channelError.message);
        }

        if (!channel) {
          throw new Error(`Channel @${username} not found`);
        }

        // Set channel data
        setChannelData(channel);

        // Initialize tenant Supabase client and fetch access data
        if (channel.tenant_supabase_url && channel.tenant_supabase_anon_key) {
          const tenantClient = createClient(
            channel.tenant_supabase_url,
            channel.tenant_supabase_anon_key
          );

          const { data: accessData, error: accessError } = await tenantClient
            .rpc('get_channels_user_id', { p_user_id: user.id })
            .abortSignal(abortController.signal);

          if (!mounted) return;

          if (accessError) {
            console.error('❌ Access data fetch error:', accessError);
          } else {
            // Update access map with fetched data
            const newAccessMap = accessData?.data?.accessMap || {};
            setAccessMap(newAccessMap);
            setChannels(accessData?.data?.channels || []);
            return;
          }
        }

        // Set default access status if tenant fetch fails or isn't available
        setAccessMap({ [username]: channel.access_status || 'none' });

      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load channel');
          setIsLoading(false);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchChannel();

    return () => {
      mounted = false;
      abortController.abort();
    };
  }, [username, user?.id, globalSupabase]);

  useEffect(() => {
    console.log('🔄 [DEBUG] Loading State:', {
      isLoading,
      username,
      userId: user?.id,
      hasGlobalSupabase: !!globalSupabase
    });
  }, [isLoading, username, user?.id, globalSupabase]);

  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setError('Loading timeout reached. Please try again.');
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(loadingTimeout);
  }, [isLoading]);

  // Handle channel selection
  const handleChannelSelect = (channelUsername: string) => {
    router.push(`/${channelUsername}`);
  };

  // Add back button handler
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleBackButton = (event: PopStateEvent) => {
        event.preventDefault();
        router.push('/channels');
      };

      window.addEventListener('popstate', handleBackButton);

      return () => {
        window.removeEventListener('popstate', handleBackButton);
      };
    }
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme.colors.background,
    },
    mainContent: {
      flex: 1,
      flexDirection: 'row',
    },
    loadingContainer: {
      flex: 1,
      backgroundColor: colorScheme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      color: colorScheme.colors.text,
      marginTop: Number(design.spacing.margin.text) * 4,
      fontSize: Number(design.spacing.fontSize.base),
    },
    errorText: {
      color: '#ef4444',
      fontSize: Number(design.spacing.fontSize.base),
    },
    header: {
      borderBottomWidth: 1,
      borderColor: colorScheme.colors.border,
      backgroundColor: colorScheme.colors.card,
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: Number(design.spacing.padding.item),
      height: 64,
    },
    headerBottom: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Number(design.spacing.padding.item),
      paddingBottom: Number(design.spacing.padding.item),
      justifyContent: 'flex-end',
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    headerAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colorScheme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    headerInfo: {
      marginLeft: Number(design.spacing.margin.text) * 2,
      flex: 1,
    },
    headerName: {
      fontSize: Number(design.spacing.fontSize.base),
      fontWeight: '600',
      color: colorScheme.colors.text,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    accessButton: {
      paddingHorizontal: Number(design.spacing.padding.item),
      paddingVertical: Number(design.spacing.padding.item) / 2,
      borderRadius: Number(design.radius.md),
    },
    accessButtonText: {
      color: '#FFFFFF',
      fontWeight: '500',
      fontSize: Number(design.spacing.fontSize.sm),
    },
    actionButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colorScheme.colors.background,
    },
    chatArea: {
      flex: 1,
      backgroundColor: colorScheme.colors.background,
      marginLeft: isMobile ? MOBILE_ICON_WIDTH : 0, // Add margin for icon-only sidebar
    },
    welcomeContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: Number(design.spacing.padding.card),
    },
    welcomeIcon: {
      width: Number(design.spacing.iconSize) * 3,
      height: Number(design.spacing.iconSize) * 3,
      borderRadius: Number(design.radius.full),
      backgroundColor: colorScheme.colors.card,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Number(design.spacing.margin.text) * 4,
    },
    welcomeTitle: {
      color: colorScheme.colors.text,
      fontSize: Number(design.spacing.fontSize.xl),
      fontWeight: '600',
      marginBottom: Number(design.spacing.margin.text) * 2,
    },
    welcomeText: {
      color: colorScheme.colors.text,
      fontSize: Number(design.spacing.fontSize.base),
      opacity: 0.7,
      textAlign: 'center',
      maxWidth: 400,
    },
    inputContainer: {
      padding: Number(design.spacing.padding.item),
      borderTopWidth: 1,
      borderTopColor: colorScheme.colors.border,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colorScheme.colors.card,
      borderRadius: Number(design.radius.lg),
      padding: Number(design.spacing.padding.item),
    },
    input: {
      flex: 1,
      marginHorizontal: Number(design.spacing.margin.text) * 2,
      color: colorScheme.colors.text,
      fontSize: Number(design.spacing.fontSize.base),
      minHeight: Number(design.spacing.iconSize) * 1.5,
      maxHeight: Number(design.spacing.iconSize) * 5,
    },
    inputButton: {
      padding: Number(design.spacing.padding.item),
      opacity: 0.8,
    },
    mobileMenuButton: {
      display: 'none', // Hide menu button since we have icon sidebar
    },
  });

  // Show initial loader
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colorScheme.colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show error if tenant config couldn't be loaded
  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Page Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <View style={styles.headerAvatar}>
              {channelData?.avatar_url ? (
                <Image
                  source={{ uri: channelData.avatar_url }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="person-circle-outline" size={24} color={colorScheme.colors.text} />
              )}
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.headerName}>
                @{username}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="search" size={20} color={colorScheme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => console.log('store opened')}
            >
              <Ionicons name="bag-outline" size={20} color={colorScheme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="ellipsis-vertical" size={20} color={colorScheme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.headerBottom}>
          <TouchableOpacity
            style={[
              styles.accessButton,
              { backgroundColor: getAccessButtonColor(accessMap[username]) },
              ['granted', 'pending'].includes(accessMap[username]) && { opacity: 0.5 }
            ]}
            onPress={() => {
              if (!['granted', 'pending'].includes(accessMap[username])) {
                router.push({
                  pathname: '/request-access',
                  params: { username }
                });
              }
            }}
            disabled={['granted', 'pending'].includes(accessMap[username])}
          >
            <Text style={[
              styles.accessButtonText,
              ['granted', 'pending'].includes(accessMap[username]) && { opacity: 0.7 }
            ]}>
              {getAccessButtonText(username)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        <ChannelSidebar
          channels={channels}
          activeChannelId={activeChannel}
          onChannelPress={handleChannelSelect}
          isPremium={channelData?.premium || false}
          isVisible={isSidebarVisible}
          onClose={() => setIsSidebarVisible(false)}
        />

        {/* Chat Area */}
        <View style={styles.chatArea}>
          <ScrollView style={{ flex: 1 }}>
            <View style={styles.welcomeContainer}>
              <View style={styles.welcomeIcon}>
                <Ionicons name="chatbubbles-outline" size={32} color={colorScheme.colors.text} />
              </View>
              <Text style={styles.welcomeTitle}>
                Welcome to #{channelData?.name || username}
              </Text>
              <Text style={styles.welcomeText}>
                This is the start of the channel. Send a message to get the conversation going!
              </Text>
            </View>
          </ScrollView>

          {/* Message Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TouchableOpacity style={styles.inputButton}>
                <Ionicons name="add-circle-outline" size={24} color={colorScheme.colors.text} />
              </TouchableOpacity>
              <TextInput
                placeholder="Message #channel"
                placeholderTextColor={colorScheme.colors.text + '80'}
                multiline
                style={styles.input}
              />
              <TouchableOpacity style={styles.inputButton}>
                <Ionicons name="send" size={24} color={colorScheme.colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
} 