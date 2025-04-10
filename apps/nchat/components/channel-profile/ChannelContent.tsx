"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ChannelMessages } from './ChannelMessages'
import { useChannelMessages } from '@/lib/hooks/useChannelMessages'
import { Channel } from '@/lib/types/channel.types'
import { Button } from "@/components/ui/button"
import { useRouter } from 'expo-router'
import { ChannelHeader } from '@/components/channel-profile/ChannelHeader'
import { ChannelSidebar } from '@/components/channel-profile/ChannelSidebar'
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from '@/lib/contexts/AuthContext'
import { JoinButton } from '@/components/common/JoinButton'
import { config } from '~/lib/config'

// Add logger utility
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[ChannelContent] ${message}`, data ? data : '');
  },
  error: (message: string, error?: any) => {
    console.error(`[ChannelContent] ${message}`, error ? error : '');
  },
  warn: (message: string, data?: any) => {
    console.warn(`[ChannelContent] ${message}`, data ? data : '');
  }
};

export function ChannelContent({ username }: { username: string }) {
  const router = useRouter()
  const { user, userInfo, updateChannelLastViewed } = useAuth()
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Base state for the component
  const [isLoading, setIsLoading] = useState(true)
  const [channelDetails, setChannelDetails] = useState<Channel | null>(null)
  const [error, setError] = useState<string | null>(null)

  // State for messages
  const [tenantRequestStatus, setTenantRequestStatus] = useState<string | null>(null)

  // Memoized value to check if user has tenant access
  const hasTenantRequest = useMemo(() => {
    if (!userInfo?.tenantRequests?.length) {
      logger.info('No tenant requests found for user');
      return false;
    }
    const hasRequest = userInfo.tenantRequests.some(request => request.username === username);
    logger.info(`Tenant request check for ${username}: ${hasRequest}`);
    return hasRequest;
  }, [userInfo, username]);

  // Memoized function to get tenant request status
  const getTenantRequestStatus = useCallback(() => {
    if (!userInfo?.tenantRequests?.length) {
      logger.info('No tenant requests available to check status');
      return null;
    }
    const relevantRequest = userInfo.tenantRequests.find(request => request.username === username);
    const status = relevantRequest?.status || null;
    logger.info(`Tenant request status for ${username}: ${status}`);
    return status;
  }, [userInfo, username]);

  // Memoized check if user has access to this channel
  const hasChannelAccess = useMemo(() => {
    if (!channelDetails) {
      logger.warn('Channel details not available for access check');
      return false;
    }
    const access = channelDetails.is_public ||
      (hasTenantRequest && getTenantRequestStatus() === "approved") ||
      (userInfo?.user_metadata?.username === username); // Use user_metadata.username
    logger.info(`Channel access check for ${username}: ${access}`);
    return access;
  }, [channelDetails, hasTenantRequest, getTenantRequestStatus, userInfo, username]);

  // Memoize fetchChannelDetails to prevent unnecessary re-renders
  const fetchChannelDetails = useCallback(async (username: string) => {
    logger.info(`Fetching channel details for ${username}`);
    try {
      const response = await fetch(`${config.api.endpoints.channels.base}/${username}`);
      if (!response.ok) {
        if (response.status === 404) {
          logger.warn(`Channel @${username} not found`);
          return { channelData: null, error: `Channel @${username} not found` };
        }
        logger.error(`Failed to fetch channel details for ${username}`, { status: response.status });
        return { channelData: null, error: 'Failed to fetch channel details' };
      }
      const channelData = await response.json();
      logger.info(`Successfully fetched channel details for ${username}`, {
        isPublic: channelData.is_public,
        relatedChannelsCount: channelData.related_channels?.length || 0,
        relatedChannels: channelData.related_channels?.map((c: any) => c.username)
      });
      return { channelData, error: null };
    } catch (err) {
      logger.error(`Error fetching channel details for ${username}`, err);
      return { channelData: null, error: 'An error occurred while loading the channel' };
    }
  }, []);

  // Fetch channel details only ONCE
  useEffect(() => {
    let isMounted = true;

    async function loadChannelDetails() {
      if (!username) {
        logger.warn('No username provided for channel details');
        return;
      }

      setIsLoading(true);
      logger.info(`Loading channel details for ${username}`);
      try {
        const { channelData, error } = await fetchChannelDetails(username);

        if (!isMounted) {
          logger.info('Component unmounted before channel details could be loaded');
          return;
        }

        if (error) {
          logger.error(`Error loading channel details: ${error}`);
          setError(error);
        } else {
          logger.info(`Successfully set channel details for ${username}`);
          setChannelDetails(channelData);
        }
      } catch (error) {
        if (isMounted) {
          logger.error('Unexpected error while loading channel details', error);
          setError('An error occurred while loading the channel');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadChannelDetails();

    return () => {
      logger.info('Cleaning up channel details fetch');
      isMounted = false;
    };
  }, [username, fetchChannelDetails]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Spinner size="large" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onPress={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  // Channel not found state
  if (!channelDetails) {
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <div className="text-muted-foreground mb-4">Channel not found</div>
        <Button onPress={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const isPublic = channelDetails.is_public;

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {/* Channel Header */}
      <ChannelHeader
        username={username}
        channelDetails={channelDetails}
      />

      {/* Content Container with Scrollable Sidebar and Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <ChannelSidebar
          username={username}
          channelDetails={channelDetails}
          selectedChannel={username}
        />

      </div>
    </div>
  );
}
