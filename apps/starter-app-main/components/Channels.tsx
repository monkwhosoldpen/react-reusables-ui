'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Search, Loader2, Compass, UserMinus, MessageCircle, CheckCheck, Clock, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Channel, ExtendedChannel } from '@/lib/types/channel.types';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import React from 'react';
import { indexedDB } from '@/lib/services/indexedDB';

// Update the interfaces at the top of the file
interface UserInfo {
  id: string;
  email: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
  last_sign_in_at: string | null;
  app_metadata: any;
  user_metadata: any;
  followedChannels: string[];
  channelActivityRecords: any[];
  channelViewedByUserRecords: any[];
  language: string;
  notifications_enabled: boolean;
  tenantRequests?: any[];
  data?: {
    testDebug?: {
      filteredChannelActivity: Array<{
        username: string;
        isFollowed: boolean;
        isApproved: boolean;
        activity_data: {
          username: string;
          message_count: number;
          last_message?: {
            message_text: string;
            created_at: string;
          };
          last_updated_at: string;
        };
      }>;
      _only_usernames: string[];
      only_usernames_channel_activity_records: Array<{
        username: string;
        message_count: number;
        last_message?: {
          message_text: string;
          created_at: string;
        };
        last_updated_at: string;
      }>;
    };
  };
}

// Add these interfaces at the top of the file
interface ChannelActivity {
  username: string;
  message_count: number;
  last_message?: {
    message_text: string;
    created_at: string;
  };
  last_updated_at: string;
}

interface ChannelViewRecord {
  username: string;
  message_count: number;
  last_viewed: string;
}

interface FilteredActivityRecord {
  username: string;
  isFollowed: boolean;
  isApproved: boolean;
  activity_data: ChannelActivity;
}

interface TestDebugData {
  filteredChannelActivity: FilteredActivityRecord[];
  _only_usernames: string[];
  only_usernames_channel_activity_records: ChannelActivity[];
}

interface UserInfoData {
  testDebug?: TestDebugData;
}


const EmptyState = React.memo(({ onExploreClick }: { onExploreClick: () => void }) => (
  <div className="flex flex-col items-center justify-center h-[70vh] text-center p-6">
    <div className="w-20 h-20 mb-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
      <MessageCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
    </div>
    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
      {'No Followed Channels'}
    </h3>
    <Button 
      onClick={onExploreClick}
      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6"
    >
      <span>{'Explore Channels'}</span>
    </Button>
  </div>
));
EmptyState.displayName = 'EmptyState';

// Create a memoized loading state component
const LoadingState = React.memo(() => (
  <div className="flex flex-col items-center justify-center h-[70vh]">
    <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-600 dark:text-emerald-400" />
    </div>
    <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
  </div>
));
LoadingState.displayName = 'LoadingState';

// Create a memoized channel item component
const ChannelItem = React.memo(({ 
  index,
  channel, 
  onChannelClick,
}: { 
  index: number,
  channel: ExtendedChannel,
  onChannelClick: (channel: Channel) => void,
}) => (
  <div
    key={index}
    onClick={() => onChannelClick(channel)}
    className={cn(
      "flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors",
      "border-b border-gray-100 dark:border-gray-800 last:border-0"
    )}
  >
    <Avatar className="h-12 w-12 mr-4 flex-shrink-0">
      <AvatarImage src={`https://placehold.co/200x200/emerald/white?text=${channel.username.substring(0, 2).toUpperCase()}`} />
      <AvatarFallback>{channel.username.substring(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
    
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
            {channel.username}
          </h3>
          {channel.isApproved && (
            <CheckCheck className="h-4 w-4 text-emerald-500" />
          )}
          {channel.isFollowing && (
            <ArrowUpRight className="h-4 w-4 text-blue-500" />
          )}
        </div>
        {(channel.unreadCount && channel.unreadCount > 0) ? (
          <Badge variant="default" className="ml-2 bg-emerald-500">
            {channel.unreadCount}
          </Badge>
        ) : null}
      </div>
      {channel.lastMessage && (
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <p className="truncate">{channel.lastMessage.message_text}</p>
          <span className="mx-2">•</span>
          <Clock className="h-3 w-3 mr-1" />
          <span className="whitespace-nowrap">
            {new Date(channel.lastMessage.created_at).toLocaleDateString()}
          </span>
        </div>
      )}
    </div>
  </div>
));

ChannelItem.displayName = 'ChannelItem';

export default function ChannelsPage() {

  return null;
} 
