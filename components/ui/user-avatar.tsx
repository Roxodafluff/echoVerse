'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { UserStatus } from '@/lib/types'

const statusColors: Record<UserStatus, string> = {
  online: 'bg-echoverse-online',
  away: 'bg-echoverse-away',
  dnd: 'bg-echoverse-dnd',
  offline: 'bg-echoverse-offline',
}

interface UserAvatarProps {
  src?: string | null
  username?: string
  status?: UserStatus
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showStatus?: boolean
}

export function UserAvatar({ src, username = '', status = 'offline', size = 'md', className, showStatus = true }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'h-7 w-7',
    md: 'h-9 w-9',
    lg: 'h-12 w-12',
  }

  const statusSizeClasses = {
    sm: 'h-2.5 w-2.5 bottom-0 right-0',
    md: 'h-3 w-3 bottom-0 right-0',
    lg: 'h-3.5 w-3.5 bottom-0 right-0',
  }

  const initials = username
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={src ?? undefined} alt={username} />
        <AvatarFallback className="bg-primary/20 text-xs font-medium text-primary">
          {initials || '?'}
        </AvatarFallback>
      </Avatar>
      {showStatus && (
        <span
          className={cn(
            'absolute rounded-full border-2 border-background',
            statusSizeClasses[size],
            statusColors[status]
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  )
}
