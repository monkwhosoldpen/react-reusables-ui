"use client"

import React from 'react'
import { Suspense } from "react"
import { useLocalSearchParams } from 'expo-router'
import { ChannelContent } from '~/components/channel-profile/ChannelContent'

export default function UserProfile() {
  const { username } = useLocalSearchParams()
  const usernameStr = Array.isArray(username) ? username[0] : username

  return (
    <>
      <Suspense fallback={<div>Loading profile...</div>}>
        <ChannelContent key={usernameStr} username={usernameStr} />
      </Suspense>
    </>
  )
} 