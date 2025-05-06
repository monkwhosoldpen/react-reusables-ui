"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
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
export default function useChannelData(usernameStr: string, refreshKey: number = 0) {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<FormDataType[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [accessStatus, setAccessStatus] = useState<AccessStatus>('NONE');
  const { user, isGuest, refreshUserInfo } = AuthHelper();

  console.log('[useChannelData] Hook initialized for channel:', usernameStr);
  console.log('[useChannelData] Current user state:', user ? 'Logged in' : 'Not logged in');
  console.log('[useChannelData] Is guest user:', isGuest);
  console.log('[useChannelData] Using refresh key:', refreshKey);

  // Create a refreshMessages function
  const refreshMessages = useCallback(async () => {
    console.log('[useChannelData] Refreshing messages for channel:', usernameStr);
    if (!user) {
      console.log('[useChannelData] No user, cannot refresh messages');
      return;
    }

    try {
      setLoadingMessages(true);
      console.log(`[useChannelData] Refreshing messages API for channel @${usernameStr}...`);
      
      // Ensure we have a valid user ID to pass to the API
      const userId = user?.id || '';
      
      // Call the messages API endpoint with optional pagination params
      const apiUrl = `${config.api.endpoints.channels.base}/${usernameStr}/messages?page_size=20&user_id=${userId}`;
      console.log(`[useChannelData] Messages refresh API URL: ${apiUrl}`);
      
      const res = await fetch(apiUrl);
      console.log(`[useChannelData] Messages refresh API response status:`, res.status);
      
      if (!res.ok) {
        throw new Error(res.status === 404 ?
          `Messages for @${usernameStr} not found` :
          'Failed to fetch channel messages');
      }
      
      const messageData = await res.json();
      console.log(`[useChannelData] Received ${messageData.messages?.length || 0} refreshed messages for @${usernameStr}`);
      console.log('[useChannelData] Refreshed access status from API:', messageData.access_status);
      
      // Save access status
      console.log(`[useChannelData] Setting refreshed access status to: ${messageData.access_status || 'NONE'}`);
      setAccessStatus(messageData.access_status || 'NONE');
      
      // Save messages
      console.log('[useChannelData] Updating messages state with refreshed data');
      setMessages(messageData.messages || []);
      setMessageError(null);
    } catch (err) {
      console.error('[useChannelData] Error refreshing messages:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to refresh messages';
      console.error('[useChannelData] Setting message error state during refresh:', errorMsg);
      // Don't update state on error to preserve existing messages
    } finally {
      setLoadingMessages(false);
      console.log('[useChannelData] Completed message refresh');
    }
  }, [usernameStr, user]);

  useEffect(() => {
    let isMounted = true;
    console.log('[useChannelData] Effect triggered with username:', usernameStr);
    console.log('[useChannelData] Current user ID:', user?.id);
    console.log('[useChannelData] Refresh key in effect:', refreshKey);

    const fetchChannel = async () => {
      try {
        console.log(`[useChannelData] Fetching channel data for @${usernameStr}...`);
        const apiUrl = `${config.api.endpoints.channels.base}/${usernameStr}`;
        console.log(`[useChannelData] API URL: ${apiUrl}`);
        
        const res = await fetch(apiUrl);
        console.log(`[useChannelData] Channel API response status:`, res.status);

        if (!res.ok) {
          throw new Error(res.status === 404 ?
            `Channel @${usernameStr} not found` :
            'Failed to fetch channel details');
        }

        const data: ChannelResponse = await res.json();
        console.log('[useChannelData] Channel response data:', data);
        console.log('[useChannelData] Channel is_public:', data.mainChannel?.is_public);
        console.log('[useChannelData] Channel is_owner_db:', data.mainChannel?.is_owner_db);
        
        if (isMounted) {
          console.log('[useChannelData] Updating channel state with retrieved data');
          setChannel(data.mainChannel);
          setError(null);
          
          // Now that we have channel details, fetch messages
          console.log(`[useChannelData] Channel details loaded, fetching messages for @${usernameStr}...`);
          await fetchChannelMessages(usernameStr);
        }
      } catch (err) {
        console.error('[useChannelData] Error fetching channel:', err);
        if (isMounted) {
          const errorMsg = err instanceof Error ? err.message : 'Failed to load channel';
          console.error('[useChannelData] Setting error state:', errorMsg);
          setError(errorMsg);
          setChannel(null);
        }
      } finally {
        if (isMounted) {
          console.log('[useChannelData] Completed channel fetch, setting loading to false');
          setLoading(false);
        }
      }
    };

    const fetchChannelMessages = async (username: string) => {
      if (!isMounted) return;
      
      try {
        console.log(`[useChannelData] Starting message fetch for @${username}`);
        setLoadingMessages(true);
        console.log(`[useChannelData] Calling messages API for channel @${username}...`);
        console.log(`[useChannelData] Current user ID being passed: ${user?.id || 'undefined'}`);
        
        // Ensure we have a valid user ID to pass to the API
        const userId = user?.id || '';
        
        // Call the messages API endpoint with optional pagination params
        const apiUrl = `${config.api.endpoints.channels.base}/${username}/messages?page_size=20&user_id=${userId}`;
        console.log(`[useChannelData] Messages API URL: ${apiUrl}`);
        
        const res = await fetch(apiUrl);
        console.log(`[useChannelData] Messages API response status:`, res.status);
        
        if (!res.ok) {
          throw new Error(res.status === 404 ?
            `Messages for @${username} not found` :
            'Failed to fetch channel messages');
        }
        
        const messageData = await res.json();
        console.log(`[useChannelData] Received ${messageData.messages?.length || 0} messages for @${username}`);
        console.log('[useChannelData] Access status from API:', messageData.access_status);
        
        if (isMounted) {
          // Save access status
          console.log(`[useChannelData] Setting access status to: ${messageData.access_status || 'NONE'}`);
          setAccessStatus(messageData.access_status || 'NONE');
          
          // Save messages
          console.log('[useChannelData] Updating messages state with received data');
          setMessages(messageData.messages || []);
          setMessageError(null);
        }
      } catch (err) {
        console.error('[useChannelData] Error fetching messages:', err);
        if (isMounted) {
          const errorMsg = err instanceof Error ? err.message : 'Failed to load messages';
          console.error('[useChannelData] Setting message error state:', errorMsg);
          setMessageError(errorMsg);
          setMessages([]);
        }
      } finally {
        if (isMounted) {
          console.log('[useChannelData] Completed message fetch, setting loadingMessages to false');
          setLoadingMessages(false);
        }
      }
    };

    fetchChannel();
    
    return () => {
      console.log('[useChannelData] Cleanup - Component unmounting');
      isMounted = false;
    };
  }, [usernameStr, user, refreshKey]);

  console.log('[useChannelData] Current state on render:', {
    loading,
    hasChannel: !!channel,
    hasError: !!error,
    messageCount: messages.length,
    loadingMessages,
    hasMessageError: !!messageError,
    accessStatus,
    refreshKey
  });

  return {
    channel,
    loading,
    error,
    messages,
    loadingMessages,
    messageError,
    accessStatus,
    refreshMessages
  };
}
