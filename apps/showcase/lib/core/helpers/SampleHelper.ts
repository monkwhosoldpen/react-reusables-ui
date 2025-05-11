'use client';

import { indexedDB } from '~/lib/core/services/indexedDB';
import { supabase } from '~/lib/core/supabase';
import { ChannelActivity, Channel, ChannelMessage, TenantRequest } from '~/lib/core/types/channel.types';
import { config } from '~/lib/core/config';
import { User } from '@supabase/supabase-js';

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
    userLanguage: string;
    tenantRequests: TenantRequest[];
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

export function SampleHelper(user: User | null, isGuest: boolean): SampleHelperReturn {

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

      // Update IndexedDB
      await indexedDB.setUserLanguage(user.id, language);
      
    } catch (error) {
      throw error;
    }
  };

  const updateNotificationPreference = async (enabled: boolean): Promise<void> => {
   
    if (!user) return;

    try {
      // Update backend
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

      // Update IndexedDB
      await indexedDB.setUserNotifications(user.id, enabled);
      
    } catch (error) {
      throw error;
    }
  };

  const updatePushSubscription = async (subscription: PushSubscription, enabled: boolean): Promise<void> => {
    
    if (!user) return;
    
    try {
      // First update IndexedDB
      const subscriptionData: PushSubscriptionData = {
        user_id: user.id,
        endpoint: subscription.endpoint,
        keys: subscription.toJSON().keys,
        device_type: 'unknown',
        browser: 'unknown',
        os: 'unknown',
        platform: 'unknown',
        device_id: 'unknown',
        app_version: 'unknown',
        notifications_enabled: enabled,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await indexedDB.savePushSubscription(subscriptionData);

      // Then update backend
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: subscription.endpoint,
          keys: JSON.stringify({
            p256dh: subscription.toJSON().keys?.p256dh,
            auth: subscription.toJSON().keys?.auth,
          }),
          device_type: 'unknown',
          browser: 'unknown',
          os: 'unknown',
          platform: 'unknown',
          device_id: 'unknown',
          app_version: 'unknown',
          notifications_enabled: enabled,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'endpoint'
        });

      if (error) throw error;

    } catch (error) {
      throw error;
    }
  };

  // Channel Management Functions
  const isFollowingChannel = async (username: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      // Check if the follow record exists in IndexedDB using composite key
      const followRecord = await indexedDB.get('user_channel_follow', [user.id, username]);
      return !!followRecord;
    } catch (err) {
      console.error('Error checking follow status:', err);
      return false;
    }
  };

  const followChannel = async (username: string): Promise<void> => {
    if (!user?.id) throw new Error('User not authenticated');
    
    try {
      // Create follow record in IndexedDB
      await indexedDB.put('user_channel_follow', {
        user_id: user.id,
        username: username,
        followed_at: new Date().toISOString()
      });
      
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
          // If API call fails, remove from IndexedDB to maintain consistency
          await indexedDB.delete('user_channel_follow', [user.id, username]);
          throw new Error(`Failed to follow channel: ${response.status}`);
        }
      }
      
      // No need to refresh user info since we're using the passed user state
    } catch (error) {
      console.error('Error following channel:', error);
      throw error; // Re-throw to allow callers to handle the error
    }
  };

  const unfollowChannel = async (username: string): Promise<void> => {
    if (!user?.id) throw new Error('User not authenticated');
    
    try {
      // Get the current record before deletion (to restore if needed)
      const existingRecord = await indexedDB.get('user_channel_follow', [user.id, username]);
      
      // Delete follow record from IndexedDB
      await indexedDB.delete('user_channel_follow', [user.id, username]);
      
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
          // If API call fails, restore the record in IndexedDB
          if (existingRecord) {
            await indexedDB.put('user_channel_follow', existingRecord);
          }
          throw new Error(`Failed to unfollow channel: ${response.status}`);
        }
      }
      
      // No need to refresh user info since we're using the passed user state
    } catch (error) {
      console.error('Error unfollowing channel:', error);
      throw error; // Re-throw to allow callers to handle the error
    }
  };

  const getChannelActivity = async () => {
    if (!user) return {
      channelActivityRecords: [],
      userLanguage: 'english',
      tenantRequests: []
    };

    try {
      // Fetch from API instead of direct Supabase call
      const response = await fetch(`${config.api.endpoints.myinfo}?userId=${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isGuest: false
        })
      });
      
      const data = await response.json();

      if (data.success) {
        try {
          // Save all raw API data to IndexedDB
          await indexedDB.saveRawApiData(user.id, data);
          
          // Extract relevant data for returning
          const preferences = data.userPreferences;
          
          // Extract language from user_language array
          const language = preferences.user_language?.length > 0 
            ? preferences.user_language[0].language 
            : 'english';
          
          // Extract tenant requests from either field - handle both possible names
          const tenantRequests = preferences.tenant_requests || preferences.tena || [];
          
          // Return the data the UI expects
          return {
            channelActivityRecords: preferences.channels_activity || [],
            userLanguage: language,
            tenantRequests: tenantRequests
          };
        } catch (syncError) {
          console.error('Error syncing data to IndexedDB:', syncError);
        }
      }

      // If no API data or sync failed, return local data from IndexedDB
      const rawData = await indexedDB.getAllRawData(user.id);
      const localLanguage = rawData.user_language?.length > 0 
        ? rawData.user_language[0].language 
        : 'english';
      const localTenantRequests = rawData.tenant_requests || [];
      const localChannelActivity = rawData.channels_activity || [];

      return {
        channelActivityRecords: localChannelActivity,
        userLanguage: localLanguage,
        tenantRequests: localTenantRequests
      };

    } catch (error) {
      console.error('Failed to fetch user data:', error);
      // Return local data as fallback
      const rawData = await indexedDB.getAllRawData(user.id);
      const localLanguage = rawData.user_language?.length > 0 
        ? rawData.user_language[0].language 
        : 'english';
      const localTenantRequests = rawData.tenant_requests || [];
      
      return {
        channelActivityRecords: [],
        userLanguage: localLanguage,
        tenantRequests: localTenantRequests
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
      console.error('Error fetching channel details:', err);
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
        console.error('Error fetching messages:', errorData);
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
      console.error('Error fetching messages:', error);
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
        console.error('Failed to update last viewed timestamp');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating last viewed timestamp:', error);
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
