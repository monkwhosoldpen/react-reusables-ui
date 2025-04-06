'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Heart } from 'lucide-react-native';
import { LoginDialog } from './LoginDialog';
import { View, Text } from 'react-native';

interface FollowButtonProps {
  username: string;
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  showIcon?: boolean;
  initialFollowing?: boolean;
}

export function FollowButton({ 
  username, 
  size = 'default', 
  className = '',
  showIcon = false,
  initialFollowing
}: FollowButtonProps) {
  const { user, refreshUserInfo, isFollowingChannel, followChannel, unfollowChannel } = useAuth();
  
  // Use local state to track following status and loading state
  const [following, setFollowing] = useState(initialFollowing ?? false);
  const [loading, setLoading] = useState(false);
  // Add state for login dialog
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  
  // Flag to track if we should follow after login
  const shouldFollowAfterLogin = useRef(false);
  
  // Load initial following status from AuthContext
  useEffect(() => {
    const loadFollowStatus = async () => {
      // If initialFollowing is provided, use that
    if (initialFollowing !== undefined) {
      setFollowing(initialFollowing);
        return;
      }
      
      // Only check follow status if user is logged in
      if (user) {
        setLoading(true);
        try {
          const isFollowed = await isFollowingChannel(username);
      setFollowing(isFollowed);
        } catch (err) {
          console.error('Error checking follow status:', err);
        } finally {
          setLoading(false);
        }
    }
    };
    
    loadFollowStatus();
  }, [initialFollowing, isFollowingChannel, username, user]);
  
  // Watch for user changes and trigger follow action if needed
  useEffect(() => {
    // If user becomes available and we should follow after login
    if (user && shouldFollowAfterLogin.current) {
      // Reset the flag
      shouldFollowAfterLogin.current = false;
      
      // Execute follow action with a small delay to ensure auth state is fully updated
      setTimeout(() => {
        executeFollowAction();
      }, 300);
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps
  
  const executeFollowAction = async () => {
    if (!user) return;
    
    setLoading(true);
    // Always set to true (follow) when coming from login
    setFollowing(true);
    
    try {
      // Use AuthContext method to follow the channel
      await followChannel(username);
      
      // Show success message
      toast.success(`Following @${username}`);
    } catch (error) {
      // Show error message
      toast.error(`Failed to follow channel`);
      
      // Revert optimistic update on error
      setFollowing(false);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFollow = async () => {
    if (!user) return;
    
    setLoading(true);
    setFollowing(true); // Optimistic update
    
    try {
      // Use AuthContext method to follow the channel
      await followChannel(username);
      
      // Show success message
        toast.success(`Following @${username}`);
    } catch (error) {
      console.error('Error following channel:', error);
      toast.error(`Failed to follow channel`);
      
      // Revert optimistic update on error
      setFollowing(false);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUnfollow = async () => {
    if (!user) return;
    
    setLoading(true);
    setFollowing(false); // Optimistic update
    
    try {
      // Use AuthContext method to unfollow the channel
      await unfollowChannel(username);
      
      // Show success message
      toast.success(`Unfollowed @${username}`);
    } catch (error) {
      console.error('Error unfollowing channel:', error);
      toast.error(`Failed to unfollow channel`);
      
      // Revert optimistic update on error
      setFollowing(true);
    } finally {
      setLoading(false);
    }
  };
  
  const handleToggleFollow = async () => {
    if (!user) {
      // Set flag to follow after login
      shouldFollowAfterLogin.current = true;
      // Show login dialog
      setShowLoginDialog(true);
      return;
    }
    
    if (following) {
      await handleUnfollow();
    } else {
      await handleFollow();
    }
  };
  
  // Handle successful login
  const handleLoginSuccess = () => {
    setShowLoginDialog(false);
  };
  
  return (
    <View>
      <Button
        variant={following ? "default" : "outline"}
        size={size}
        className={cn(
          "gap-2 font-medium",
          following && "bg-blue-500 hover:bg-blue-600 text-white",
          !following && "text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-950",
          className
        )}
        onPress={handleToggleFollow}
        disabled={loading}
      >
        {loading ? (
          <Text>Loading...</Text>
        ) : (
          <View>
            {showIcon && (
              <Heart 
                className={cn(
                  "h-4 w-4", 
                  following ? "fill-current" : "text-blue-500 dark:text-blue-400"
                )} 
              />
            )}
            <Text>{following ? 'Following' : 'Follow'}</Text>
          </View>
        )}
      </Button>
      
      {showLoginDialog && (
        <LoginDialog
          isOpen={showLoginDialog} 
          onOpenChange={setShowLoginDialog} 
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </View>
  );
} 