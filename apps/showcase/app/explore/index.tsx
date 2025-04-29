'use client';

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated, SafeAreaView, ScrollView } from 'react-native';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useRouter } from 'expo-router';
import { toast } from 'sonner';
import { FollowButton } from '@/components/common/FollowButton';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Channel } from '@/lib/types/channel.types';
import { config } from '@/lib/config';
import { useTheme } from '@/lib/providers/theme/ThemeProvider';
import { useColorScheme } from '@/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '@/lib/providers/theme/DesignSystemProvider';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from "@expo/vector-icons";
import { CommonHeader } from '~/components/common/CommonHeader';

export default function ExplorePage() {
  const { user } = useAuth();
  const [channels, setChannels] = React.useState<Channel[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { theme } = useTheme();
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

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
    card: {
      padding: 20,
      borderRadius: 16,
      marginTop: 24,
      backgroundColor: colorScheme.colors.card,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
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
      backgroundColor: colorScheme.colors.primary,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
      marginLeft: 8,
    },
  });

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  React.useEffect(() => {
    const fetchChannels = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(config.api.endpoints.channels.base);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch channels: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setChannels(data);
        } else if (data.success) {
          setChannels(data.channels);
        } else {
          throw new Error(data.error || 'Failed to fetch channels');
        }
      } catch (error) {
        setError('Failed to load channels. Please try again.');
        toast.error('Failed to load channels');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChannels();
  }, []);

  const renderItem = useCallback(({ item, index }: { item: Channel; index: number }) => {
    return (
      <Animated.View
        style={[
          styles.item,
          {
            backgroundColor: colorScheme.colors.card,
            borderColor: colorScheme.colors.border,
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
          onPress={() => {
            router.push(`/${item.username}`);
          }}
        >
          <View style={[styles.avatar, { backgroundColor: avatarBgColor }]}>
            <Text style={[styles.itemTitle, { color: colorScheme.colors.primary }]}>
              {item.username?.[0]?.toUpperCase() || '#'}
            </Text>
          </View>
          <View style={styles.itemContent}>
            <Text style={[styles.itemTitle, { color: colorScheme.colors.text }]} numberOfLines={1}>
              {item.username}
            </Text>
            <Text style={[styles.itemSubtitle, { color: subtitleColor }]} numberOfLines={1}>
              {item.stateName || 'No description available'}
            </Text>
          </View>
        </TouchableOpacity>
        <FollowButton
          username={item.username}
          initialFollowing={false}
        />
      </Animated.View>
    );
  }, [colorScheme, router, fadeAnim]);

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
        <View style={[styles.card, { margin: 16 }]}>
          <Text style={[styles.sectionTitle, { color: colorScheme.colors.text }]}>
            {error}
          </Text>
          <Text style={[styles.settingDescription, { color: subtitleColor }]}>
            There was a problem loading the channels. This could be due to a network issue or the server might be unavailable.
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => window.location.reload()}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
      <CommonHeader title="Explore" showBackButton={true} />
      <ScrollView 
        style={{ flex: 1, backgroundColor: colorScheme.colors.background }}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {isLoading ? (
          <View style={[styles.card, { margin: 16 }]}>
            <ActivityIndicator size="large" color={colorScheme.colors.primary} />
            <Text style={[styles.settingDescription, { color: subtitleColor, textAlign: 'center', marginTop: 16 }]}>
              Loading channels...
            </Text>
          </View>
        ) : channels.length > 0 ? (
          <View style={{ paddingHorizontal: 16 }}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionHeaderText, { color: subtitleColor }]}>AVAILABLE CHANNELS</Text>
            </View>
            <FlashList
              data={channels}
              renderItem={renderItem}
              estimatedItemSize={72}
              contentContainerStyle={{
                paddingTop: insets.top + 16,
                paddingBottom: insets.bottom + 16,
              }}
              showsVerticalScrollIndicator={false}
            />
          </View>
        ) : (
          <View style={[styles.card, { margin: 16 }]}>
            <Text style={[styles.sectionTitle, { color: colorScheme.colors.text }]}>
              No channels found
            </Text>
            <Text style={[styles.settingDescription, { color: subtitleColor }]}>
              There are currently no channels available. Please check back later.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
} 