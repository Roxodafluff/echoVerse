'use client'

import { useState } from 'react'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { UserAvatar } from '@/components/ui/user-avatar'
import { StaffBadge } from '@/components/ui/staff-badge'
import { RoleBadge } from '@/components/ui/role-badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { CalendarDays, AtSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Profile } from '@/lib/types'

interface ServerRoleDisplay {
  name: string
  color: string
}

interface UserProfilePopoverProps {
  profile: Profile
  serverRoles?: ServerRoleDisplay[]
  isOwnProfile?: boolean
  onToggleBadge?: (show: boolean) => void
  children: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
}

export function UserProfilePopover({
  profile,
  serverRoles,
  isOwnProfile = false,
  onToggleBadge,
  children,
  side = 'right',
  align = 'start',
}: UserProfilePopoverProps) {
  const [badgeVisible, setBadgeVisible] = useState(profile.show_staff_badge ?? true)

  const displayName = profile.display_name || profile.username
  const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const isStaff = profile.global_role !== 'user'

  function handleToggleBadge(checked: boolean) {
    setBadgeVisible(checked)
    onToggleBadge?.(checked)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="cursor-pointer text-left">
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        className="w-[300px] overflow-hidden rounded-xl border border-border bg-card p-0 shadow-xl"
      >
        {/* Banner */}
        <div
          className="h-[60px] w-full"
          style={{ backgroundColor: profile.banner_color || '#5865F2' }}
        />

        {/* Avatar overlapping banner */}
        <div className="relative px-4">
          <div className="-mt-7 mb-2 flex items-end gap-3">
            <div className="rounded-full border-[3px] border-card">
              <UserAvatar
                src={profile.avatar_url}
                username={profile.username}
                status={profile.status}
                size="lg"
                showStatus
              />
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="px-4 pb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-semibold text-foreground text-balance">
              {displayName}
            </span>
            {isStaff && (
              <StaffBadge
                role={profile.global_role}
                showBadge={badgeVisible}
              />
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <AtSign className="h-3 w-3" />
            <span>{profile.username}</span>
          </div>
        </div>

        <Separator className="mx-4 w-auto" />

        {/* Bio */}
        {profile.bio && (
          <div className="px-4 py-3">
            <h4 className="mb-1 text-[10px] font-bold uppercase tracking-wider text-foreground">
              About Me
            </h4>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Member Since */}
        <div className="px-4 pb-3">
          <h4 className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground">
            Member Since
          </h4>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>{memberSince}</span>
          </div>
        </div>

        {/* Server Roles */}
        {serverRoles && serverRoles.length > 0 && (
          <div className="px-4 pb-3">
            <h4 className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground">
              Roles
            </h4>
            <div className="flex flex-wrap gap-1">
              {serverRoles.map((role) => (
                <RoleBadge
                  key={role.name}
                  name={role.name}
                  color={role.color}
                />
              ))}
            </div>
          </div>
        )}

        {/* Staff badge toggle -- only for own profile + staff */}
        {isOwnProfile && isStaff && (
          <>
            <Separator className="mx-4 w-auto" />
            <div className="flex items-center justify-between px-4 py-3">
              <label
                htmlFor="badge-toggle"
                className="text-xs font-medium text-muted-foreground"
              >
                Show staff badge
              </label>
              <Switch
                id="badge-toggle"
                checked={badgeVisible}
                onCheckedChange={handleToggleBadge}
              />
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
