'use client';

import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Animated, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { toast } from 'sonner';
import { FollowButton } from '~/components/common/FollowButton';
import { useAuth } from '~/lib/core/contexts/AuthContext';
import { Channel } from '~/lib/core/types/channel.types';
import { config } from '~/lib/core/config';
import { useTheme } from '~/lib/core/providers/theme/ThemeProvider';
import { useColorScheme } from '~/lib/core/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/core/providers/theme/DesignSystemProvider';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
        className="flex-row items-center p-4 bg-transparent rounded-xl my-1 shadow-sm"
        style={{
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
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <TouchableOpacity
          className="flex-1 flex-row items-center"
          onPress={() => {
            router.push(`/${item.username}`);
          }}
        >
          <View 
            className="w-12 h-12 rounded-full justify-center items-center mr-3 shadow-sm"
            style={{ 
              backgroundColor: avatarBgColor,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <Text 
              className="text-base font-semibold"
              style={{ color: colorScheme.colors.primary }}
            >
              {item.username?.[0]?.toUpperCase() || '#'}
            </Text>
          </View>
          <View className="flex-1 mr-3">
            <Text 
              className="text-base font-semibold mb-1"
              style={{ color: colorScheme.colors.text }}
              numberOfLines={1}
            >
              {item.username}
            </Text>
            <Text 
              className="text-sm leading-5" 
              style={{ color: subtitleColor }}
              numberOfLines={1}
            >
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
      <SafeAreaView className="flex-1" style={{ backgroundColor: colorScheme.colors.background }}>
        <View className="p-5 rounded-2xl mt-6 mx-4 shadow-sm" style={{ backgroundColor: colorScheme.colors.card }}>
          <Text className="text-2xl font-bold mb-2" style={{ color: colorScheme.colors.text }}>
            {error}
          </Text>
          <Text className="text-base mb-4 leading-6" style={{ color: subtitleColor }}>
            There was a problem loading the channels. This could be due to a network issue or the server might be unavailable.
          </Text>
          <TouchableOpacity 
            className="flex-row items-center justify-center py-3.5 px-5 rounded-xl mt-3"
            style={{ backgroundColor: colorScheme.colors.primary }}
            onPress={() => window.location.reload()}
          >
            <Text className="text-base font-semibold text-white">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colorScheme.colors.background }}>
      <CommonHeader title="Explore" showBackButton={true} />
      <ScrollView 
        className="flex-1"
        style={{ backgroundColor: colorScheme.colors.background }}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {isLoading ? (
          <View className="p-5 rounded-2xl mt-6 mx-4 shadow-sm" style={{ backgroundColor: colorScheme.colors.card }}>
            <ActivityIndicator size="large" color={colorScheme.colors.primary} />
            <Text className="text-base text-center mt-4" style={{ color: subtitleColor }}>
              Loading channels...
            </Text>
          </View>
        ) : channels.length > 0 ? (
          <View className="px-4">
            <View className="py-3 px-4 mt-2 bg-transparent">
              <Text className="text-xs font-semibold uppercase tracking-wider" style={{ color: subtitleColor }}>
                AVAILABLE CHANNELS
              </Text>
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
          <View className="p-5 rounded-2xl mt-6 mx-4 shadow-sm" style={{ backgroundColor: colorScheme.colors.card }}>
            <Text className="text-2xl font-bold mb-2" style={{ color: colorScheme.colors.text }}>
              No channels found
            </Text>
            <Text className="text-base mb-4 leading-6" style={{ color: subtitleColor }}>
              There are currently no channels available. Please check back later.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
} 