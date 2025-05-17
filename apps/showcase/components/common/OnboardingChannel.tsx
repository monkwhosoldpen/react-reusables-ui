"use client"

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { Channel } from '~/lib/core/types/channel.types';
import { useAuth } from '~/lib/core/contexts/AuthContext'
import { View, Text, useColorScheme } from 'react-native'

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
  // Track current screen index for the middle screens
  const [currentScreenIndex, setCurrentScreenIndex] = useState<number>(-1)
  // Track overall step (welcome, screens, finish)
  const [step, setStep] = useState<'welcome' | 'screens' | 'finish'>('welcome')

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
    
    if (!open && currentScreenIndex === -1) {
      onComplete?.();
    }
  }

  // Log screen transitions
  const handleStartClick = () => {
    setCurrentScreenIndex(0);
    setStep('screens');
  }

  const handleNextClick = () => {
    setCurrentScreenIndex(prev => {
      return prev + 1;
    });
  }

  const handleFinishClick = async () => {
    try {
      if (channelDetails) {
        
        setStep('finish');
        
        // Make the API call and log response
        const response = await completeChannelOnboarding(username, channelDetails);
        
        onComplete?.();
      } else {
      }
    } catch (error) {
    }
  }

  // Function to determine if user can proceed to next screen
  const canProceed = () => {
    // Add any validation logic here if needed
    // For now, always allow proceeding
    return true
  }

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent className="w-[60%] h-[60%] max-w-none max-h-none sm:w-[60%] sm:h-[60%] md:w-[60%] md:h-[60%] lg:w-[60%] lg:h-[60%]">
        <DialogHeader>
          <DialogTitle>
            {step === 'welcome' && config.welcomescreen.title}
            {step === 'screens' && currentScreen?.title}
            {step === 'finish' && config.finishscreen.title}
          </DialogTitle>
        </DialogHeader>

        <View className="flex-1 items-center justify-center p-4 overflow-auto">
          {step === 'welcome' && (
            <>
              <Text className="text-lg font-medium mb-2">{config.welcomescreen.subtitle}</Text>
              <Text className="text-sm text-muted-foreground mb-4">{config.welcomescreen.description}</Text>
              <Button 
                onPress={handleStartClick}
                className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                <View className="flex-row items-center gap-2">
                  <Text className="text-sm font-medium text-white">
                    {config.welcomescreen.buttontext}
                  </Text>
                </View>
              </Button>
            </>
          )}

          {step === 'screens' && currentScreen && (
            <>
              <Text className="text-lg font-medium mb-2">{currentScreen.title}</Text>
              <Text className="text-sm text-muted-foreground mb-4">{currentScreen.description}</Text>
              <View className="flex-row gap-2">
                {currentScreenIndex > 0 && (
                  <Button 
                    variant="outline" 
                    onPress={() => {
                      setCurrentScreenIndex(currentScreenIndex - 1);
                    }}
                    className="border-gray-200 dark:border-gray-700"
                  >
                    <View className="flex-row items-center gap-2">
                      <Text className="text-sm font-medium text-gray-900 dark:text-white">
                        Back
                      </Text>
                    </View>
                  </Button>
                )}
                <Button 
                  onPress={() => {
                    if (currentScreenIndex === config.screens.length - 1) {
                      handleFinishClick();
                    } else {
                      handleNextClick();
                    }
                  }} 
                  disabled={!canProceed()}
                  className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  <View className="flex-row items-center gap-2">
                    <Text className="text-sm font-medium text-white">
                      {currentScreen.buttontext}
                    </Text>
                  </View>
                </Button>
              </View>
            </>
          )}

          {step === 'finish' && (
            <>
              <Text className="text-lg font-medium mb-2">{config.finishscreen.subtitle}</Text>
              <Text className="text-sm text-muted-foreground mb-4">{config.finishscreen.description}</Text>
              <Button 
                onPress={handleFinishClick}
                className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                <View className="flex-row items-center gap-2">
                  <Text className="text-sm font-medium text-white">
                    {config.finishscreen.buttontext}
                  </Text>
                </View>
              </Button>
            </>
          )}
        </View>

        <DialogFooter>
          <Button 
            variant="outline" 
            onPress={() => {
              onComplete?.();
            }}
            className="border-gray-200 dark:border-gray-700"
          >
            <View className="flex-row items-center gap-2">
              <Text className="text-sm font-medium text-gray-900 dark:text-white">
                Cancel
              </Text>
            </View>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 