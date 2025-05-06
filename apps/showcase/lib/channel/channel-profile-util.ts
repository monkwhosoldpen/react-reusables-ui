"use client";

import React, { useEffect, useState, useRef } from 'react';
import { View, ScrollView, useWindowDimensions, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Loader2 } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { ChannelSidebar } from '~/components/channel-profile/ChannelSidebar';
import { ChannelDebugInfo } from '~/components/channel-profile/ChannelDebugInfo';
import { ChannelHeader } from '~/components/channel-profile/ChannelHeader';
import { Channel, ChannelResponse } from '~/lib/core/types/channel.types';
import { config } from '~/lib/core/config';
import { useRealtime } from '~/lib/core/providers/RealtimeProvider';
import { FormDataType } from '~/lib/enhanced-chat/types/superfeed';
import { FeedItem } from '~/lib/enhanced-chat/components/feed/FeedItem';
import { AuthHelper } from '../core/helpers/AuthHelpers';

/**
 * Channel response structure based on actual API response:
 * 
 * {
 *   mainChannel: {
 *     isFollowing: false,
 *     is_agent: false,
 *     is_enhanced_chat: true,
 *     is_owner_db: true,
 *     is_premium: true,
 *     is_public: false,
 *     is_realtime: false,
 *     is_update_only: true,
 *     last_message: {id: '', message_text: '', text: '', created_at: ''},
 *     last_updated_at: "",
 *     onboardingConfig: {welcomescreen: {...}, screens: Array(3), finishscreen: {...}},
 *     owner_username: "janedoe",
 *     parent_channel: {
 *       username: 'janedoe', 
 *       stateName: 'Telangana', 
 *       is_premium: true, 
 *       is_update_only: true, 
 *       is_public: true, 
 *       ...
 *     },
 *     parliamentaryConstituency: "",
 *     products: [],
 *     products_count: 0,
 *     related_channels: [...],
 *     related_channels_count: 10,
 *     stateName: "Unknown",
 *     tenant_supabase_anon_key: "...",
 *     tenant_supabase_url: "https://risbemjewosmlvzntjkd.supabase.co",
 *     username: "janedoe_farmers"
 *   }
 * }
 */

// Access status types
export type AccessStatus = 'NONE' | 'PARTIAL' | 'FULL' | string;

// 👇 New custom hook
export default function useChannelData(usernameStr: string) {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<FormDataType[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [accessStatus, setAccessStatus] = useState<AccessStatus>('NONE');
  const { user, isGuest, refreshUserInfo } = AuthHelper();

  useEffect(() => {
    let isMounted = true;

    const fetchChannel = async () => {
      try {
        console.log(`Fetching channel data for @${usernameStr}...`);
        const res = await fetch(`${config.api.endpoints.channels.base}/${usernameStr}`);

        if (!res.ok) {
          throw new Error(res.status === 404 ?
            `Channel @${usernameStr} not found` :
            'Failed to fetch channel details');
        }

        const data: ChannelResponse = await res.json();
        console.log('Channel response data:', data);
        
        if (isMounted) {
          setChannel(data.mainChannel);
          setError(null);
          
          // Now that we have channel details, fetch messages
          console.log(`Channel details loaded, fetching messages for @${usernameStr}...`);
          await fetchChannelMessages(usernameStr);
        }
      } catch (err) {
        console.error('Error fetching channel:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load channel');
          setChannel(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };


    const fetchChannelMessages = async (username: string) => {
      if (!isMounted) return;
      
      
      try {
        setLoadingMessages(true);
        console.log(`Calling messages API for channel @${username}...`);
        console.log(`Current user ID being passed: ${user?.id || 'undefined'}`);
        
        // Ensure we have a valid user ID to pass to the API
        const userId = user?.id || '';
        
        // Call the messages API endpoint with optional pagination params
        const res = await fetch(`${config.api.endpoints.channels.base}/${username}/messages?page_size=20&user_id=${userId}`);
        
        if (!res.ok) {
          throw new Error(res.status === 404 ?
            `Messages for @${username} not found` :
            'Failed to fetch channel messages');
        }
        
        const messageData = await res.json();
        console.log(`Received ${messageData.messages?.length || 0} messages for @${username}`);
        
        // Only log the access_status
        console.log('Access status:', messageData.access_status);
        
        if (isMounted) {
          // Save access status
          setAccessStatus(messageData.access_status || 'NONE');
          
          // Save messages
          setMessages(messageData.messages || []);
          setMessageError(null);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
        if (isMounted) {
          setMessageError(err instanceof Error ? err.message : 'Failed to load messages');
          setMessages([]);
        }
      } finally {
        if (isMounted) {
          setLoadingMessages(false);
        }
      }
    };

    fetchChannel();
    
    return () => {
      isMounted = false;
    };
  }, [usernameStr, user]);

  return {
    channel,
    loading,
    error,
    messages,
    loadingMessages,
    messageError,
    accessStatus,
  };
}
