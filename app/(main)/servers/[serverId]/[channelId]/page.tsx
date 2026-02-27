'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ChatArea } from '@/components/layout/chat-area'
import { getChannel } from '@/lib/queries/channels'
import type { Channel } from '@/lib/types'

export default function ChannelPage() {
  const params = useParams()
  const channelId = params?.channelId as string
  const [channel, setChannel] = useState<Channel | null>(null)

  useEffect(() => {
    if (!channelId) return
    getChannel(channelId).then(setChannel).catch(() => setChannel(null))
  }, [channelId])

  return <ChatArea channel={channel} />
}
