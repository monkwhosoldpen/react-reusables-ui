"use client"

import React from 'react'
import { ChevronLeft, Settings, Bell, BellOff, Users } from 'lucide-react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Channel } from '@/lib/types/channel.types'
import LanguageChanger from "@/components/common/LanguageChanger"
import { JoinButton } from "@/components/common/JoinButton"
import { FollowButton } from '../common/FollowButton'

interface ChannelHeaderProps {
  username: string
  channelDetails: Channel
}

export function ChannelHeader({ username, channelDetails }: ChannelHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b bg-background px-6 py-3 h-16 sticky top-0 z-10 backdrop-blur-sm bg-background/95 shadow-sm">
      <div className="flex items-center gap-3">
        <Link 
          href="/channels" 
          className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-accent/50"
          aria-label="Back to channels"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="font-semibold text-lg flex items-center">
          <span className="text-foreground hover:underline cursor-pointer">@{username}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <LanguageChanger />

        {channelDetails.is_public ? (
          <FollowButton
            username={username}
            size="sm"
            showIcon={true}
          />
        ) : (
          <JoinButton
            username={username}
            buttonText="Join Channel"
            size="sm"
          />
        )}

        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-full"
          aria-label="Channel settings"
        >
          <Settings className="h-4.5 w-4.5" />
        </Button>
      </div>
    </header>
  )
} 