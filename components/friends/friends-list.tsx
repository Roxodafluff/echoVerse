'use client'

import { UserAvatar } from '@/components/ui/user-avatar'
import { Button } from '@/components/ui/button'
import { MessageSquare, UserMinus } from 'lucide-react'
import { removeFriend } from '@/lib/queries/friends'
import type { FriendRequest, Profile } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { getOrCreateConversation } from '@/lib/queries/dms'

interface FriendsListProps {
  friends: FriendRequest[]
  currentUserId: string
  onRefresh: () => void
  filter?: 'all' | 'online'
}

export function FriendsList({ friends, currentUserId, onRefresh, filter = 'all' }: FriendsListProps) {
  const router = useRouter()

  function getFriendProfile(request: FriendRequest): Profile | undefined {
    if (request.from_user_id === currentUserId) return request.to_profile as Profile | undefined
    return request.from_profile as Profile | undefined
  }

  const filtered = filter === 'online'
    ? friends.filter((f) => {
        const p = getFriendProfile(f)
        return p?.status === 'online' || p?.status === 'away' || p?.status === 'dnd'
      })
    : friends

  async function handleMessage(friendId: string) {
    try {
      const convId = await getOrCreateConversation(friendId)
      router.push(`/dms/${convId}`)
    } catch {
      // Error creating conversation
    }
  }

  async function handleRemove(requestId: string) {
    try {
      await removeFriend(requestId)
      onRefresh()
    } catch {
      // Error removing friend
    }
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-muted-foreground">
          {filter === 'online' ? 'No friends online' : 'No friends yet'}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {filter === 'online' ? 'Online' : 'All Friends'} -- {filtered.length}
      </p>
      {filtered.map((request) => {
        const profile = getFriendProfile(request)
        if (!profile) return null

        return (
          <div
            key={request.id}
            className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-accent/30"
          >
            <UserAvatar
              src={profile.avatar_url}
              username={profile.username}
              status={profile.status}
              size="md"
            />
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-foreground">
                {profile.display_name || profile.username}
              </p>
              <p className="text-xs text-muted-foreground capitalize">{profile.status}</p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleMessage(profile.id)}
                aria-label="Send message"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => handleRemove(request.id)}
                aria-label="Remove friend"
              >
                <UserMinus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
