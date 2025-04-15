"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Channel } from '@/lib/types/channel.types';
import { useAuth } from '@/lib/contexts/AuthContext'
import LoginCommon from '@/components/common/LoginCommon'
import { View, Text, StyleSheet, Image } from 'react-native'
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';

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
  const { design } = useDesign();
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme.name === 'dark';

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

  const styles = StyleSheet.create({
    dialogContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    content: {
      padding: Number(design.spacing.padding.card) * 1.5,
      gap: Number(design.spacing.gap) * 1.5,
      width: '100%',
      maxWidth: 425,
      backgroundColor: colorScheme.colors.card,
      borderRadius: Number(design.radius.lg),
      margin: 'auto',
    },
    screenContent: {
      alignItems: 'center',
      gap: Number(design.spacing.gap) * 1.5,
    },
    header: {
      alignItems: 'center',
      gap: Number(design.spacing.gap),
      marginBottom: Number(design.spacing.margin.section),
    },
    title: {
      fontSize: Number(design.spacing.fontSize['2xl']),
      fontWeight: '700',
      color: colorScheme.colors.text,
      textAlign: 'center',
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: Number(design.spacing.fontSize.lg),
      fontWeight: '600',
      color: colorScheme.colors.text,
      textAlign: 'center',
      letterSpacing: -0.25,
    },
    description: {
      fontSize: Number(design.spacing.fontSize.base),
      color: colorScheme.colors.text,
      opacity: Number(design.opacity.medium),
      textAlign: 'center',
      lineHeight: Number(design.spacing.lineHeight.relaxed),
      paddingHorizontal: Number(design.spacing.padding.card),
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: Number(design.spacing.gap),
      marginTop: Number(design.spacing.margin.section),
      justifyContent: 'center',
      width: '100%',
    },
    image: {
      width: '100%',
      height: 200,
      borderRadius: Number(design.radius.lg),
      marginBottom: Number(design.spacing.margin.section),
      backgroundColor: colorScheme.colors.border,
      overflow: 'hidden',
    },
    imagePlaceholder: {
      width: '100%',
      height: '100%',
      backgroundColor: colorScheme.colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
    },
    imageText: {
      fontSize: Number(design.spacing.fontSize.lg),
      color: colorScheme.colors.primary,
      opacity: Number(design.opacity.medium),
    },
    footer: {
      marginTop: Number(design.spacing.margin.section),
      borderTopWidth: 1,
      borderTopColor: colorScheme.colors.border,
      paddingTop: Number(design.spacing.padding.card),
    },
  });

  // Get the current screen from the screens array
  const currentScreen = currentScreenIndex >= 0 && currentScreenIndex < config.screens.length
    ? config.screens[currentScreenIndex]
    : null

  // Log when dialog opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open && currentScreenIndex === -1) {
      onComplete?.()
    }
  }

  // Log screen transitions
  const handleStartClick = () => {
    setCurrentScreenIndex(0)
  }

  const handleNextClick = () => {
    setCurrentScreenIndex(prev => prev + 1)
  }

  const handleFinishClick = async () => {
    try {
      if (channelDetails) {
        await completeChannelOnboarding(username, channelDetails)
        onComplete?.()
      }
    } catch (error) {
      console.error('[OnboardingChannel] Error completing onboarding:', error)
    }
  }

  // Function to determine if user can proceed to next screen
  const canProceed = () => {
    return true
  }

  const renderImage = (imageUrl: string, altText: string) => (
    <View style={styles.image}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imageText}>{altText}</Text>
        </View>
      )}
    </View>
  );

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <View style={styles.dialogContainer}>
        <DialogContent className='sm:max-w-[425px]'>
          <View style={styles.content}>
            {step === 'welcome' && (
              <View style={styles.screenContent}>
                <View style={styles.header}>
                  <Text style={styles.title}>{config.welcomescreen.title}</Text>
                  <Text style={styles.subtitle}>{config.welcomescreen.subtitle}</Text>
                </View>
                {renderImage(config.welcomescreen.image, "Welcome")}
                <Text style={styles.description}>{config.welcomescreen.description}</Text>
                <View style={styles.buttonContainer}>
                  <Button onPress={handleStartClick}>{config.welcomescreen.buttontext}</Button>
                </View>
              </View>
            )}

            {step === 'screens' && currentScreen && (
              <View style={styles.screenContent}>
                <View style={styles.header}>
                  <Text style={styles.title}>{currentScreen.title}</Text>
                </View>
                {renderImage(currentScreen.image, currentScreen.title)}
                <Text style={styles.description}>{currentScreen.description}</Text>
                <View style={styles.buttonContainer}>
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
              <View style={styles.screenContent}>
                <View style={styles.header}>
                  <Text style={styles.title}>{config.finishscreen.title}</Text>
                  <Text style={styles.subtitle}>{config.finishscreen.subtitle}</Text>
                </View>
                {renderImage(config.finishscreen.image, "Finished")}
                <Text style={styles.description}>{config.finishscreen.description}</Text>
                <View style={styles.buttonContainer}>
                  <Button onPress={handleFinishClick}>{config.finishscreen.buttontext}</Button>
                </View>
              </View>
            )}

            <View style={styles.footer}>
              <Button variant="outline" onPress={() => onComplete?.()}>Cancel</Button>
            </View>
          </View>
        </DialogContent>
      </View>
    </Dialog>
  )
} 