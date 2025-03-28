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
