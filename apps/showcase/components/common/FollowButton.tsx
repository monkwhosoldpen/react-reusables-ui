'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '~/lib/core/contexts/AuthContext';
import { Button } from '~/components/ui/button';
import { toast } from 'sonner';
import { Heart } from 'lucide-react-native';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogPortal,
  DialogOverlay
} from '~/components/ui/dialog';
import LoginCommon from '~/components/common/LoginCommon';
import { View, Text } from 'react-native';
import { indexedDB } from '~/lib/core/services/indexedDB';

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
  const { user, refreshUserInfo, isFollowingChannel, followChannel, unfollowChannel, signInAnonymously, signInAsGuest, signIn } = useAuth();
  
  // Use local state to track following status and loading state
  const [following, setFollowing] = useState(initialFollowing ?? false);
  const [loading, setLoading] = useState(false);
  // Add state for login dialog
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
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
          // Handle error silently
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
  }, [user]);
  
  const executeFollowAction = async () => {
    if (!user) {
      return;
    }
    
    setLoading(true);
    setFollowing(true);
    
    try {
      // Wait for auth state to be fully synchronized
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Refresh user info to ensure state is up to date
      await refreshUserInfo();
      // Now attempt to follow
      await followChannel(username);
      
      // No need to directly update IndexedDB here as followChannel already handles it
      
      toast.success(`Following @${username}`);
    } catch (error) {
      toast.error(`Failed to follow channel`);
      setFollowing(false);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFollow = async () => {
    if (!user) {
      return;
    }
    
    setLoading(true);
    setFollowing(true); // Optimistic update
    
    try {
      await followChannel(username);
      
      // No need to directly update IndexedDB here as followChannel already handles it
      
      toast.success(`Following @${username}`);
    } catch (error) {
      toast.error(`Failed to follow channel`);
      setFollowing(false);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUnfollow = async () => {
    if (!user) {
      return;
    }
    
    setLoading(true);
    setFollowing(false); // Optimistic update
    
    try {
      await unfollowChannel(username);
      
      // No need to directly update IndexedDB here as unfollowChannel already handles it
      
      toast.success(`Unfollowed @${username}`);
    } catch (error) {
      toast.error(`Failed to unfollow channel`);
      setFollowing(true);
    } finally {
      setLoading(false);
    }
  };
  
  const handleToggleFollow = async () => {
    if (!user) {
      shouldFollowAfterLogin.current = true;
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
  const handleLoginSuccess = async () => {
    setShowLoginDialog(false);
    // Wait for auth state to be synchronized
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Refresh user info to ensure state is up to date
    await refreshUserInfo();
    // Execute follow action after login
    await executeFollowAction();
  };
  
  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await signIn(email, password);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await refreshUserInfo();
      setShowLoginDialog(false);
      // Execute follow action after successful email sign in
      await executeFollowAction();
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAnonymousSignIn = async () => {
    setIsLoading(true);
    setError('');

    try {
      await signInAnonymously();
      await new Promise(resolve => setTimeout(resolve, 1000));
      await refreshUserInfo();
      setShowLoginDialog(false);
      // Execute follow action after successful anonymous sign in
      await executeFollowAction();
    } catch (err) {
      setError('Failed to sign in anonymously');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setIsLoading(true);
    setError('');

    try {
      await signInAsGuest();
      await new Promise(resolve => setTimeout(resolve, 1000));
      await refreshUserInfo();
      setShowLoginDialog(false);
      // Execute follow action after successful guest sign in
      await executeFollowAction();
    } catch (err) {
      setError('Failed to sign in as guest');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <View className="relative">
      <Button
        variant={following ? "default" : "outline"}
        size={size}
        className={`rounded-md px-3 py-1.5 ${following ? 'bg-primary border-transparent' : 'bg-transparent border-primary'}`}
        onPress={handleToggleFollow}
        disabled={loading}
      >
        {loading ? (
          <Text className={`text-sm ${following ? 'text-white' : 'text-primary'}`}>Loading...</Text>
        ) : (
          <View className="flex-row items-center gap-2">
            {showIcon && (
              <Heart 
                size={16}
                color={following ? 'white' : '#3B82F6'}
                fill={following ? 'white' : 'none'}
              />
            )}
            <Text className={`text-sm font-medium ${following ? 'text-white' : 'text-primary'}`}>
              {following ? 'Following' : 'Follow'}
            </Text>
          </View>
        )}
      </Button>
      
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="w-[90%] sm:max-w-[425px] mx-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <View className="w-full p-4 gap-4">
            <LoginCommon
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              error={error}
              isLoading={isLoading}
              handleSubmit={handleSubmit}
              handleAnonymousSignIn={handleAnonymousSignIn}
              handleGuestSignIn={handleGuestSignIn}
              onCancel={() => setShowLoginDialog(false)}
            />
          </View>
        </DialogContent>
      </Dialog>
    </View>
  );
} 