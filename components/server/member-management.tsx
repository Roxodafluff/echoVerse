'use client'

import { useState, useEffect } from 'react'
import { UserAvatar } from '@/components/ui/user-avatar'
import { RoleBadge } from '@/components/ui/role-badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { assignRole, removeRole } from '@/lib/queries/roles'
import type { ServerMember, ServerRole, MemberRole } from '@/lib/types'
import { UserX } from 'lucide-react'

interface MemberManagementProps {
  serverId: string
  members: ServerMember[]
  roles: ServerRole[]
  onRefresh: () => void
}

export function MemberManagement({ serverId, members, roles, onRefresh }: MemberManagementProps) {
  const [memberRolesMap, setMemberRolesMap] = useState<Record<string, MemberRole[]>>({})

  useEffect(() => {
    async function fetchMemberRoles() {
      const supabase = createClient()
      const { data } = await supabase
        .from('member_roles')
        .select('*, server_roles(*)')

      if (data) {
        const map: Record<string, MemberRole[]> = {}
        for (const mr of data as MemberRole[]) {
          if (!map[mr.member_id]) map[mr.member_id] = []
          map[mr.member_id].push(mr)
        }
        setMemberRolesMap(map)
      }
    }
    fetchMemberRoles()
  }, [serverId, members])

  async function handleAssignRole(memberId: string, roleId: string) {
    try {
      await assignRole(memberId, roleId)
      onRefresh()
    } catch {
      // Error assigning role
    }
  }

  async function handleKick(memberId: string) {
    const supabase = createClient()
    await supabase.from('server_members').delete().eq('id', memberId)
    onRefresh()
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-foreground">
        Members ({members.length})
      </h3>
      <div className="flex flex-col gap-1">
        {members.map((member) => {
          const profile = member.profiles
          if (!profile) return null
          const mRoles = memberRolesMap[member.id] ?? []

          return (
            <div
              key={member.id}
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
                <div className="mt-1 flex flex-wrap gap-1">
                  {mRoles.map((mr) =>
                    mr.server_roles ? (
                      <RoleBadge
                        key={mr.id}
                        name={mr.server_roles.name}
                        color={mr.server_roles.color}
                      />
                    ) : null
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select onValueChange={(roleId) => handleAssignRole(member.id, roleId)}>
                  <SelectTrigger className="h-8 w-32 text-xs">
                    <SelectValue placeholder="Add role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleKick(member.id)}
                  aria-label="Kick member"
                >
                  <UserX className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
