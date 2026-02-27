'use client'

import { UserAvatar } from '@/components/ui/user-avatar'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'
import { respondToRequest } from '@/lib/queries/friends'
import type { FriendRequest, Profile } from '@/lib/types'

interface PendingRequestsProps {
  requests: FriendRequest[]
  currentUserId: string
  onRefresh: () => void
}

export function PendingRequests({ requests, currentUserId, onRefresh }: PendingRequestsProps) {
  const incoming = requests.filter((r) => r.to_user_id === currentUserId)
  const outgoing = requests.filter((r) => r.from_user_id === currentUserId)

  async function handleRespond(requestId: string, status: 'accepted' | 'rejected') {
    try {
      await respondToRequest(requestId, status)
      onRefresh()
    } catch {
      // Error responding
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {incoming.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Incoming -- {incoming.length}
          </p>
          <div className="flex flex-col gap-1">
            {incoming.map((request) => {
              const profile = request.from_profile as Profile | undefined
              if (!profile) return null
              return (
                <div
                  key={request.id}
                  className="flex items-center gap-3 rounded-lg border border-border p-3"
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
                    <p className="text-xs text-muted-foreground">
                      Incoming Friend Request
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-echoverse-success hover:text-echoverse-success"
                      onClick={() => handleRespond(request.id, 'accepted')}
                      aria-label="Accept"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleRespond(request.id, 'rejected')}
                      aria-label="Reject"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {outgoing.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Outgoing -- {outgoing.length}
          </p>
          <div className="flex flex-col gap-1">
            {outgoing.map((request) => {
              const profile = request.to_profile as Profile | undefined
              if (!profile) return null
              return (
                <div
                  key={request.id}
                  className="flex items-center gap-3 rounded-lg border border-border p-3"
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
                    <p className="text-xs text-muted-foreground">
                      Outgoing Friend Request
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {incoming.length === 0 && outgoing.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">No pending requests</p>
        </div>
      )}
    </div>
  )
}
