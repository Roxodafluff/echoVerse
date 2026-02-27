'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/ui/user-avatar'
import { searchProfiles } from '@/lib/queries/profiles'
import { sendFriendRequest } from '@/lib/queries/friends'
import type { Profile } from '@/lib/types'
import { Search, UserPlus, Loader2 } from 'lucide-react'

interface AddFriendProps {
  currentUserId: string
}

export function AddFriend({ currentUserId }: AddFriendProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Profile[]>([])
  const [searching, setSearching] = useState(false)
  const [sentIds, setSentIds] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    setError('')
    try {
      const profiles = await searchProfiles(query.trim())
      setResults(profiles.filter((p) => p.id !== currentUserId))
    } catch {
      setError('Failed to search users')
    } finally {
      setSearching(false)
    }
  }

  async function handleSendRequest(userId: string) {
    try {
      await sendFriendRequest(userId)
      setSentIds((prev) => new Set([...prev, userId]))
    } catch {
      setError('Failed to send friend request')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="mb-1 text-sm font-semibold text-foreground">Add Friend</h3>
        <p className="text-xs text-muted-foreground">
          Search by username to send a friend request.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username..."
            className="pl-9"
          />
        </div>
        <Button type="submit" disabled={searching || !query.trim()}>
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
        </Button>
      </form>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-col gap-1">
        {results.map((profile) => (
          <div
            key={profile.id}
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
              <p className="truncate text-xs text-muted-foreground">@{profile.username}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={sentIds.has(profile.id)}
              onClick={() => handleSendRequest(profile.id)}
            >
              {sentIds.has(profile.id) ? (
                'Sent'
              ) : (
                <>
                  <UserPlus className="mr-1 h-3 w-3" />
                  Add
                </>
              )}
            </Button>
          </div>
        ))}
        {results.length === 0 && query && !searching && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No users found matching that username
          </p>
        )}
      </div>
    </div>
  )
}
