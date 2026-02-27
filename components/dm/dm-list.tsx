'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserAvatar } from '@/components/ui/user-avatar'
import { getConversations } from '@/lib/queries/dms'
import { createClient } from '@/lib/supabase/client'
import type { DmConversation, Profile } from '@/lib/types'
import { cn } from '@/lib/utils'
import { MessageSquare } from 'lucide-react'

export function DmList() {
  const pathname = usePathname()
  const [conversations, setConversations] = useState<DmConversation[]>([])
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const convs = await getConversations()
      setConversations(convs)
    }
    fetchData()
  }, [])

  function getOtherParticipant(conv: DmConversation): Profile | null {
    const participant = conv.dm_participants?.find((p) => p.user_id !== userId)
    return (participant?.profiles as Profile) ?? null
  }

  return (
    <aside className="flex h-full w-60 flex-col bg-echoverse-sidebar">
      <div className="flex h-12 items-center border-b border-border px-4">
        <h2 className="text-sm font-semibold text-foreground">Direct Messages</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MessageSquare className="mb-2 h-6 w-6 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">No conversations yet</p>
          </div>
        ) : (
          conversations.map((conv) => {
            const other = getOtherParticipant(conv)
            if (!other) return null
            const active = pathname === `/dms/${conv.id}`

            return (
              <Link
                key={conv.id}
                href={`/dms/${conv.id}`}
                className={cn(
                  'flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors',
                  active
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                )}
              >
                <UserAvatar
                  src={other.avatar_url}
                  username={other.username}
                  status={other.status}
                  size="sm"
                />
                <span className="truncate text-sm">
                  {other.display_name || other.username}
                </span>
              </Link>
            )
          })
        )}
      </div>
    </aside>
  )
}
