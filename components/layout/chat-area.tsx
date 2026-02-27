'use client'

import { useEffect, useState } from 'react'
import { ChannelHeader } from '@/components/chat/channel-header'
import { MessageList } from '@/components/chat/message-list'
import { MessageInput } from '@/components/chat/message-input'
import { useRealtimeMessages } from '@/hooks/use-realtime-messages'
import { sendMessage } from '@/lib/queries/messages'
import { createClient } from '@/lib/supabase/client'
import type { Channel } from '@/lib/types'

interface ChatAreaProps {
  channel: Channel | null
}

export function ChatArea({ channel }: ChatAreaProps) {
  const { messages, loading } = useRealtimeMessages(channel?.id ?? null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function getUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id ?? null)
    }
    getUser()
  }, [])

  async function handleSend(content: string) {
    if (!channel) return
    await sendMessage(channel.id, content)
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ChannelHeader channel={channel} />
      <MessageList messages={messages} currentUserId={userId} loading={loading} />
      <MessageInput
        placeholder={channel ? `Message #${channel.name}` : 'Select a channel...'}
        onSend={handleSend}
        disabled={!channel}
      />
    </div>
  )
}
