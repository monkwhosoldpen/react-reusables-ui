"use client";

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Channel } from '@/lib/types/channel.types';
import { MessageCircle } from 'lucide-react';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { JoinButton } from '@/components/common/JoinButton';
import { FollowButton } from '@/components/common/FollowButton';
import { useAuth } from '@/lib/contexts/AuthContext';

interface ChannelInfoSectionProps {
  username: string;
  channelDetails: Channel;
  messageCount: number;
  children: React.ReactNode;
}

const ChannelInfoSection = ({ username, channelDetails, messageCount, children }: ChannelInfoSectionProps) => {
  const { colorScheme } = useColorScheme();
  const { user } = useAuth();
  const hasAccess = channelDetails.is_public || user?.id;

  return (
    <View style={styles.container}>
      <View className="flex-row items-center gap-2 p-2 rounded bg-primary/10">
        <MessageCircle size={12} color={colorScheme.colors.primary} />
        <Text className="text-xs text-primary">
          {messageCount}
        </Text>
        {channelDetails.is_public ? (
          <FollowButton 
            username={channelDetails.username}
            size="sm"
            showIcon={false}
          />
        ) : (
          <JoinButton 
            username={channelDetails.username}
            channelDetails={channelDetails}
            size="sm"
            showIcon={false}
          />
        )}
      </View>

      <View style={styles.contentWrapper}>
        <View style={styles.contentContainer}>
          {children}
        </View>
        {!hasAccess && (
          <View style={[
            styles.overlay,
            { backgroundColor: colorScheme.colors.background }
          ]} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    position: 'relative',
    marginTop: 8,
  },
  contentContainer: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.7,
    zIndex: 1,
  }
});

export default ChannelInfoSection; 