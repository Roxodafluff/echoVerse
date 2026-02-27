'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { UserAvatar } from '@/components/ui/user-avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, Trash2, Smile } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { editMessage, deleteMessage, addReaction, removeReaction } from '@/lib/queries/messages'
import type { Message } from '@/lib/types'
import { cn } from '@/lib/utils'

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😢', '🔥', '🎉']

interface MessageItemProps {
  message: Message
  currentUserId: string | null
  isCompact?: boolean
}

export function MessageItem({ message, currentUserId, isCompact }: MessageItemProps) {
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const [hovering, setHovering] = useState(false)
  const profile = message.profiles
  const isOwn = currentUserId === message.author_id

  async function handleEdit() {
    if (!editContent.trim()) return
    try {
      await editMessage(message.id, editContent.trim())
      setEditing(false)
    } catch {
      // Error editing
    }
  }

  async function handleDelete() {
    try {
      await deleteMessage(message.id)
    } catch {
      // Error deleting
    }
  }

  async function handleReaction(emoji: string) {
    const existing = message.message_reactions?.find(
      (r) => r.user_id === currentUserId && r.emoji === emoji
    )
    try {
      if (existing) {
        await removeReaction(message.id, emoji)
      } else {
        await addReaction(message.id, emoji)
      }
    } catch {
      // Error with reaction
    }
  }

  // Group reactions by emoji
  const reactionGroups = (message.message_reactions ?? []).reduce(
    (acc, r) => {
      acc[r.emoji] = acc[r.emoji] || { emoji: r.emoji, count: 0, hasOwn: false }
      acc[r.emoji].count++
      if (r.user_id === currentUserId) acc[r.emoji].hasOwn = true
      return acc
    },
    {} as Record<string, { emoji: string; count: number; hasOwn: boolean }>
  )

  return (
    <div
      className={cn(
        'group relative flex gap-3 px-4 py-1 hover:bg-accent/30',
        isCompact ? 'pl-16' : 'pt-2'
      )}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {!isCompact && (
        <UserAvatar
          src={profile?.avatar_url}
          username={profile?.username ?? ''}
          status={profile?.status}
          size="md"
          showStatus={false}
          className="mt-0.5"
        />
      )}
      <div className="flex-1 overflow-hidden">
        {!isCompact && (
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-foreground">
              {profile?.display_name || profile?.username || 'Unknown'}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
            </span>
          </div>
        )}
        {editing ? (
          <div className="flex items-center gap-2 py-1">
            <Input
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEdit()
                if (e.key === 'Escape') setEditing(false)
              }}
              className="h-8 text-sm"
              autoFocus
            />
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleEdit}>
              Save
            </Button>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">
            {message.content}
            {message.edited_at && (
              <span className="ml-1 text-[10px] text-muted-foreground">(edited)</span>
            )}
          </p>
        )}

        {/* Reactions */}
        {Object.keys(reactionGroups).length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {Object.values(reactionGroups).map((r) => (
              <button
                key={r.emoji}
                onClick={() => handleReaction(r.emoji)}
                className={cn(
                  'flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs transition-colors',
                  r.hasOwn
                    ? 'border-primary/50 bg-primary/10 text-primary'
                    : 'border-border bg-secondary text-muted-foreground hover:border-primary/30'
                )}
              >
                <span>{r.emoji}</span>
                <span>{r.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hover actions */}
      {hovering && !editing && (
        <div className="absolute -top-3 right-4 flex items-center gap-0.5 rounded-md border border-border bg-card p-0.5 shadow-sm">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Smile className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-1" align="end">
              <div className="flex gap-1">
                {QUICK_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className="rounded p-1 text-lg hover:bg-accent"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          {isOwn && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => {
                  setEditContent(message.content)
                  setEditing(true)
                }}
                aria-label="Edit message"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={handleDelete}
                aria-label="Delete message"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
