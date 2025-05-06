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
  onJoin?: () => void;
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

    setShowDialog(true);
    setShowLogin(!user);
    if (user) {
      setCurrentStep(0); // Reset to first step when opening dialog
    }
  }

  // Handle successful login
  const handleLoginSuccess = async () => {
    await refreshUserInfo();
    setShowLogin(false);
  }

  const handleNextStep = async () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      try {
        const success = await completeChannelOnboarding(username, channelDetails as Channel);

        if (success) {
          setShowDialog(false);
          setHasJoined(true);
          onJoin?.();
          toast.success(`You've joined @${username}`);
        } else {
          toast.error('Failed to complete channel onboarding');
        }
      } catch (error) {
        toast.error('Failed to complete channel onboarding');
      }
    }
  }

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }

    setIsLoginLoading(true)
    setError('')

    try {
      await signIn(email, password)
      handleLoginSuccess()
    } catch (err) {
      setError('Invalid email or password')
    } finally {
      setIsLoginLoading(false)
    }
  }

  const handleAnonymousSignIn = async () => {
    setIsLoginLoading(true)
    setError('')

    try {
      await signInAnonymously()
      handleLoginSuccess()
    } catch (err) {
      setError('Failed to sign in anonymously')
    } finally {
      setIsLoginLoading(false)
    }
  }

  const handleGuestSignIn = async () => {
    setIsLoginLoading(true)
    setError('')

    try {
      await signInAsGuest()
      handleLoginSuccess()
    } catch (err) {
      setError('Failed to sign in as guest')
    } finally {
      setIsLoginLoading(false)
    }
  }

  const handleComplete = async () => {
    console.log('Channel details before completing onboarding:', channelDetails);
    console.log('Is tenant channel:', channelDetails?.is_owner_db);
    const success = await completeChannelOnboarding(username, channelDetails);
    if (success) {
      console.log('Channel onboarding completed successfully');
      setHasJoined(true);
      setShowDialog(false);
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