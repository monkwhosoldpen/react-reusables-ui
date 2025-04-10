"use client"

import React from 'react'
import { Suspense } from "react"
import { ChannelContentWrapper } from '@/components/channel-profile/ChannelContentWrapper'
import { useLocalSearchParams } from 'expo-router'

export default function UserProfile() {
  const { username } = useLocalSearchParams()
  const usernameStr = Array.isArray(username) ? username[0] : username

  return (
    <>      
      <Suspense fallback={<div>Loading profile...</div>}>
        <ChannelContentWrapper username={usernameStr} />
      </Suspense>
    </>
  )
} 