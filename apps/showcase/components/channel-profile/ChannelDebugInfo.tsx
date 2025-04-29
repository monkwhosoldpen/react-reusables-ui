"use client"

import React, { useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Channel } from '@/lib/types/channel.types'
import { Users, Info } from 'lucide-react'
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface ChannelDebugInfoProps {
  username: string
  channelDetails: Channel
}

export function ChannelDebugInfo({ username, channelDetails }: ChannelDebugInfoProps) {
  const { colorScheme } = useColorScheme();
  const [isOpen, setIsOpen] = useState(false);

  const ChannelProperty = ({ label, value }: { label: string; value: boolean }) => (
    <View className="flex-row items-center gap-1 px-2 py-1 rounded bg-primary/10">
      <Text className="text-[8px] text-primary">
        {label}: {value ? 'Yes' : 'No'}
      </Text>
    </View>
  );

  return (
    <>
      <TouchableOpacity 
        onPress={() => setIsOpen(true)}
        className="absolute right-4 top-4 z-10"
      >
        <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
          <Info size={16} color={colorScheme.colors.primary} />
        </View>
      </TouchableOpacity>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Channel Debug Info</DialogTitle>
          </DialogHeader>
          <View className="flex-col gap-2">
            {/* Current Channel */}
            <View className="flex-col items-center p-1.5 rounded-lg m-0.5 bg-card">
              <View className="w-9 h-9 rounded-full bg-primary/10 items-center justify-center">
                <Users size={18} color={colorScheme.colors.primary} />
              </View>
              <Text className="text-[10px] text-center mt-0.5">
                {username}
                <Text className="text-[8px] text-muted-foreground"> (Current)</Text>
              </Text>
              <View className="flex-row flex-wrap gap-1 mt-1">
                <ChannelProperty label="Agent" value={channelDetails.is_agent} />
                <ChannelProperty label="Owner" value={channelDetails.is_owner_db} />
                <ChannelProperty label="Premium" value={channelDetails.is_premium} />
                <ChannelProperty label="Public" value={channelDetails.is_public} />
                <ChannelProperty label="Realtime" value={channelDetails.is_realtime} />
                <ChannelProperty label="Update Only" value={channelDetails.is_update_only} />
                <ChannelProperty label="Enhanced Chat" value={channelDetails.is_enhanced_chat} />
              </View>
            </View>

            {/* Parent Channel */}
            {channelDetails.parent_channel && (
              <View className="flex-col items-center p-1.5 rounded-lg m-0.5 bg-card">
                <View className="w-9 h-9 rounded-full bg-primary/10 items-center justify-center">
                  <Users size={18} color={colorScheme.colors.primary} />
                </View>
                <Text className="text-[10px] text-center mt-0.5 font-medium">
                  {channelDetails.parent_channel.username}
                  <Text className="text-[8px] text-muted-foreground"> (Parent)</Text>
                </Text>
                <View className="flex-row flex-wrap gap-1 mt-1">
                  <ChannelProperty label="Agent" value={channelDetails.parent_channel.is_agent} />
                  <ChannelProperty label="Owner" value={channelDetails.parent_channel.is_owner_db} />
                  <ChannelProperty label="Premium" value={channelDetails.parent_channel.is_premium} />
                  <ChannelProperty label="Public" value={channelDetails.parent_channel.is_public} />
                  <ChannelProperty label="Realtime" value={channelDetails.parent_channel.is_realtime} />
                  <ChannelProperty label="Update Only" value={channelDetails.parent_channel.is_update_only} />
                  <ChannelProperty label="Enhanced Chat" value={channelDetails.parent_channel.is_enhanced_chat} />
                </View>
              </View>
            )}

            {/* Related Channels Count */}
            {channelDetails.related_channels && channelDetails.related_channels.length > 0 && (
              <View className="flex-col items-center p-1.5 rounded-lg bg-card">
                <View className="w-9 h-9 rounded-full bg-primary/10 items-center justify-center">
                  <Users size={18} color={colorScheme.colors.primary} />
                </View>
                <Text className="text-[10px] text-center mt-0.5">
                  {channelDetails.related_channels.length} Related Channels
                </Text>
              </View>
            )}
          </View>
        </DialogContent>
      </Dialog>
    </>
  );
} 