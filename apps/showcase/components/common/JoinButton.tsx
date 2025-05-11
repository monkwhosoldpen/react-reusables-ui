"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "~/components/ui/button"
import { useAuth } from "~/lib/core/contexts/AuthContext"
import { toast } from "sonner"
import { UserPlus, ArrowRight, Check, Loader2 } from 'lucide-react-native'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "~/components/ui/dialog"
import LoginCommon from '~/components/common/LoginCommon'
import { View, Text } from 'react-native'
import { Channel } from '~/lib/core/types/channel.types'
import { TenantRequest } from '~/lib/core/services/indexedDBSchema'
import { indexedDB } from '~/lib/core/services/indexedDB'

interface JoinButtonProps {
  username: string;
  buttonText?: string;
  size?: 'sm' | 'md' | 'lg' | 'default';
  channelDetails?: Channel;
  accessStatus?: string;
  className?: string;
  showIcon?: boolean;
  onJoin?: (response?: any) => void;
  onRequestAccess?: () => void;
  isLoading?: boolean;
}

export function JoinButton({
  username,
  channelDetails,
  accessStatus,
  buttonText = 'Join',
  className,
  size = 'default',
  showIcon = true,
  onJoin,
  onRequestAccess,
  isLoading: externalLoading = false,
  ...props
}: JoinButtonProps) {
  const { user, signIn, signInAnonymously, signInAsGuest, refreshUserInfo, completeChannelOnboarding, isFollowingChannel } = useAuth()
  const [dbInitialized, setDbInitialized] = useState(false);
  
  const [showDialog, setShowDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoginLoading, setIsLoginLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [showLogin, setShowLogin] = useState(true)

  const onboardingSteps = [
    {
      title: "Welcome to the Channel",
      description: "This is a private channel where you can connect with other members."
    },
    {
      title: "Channel Rules",
      description: "Please be respectful and follow the community guidelines."
    },
    {
      title: "Get Started",
      description: "You're all set! Start exploring the channel and connecting with others."
    }
  ]

  // Combine internal and external loading states
  const isButtonLoading = isLoading || externalLoading;

  // Initialize IndexedDB
  useEffect(() => {
    const initDB = async () => {
      try {
        await indexedDB.initialize();
        setDbInitialized(true);
      } catch (error) {
        // Handle error silently
      }
    };

    initDB();
  }, []);


  // Function to handle button click
  const handleClick = () => {
    console.log('[JoinButton] Button clicked for channel:', username);
    console.log('[JoinButton] User auth state:', user ? 'Logged in' : 'Not logged in');
    console.log('[JoinButton] Channel access status:', accessStatus);

    setShowDialog(true);
    setShowLogin(!user);
    if (user) {
      setCurrentStep(0); // Reset to first step when opening dialog
      console.log('[JoinButton] Dialog opened with user authenticated, starting onboarding at step 0');
    } else {
      console.log('[JoinButton] Dialog opened with login view, user not authenticated');
    }
  }

  // Handle successful login
  const handleLoginSuccess = async () => {
    console.log('[JoinButton] Login successful, refreshing user info');
    await refreshUserInfo();
    console.log('[JoinButton] User info refreshed, transitioning to onboarding flow');
    setShowLogin(false);
  }

  const handleNextStep = async () => {
    console.log('[JoinButton] Current step:', currentStep, 'of', onboardingSteps.length - 1);
    
    if (currentStep < onboardingSteps.length - 1) {
      console.log('[JoinButton] Advancing to next step:', currentStep + 1);
      setCurrentStep(currentStep + 1);
    } else {
      console.log('[JoinButton] Final step reached, completing channel onboarding');
      console.log('[JoinButton] Onboarding payload:', { username, channelDetails });
      
      try {
        console.log('[JoinButton] Calling completeChannelOnboarding API');
        const result = await completeChannelOnboarding(username, channelDetails as Channel);

        if (result && typeof result === 'object') {
          console.log('[JoinButton] Channel onboarding completed successfully with result:', result);
          
          // Check if there's a new access status in the response
          if (result && 'access_status' in result) {
            const typedResult = result as { access_status: string };
            console.log('[JoinButton] New access status received:', typedResult.access_status);
          }
          
          setShowDialog(false);
          setHasJoined(true);
          console.log('[JoinButton] Dialog closed, hasJoined state updated to true');
          onJoin?.(result);
          console.log('[JoinButton] onJoin callback executed with response');
          
          // Check for status in the response to customize the toast message
          if (result && 'status' in result) {
            const typedResult = result as { status: string };
            if (typedResult.status === 'APPROVED') {
              toast.success(`You've joined @${username}`);
            } else if (typedResult.status === 'PENDING') {
              toast.success(`You've requested access to @${username}`);
            } else {
              toast.success(`Request for @${username} submitted`);
            }
          } else {
            toast.success(`You've requested access to @${username}`);
          }
        } else if (result === true) {
          console.log('[JoinButton] Channel onboarding completed successfully');
          setShowDialog(false);
          setHasJoined(true);
          console.log('[JoinButton] Dialog closed, hasJoined state updated to true');
          onJoin?.({});
          console.log('[JoinButton] onJoin callback executed');
          toast.success(`You've requested access to @${username}`);
        } else {
          console.error('[JoinButton] Failed to complete channel onboarding - API returned false');
          toast.error('Failed to complete channel onboarding');
        }
      } catch (error) {
        console.error('[JoinButton] Exception during channel onboarding:', error);
        toast.error('Failed to complete channel onboarding');
      }
    }
  }

  const handleSubmit = async () => {
    if (!email || !password) {
      console.warn('[JoinButton] Login attempted with missing email or password');
      setError('Please enter both email and password')
      return
    }

    console.log('[JoinButton] Attempting to sign in with email');
    setIsLoginLoading(true)
    setError('')

    try {
      await signIn(email, password)
      console.log('[JoinButton] Email sign-in successful');
      handleLoginSuccess()
    } catch (err) {
      console.error('[JoinButton] Email sign-in failed:', err);
      setError('Invalid email or password')
    } finally {
      setIsLoginLoading(false)
    }
  }

  const handleAnonymousSignIn = async () => {
    console.log('[JoinButton] Attempting anonymous sign-in');
    setIsLoginLoading(true)
    setError('')

    try {
      await signInAnonymously()
      console.log('[JoinButton] Anonymous sign-in successful');
      handleLoginSuccess()
    } catch (err) {
      console.error('[JoinButton] Anonymous sign-in failed:', err);
      setError('Failed to sign in anonymously')
    } finally {
      setIsLoginLoading(false)
    }
  }

  const handleGuestSignIn = async () => {
    console.log('[JoinButton] Attempting guest sign-in');
    setIsLoginLoading(true)
    setError('')

    try {
      await signInAsGuest()
      console.log('[JoinButton] Guest sign-in successful');
      handleLoginSuccess()
    } catch (err) {
      console.error('[JoinButton] Guest sign-in failed:', err);
      setError('Failed to sign in as guest')
    } finally {
      setIsLoginLoading(false)
    }
  }

  const handleComplete = async () => {
    console.log('[JoinButton] handleComplete called with channel details:', channelDetails);
    console.log('[JoinButton] Is tenant channel:', channelDetails?.is_owner_db);
    
    console.log('[JoinButton] Calling completeChannelOnboarding API');
    const result = await completeChannelOnboarding(username, channelDetails);
    
    if (result) {
      console.log('[JoinButton] Channel onboarding completed successfully via handleComplete');
      setHasJoined(true);
      setShowDialog(false);
      console.log('[JoinButton] Dialog closed, hasJoined state updated to true');
      onJoin?.(result);
      console.log('[JoinButton] onJoin callback executed with response');
    } else {
      console.error('[JoinButton] Channel onboarding failed in handleComplete');
    }
  };

  const renderDialogContent = () => {
    if (showLogin) {
      return (
        <>
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Sign in to join channels</DialogTitle>
          </DialogHeader>
          <LoginCommon
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            error={error}
            isLoading={isLoginLoading}
            handleSubmit={handleSubmit}
            handleAnonymousSignIn={handleAnonymousSignIn}
            handleGuestSignIn={handleGuestSignIn}
            onCancel={() => setShowDialog(false)}
          />
        </>
      )
    }

    // If user is logged in and on first step, show user details
    if (user && currentStep === 0) {
      return (
        <>
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Welcome back, {user.email}
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600 dark:text-gray-300 opacity-70">
              You're already signed in. Ready to join @{username}?
            </DialogDescription>
          </DialogHeader>
        </>
      )
    }

    // Show regular onboarding steps
    return (
      <>
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {onboardingSteps[currentStep].title}
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 dark:text-gray-300 opacity-70">
            {onboardingSteps[currentStep].description}
          </DialogDescription>
        </DialogHeader>
      </>
    )
  }

  return (
    <View className="relative">
      <Button 
        onPress={handleClick}
        variant={hasJoined ? "default" : "outline"}
        className={`rounded-md px-3 py-1.5 ${hasJoined ? 'bg-primary border-transparent' : 'bg-transparent border-primary'}`}
        disabled={isButtonLoading }
        {...props}
      >
        {isButtonLoading ? (
          <View className="flex-row items-center gap-2">
            <Loader2 
              size={16}
              color={hasJoined ? 'white' : '#3B82F6'}
              className="rotate-45"
            />
            <Text className={`text-sm ${hasJoined ? 'text-white' : 'text-primary'}`}>Loading...</Text>
          </View>
        ) : (
          <View className="flex-row items-center gap-2">
            {showIcon && (
              <UserPlus 
                size={16}
                color={hasJoined ? 'white' : '#3B82F6'}
              />
            )}
            <Text className={`text-sm font-medium ${hasJoined ? 'text-white' : 'text-primary'}`}>
              {
                `Request ${accessStatus || 'NA'}`
              }
            </Text>
          </View>
        )}
      </Button>
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="w-[90%] sm:max-w-[425px] mx-auto">
          {renderDialogContent()}

          <DialogFooter>
            <View className="flex-row justify-center gap-2">
              {showLogin ? (
                <Button onPress={() => setShowDialog(false)} variant="outline">
                  <Text>Cancel</Text>
                </Button>
              ) : (
                <Button onPress={handleNextStep} variant="default">
                  <View className="flex-row justify-center items-center gap-2">
                    <Text className="text-sm font-medium text-white">
                      {currentStep === onboardingSteps.length - 1 ? 'Finish' : 'Next'}
                    </Text>
                    {currentStep === onboardingSteps.length - 1 ? (
                      <Check size={16} color="white" />
                    ) : (
                      <ArrowRight size={16} color="white" />
                    )}
                  </View>
                </Button>
              )}
            </View>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </View>
  );
} 