'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/ui/user-avatar'
import { StaffBadge } from '@/components/ui/staff-badge'
import { Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Profile, GlobalRole } from '@/lib/types'

const GLOBAL_ROLES: GlobalRole[] = ['owner', 'admin', 'moderator', 'support', 'user']
const SENSITIVE_ROLES: GlobalRole[] = ['owner', 'admin']

export function GlobalRoles() {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [pendingChange, setPendingChange] = useState<{ userId: string; newRole: GlobalRole; username: string } | null>(null)

  async function handleSearch() {
    if (!query.trim()) return
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setUsers(data ?? [])
    } catch {
      toast.error('Failed to search users')
    } finally {
      setLoading(false)
    }
  }

  async function handleRoleChange(userId: string, newRole: GlobalRole) {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({ global_role: newRole })
        .eq('id', userId)

      if (error) throw error
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, global_role: newRole } : u)),
      )
      toast.success('Role updated')
    } catch {
      toast.error('Failed to update role')
    }
  }

  function initiateRoleChange(userId: string, newRole: GlobalRole, username: string) {
    if (SENSITIVE_ROLES.includes(newRole)) {
      setPendingChange({ userId, newRole, username })
    } else {
      handleRoleChange(userId, newRole)
    }
  }

  const roleColors: Record<string, string> = {
    owner: 'bg-amber-500/10 text-amber-500',
    admin: 'bg-red-500/10 text-red-500',
    moderator: 'bg-blue-500/10 text-blue-500',
    support: 'bg-emerald-500/10 text-emerald-500',
    user: 'bg-muted text-muted-foreground',
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users to change their global role..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-9"
          />
        </div>
        <Button onClick={handleSearch} disabled={loading} className="shrink-0">
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {users.length > 0 ? (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>Change Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          src={user.avatar_url}
                          username={user.username}
                          size="sm"
                          status={user.status}
                        />
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-foreground">
                            {user.display_name || user.username}
                          </span>
                          <StaffBadge role={user.global_role} showBadge={user.show_staff_badge} iconOnly />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      @{user.username}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={roleColors[user.global_role] || ''}>
                        {user.global_role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.global_role}
                        onValueChange={(val) => initiateRoleChange(user.id, val as GlobalRole, user.username)}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {GLOBAL_ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              <span className="capitalize">{role}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile card layout */}
          <div className="flex flex-col gap-2 md:hidden">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3"
              >
                <div className="flex items-center gap-3">
                  <UserAvatar
                    src={user.avatar_url}
                    username={user.username}
                    size="md"
                    status={user.status}
                  />
                  <div className="flex-1 truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-medium text-foreground">
                        {user.display_name || user.username}
                      </span>
                      <StaffBadge role={user.global_role} showBadge={user.show_staff_badge} iconOnly />
                    </div>
                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                  </div>
                  <Badge variant="secondary" className={roleColors[user.global_role] || ''}>
                    {user.global_role}
                  </Badge>
                </div>
                <Select
                  value={user.global_role}
                  onValueChange={(val) => initiateRoleChange(user.id, val as GlobalRole, user.username)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Change role" />
                  </SelectTrigger>
                  <SelectContent>
                    {GLOBAL_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        <span className="capitalize">{role}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border">
          <p className="text-sm text-muted-foreground">Search for users to manage their global roles</p>
        </div>
      )}

      {/* Sensitive role confirmation dialog */}
      <AlertDialog open={!!pendingChange} onOpenChange={(open) => !open && setPendingChange(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Assign Sensitive Role</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to assign the <strong className="capitalize">{pendingChange?.newRole}</strong> role to <strong>{pendingChange?.username}</strong>. This grants elevated platform permissions. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingChange) {
                  handleRoleChange(pendingChange.userId, pendingChange.newRole)
                  setPendingChange(null)
                }
              }}
            >
              Assign Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
