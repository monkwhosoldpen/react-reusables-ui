"use client"

import React from 'react'
import { Suspense } from "react"
import { ChannelContentWrapper } from '@/components/channel-profile/ChannelContentWrapper'

export default function UserProfile() {
  // const { username } = useLocalSearchParams()
  // const usernameStr = Array.isArray(username) ? username[0] : username

  // if (!usernameStr) {
  //   notFound()
  // }

  return (
    <>      
      <Suspense fallback={<div>Loading profile...</div>}>
        <ChannelContentWrapper username={'elonmusk'} />
      </Suspense>
    </>
  )
} 