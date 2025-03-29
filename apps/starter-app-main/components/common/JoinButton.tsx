"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/contexts/AuthContext"
import { Channel } from "@/lib/types/channel.types"
import { OnboardingChannel } from "./OnboardingChannel"
import { UserPlus } from "lucide-react"
import { toast } from "sonner"

export interface JoinButtonProps extends Omit<ButtonProps, 'onClick'> {
  username: string;
  buttonText?: string;
  className?: string;
  size?: 'default' | 'sm' | 'lg';
  showIcon?: boolean;
}

/**
 * A reusable button component that opens the channel onboarding dialog
 * Only requires username prop - handles all functionality internally
 * 
 * @param username - The username of the channel to join
 * @param buttonText - The text to display on the button (default: 'Join Channel')
 * @param className - Additional CSS classes to apply to the button
 * @param size - Size of the button (default: 'default')
 * @param showIcon - Whether to show the join icon (default: false)
 * @param ...props - Any other Button props to pass through
 */
export function JoinButton({
  username,
  buttonText = 'Join',
  className,
  size = 'default',
  showIcon = true,
  ...props
}: JoinButtonProps) {
  const { user, userInfo } = useAuth()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [channelDetails, setChannelDetails] = useState<Channel | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)
  
  // Function to handle button click
  const handleClick = async () => {
    try {
      setIsLoading(true)
      
      // Fetch channel details if not already fetched
      if (!channelDetails) {
        const response = await fetch(`/api/channels/${username}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch channel details for ${username}`)
        }
        
        const data = await response.json()
        setChannelDetails(data)
      }
      
      setShowOnboarding(true)
    } catch (error) {
      console.error(`Error fetching channel details for ${username}:`, error)
      toast.error(`Could not load channel information`)
    } finally {
      setIsLoading(false)
    }
  }

  // Function to handle closing the onboarding modal
  const handleCloseOnboarding = () => {
    setShowOnboarding(false)
    setHasJoined(true)
    toast.success(`You've joined @${username}`)
  }

  return (
    <>
      <Button 
        onClick={handleClick}
        variant={hasJoined ? "default" : "outline"}
        size={size}
        className={cn(
          "gap-2 font-medium",
          hasJoined && "bg-purple-600 hover:bg-purple-700 text-white",
          !hasJoined && "text-purple-700 border-purple-200 hover:bg-purple-50 dark:text-purple-300 dark:border-purple-800 dark:hover:bg-purple-950",
          className
        )}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <>Loading...</>
        ) : (
          <>
            {showIcon && (
              <UserPlus 
                className={cn(
                  "h-4 w-4", 
                  hasJoined ? "fill-white" : "text-purple-500 dark:text-purple-400"
                )} 
              />
            )}
            {hasJoined ? 'Joined' : buttonText}
          </>
        )}
      </Button>
      
      {showOnboarding && channelDetails && (
        <OnboardingChannel
          username={username}
          channelDetails={channelDetails}
          onboardingConfig={channelDetails.onboardingConfig}
          onClose={handleCloseOnboarding}
        />
      )}
    </>
  );
} 