'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { Search, MoreHorizontal, Ban, ShieldCheck, ShieldX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Profile } from '@/lib/types'

type FilterTab = 'all' | 'staff' | 'banned'

export function UserManagement() {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<FilterTab>('all')
  const [banTarget, setBanTarget] = useState<{ id: string; name: string } | null>(null)

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

  async function handleGlobalBan(userId: string, username: string) {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from('global_bans').insert({
        user_id: userId,
        banned_by: user.id,
        reason: 'Banned by admin',
      })

      if (error) throw error
      toast.success(`${username} has been globally banned`)
    } catch {
      toast.error('Failed to ban user')
    }
  }

  async function handleSetRole(userId: string, role: string, username: string) {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({ global_role: role })
        .eq('id', userId)

      if (error) throw error
      toast.success(`${username} role set to ${role}`)
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, global_role: role as Profile['global_role'] } : u,
        ),
      )
    } catch {
      toast.error('Failed to update role')
    }
  }

  const filteredUsers = users.filter((user) => {
    if (filter === 'staff') return user.global_role !== 'user'
    return true
  })

  const roleColors: Record<string, string> = {
    owner: 'bg-amber-500/10 text-amber-500',
    admin: 'bg-red-500/10 text-red-500',
    moderator: 'bg-blue-500/10 text-blue-500',
    support: 'bg-emerald-500/10 text-emerald-500',
    user: 'bg-muted text-muted-foreground',
  }

  const filterTabs: { value: FilterTab; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'staff', label: 'Staff' },
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* Search bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users by username or display name..."
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

      {/* Filter tabs */}
      {users.length > 0 && (
        <div className="flex gap-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilter(tab.value)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                filter === tab.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-accent',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {filteredUsers.length > 0 ? (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
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
                      <span className="text-sm capitalize text-muted-foreground">{user.status}</span>
                    </TableCell>
                    <TableCell>
                      <UserActionsDropdown
                        user={user}
                        onSetRole={handleSetRole}
                        onBan={(id, name) => setBanTarget({ id, name })}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile card layout */}
          <div className="flex flex-col gap-2 md:hidden">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
              >
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
                  <Badge variant="secondary" className={cn('mt-1', roleColors[user.global_role] || '')}>
                    {user.global_role}
                  </Badge>
                </div>
                <UserActionsDropdown
                  user={user}
                  onSetRole={handleSetRole}
                  onBan={(id, name) => setBanTarget({ id, name })}
                />
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border">
          <p className="text-sm text-muted-foreground">Search for users to manage them</p>
        </div>
      )}

      {/* Ban confirmation dialog */}
      <AlertDialog open={!!banTarget} onOpenChange={(open) => !open && setBanTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Global Ban User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to globally ban <strong>{banTarget?.name}</strong>? This action will prevent them from accessing the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (banTarget) {
                  handleGlobalBan(banTarget.id, banTarget.name)
                  setBanTarget(null)
                }
              }}
            >
              Ban User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function UserActionsDropdown({
  user,
  onSetRole,
  onBan,
}: {
  user: Profile
  onSetRole: (id: string, role: string, name: string) => void
  onBan: (id: string, name: string) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onSetRole(user.id, 'admin', user.username)}>
          <ShieldCheck className="mr-2 h-4 w-4" />
          Make Admin
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSetRole(user.id, 'moderator', user.username)}>
          <ShieldCheck className="mr-2 h-4 w-4" />
          Make Moderator
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSetRole(user.id, 'user', user.username)}>
          <ShieldX className="mr-2 h-4 w-4" />
          Reset to User
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => onBan(user.id, user.username)}
        >
          <Ban className="mr-2 h-4 w-4" />
          Global Ban
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
