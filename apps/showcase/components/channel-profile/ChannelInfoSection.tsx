"use client";

import React from 'react';
import { View, Text } from 'react-native';
import { Channel } from '~/lib/core/types/channel.types';
import { MessageCircle } from 'lucide-react';
import { JoinButton } from '~/components/common/JoinButton';
import { FollowButton } from '~/components/common/FollowButton';
import { useAuth } from '~/lib/core/contexts/AuthContext';
import { AccessStatus } from '~/lib/core/utils/channel-profile-util';

interface ChannelInfoSectionProps {
  username: string;
  channelDetails: Channel;
  messageCount: number;
  accessStatus?: AccessStatus;
  children: React.ReactNode;
}

const ChannelInfoSection = ({ 
  username, 
  channelDetails, 
  messageCount, 
  accessStatus = 'NONE',
  children 
}: ChannelInfoSectionProps) => {
  
  // Determine access based on both the channel properties and API accessStatus
  const hasAccess = accessStatus === 'FULL' || 
                    (channelDetails.is_public && accessStatus !== 'NONE');

  return (
    <View>
      <View className="flex-row items-center gap-2 p-2 bg-primary/10">
        <MessageCircle size={12} />
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
          />
        )}
      </View>
    </View>
  );
};

export default ChannelInfoSection; 