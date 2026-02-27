'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { UserAvatar } from '@/components/ui/user-avatar'
import { RoleBadge } from '@/components/ui/role-badge'
import { StaffBadge } from '@/components/ui/staff-badge'
import { UserProfilePopover } from '@/components/ui/user-profile-popover'
import { updateProfile } from '@/lib/queries/profiles'
import type { ServerMember, MemberRole, Profile } from '@/lib/types'

interface MemberWithRoles extends ServerMember {
  roles: Array<{ name: string; color: string; position: number }>
}

export function MemberSidebar() {
  const params = useParams()
  const serverId = params?.serverId as string | undefined
  const [members, setMembers] = useState<MemberWithRoles[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    if (!serverId) return

    async function fetchMembers() {
      try {
        const supabase = createClient()

        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (user) setCurrentUserId(user.id)

        const { data: membersData } = await supabase
          .from('server_members')
          .select('*, profiles(*)')
          .eq('server_id', serverId!)

        if (!membersData) return

        const { data: memberRolesData } = await supabase
          .from('member_roles')
          .select('*, server_roles(*)')

        const enriched: MemberWithRoles[] = (membersData as ServerMember[]).map((m) => {
          const mRoles = (memberRolesData as MemberRole[] ?? [])
            .filter((mr) => mr.member_id === m.id)
            .map((mr) => mr.server_roles!)
            .filter(Boolean)
            .sort((a, b) => b.position - a.position)
            .map((r) => ({ name: r.name, color: r.color, position: r.position }))

          return { ...m, roles: mRoles }
        })

        // Sort: online first, then by highest role
        enriched.sort((a, b) => {
          const statusOrder = { online: 0, away: 1, dnd: 2, offline: 3 }
          const aStatus = a.profiles?.status ?? 'offline'
          const bStatus = b.profiles?.status ?? 'offline'
          const statusDiff = statusOrder[aStatus] - statusOrder[bStatus]
          if (statusDiff !== 0) return statusDiff
          const aTop = a.roles[0]?.position ?? 0
          const bTop = b.roles[0]?.position ?? 0
          return bTop - aTop
        })

        setMembers(enriched)
      } catch {
        // Supabase not connected yet
      }
    }

    fetchMembers()
  }, [serverId])

  async function handleToggleBadge(show: boolean) {
    try {
      await updateProfile({ show_staff_badge: show })
    } catch {
      // Failed to toggle badge
    }
  }

  if (!serverId) return null

  const onlineMembers = members.filter((m) => m.profiles?.status !== 'offline')
  const offlineMembers = members.filter((m) => m.profiles?.status === 'offline')

  return (
    <aside className="hidden h-full w-60 flex-col bg-echoverse-member-bar lg:flex">
      <div className="flex-1 overflow-y-auto px-2 py-4">
        {onlineMembers.length > 0 && (
          <MemberGroup
            label={`Online -- ${onlineMembers.length}`}
            members={onlineMembers}
            currentUserId={currentUserId}
            onToggleBadge={handleToggleBadge}
          />
        )}
        {offlineMembers.length > 0 && (
          <MemberGroup
            label={`Offline -- ${offlineMembers.length}`}
            members={offlineMembers}
            currentUserId={currentUserId}
            onToggleBadge={handleToggleBadge}
          />
        )}
        {members.length === 0 && (
          <p className="px-2 py-4 text-center text-xs text-muted-foreground">
            No members
          </p>
        )}
      </div>
    </aside>
  )
}

function MemberGroup({
  label,
  members,
  currentUserId,
  onToggleBadge,
}: {
  label: string
  members: MemberWithRoles[]
  currentUserId: string | null
  onToggleBadge: (show: boolean) => void
}) {
  return (
    <div className="mb-4">
      <h3 className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </h3>
      {members.map((member) => (
        <MemberItem
          key={member.id}
          member={member}
          isOwnProfile={currentUserId === member.user_id}
          onToggleBadge={onToggleBadge}
        />
      ))}
    </div>
  )
}

function MemberItem({
  member,
  isOwnProfile,
  onToggleBadge,
}: {
  member: MemberWithRoles
  isOwnProfile: boolean
  onToggleBadge: (show: boolean) => void
}) {
  const profile = member.profiles
  if (!profile) return null

  return (
    <UserProfilePopover
      profile={profile as Profile}
      serverRoles={member.roles}
      isOwnProfile={isOwnProfile}
      onToggleBadge={onToggleBadge}
      side="left"
      align="start"
    >
      <div className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent/50">
        <UserAvatar
          src={profile.avatar_url}
          username={profile.username}
          status={profile.status}
          size="sm"
        />
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-1">
            <p
              className="truncate text-sm font-medium"
              style={{ color: member.roles[0]?.color ?? undefined }}
            >
              {profile.display_name || profile.username}
            </p>
            <StaffBadge
              role={profile.global_role}
              showBadge={profile.show_staff_badge}
              iconOnly
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {member.roles.slice(0, 2).map((role) => (
              <RoleBadge key={role.name} name={role.name} color={role.color} />
            ))}
          </div>
        </div>
      </div>
    </UserProfilePopover>
  )
}
