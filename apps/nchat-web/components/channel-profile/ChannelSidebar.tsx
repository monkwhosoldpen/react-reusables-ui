"use client"

import { Channel } from "@/lib/types/channel.types"
import Link from "next/link"

interface ChannelSidebarProps {
  username: string
  channelDetails: Channel
  selectedChannel: string
}

export function ChannelSidebar({
  username,
  channelDetails,
  selectedChannel
}: ChannelSidebarProps) {

  return (
    <aside className="hidden md:flex md:w-80 border-r flex-col bg-background">

      <div className="flex-1 overflow-auto p-4">

        <div className="space-y-2">
          {channelDetails.related_channels?.map((related) => (
            <Link href={`/${related.username}`} key={related.username}>
              <div className="p-2 border rounded-md hover:bg-accent cursor-pointer transition-colors">
                <div className="font-medium">@{related.username}</div>
              </div>
            </Link>
          ))}

          {(!channelDetails.related_channels || channelDetails.related_channels.length === 0) && (
            <p className="text-sm text-muted-foreground">No related channels.</p>
          )}
        </div>

      </div>
    </aside>
  )
} 