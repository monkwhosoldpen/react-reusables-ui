"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/contexts/AuthContext"
import { toast } from "sonner"
import { UserPlus, ArrowRight, Check, Loader2 } from 'lucide-react-native'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import LoginCommon from '@/components/common/LoginCommon'
import { View, Text, StyleSheet } from 'react-native'
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider'
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider'
import { Channel } from '@/lib/types/channel.types'

interface JoinButtonProps {
  username: string;
  buttonText?: string;
  size?: 'sm' | 'md' | 'lg' | 'default';
  channelDetails?: Channel;
  className?: string;
  showIcon?: boolean;
  onJoin?: () => void;
  onRequestAccess?: () => void;
  isRequested?: boolean;
  requestStatus?: string | null;
  isLoading?: boolean;
}

export function JoinButton({
  username,
  channelDetails,
  buttonText = 'Join',
  className,
  size = 'default',
  showIcon = true,
  onJoin,
  onRequestAccess,
  isRequested = false,
  requestStatus = null,
  isLoading: externalLoading = false,
  ...props
}: JoinButtonProps) {
  const { user, signIn, signInAnonymously, signInAsGuest, refreshUserInfo, completeChannelOnboarding } = useAuth()
  const { colorScheme, isDarkMode } = useColorScheme()
  const { design } = useDesign()
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

  // Log channel details and access status
  useEffect(() => {
    console.log('JoinButton State:', {
      username,
      channelDetails,
      isRequested,
      requestStatus,
      hasJoined,
      isLoading,
      showDialog,
      showLogin,
      currentStep
    });
  }, [username, channelDetails, isRequested, requestStatus, hasJoined, isLoading, showDialog, showLogin, currentStep]);

  // Function to handle button click
  const handleClick = () => {
    console.log('[JoinButton] handleClick called', {
      username,
      isRequested,
      requestStatus,
      hasJoined
    });
    
    if (isRequested) {
      console.log('Access already requested, status:', requestStatus);
      return;
    }

    setShowDialog(true);
    setShowLogin(!user);
    if (user) {
      setCurrentStep(0); // Reset to first step when opening dialog
    }
  }

  // Handle successful login
  const handleLoginSuccess = async () => {
    console.log('[JoinButton] Login successful');
    await refreshUserInfo();
    setShowLogin(false);
  }

  const handleNextStep = async () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      try {
        console.log('Completing onboarding with:', { 
          username, 
          channelDetails,
          isRequested,
          requestStatus 
        });
        
        // Call completeChannelOnboarding with both username and channelDetails
        const success = await completeChannelOnboarding(username, channelDetails as Channel);

        if (success) {
          console.log('Channel onboarding completed successfully');
          setShowDialog(false);
          setHasJoined(true);
          onJoin?.();
          toast.success(`You've joined @${username}`);
        } else {
          console.warn('Channel onboarding completion had an issue');
          toast.error('Failed to complete channel onboarding');
        }
      } catch (error) {
        console.error('Error during onboarding completion:', error);
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

  const dialogStyles = StyleSheet.create({
    dialogView: {
      backgroundColor: colorScheme.colors.background,
      borderColor: colorScheme.colors.border,
      borderRadius: Number(design.radius.lg),
      padding: Number(design.spacing.padding.card),
      width: '100%',
      maxWidth: 400,
    },
    dialogHeader: {
      marginBottom: Number(design.spacing.padding.card),
    },
    dialogTitle: {
      fontSize: Number(design.spacing.fontSize.xl),
      fontWeight: '600',
      color: colorScheme.colors.text,
      marginBottom: Number(design.spacing.padding.item),
    },
    dialogDescription: {
      fontSize: Number(design.spacing.fontSize.base),
      color: colorScheme.colors.text,
      opacity: 0.7,
    },
    onboardingContent: {
      alignItems: 'center',
      gap: Number(design.spacing.gap) * 2,
      padding: Number(design.spacing.padding.card),
    },
    onboardingTitle: {
      fontSize: Number(design.spacing.fontSize.lg),
      fontWeight: '600',
      color: colorScheme.colors.text,
      textAlign: 'center',
    },
    onboardingDescription: {
      fontSize: Number(design.spacing.fontSize.base),
      color: colorScheme.colors.text,
      textAlign: 'center',
      opacity: Number(design.opacity.medium),
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: Number(design.spacing.gap),
    },
    button: {
      backgroundColor: colorScheme.colors.primary,
      borderRadius: Number(design.radius.md),
      paddingHorizontal: Number(design.spacing.padding.item),
      paddingVertical: Number(design.spacing.padding.item) / 2,
    },
    buttonText: {
      color: colorScheme.colors.background,
      fontSize: Number(design.spacing.fontSize.sm),
      fontWeight: '500',
    },
    buttonIcon: {
      color: colorScheme.colors.background,
    },
  });

  const renderDialogContent = () => {
    if (showLogin) {
      return (
        <>
          <DialogHeader style={dialogStyles.dialogHeader}>
            <DialogTitle style={dialogStyles.dialogTitle}>Sign in to join channels</DialogTitle>
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
          <DialogHeader style={dialogStyles.dialogHeader}>
            <DialogTitle style={dialogStyles.dialogTitle}>
              Welcome back, {user.email}
            </DialogTitle>
            <DialogDescription style={dialogStyles.dialogDescription}>
              You're already signed in. Ready to join @{username}?
            </DialogDescription>
          </DialogHeader>
        </>
      )
    }

    // Show regular onboarding steps
    return (
      <>
        <DialogHeader style={dialogStyles.dialogHeader}>
          <DialogTitle style={dialogStyles.dialogTitle}>
            {onboardingSteps[currentStep].title}
          </DialogTitle>
          <DialogDescription style={dialogStyles.dialogDescription}>
            {onboardingSteps[currentStep].description}
          </DialogDescription>
        </DialogHeader>
      </>
    )
  }

  return (
    <View style={{ position: 'relative' }}>
      <Button 
        onPress={handleClick}
        variant={hasJoined ? "default" : "outline"}
        style={{
          borderRadius: Number(design.radius.md),
          paddingHorizontal: Number(design.spacing.padding.item),
          paddingVertical: Number(design.spacing.padding.item) / 2,
          backgroundColor: hasJoined ? colorScheme.colors.primary : 'transparent',
          borderColor: hasJoined ? 'transparent' : colorScheme.colors.primary,
        }}
        disabled={isButtonLoading || isRequested}
        {...props}
      >
        {isButtonLoading ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Number(design.spacing.gap) }}>
            <Loader2 
              size={Number(design.spacing.iconSize)}
              color={hasJoined ? colorScheme.colors.background : colorScheme.colors.primary}
              style={{ transform: [{ rotate: '45deg' }] }}
            />
            <Text style={{ 
              color: hasJoined ? colorScheme.colors.background : colorScheme.colors.primary,
              fontSize: Number(design.spacing.fontSize.sm)
            }}>Loading...</Text>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Number(design.spacing.gap) }}>
            {showIcon && (
              <UserPlus 
                size={Number(design.spacing.iconSize)}
                color={hasJoined ? colorScheme.colors.background : colorScheme.colors.primary}
              />
            )}
            <Text style={{ 
              color: hasJoined ? colorScheme.colors.background : colorScheme.colors.primary,
              fontSize: Number(design.spacing.fontSize.sm),
              fontWeight: '500'
            }}>
              {isRequested ? `Request ${requestStatus || 'Pending'}` : (hasJoined ? 'Joined' : buttonText)}
            </Text>
          </View>
        )}
      </Button>
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="w-[90%] sm:max-w-[425px] mx-auto">
          {renderDialogContent()}

          <DialogFooter>
            <View style={dialogStyles.buttonContainer}>
              {showLogin ? (
                <Button onPress={() => setShowDialog(false)} variant="outline">
                  <Text>Cancel</Text>
                </Button>
              ) : (
                <Button onPress={handleNextStep} variant="default">
                  <View style={dialogStyles.buttonContainer}>
                    <Text style={dialogStyles.buttonText}>
                      {currentStep === onboardingSteps.length - 1 ? 'Finish' : 'Next'}
                    </Text>
                    {currentStep === onboardingSteps.length - 1 ? (
                      <Check size={Number(design.spacing.iconSize)} color={colorScheme.colors.background} />
                    ) : (
                      <ArrowRight size={Number(design.spacing.iconSize)} color={colorScheme.colors.background} />
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