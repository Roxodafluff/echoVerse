'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Message } from '@/lib/types'
import { getMessages } from '@/lib/queries/messages'

export function useRealtimeMessages(channelId: string | null) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMessages = useCallback(async () => {
    if (!channelId) return
    setLoading(true)
    try {
      const data = await getMessages(channelId)
      setMessages(data)
    } catch {
      // Channel may not exist yet
    } finally {
      setLoading(false)
    }
  }, [channelId])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  useEffect(() => {
    if (!channelId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`messages:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
          const { data } = await supabase
            .from('messages')
            .select('*, profiles(*), message_reactions(*)')
            .eq('id', payload.new.id)
            .single()

          if (data) {
            setMessages((prev) => [...prev, data as Message])
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
          const { data } = await supabase
            .from('messages')
            .select('*, profiles(*), message_reactions(*)')
            .eq('id', payload.new.id)
            .single()

          if (data) {
            setMessages((prev) =>
              prev.map((m) => (m.id === data.id ? (data as Message) : m))
            )
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [channelId])

  return { messages, loading, refetch: fetchMessages }
}
