'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Heart } from 'lucide-react-native';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogPortal,
  DialogOverlay
} from '@/components/ui/dialog';
import LoginCommon from './LoginCommon';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';

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
  const { colorScheme, isDarkMode } = useColorScheme();
  const { design } = useDesign();
  
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
    console.log('Executing follow action');
    if (!user) return;
    
    setLoading(true);
    setFollowing(true);
    
    try {
      // Wait for auth state to be fully synchronized
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Refresh user info to ensure state is up to date
      await refreshUserInfo();
      // Now attempt to follow
      await followChannel(username);
      toast.success(`Following @${username}`);
    } catch (error) {
      console.error('Error following channel:', error);
      toast.error(`Failed to follow channel`);
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
  
  // Add debug effect for dialog state
  useEffect(() => {
    console.log('Dialog state changed:', showLoginDialog);
  }, [showLoginDialog]);
  
  const handleToggleFollow = async () => {
    console.log('handleToggleFollow called, user:', user);
    if (!user) {
      console.log('No user, opening login dialog');
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
  const handleLoginSuccess = async () => {
    console.log('Login successful, executing follow action');
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
      console.error('Email sign in error:', err);
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
      console.error('Anonymous sign in error:', err);
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
      console.error('Guest sign in error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const dialogStyles = StyleSheet.create({
    dialogContent: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    },
    dialogView: {
      width: '90%',
      maxWidth: 400,
      maxHeight: '90%',
      overflow: 'scroll' as const
    }
  });
  
  return (
    <View style={{ position: 'relative' }}>
      <Button
        variant={following ? "default" : "outline"}
        size={size}
        className={cn(
          "gap-2 font-medium",
          following && "bg-primary hover:bg-primary/90 text-white",
          !following && "text-primary border-primary/20 hover:bg-primary/10",
          className
        )}
        style={{
          borderRadius: Number(design.radius.md),
          paddingHorizontal: Number(design.spacing.padding.item),
          paddingVertical: Number(design.spacing.padding.item) / 2,
          backgroundColor: following ? colorScheme.colors.primary : 'transparent',
          borderColor: following ? 'transparent' : colorScheme.colors.primary,
        }}
        onPress={handleToggleFollow}
        disabled={loading}
      >
        {loading ? (
          <Text style={{ 
            color: following ? colorScheme.colors.background : colorScheme.colors.primary,
            fontSize: Number(design.spacing.fontSize.sm)
          }}>Loading...</Text>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Number(design.spacing.gap) }}>
            {showIcon && (
              <Heart 
                size={Number(design.spacing.iconSize)}
                color={following ? colorScheme.colors.background : colorScheme.colors.primary}
                fill={following ? colorScheme.colors.background : 'none'}
              />
            )}
            <Text style={{ 
              color: following ? colorScheme.colors.background : colorScheme.colors.primary,
              fontSize: Number(design.spacing.fontSize.sm),
              fontWeight: '500'
            }}>
              {following ? 'Following' : 'Follow'}
            </Text>
          </View>
        )}
      </Button>
      
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent style={[dialogStyles.dialogContent, {
          backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)',
        }]}>
          <View style={[dialogStyles.dialogView, {
            backgroundColor: colorScheme.colors.card,
            padding: Number(design.spacing.padding.card),
            borderRadius: Number(design.radius.lg),
            gap: Number(design.spacing.gap),
            borderColor: colorScheme.colors.border,
            borderWidth: StyleSheet.hairlineWidth,
          }]}>
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