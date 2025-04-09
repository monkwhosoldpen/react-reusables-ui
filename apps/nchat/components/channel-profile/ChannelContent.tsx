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
    if (!userInfo?.tenantRequests?.length) return false;
    return userInfo.tenantRequests.some(request => request.username === username);
  }, [userInfo, username]);

  // Memoized function to get tenant request status
  const getTenantRequestStatus = useCallback(() => {
    if (!userInfo?.tenantRequests?.length) return null;
    const relevantRequest = userInfo.tenantRequests.find(request => request.username === username);
    return relevantRequest?.status || null;
  }, [userInfo, username]);

  // Memoized check if user has access to this channel
  const hasChannelAccess = useMemo(() => {
    if (!channelDetails) return false;
    return channelDetails.is_public || 
      (hasTenantRequest && getTenantRequestStatus() === "approved");
  }, [channelDetails, hasTenantRequest, getTenantRequestStatus]);

  // Memoize fetchChannelDetails to prevent unnecessary re-renders
  const fetchChannelDetails = useCallback(async (username: string) => {
    try {
      const response = await fetch(`${config.api.endpoints.channels.base}/${username}`);
      if (!response.ok) {
        if (response.status === 404) {
          return { channelData: null, error: `Channel @${username} not found` };
        }
        return { channelData: null, error: 'Failed to fetch channel details' };
      }
      const channelData = await response.json();
      return { channelData, error: null };
    } catch (err) {
      console.error('Error fetching channel details:', err);
      return { channelData: null, error: 'An error occurred while loading the channel' };
    }
  }, []); // Empty dependency array since this function doesn't depend on any props or state

  // Fetch channel details only ONCE
  useEffect(() => {
    let isMounted = true;
    
    async function loadChannelDetails() {
      if (!username) return;
      
      setIsLoading(true);
      try {
        const { channelData, error } = await fetchChannelDetails(username);
        
        // Only update state if component is still mounted
        if (!isMounted) return;
        
        if (error) {
          setError(error);
        } else {
          setChannelDetails(channelData);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching channel details:', error);
          setError('An error occurred while loading the channel');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadChannelDetails();
    
    // Cleanup to prevent state updates if unmounted
    return () => {
      isMounted = false;
    };
  }, [username, fetchChannelDetails]); // Only run when username changes

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
        {/* Channel Sidebar */}
        <ChannelSidebar
          username={username}
          channelDetails={channelDetails}
          selectedChannel={username}
        />

        <div
          className={cn(
            "flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-950",
            "relative"
          )}
        >
          {/* Tenant Request Status - Only show for private channels */}
          {!isPublic && (
            <div className={cn(
              "py-2 px-4 text-sm border-b",
              tenantRequestStatus === "approved" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" :
              tenantRequestStatus === "pending" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300" :
              tenantRequestStatus === "denied" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" :
              "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            )}>
              <strong>Status:</strong> {tenantRequestStatus ? 
                `${tenantRequestStatus}` : 
                "NONE"}
            </div>
          )}
          
          {/* Messages Container */}
          <div 
            ref={messagesContainerRef}
            className={cn(
              "flex-1 overflow-y-auto p-4 space-y-4 relative",
              isPublic ? "bg-green-50 dark:bg-green-950/20" : "bg-red-50 dark:bg-red-950/20"
            )}
          >
            {/* Blur overlay for no-access channels */}
            {!hasChannelAccess && (
              <div className="absolute inset-0 backdrop-blur-md bg-white/50 dark:bg-black/50 z-10 pointer-events-none" />
            )}
            
            {/* <ChannelMessages
              messages={messages}
              messagesLoading={messagesLoading || hookMessagesLoading}
              messagesError={hookMessagesError || messagesError}
              messagesEndRef={messagesEndRef}
              onLoadMore={handleLoadMore}
              channelDetails={channelDetails}
              onRefreshMessages={refreshMessages}
            /> */}

            {/* Loading indicator for pagination */}
            {/* {(messagesLoading || hookMessagesLoading) && messages.length > 0 && !hasMoreMessages && (
              <div className="flex justify-center p-4">
                <Spinner size="small" />
              </div>
            )} */}
            
            {!hasChannelAccess && (
              <div className="sticky bottom-4 flex justify-center z-20 mt-8 transition-opacity duration-300 opacity-100">
                <JoinButton 
                  username={username}
                  buttonText="Join this channel" 
                  size="lg"
                  showIcon={true}
                  className="shadow-lg"
                />
              </div>
            )}
            
            {/* Private channel notice */}
            {!isPublic && (
              <div className="mt-2 text-center p-2 bg-red-100 dark:bg-red-900/20 rounded text-xs text-red-600 dark:text-red-400">
                {hasChannelAccess 
                  ? "This is a private channel. Message loading has a 3-second delay."
                  : "This is a private channel. Scroll down to see the join button."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
