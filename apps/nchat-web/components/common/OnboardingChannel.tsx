"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Channel } from '@/lib/types/channel.types';
import { useAuth } from '@/lib/contexts/AuthContext'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import LoginCommon from '@/components/common/LoginCommon'

interface OnboardingChannelProps {
  username: string
  channelDetails: Channel
  onboardingConfig?: any
  onClose: () => void
}

export function OnboardingChannel({
  username,
  channelDetails,
  onboardingConfig,
  onClose
}: OnboardingChannelProps) {
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
  const { user, userInfo, completeChannelOnboarding } = useAuth()

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

  // Handle start button click
  const handleStart = () => {
    console.log('Starting onboarding with:', {
      username,
      channelDetails,
      welcomeScreen: config.welcomescreen,
      userInfo
    })

    // If there are screens, go to the first one
    if (config.screens && config.screens.length > 0) {
      setCurrentScreenIndex(0)
      setStep('screens')
    } else {
      // If no screens, go straight to finish
      setStep('finish')
    }
  }

  // Handle next screen button click
  const handleNextScreen = () => {
    console.log('Moving to next screen:', {
      username,
      channelDetails,
      currentScreen,
      screenIndex: currentScreenIndex,
      userInfo
    })

    if (currentScreenIndex < config.screens.length - 1) {
      setCurrentScreenIndex(currentScreenIndex + 1)
    } else {
      setStep('finish')
    }
  }

  // Handle previous screen button click
  const handlePrevScreen = () => {
    console.log('Moving to previous screen:', {
      username,
      channelDetails,
      currentScreen,
      screenIndex: currentScreenIndex
    })

    if (currentScreenIndex > 0) {
      setCurrentScreenIndex(currentScreenIndex - 1)
    } else {
      setStep('welcome')
    }
  }

  // Check if everything is in place to proceed
  const canProceed = () => {
    return user !== null && isLocationValid;
  }

  // Handle finish button click
  const handleFinish = async () => {
    console.log('Finishing onboarding with:', {
      username,
      channelDetails,
      finishScreen: config.finishscreen,
      userInfo
    })

    try {
      // Use the completeChannelOnboarding function from useAuth
      const success = await completeChannelOnboarding(username, channelDetails);

      if (success) {
        console.log('Channel onboarding completed successfully');
      } else {
        console.warn('Channel onboarding completion had an issue');
      }
    } catch (error) {
      console.error('Error during onboarding completion:', error);
    }

    // Close the modal regardless of the result
    onClose();
  }

  // Handle dummy login form submission
  const handleDummyLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoginLoading(true)
    console.log('Dummy login attempt with:', { email, password })
    // Simulate API call with timeout
    setTimeout(() => {
      // Reset form
      setEmail('')
      setPassword('')
      setIsLoginLoading(false)
    }, 1000)
  }

  // Handle anonymous sign-in in the onboarding context
  const handleAnonymousSignIn = () => {
    setIsLoginLoading(true)
    console.log('Anonymous sign-in attempt in onboarding flow')
    // Simulate API call with timeout
    setTimeout(() => {
      setIsLoginLoading(false)
      // Optional: close onboarding after login
      // onClose()
    }, 1000)
  }

  // Handle guest sign-in in the onboarding context
  const handleGuestSignIn = () => {
    setIsLoginLoading(true)
    console.log('Guest sign-in attempt in onboarding flow')
    // Simulate API call with timeout
    setTimeout(() => {
      setIsLoginLoading(false)
      // Optional: close onboarding after login
      // onClose()
    }, 1000)
  }

  return (
    <Dialog open={true} onOpenChange={(open) => {
      if (!open) {
        onClose()
      }
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {step === 'welcome' && (config.welcomescreen?.title || 'Welcome to Onboarding')}
            {step === 'screens' && currentScreen?.title}
            {step === 'finish' && 'Setup Complete'}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Welcome Screen */}
          {step === 'welcome' && (
            <div className="space-y-6">
              {config.welcomescreen?.image && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden">
                  <img
                    src={config.welcomescreen.image}
                    alt="Welcome"
                    className="object-cover w-full h-full"
                  />
                </div>
              )}

              <p className="text-lg">{config.welcomescreen?.description || 'Welcome to the channel onboarding process.'}</p>

              {/* Account Status and Login Section */}
              <div className="bg-muted/50 p-4 rounded-md space-y-3">
                {user ? (
                  // When user is logged in
                  <>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="switch-account" className="border-0">
                        <AccordionTrigger className="py-2 text-sm text-primary hover:no-underline">
                          Switch accounts
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="bg-background p-4 rounded-md border">Hello World</div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </>
                ) : (
                  // When user is not logged in
                  <>

                    <div className="bg-background p-4 rounded-md border">
                      <LoginCommon
                        email={email}
                        setEmail={setEmail}
                        password={password}
                        setPassword={setPassword}
                        error=""
                        isLoading={isLoginLoading}
                        handleSubmit={handleDummyLogin}
                        handleAnonymousSignIn={handleAnonymousSignIn}
                        handleGuestSignIn={handleGuestSignIn}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm font-medium">Channel: @{channelDetails.username}</p>
                <p className="text-sm">Owner: {channelDetails.owner_username}</p>
                {!channelDetails.is_public && (
                  <p className="text-sm text-amber-500 font-medium">Private Channel</p>
                )}
              </div>

            </div>
          )}

          {/* Content Screens */}
          {step === 'screens' && currentScreen && (
            <div className="space-y-6">
              <p className="text-base">{currentScreen.description}</p>

              <div className="bg-muted/50 p-4 rounded-md">
                <h3 className="font-medium mb-2">Form Fields:</h3>
                <div className="space-y-4">
                  {currentScreen.form?.fields.map((field: any, index: number) => (
                    <div key={index} className="border border-border p-3 rounded-md">
                      <div className="flex justify-between">
                        <p className="font-medium">{field.label}</p>
                        {field.required && <span className="text-xs text-red-500">Required</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">Type: {field.type}</p>

                      {field.options && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground">Options:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {field.options.map((option: string, i: number) => (
                              <span key={i} className="text-xs bg-background px-2 py-1 rounded-md">
                                {option}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>Screen {currentScreenIndex + 1} of {config.screens.length}</p>
                <p>Screen ID: {currentScreen.slug}</p>
              </div>
            </div>
          )}

          {/* Finish Screen */}
          {step === 'finish' && (
            <div className="space-y-6">
              {config.finishscreen?.image && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden">
                  <img
                    src={config.finishscreen.image}
                    alt="Setup Complete"
                    className="object-cover w-full h-full"
                  />
                </div>
              )}

              <p className="text-lg">{config.finishscreen?.description || 'You have completed the onboarding process.'}</p>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-900/30">
                <p className="text-green-700 dark:text-green-300 font-medium">Setup Complete!</p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  Thank you for completing the onboarding for @{channelDetails.username}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {step === 'welcome' && (
            <Button
              onClick={handleStart}
              className="w-full sm:w-auto"
            >
              {canProceed()
                ? (config.welcomescreen?.buttontext || 'Start') : 'Please complete the form'}
            </Button>
          )}

          {step === 'screens' && (
            <div className="flex justify-between w-full">
              <Button variant="outline" onClick={handlePrevScreen}>
                {currentScreenIndex === 0 ? 'Back to Welcome' : 'Previous'}
              </Button>
              <Button onClick={handleNextScreen}>
                {currentScreenIndex === config.screens.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
          )}

          {step === 'finish' && (
            <Button
              onClick={handleFinish}
              className="w-full sm:w-auto"
            >
              Complete
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 