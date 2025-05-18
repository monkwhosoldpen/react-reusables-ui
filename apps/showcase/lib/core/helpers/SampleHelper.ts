'use client';

import { supabase } from '~/lib/core/supabase';
import { ChannelActivity, Channel, ChannelMessage, TenantRequest, UserInfo } from '~/lib/core/types/channel.types';
import { config } from '~/lib/core/config';
import { User } from '@supabase/supabase-js';
import { useInAppDB, UserChannelFollow } from '../providers/InAppDBProvider';

interface PushSubscriptionData {
  user_id: string;
  endpoint: string;
  keys: any;
  device_type: string;
  browser: string;
  os: string;
  platform: string;
  device_id: string;
  app_version: string;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface SampleHelperReturn {
  testFn: (username: string) => Promise<void>;
  updateLanguagePreference: (language: string) => Promise<void>;
  updateNotificationPreference: (enabled: boolean) => Promise<void>;
  updatePushSubscription: (subscription: PushSubscription, enabled: boolean) => Promise<void>;
  isFollowingChannel: (username: string) => Promise<boolean>;
  followChannel: (username: string) => Promise<void>;
  unfollowChannel: (username: string) => Promise<void>;
  getChannelActivity: () => Promise<{
    channelActivityRecords: ChannelActivity[];
  }>;
  fetchChannelDetails: (username: string) => Promise<{
    channelData: Channel | null;
    error: string | null;
  }>;
  completeChannelOnboarding: (channelUsername: string, channelDetails: Channel) => Promise<any>;
  fetchChannelMessages: (
    username: string, 
    pageSize: number, 
    lastTimestamp?: string | null
  ) => Promise<{
    messages: ChannelMessage[];
    accessStatus: any;
    hasMore: boolean;
    error: string | null;
  }>;
  updateChannelLastViewed: (username: string) => Promise<boolean>;
}

export function SampleHelper(user: User | null, isGuest: boolean, userInfo: UserInfo | null): SampleHelperReturn {

  const inappDb = useInAppDB();

  const testFn = async (username: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  };

  const updateLanguagePreference = async (language: string): Promise<void> => {
    
    if (!user?.id) return;
    
    try {
      // Update backend for non-guest users
      if (!isGuest) {
        const response = await fetch(config.api.endpoints.user.language, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            language,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to save language preference');
        }
      }

      // Update InAppDB
      await inappDb.setUserLanguage(user.id, language);
      
    } catch (error) {
      throw error;
    }
  };

  const updateNotificationPreference = async (enabled: boolean): Promise<void> => {
    if (!user) {
      return;
    }

    try {
      const response = await fetch(config.api.endpoints.user.notification, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          notifications_enabled: enabled,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save notification preference');
      }
      await inappDb.setUserNotifications(user.id, enabled);   
      
    } catch (error) {
      console.error('[SampleHelper] Failed to update notification preference', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        userId: user.id,
        enabled,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  };

  const updatePushSubscription = async (subscription: PushSubscription, enabled: boolean): Promise<void> => {
    if (!user) {
      return;
    }

    try {
      // First update InAppDB
      const subscriptionData: PushSubscriptionData = {
        user_id: user.id,
        endpoint: subscription.endpoint,
        keys: subscription.toJSON().keys,
        device_type: 'web',
        browser: navigator.userAgent,
        os: navigator.platform,
        platform: 'browser',
        device_id: subscription.endpoint,
        app_version: '1.0.0',
        notifications_enabled: enabled,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await inappDb.savePushSubscription(subscriptionData);

      const supabaseData = {
        user_id: user.id,
        endpoint: subscription.endpoint,
        keys: JSON.stringify({
          p256dh: subscription.toJSON().keys?.p256dh,
          auth: subscription.toJSON().keys?.auth,
        }),
        device_type: 'web',
        browser: navigator.userAgent,
        os: navigator.platform,
        platform: 'browser',
        device_id: subscription.endpoint,
        app_version: '1.0.0',
        notifications_enabled: enabled,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('push_subscriptions')
        .upsert(supabaseData, {
          onConflict: 'endpoint'
        });

      if (error) {
        throw error;
      }

    } catch (error) {
      throw error;
    }
  };

  // Channel Management Functions
  const isFollowingChannel = async (username: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      const followRecord = await inappDb.getUserChannelFollow(user.id);
      return !!followRecord;
    } catch (err) {
      return false;
    }
  };

  const followChannel = async (username: string): Promise<void> => {
    if (!user?.id) throw new Error('User not authenticated');
    
    try {
      
      // Make API call if not a guest user
      if (!isGuest) {
        const endpoint = `${config.api.endpoints.follow}?username=${encodeURIComponent(username)}&userId=${encodeURIComponent(user.id)}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error(`Failed to follow channel: ${response.status}`);
        }

        const followData: UserChannelFollow = {
          user_id: user.id,
          username: username,
          followed_at: new Date().toISOString()
        };
        inappDb.saveUserChannelFollow(user.id, followData);
      }
      
      // No need to refresh user info since we're using the passed user state
    } catch (error) {
      throw error; // Re-throw to allow callers to handle the error
    }
  };

  const unfollowChannel = async (username: string): Promise<void> => {
    if (!user?.id) throw new Error('User not authenticated');
    
    try {
      // Get the current record before deletion (to restore if needed)
      const existingRecord = await inappDb.getUserChannelFollow(user.id);
      
      // Make API call if not a guest user
      if (!isGuest) {
        const endpoint = `${config.api.endpoints.follow}?username=${encodeURIComponent(username)}&userId=${encodeURIComponent(user.id)}`;
        const response = await fetch(endpoint, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        if (!response.ok) {
          // If API call fails, restore the record in InAppDB
          if (existingRecord) {
            const unfollowData: UserChannelFollow = {
              user_id: user.id,
              username: username,
              followed_at: new Date().toISOString()
            };
            inappDb.saveUserChannelUnFollow(user.id, unfollowData);
          }
          throw new Error(`Failed to unfollow channel: ${response.status}`);
        }
      }
      
      // No need to refresh user info since we're using the passed user state
    } catch (error) {
      throw error; // Re-throw to allow callers to handle the error
    }
  };

  const getChannelActivity = async () => {
    if (!user) {
      return {
        channelActivityRecords: [],
        userLanguage: 'english',
        tenantRequests: []
      };
    }

    try {
      // Use userInfo from AuthHelper instead of making API call
      if (userInfo) {
        const channelActivityRecords = await inappDb.getAllRawData(user.id);
        
        return {
          channelActivityRecords: channelActivityRecords.channels_activity || [],
        };
      }

      const rawData = await inappDb.getAllRawData(user.id);

      return {
        channelActivityRecords: rawData.channels_activity || [],
      };

    } catch (error) {
      // Return local data as fallback
      const rawData = await inappDb.getAllRawData(user.id);

      return {
        channelActivityRecords: [],
        userLanguage: rawData.user_language?.[0]?.language || 'english',
        tenantRequests: rawData.tenant_requests || []
      };
    }
  };

  // New function to fetch channel details
  const fetchChannelDetails = async (username: string) => {
    let channelData: Channel | null = null;
    let error: string | null = null;

    try {
      // Step 1: Fetch channel details from API
      const response = await fetch(`${config.api.endpoints.channels.base}/${username}`);

      if (!response.ok) {
        if (response.status === 404) {
          error = `Channel @${username} not found`;
        } else {
          error = 'Failed to fetch channel details';
        }
        return { channelData: null, error };
      }

      channelData = await response.json();

      // Sort related channels if they exist
      if (channelData && channelData.related_channels && Array.isArray(channelData.related_channels)) {
        channelData.related_channels.sort((a, b) =>
          a.username.localeCompare(b.username)
        );
      }
      
      return { channelData, error: null };
      
    } catch (err) {
      error = 'An error occurred while loading the channel';
      return { channelData: null, error };
    }
  };

  // New function to handle channel onboarding completion
  const completeChannelOnboarding = async (channelUsername: string, channelDetails: Channel) => {
    try {
      
      if (!channelDetails) {
        return false;
      }
      
      const userId = user?.id || 'guest-id';
      
      const endpoint = `${config.api.endpoints.channels.base}/${channelDetails.username}/request-access`;
      
      const requestPayload = {
        user_id: userId,
        username: channelUsername,
        config: {
          channel: channelUsername,
          user_id: userId,
          timestamp: new Date().toISOString(),
          onboarding_completed: true
        }
      };
      
      // Use the Vercel API endpoint instead of direct Supabase call
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });
      
      
      if (!response.ok) {
        const errorData = await response.json();
        return false;
      } else {
        const data = await response.json();
        
        // If there are specific fields in the response that indicate success, log them
        if (data.success) {
        }
        if (data.status) {
        }
        if (data.message) {
        }
        if (data.access_granted) {
        }
        
        // Return the full response object instead of just true
        return data;
      }
    } catch (error) {
      if (error instanceof Error) {
      }
      return false;
    }
  };

  // New function to handle fetching channel messages
  const fetchChannelMessages = async (
    username: string, 
    pageSize: number, 
    lastTimestamp: string | null = null
  ) => {
    try {
      // Use the Vercel API endpoint instead of direct Supabase call
      const queryParams = new URLSearchParams({
        user_id: user?.id || '',
        username: username,
        page_size: pageSize.toString()
      });

      // Add last_message_timestamp if provided
      if (lastTimestamp) {
        queryParams.append('last_message_timestamp', lastTimestamp);
      }

      const response = await fetch(`${config.api.endpoints.channels.base}/${username}/messages?${queryParams.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        return {
          messages: [],
          accessStatus: {},
          hasMore: false,
          error: 'Failed to fetch channel messages'
        };
      } 
      
      const data = await response.json();

      // Extract messages from the response
      const messagesData = data?.messages || [];

      // Sort messages to have newest at the bottom
      const sortedMessages = [...messagesData].sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      return {
        messages: sortedMessages,
        accessStatus: data?.access_status || {},
        hasMore: data?.has_more || false,
        error: null
      };
    } catch (error) {
      return {
        messages: [],
        accessStatus: {},
        hasMore: false,
        error: 'An error occurred while loading messages'
      };
    }
  };

  // New function to update the last viewed timestamp for a channel
  const updateChannelLastViewed = async (username: string): Promise<boolean> => {
    try {
      // Only proceed if we have a user ID
      if (!user?.id || !username) {
        return false;
      }

      const response = await fetch(`${config.api.endpoints.channels.base}/${username}/last-viewed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id
        }),
      });

      if (!response.ok) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  };

  // Return all functions and state
  return {
    testFn,
    updateLanguagePreference,
    updateNotificationPreference,
    updatePushSubscription,
    isFollowingChannel,
    followChannel,
    unfollowChannel,
    getChannelActivity,
    fetchChannelDetails,
    completeChannelOnboarding,
    fetchChannelMessages,
    updateChannelLastViewed,
  };
}
