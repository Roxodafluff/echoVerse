'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRealtimeDm } from '@/hooks/use-realtime-dm'
import { sendDm } from '@/lib/queries/dms'
import { MessageInput } from '@/components/chat/message-input'
import { UserAvatar } from '@/components/ui/user-avatar'
import { formatDistanceToNow } from 'date-fns'
import type { DirectMessage, DmConversation, Profile } from '@/lib/types'
import { Loader2, MessageSquare } from 'lucide-react'

interface DmChatProps {
  conversationId: string
}

export function DmChat({ conversationId }: DmChatProps) {
  const { messages, loading } = useRealtimeDm(conversationId)
  const [userId, setUserId] = useState<string | null>(null)
  const [otherUser, setOtherUser] = useState<Profile | null>(null)

  useEffect(() => {
    async function fetchContext() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data } = await supabase
        .from('dm_participants')
        .select('*, profiles(*)')
        .eq('conversation_id', conversationId)
        .neq('user_id', user.id)
        .single()

      if (data?.profiles) {
        setOtherUser(data.profiles as Profile)
      }
    }
    fetchContext()
  }, [conversationId])

  async function handleSend(content: string) {
    await sendDm(conversationId, content)
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-echoverse-chat">
      {/* DM Header */}
      <header className="flex h-12 items-center gap-2 border-b border-border px-4">
        {otherUser && (
          <>
            <UserAvatar
              src={otherUser.avatar_url}
              username={otherUser.username}
              status={otherUser.status}
              size="sm"
            />
            <span className="text-sm font-semibold text-foreground">
              {otherUser.display_name || otherUser.username}
            </span>
          </>
        )}
      </header>

      {/* Messages */}
      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <MessageSquare className="h-7 w-7 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            Start your conversation with{' '}
            {otherUser?.display_name || otherUser?.username || 'this user'}!
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto py-2">
          {messages.map((msg) => (
            <DmMessageItem key={msg.id} message={msg} isOwn={msg.author_id === userId} />
          ))}
        </div>
      )}

      <MessageInput
        placeholder={`Message ${otherUser?.display_name || otherUser?.username || '...'}`}
        onSend={handleSend}
      />
    </div>
  )
}

function DmMessageItem({ message, isOwn }: { message: DirectMessage; isOwn: boolean }) {
  const profile = message.profiles

  return (
    <div className="group flex gap-3 px-4 py-1 hover:bg-accent/30">
      <UserAvatar
        src={profile?.avatar_url}
        username={profile?.username ?? ''}
        status={profile?.status}
        size="md"
        showStatus={false}
        className="mt-0.5"
      />
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-foreground">
            {profile?.display_name || profile?.username || 'Unknown'}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">
          {message.content}
        </p>
      </div>
    </div>
  )
}
