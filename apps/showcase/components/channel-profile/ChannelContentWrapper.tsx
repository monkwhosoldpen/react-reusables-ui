"use client"

import React from 'react'
import { ChannelContent } from './ChannelContent'

export interface ChannelContentWrapperProps {
  username: string
}

export function ChannelContentWrapper({ username }: ChannelContentWrapperProps) {
  return <ChannelContent key={username} username={username} />
} 