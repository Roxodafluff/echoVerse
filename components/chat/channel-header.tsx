'use client'

import { Hash, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Channel } from '@/lib/types'

interface ChannelHeaderProps {
  channel: Channel | null
}

export function ChannelHeader({ channel }: ChannelHeaderProps) {
  if (!channel) {
    return (
      <div className="flex h-12 items-center border-b border-border px-4">
        <span className="text-sm text-muted-foreground">Select a channel</span>
      </div>
    )
  }

  return (
    <header className="flex h-12 items-center justify-between border-b border-border px-4">
      <div className="flex items-center gap-2">
        <Hash className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-sm font-semibold text-foreground">{channel.name}</h1>
        {channel.topic && (
          <>
            <span className="mx-2 h-4 w-px bg-border" />
            <span className="truncate text-xs text-muted-foreground">{channel.topic}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Toggle member list">
          <Users className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
