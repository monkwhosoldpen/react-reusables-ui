"use client"

import React from 'react'
import { Suspense } from "react"
import { notFound } from "next/navigation"
import { ChannelContentWrapper } from '@/components/channel-profile/ChannelContentWrapper'

export default function UserProfile({
  params
}: {
  params: { username: string }
}) {
  const { username } = params

  if (!username) {
    notFound()
  }

  return (
    <>      
      <Suspense fallback={<div>Loading profile...</div>}>
        <ChannelContentWrapper username={username} />
      </Suspense>
    </>
  )
} 