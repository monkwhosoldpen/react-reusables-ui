"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/contexts/AuthContext"
import { toast } from "sonner"
import { UserPlus, ArrowRight, Check } from 'lucide-react-native'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import LoginCommon from './LoginCommon'
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
}

export function JoinButton({
  username,
  channelDetails,
  buttonText = 'Join',
  className,
  size = 'default',
  showIcon = true,
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

  // Function to handle button click
  const handleClick = () => {
    console.log('[JoinButton] handleClick called')
    setShowDialog(true)
    setShowLogin(!user)
    if (user) {
      setCurrentStep(0) // Reset to first step when opening dialog
    }
  }

  // Handle successful login
  const handleLoginSuccess = async () => {
    console.log('[JoinButton] Login successful')
    await refreshUserInfo()
    setShowLogin(false)
  }

  const handleNextStep = async () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      try {
        console.log('Completing onboarding with:', { username, channelDetails })
        // Call completeChannelOnboarding with both username and channelDetails
        const success = await completeChannelOnboarding(username, channelDetails as Channel);

        if (success) {
          console.log('Channel onboarding completed successfully');
          setShowDialog(false)
          setHasJoined(true)
          toast.success(`You've joined @${username}`)
        } else {
          console.warn('Channel onboarding completion had an issue');
          toast.error('Failed to complete channel onboarding')
        }
      } catch (error) {
        console.error('Error during onboarding completion:', error);
        toast.error('Failed to complete channel onboarding')
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
    },
    onboardingContent: {
      alignItems: 'center',
      gap: Number(design.spacing.gap) * 2,
      padding: Number(design.spacing.padding.card)
    },
    onboardingTitle: {
      fontSize: Number(design.spacing.fontSize.lg),
      fontWeight: '600',
      color: colorScheme.colors.text,
      textAlign: 'center'
    },
    onboardingDescription: {
      fontSize: Number(design.spacing.fontSize.base),
      color: colorScheme.colors.text,
      textAlign: 'center',
      opacity: 0.8
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: Number(design.spacing.gap)
    }
  })

  const renderDialogContent = () => {
    if (showLogin) {
      return (
        <View style={[dialogStyles.dialogView, {
          backgroundColor: colorScheme.colors.card,
          padding: Number(design.spacing.padding.card),
          borderRadius: Number(design.radius.lg),
          gap: Number(design.spacing.gap),
          borderColor: colorScheme.colors.border,
          borderWidth: StyleSheet.hairlineWidth,
        }]}>
          <DialogHeader>
            <DialogTitle>Sign in to join channels</DialogTitle>
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
        </View>
      )
    }

    // If user is logged in and on first step, show user details
    if (user && currentStep === 0) {
      return (
        <View style={[dialogStyles.dialogView, {
          backgroundColor: colorScheme.colors.card,
          padding: Number(design.spacing.padding.card),
          borderRadius: Number(design.radius.lg),
          gap: Number(design.spacing.gap),
          borderColor: colorScheme.colors.border,
          borderWidth: StyleSheet.hairlineWidth,
        }]}>
          <View style={dialogStyles.onboardingContent}>
            <Text style={dialogStyles.onboardingTitle}>
              Welcome back, {user.email}
            </Text>
            <Text style={dialogStyles.onboardingDescription}>
              You're already signed in. Ready to join @{username}?
            </Text>
            <View style={dialogStyles.buttonContainer}>
              <Button
                onPress={handleNextStep}
                variant="default"
                size="default"
                style={{
                  backgroundColor: colorScheme.colors.primary,
                  borderRadius: Number(design.radius.md),
                  paddingHorizontal: Number(design.spacing.padding.item),
                  paddingVertical: Number(design.spacing.padding.item) / 2,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Number(design.spacing.gap) }}>
                  <Text style={{ 
                    color: colorScheme.colors.background,
                    fontSize: Number(design.spacing.fontSize.sm),
                    fontWeight: '500'
                  }}>
                    Continue
                  </Text>
                  <ArrowRight size={Number(design.spacing.iconSize)} color={colorScheme.colors.background} />
                </View>
              </Button>
            </View>
          </View>
        </View>
      )
    }

    // Show regular onboarding steps
    return (
      <View style={[dialogStyles.dialogView, {
        backgroundColor: colorScheme.colors.card,
        padding: Number(design.spacing.padding.card),
        borderRadius: Number(design.radius.lg),
        gap: Number(design.spacing.gap),
        borderColor: colorScheme.colors.border,
        borderWidth: StyleSheet.hairlineWidth,
      }]}>
        <View style={dialogStyles.onboardingContent}>
          <Text style={dialogStyles.onboardingTitle}>
            {onboardingSteps[currentStep].title}
          </Text>
          <Text style={dialogStyles.onboardingDescription}>
            {onboardingSteps[currentStep].description}
          </Text>
          <View style={dialogStyles.buttonContainer}>
            <Button
              onPress={handleNextStep}
              variant="default"
              size="default"
              style={{
                backgroundColor: colorScheme.colors.primary,
                borderRadius: Number(design.radius.md),
                paddingHorizontal: Number(design.spacing.padding.item),
                paddingVertical: Number(design.spacing.padding.item) / 2,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Number(design.spacing.gap) }}>
                <Text style={{ 
                  color: colorScheme.colors.background,
                  fontSize: Number(design.spacing.fontSize.sm),
                  fontWeight: '500'
                }}>
                  {currentStep === onboardingSteps.length - 1 ? 'Finish' : 'Next'}
                </Text>
                {currentStep === onboardingSteps.length - 1 ? (
                  <Check size={Number(design.spacing.iconSize)} color={colorScheme.colors.background} />
                ) : (
                  <ArrowRight size={Number(design.spacing.iconSize)} color={colorScheme.colors.background} />
                )}
              </View>
            </Button>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={{ position: 'relative' }}>
      <Button 
        onPress={handleClick}
        variant={hasJoined ? "default" : "outline"}
        className={cn(
          "gap-2 font-medium",
          hasJoined && "bg-primary hover:bg-primary/90 text-white",
          !hasJoined && "text-primary border-primary/20 hover:bg-primary/10",
          className
        )}
        style={{
          borderRadius: Number(design.radius.md),
          paddingHorizontal: Number(design.spacing.padding.item),
          paddingVertical: Number(design.spacing.padding.item) / 2,
          backgroundColor: hasJoined ? colorScheme.colors.primary : 'transparent',
          borderColor: hasJoined ? 'transparent' : colorScheme.colors.primary,
        }}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <Text style={{ 
            color: hasJoined ? colorScheme.colors.background : colorScheme.colors.primary,
            fontSize: Number(design.spacing.fontSize.sm)
          }}>Loading...</Text>
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
              {hasJoined ? 'Joined' : buttonText}
            </Text>
          </View>
        )}
      </Button>
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent style={[dialogStyles.dialogContent, {
          backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)',
        }]}>
          {renderDialogContent()}
        </DialogContent>
      </Dialog>
    </View>
  );
} 