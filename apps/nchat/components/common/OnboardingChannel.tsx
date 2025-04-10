"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Channel } from '@/lib/types/channel.types';
import { useAuth } from '@/lib/contexts/AuthContext'
import LoginCommon from '@/components/common/LoginCommon'
import { View, Text } from 'react-native'

export interface OnboardingChannelProps {
  username: string
  channelDetails: Channel
  onboardingConfig?: any
  onComplete?: () => void
}

export function OnboardingChannel({
  username,
  channelDetails,
  onboardingConfig,
  onComplete
}: OnboardingChannelProps) {
  console.log('[OnboardingChannel] Component mounted with props:', {
    hasChannelDetails: !!channelDetails,
    hasOnCompleteHandler: !!onComplete
  })

  // Track current screen index for the middle screens
  const [currentScreenIndex, setCurrentScreenIndex] = useState<number>(-1)
  // Track overall step (welcome, screens, finish)
  const [step, setStep] = useState<'welcome' | 'screens' | 'finish'>('welcome')
  // For the dummy login form
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // Track location validity
  const [isLocationValid, setIsLocationValid] = useState(false)
  // Add loading state for login actions
  const [isLoginLoading, setIsLoginLoading] = useState(false)

  // Get auth context for user info and completeChannelOnboarding function
  const { completeChannelOnboarding } = useAuth()

  // Create default onboarding config if none is provided
  const config = onboardingConfig || {
    welcomescreen: {
      title: `Welcome to @${username}`,
      subtitle: "Get started with this channel",
      description: "This channel provides important information and updates.",
      image: "https://placehold.co/600x400/emerald/white?text=Welcome",
      buttontext: "Get Started"
    },
    screens: [
      {
        title: "About This Channel",
        description: "This channel is used to share information and updates.",
        image: "https://placehold.co/600x400/emerald/white?text=About",
        buttontext: "Next"
      }
    ],
    finishscreen: {
      title: "You're All Set!",
      subtitle: "Thanks for joining",
      description: "You can now start using this channel.",
      image: "https://placehold.co/600x400/emerald/white?text=Finished",
      buttontext: "Finish"
    }
  }

  // Get the current screen from the screens array
  const currentScreen = currentScreenIndex >= 0 && currentScreenIndex < config.screens.length
    ? config.screens[currentScreenIndex]
    : null

  // Log when dialog opens/closes
  const handleOpenChange = (open: boolean) => {
    console.log('[OnboardingChannel] Dialog open state changed:', open)
    if (!open && currentScreenIndex === -1) {
      console.log('[OnboardingChannel] Dialog closed without starting onboarding')
      onComplete?.()
    }
  }

  // Log screen transitions
  const handleStartClick = () => {
    console.log('[OnboardingChannel] Starting onboarding process')
    setCurrentScreenIndex(0)
  }

  const handleNextClick = () => {
    console.log('[OnboardingChannel] Moving to next screen:', currentScreenIndex + 1)
    setCurrentScreenIndex(prev => prev + 1)
  }

  const handleFinishClick = async () => {
    console.log('[OnboardingChannel] Finishing onboarding process')
    try {
      if (channelDetails) {
        console.log('[OnboardingChannel] Calling completeChannelOnboarding with:', channelDetails)
        await completeChannelOnboarding(username, channelDetails)
        console.log('[OnboardingChannel] Onboarding completed successfully')
        onComplete?.()
      } else {
        console.error('[OnboardingChannel] Cannot complete onboarding: missing channel details')
      }
    } catch (error) {
      console.error('[OnboardingChannel] Error completing onboarding:', error)
    }
  }

  console.log('[OnboardingChannel] Current render state:', {
    currentScreenIndex,
    isWelcomeScreen: currentScreenIndex === -1,
    isFinishScreen: currentScreenIndex === config.screens.length
  })

  // Function to determine if user can proceed to next screen
  const canProceed = () => {
    // Add any validation logic here if needed
    // For now, always allow proceeding
    return true
  }

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {step === 'welcome' && config.welcomescreen.title}
            {step === 'screens' && currentScreen?.title}
            {step === 'finish' && config.finishscreen.title}
          </DialogTitle>
        </DialogHeader>

        {step === 'welcome' && (
          <View className="flex-1 items-center justify-center p-4">
            <Text className="text-lg font-medium mb-2">{config.welcomescreen.subtitle}</Text>
            <Text className="text-sm text-muted-foreground mb-4">{config.welcomescreen.description}</Text>
            <Button onPress={handleStartClick}>{config.welcomescreen.buttontext}</Button>
          </View>
        )}

        {step === 'screens' && currentScreen && (
          <View className="flex-1 items-center justify-center p-4">
            <Text className="text-lg font-medium mb-2">{currentScreen.title}</Text>
            <Text className="text-sm text-muted-foreground mb-4">{currentScreen.description}</Text>
            <View className="flex-row gap-2">
              {currentScreenIndex > 0 && (
                <Button variant="outline" onPress={() => setCurrentScreenIndex(currentScreenIndex - 1)}>Back</Button>
              )}
              <Button onPress={handleNextClick} disabled={!canProceed()}>
                {currentScreen.buttontext}
              </Button>
            </View>
          </View>
        )}

        {step === 'finish' && (
          <View className="flex-1 items-center justify-center p-4">
            <Text className="text-lg font-medium mb-2">{config.finishscreen.subtitle}</Text>
            <Text className="text-sm text-muted-foreground mb-4">{config.finishscreen.description}</Text>
            <Button onPress={handleFinishClick}>{config.finishscreen.buttontext}</Button>
          </View>
        )}

        <DialogFooter>
          <Button variant="outline" onPress={() => onComplete?.()}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 