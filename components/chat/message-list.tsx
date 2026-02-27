'use client'

import { useEffect, useRef } from 'react'
import { MessageItem } from './message-item'
import type { Message } from '@/lib/types'
import { Loader2, MessageSquare } from 'lucide-react'

interface MessageListProps {
  messages: Message[]
  currentUserId: string | null
  loading?: boolean
}

export function MessageList({ messages, currentUserId, loading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <MessageSquare className="h-7 w-7 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">
          No messages yet. Start the conversation!
        </p>
      </div>
    )
  }

  // Determine compact grouping: same author within 5 minutes
  function isCompact(msg: Message, prevMsg: Message | null): boolean {
    if (!prevMsg) return false
    if (msg.author_id !== prevMsg.author_id) return false
    const timeDiff = new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime()
    return timeDiff < 5 * 60 * 1000
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto py-2">
      {messages.map((msg, i) => (
        <MessageItem
          key={msg.id}
          message={msg}
          currentUserId={currentUserId}
          isCompact={isCompact(msg, messages[i - 1] ?? null)}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
