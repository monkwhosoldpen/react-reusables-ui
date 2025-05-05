"use client";

import React from 'react';
import { View, Text } from 'react-native';
import { Channel } from '~/lib/core/types/channel.types';
import { MessageCircle } from 'lucide-react';
import { useColorScheme } from '~/lib/core/providers/theme/ColorSchemeProvider';
import { JoinButton } from '~/components/common/JoinButton';
import { FollowButton } from '~/components/common/FollowButton';
import { useAuth } from '~/lib/core/contexts/AuthContext';

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
    <View>
      <View className="flex-row items-center gap-2 p-2 bg-primary/10">
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

      <View className="flex-1 relative">
        <View className="flex-1">
          {children}
        </View>
        {!hasAccess && (
          <View 
            className="absolute inset-0 z-10 opacity-70"
            style={{ backgroundColor: colorScheme.colors.background }}
          />
        )}
      </View>
    </View>
  );
};

export default ChannelInfoSection; 