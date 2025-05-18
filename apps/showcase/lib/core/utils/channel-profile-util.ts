"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Channel, ChannelResponse } from '~/lib/core/types/channel.types';
import { config } from '~/lib/core/config';
import { FormDataType } from '~/lib/enhanced-chat/types/superfeed';
import { AuthHelper } from '../helpers/AuthHelpers';

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


  // Create a refreshMessages function
  const refreshMessages = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      setLoadingMessages(true);
      
      // Ensure we have a valid user ID to pass to the API
      const userId = user?.id || '';
      
      // Call the messages API endpoint with optional pagination params
      const apiUrl = `${config.api.endpoints.channels.base}/${usernameStr}/messages?page_size=20&user_id=${userId}`;
      
      const res = await fetch(apiUrl);
      
      if (!res.ok) {
        throw new Error(res.status === 404 ?
          `Messages for @${usernameStr} not found` :
          'Failed to fetch channel messages');
      }
      
      const messageData = await res.json();
      
      // Save access status
      setAccessStatus(messageData.access_status || 'NONE');
      
      // Save messages
      setMessages(messageData.messages || []);
      setMessageError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to refresh messages';
      // Don't update state on error to preserve existing messages
    } finally {
      setLoadingMessages(false);
    }
  }, [usernameStr, user]);

  useEffect(() => {
    let isMounted = true;

    const fetchChannel = async () => {
      try {
        const apiUrl = `${config.api.endpoints.channels.base}/${usernameStr}`;
        
        const res = await fetch(apiUrl);

        if (!res.ok) {
          throw new Error(res.status === 404 ?
            `Channel @${usernameStr} not found` :
            'Failed to fetch channel details');
        }

        const data: ChannelResponse = await res.json();
        
        if (isMounted) {
          setChannel(data.mainChannel);
          setError(null);
          
          // Now that we have channel details, fetch messages
          await fetchChannelMessages(usernameStr);
        }
      } catch (err) {
        if (isMounted) {
          const errorMsg = err instanceof Error ? err.message : 'Failed to load channel';
          setError(errorMsg);
          setChannel(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const fetchChannelMessages = async (username: string) => {
      if (!isMounted) return;
      
      try {
        setLoadingMessages(true);
        
        // Ensure we have a valid user ID to pass to the API
        const userId = user?.id || '';
        
        // Call the messages API endpoint with optional pagination params
        const apiUrl = `${config.api.endpoints.channels.base}/${username}/messages?page_size=20&user_id=${userId}`;
        
        const res = await fetch(apiUrl);
        
        if (!res.ok) {
          throw new Error(res.status === 404 ?
            `Messages for @${username} not found` :
            'Failed to fetch channel messages');
        }
        
        const messageData = await res.json();
        
        if (isMounted) {
          // Save access status
          setAccessStatus(messageData.access_status || 'NONE');
          
          // Save messages
          setMessages(messageData.messages || []);
          setMessageError(null);
        }
      } catch (err) {
        if (isMounted) {
          const errorMsg = err instanceof Error ? err.message : 'Failed to load messages';
          setMessageError(errorMsg);
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
  }, [usernameStr, user, refreshKey]);

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
