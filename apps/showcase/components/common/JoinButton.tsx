"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/contexts/AuthContext"
import { toast } from "sonner"
import { UserPlus, ArrowRight, Check, Loader2 } from 'lucide-react-native'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import LoginCommon from './LoginCommon'
import { View, Text, StyleSheet } from 'react-native'
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider'
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider'
import { Channel } from '@/lib/types/channel.types'

interface JoinButtonProps {
  username: string;
  buttonText?: string;
  size?: 'sm' | 'lg' | 'default' | 'icon';
  channelDetails?: Channel;
  showIcon?: boolean;
  onJoin?: () => void;
  onRequestAccess?: () => void;
  isRequested?: boolean;
  requestStatus?: string | null;
  isLoading?: boolean;
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontWeight: '600',
  },
  dialogView: {
    padding: 16,
    borderRadius: 8,
    gap: 16,
  },
  dialogHeader: {
    marginBottom: 16,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  dialogDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  dialogFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
  onboardingStep: {
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
});

export function JoinButton({
  username,
  channelDetails,
  buttonText = 'Join',
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

  const renderDialogContent = () => {
    if (showLogin) {
      return (
        <View style={[styles.dialogView, {
          backgroundColor: colorScheme.colors.card,
          padding: Number(design.spacing.padding.card),
          borderRadius: Number(design.radius.lg),
          gap: Number(design.spacing.gap),
          borderColor: colorScheme.colors.border,
          borderWidth: StyleSheet.hairlineWidth,
        }]}>
          <View style={styles.dialogHeader}>
            <Text style={[styles.dialogTitle, { color: colorScheme.colors.text }]}>
              Sign in to join channels
            </Text>
            <Text style={[styles.dialogDescription, { color: colorScheme.colors.text }]}>
              Please sign in to join this channel and start connecting with others.
            </Text>
          </View>
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
        </View>
      )
    }

    return (
      <View style={[styles.dialogView, {
        backgroundColor: colorScheme.colors.card,
        padding: Number(design.spacing.padding.card),
        borderRadius: Number(design.radius.lg),
        gap: Number(design.spacing.gap),
        borderColor: colorScheme.colors.border,
        borderWidth: StyleSheet.hairlineWidth,
      }]}>
        <View style={styles.dialogHeader}>
          <Text style={[styles.dialogTitle, { color: colorScheme.colors.text }]}>
            {onboardingSteps[currentStep].title}
          </Text>
          <Text style={[styles.dialogDescription, { color: colorScheme.colors.text }]}>
            {onboardingSteps[currentStep].description}
          </Text>
        </View>

        <View style={styles.dialogFooter}>
          <Button
            variant="outline"
            onPress={() => setShowDialog(false)}
          >
            Cancel
          </Button>
          <Button
            onPress={handleNextStep}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 size={20} color={colorScheme.colors.text} />
            ) : currentStep === onboardingSteps.length - 1 ? (
              'Join Channel'
            ) : (
              'Next'
            )}
          </Button>
        </View>
      </View>
    )
  }

  return (
    <View>
      <Button
        variant={hasJoined ? "outline" : "default"}
        size={size}
        onPress={handleClick}
        disabled={isRequested || isButtonLoading}
        {...props}
      >
        <View style={styles.buttonContainer}>
          {showIcon && !isButtonLoading && (
            hasJoined ? (
              <Check size={20} color={colorScheme.colors.text} />
            ) : (
              <UserPlus size={20} color={colorScheme.colors.text} />
            )
          )}
          {isButtonLoading && (
            <Loader2 size={20} color={colorScheme.colors.text} className="animate-spin" />
          )}
          <Text style={[styles.buttonText, { color: colorScheme.colors.text }]}>
            {isRequested ? 'Requested' : hasJoined ? 'Joined' : buttonText}
          </Text>
        </View>
      </Button>
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className='sm:max-w-[425px]'>
          {renderDialogContent()}
        </DialogContent>
      </Dialog>
    </View>
  );
} 