"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ChannelMessages } from './ChannelMessages'
import { useChannelMessages } from '@/lib/hooks/useChannelMessages'
import { Channel } from '@/lib/types/channel.types'
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import { ChannelHeader } from '@/components/channel-profile/ChannelHeader'
import { ChannelSidebar } from '@/components/channel-profile/ChannelSidebar'
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from '@/lib/contexts/AuthContext'
import { JoinButton } from '@/components/common/JoinButton'
import { DirectMessages } from '@/components/direct-messages/DirectMessages'
import { useDirectMessages } from '@/lib/hooks/useDirectMessages'

export function ChannelContent({ username }: { username: string }) {
  const router = useRouter()
  const { fetchChannelDetails, user, userInfo, updateChannelLastViewed } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  
  // State for scroll position tracking
  const [scrollCount, setScrollCount] = useState(0)
  const [showJoinButton, setShowJoinButton] = useState(false)

  // Base state for the component
  const [isLoading, setIsLoading] = useState(true)
  const [channelDetails, setChannelDetails] = useState<Channel | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // State for messages
  const [messagesLoading, setMessagesLoading] = useState(true)
  const [messagesError, setMessagesError] = useState<string | null>(null)
  const [messagesInitialized, setMessagesInitialized] = useState(false)
  const [tenantRequestStatus, setTenantRequestStatus] = useState<string | null>(null)
  
  // Determine if this is a direct message or agent channel
  const isDirect = useMemo(() => channelDetails?.is_direct === true, [channelDetails]);
  const isAgent = useMemo(() => channelDetails?.is_agent === true, [channelDetails]);
  const isPublic = useMemo(() => channelDetails?.is_public === true, [channelDetails]);
  
  // Get direct messages if this is a direct or agent channel
  const {
    messages: directMessages,
    messagesLoading: directMessagesLoading,
    messagesError: directMessagesError,
    hasMoreMessages: hasMoreDirectMessages,
    handleLoadMore: handleLoadMoreDirectMessages,
    sendMessage: sendDirectMessage
  } = useDirectMessages({
    recipientId: username,
    isAgent
  });

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

  // Always initialize the hook to fetch real messages
  const {
    messages: channelMessages,
    messagesLoading: hookMessagesLoading,
    messagesError: hookMessagesError,
    hasMoreMessages,
    handleLoadMore,
    fetchMessages
  } = useChannelMessages({ 
    username,
  });

  // Function to handle sending a direct message
  const handleSendDirectMessage = useCallback(async (message: string) => {
    if (!message.trim() || !user?.id) return;
    
    try {
      await sendDirectMessage(message);
      // Scroll to bottom handled in DirectMessages component
    } catch (error) {
      console.error('Error sending direct message:', error);
    }
  }, [user?.id, sendDirectMessage]);

  // Listen for service worker messages
  useEffect(() => {
    if (!navigator.serviceWorker) return;
    
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PUSH_NOTIFICATION' && 
          event.data.notification?.data?.username === username) {
        // Handle notification for this channel
      }
    };

    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, [username]);

  // Track scroll events to show join button
  useEffect(() => {
    // Only add scroll tracking for channels where user doesn't have access
    if (!channelDetails || hasChannelAccess) return;
    
    const messagesContainer = messagesContainerRef.current;
    if (!messagesContainer) return;
    
    // Show join button immediately if content isn't enough to scroll
    const checkIfScrollable = () => {
      if (messagesContainer.scrollHeight <= messagesContainer.clientHeight) {
        // Not enough content to scroll, show join button after a delay
        setTimeout(() => {
          setShowJoinButton(true);
        }, 2000); // 2 second delay to give user time to look at blurred content
      }
    };
    
    // Run the check once messages are loaded
    if (!hookMessagesLoading && channelMessages.length > 0) {
      checkIfScrollable();
    }
    
    // Debounce function to avoid multiple scroll triggers
    let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
    
    const handleScroll = () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      scrollTimeout = setTimeout(() => {
        const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
        
        // Check if user has scrolled at least 70% through the content
        const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
        if (scrollPercentage >= 0.7) {
          setScrollCount(prevCount => {
            // Set to show join button after first significant scroll
            if (prevCount === 0) {
              setShowJoinButton(true);
            }
            return prevCount + 1;
          });
        }
      }, 150); // Debounce for 150ms
    };
    
    messagesContainer.addEventListener('scroll', handleScroll);
    
    // Also handle touch events for mobile
    const handleTouchMove = () => {
      handleScroll();
    };
    
    messagesContainer.addEventListener('touchmove', handleTouchMove);
    
    return () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      messagesContainer.removeEventListener('scroll', handleScroll);
      messagesContainer.removeEventListener('touchmove', handleTouchMove);
    };
  }, [channelDetails, hasChannelAccess, hookMessagesLoading, channelMessages.length]);

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

  // Load messages ONLY ONCE after channel details are loaded
  useEffect(() => {
    let isMounted = true;
    
    // Skip if already initialized, channel details aren't loaded, or userInfo isn't available
    if (messagesInitialized || !channelDetails || !userInfo) return;
    
    // Skip loading channel messages if this is a direct message - those are handled differently
    if (isDirect || isAgent) {
      if (isMounted) {
        setMessagesInitialized(true);
        setMessagesLoading(false);
      }
      return;
    }
    
    async function initializeMessages() {
      setMessagesLoading(true);
      
      try {
        // Update tenant request status
        const status = getTenantRequestStatus();
        if (isMounted) {
          setTenantRequestStatus(status);
        }

        // Add delay for private channels
        if (!channelDetails?.is_public) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
        
        // Always fetch real messages regardless of access
        if (isMounted) {
          await fetchMessages();
          
          // Update last viewed timestamp for users with access
          if (hasChannelAccess) {
            try {
              await updateChannelLastViewed(username);
            } catch (error) {
              console.error('Error updating last viewed timestamp:', error);
            }
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error loading messages:', error);
          setMessagesError('An error occurred while loading messages');
        }
      } finally {
        if (isMounted) {
          setMessagesLoading(false);
          setMessagesInitialized(true); // Mark as initialized to prevent reloading
        }
      }
    }

    initializeMessages();
    
    return () => {
      isMounted = false;
    };
  }, [
    channelDetails,
    userInfo,
    messagesInitialized,
    getTenantRequestStatus,
    username,
    updateChannelLastViewed,
    fetchMessages,
    hasChannelAccess,
    isDirect,
    isAgent
  ]);

  // Refresh function - only call when explicitly needed (e.g., by a refresh button)
  const refreshMessages = useCallback(async () => {
    if (isDirect || isAgent) return; // Skip for direct or agent channels
    
    setMessagesLoading(true);
    
    try {
      await fetchMessages();
    } catch (error) {
      console.error('Error refreshing messages:', error);
      setMessagesError('An error occurred while refreshing messages');
    } finally {
      setMessagesLoading(false);
    }
  }, [fetchMessages, isDirect, isAgent]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Spinner size="large" className="border-t-4 border-r-4" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  // Channel not found state
  if (!channelDetails) {
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <div className="text-muted-foreground mb-4">Channel not found</div>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  // If this is a direct message or agent channel, render different UI
  if (isDirect || isAgent) {
    return (
      <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
        {/* Chat Header */}
        <div className={cn(
          "px-6 py-4 border-b flex items-center",
          !isPublic && "bg-red-50 dark:bg-red-900/20",
          isPublic && "bg-green-50 dark:bg-green-900/20"
        )}>
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center mr-3",
            isAgent ? "bg-purple-100 text-purple-500 dark:bg-purple-900/30 dark:text-purple-300" : 
                     "bg-blue-100 text-blue-500 dark:bg-blue-900/30 dark:text-blue-300"
          )}>
            {channelDetails.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="font-medium text-lg">{channelDetails.username}</h3>
            <div className="flex items-center space-x-2">
              {isAgent && (
                <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 px-2 py-0.5 rounded">
                  Agent
                </span>
              )}
              {isDirect && (
                <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded">
                  Direct
                </span>
              )}
              {isPublic ? (
                <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-0.5 rounded">
                  Public
                </span>
              ) : (
                <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 px-2 py-0.5 rounded">
                  Private
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Messages area - fills remaining height */}
        <div className="flex-1 overflow-hidden">
          <DirectMessages
            messages={directMessages}
            messagesLoading={directMessagesLoading}
            messagesError={directMessagesError}
            messagesEndRef={messagesEndRef}
            onLoadMore={handleLoadMoreDirectMessages}
            onSendMessage={handleSendDirectMessage}
            currentUserId={user?.id}
            isAgent={isAgent}
          />
        </div>
      </div>
    );
  }

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
            
            <ChannelMessages
              messages={channelMessages}
              messagesLoading={messagesLoading || hookMessagesLoading}
              messagesError={hookMessagesError || messagesError}
              messagesEndRef={messagesEndRef}
              onLoadMore={handleLoadMore}
              channelDetails={channelDetails}
              onRefreshMessages={refreshMessages}
            />

            {/* Loading indicator for pagination */}
            {(messagesLoading || hookMessagesLoading) && channelMessages.length > 0 && !hasMoreMessages && (
              <div className="flex justify-center p-4">
                <Spinner size="small" />
              </div>
            )}
            
            {/* Join Button that appears after scrolling - Only show for private channels without access */}
            {!hasChannelAccess && showJoinButton && (
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
