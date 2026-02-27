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
import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/ui/user-avatar'
import { Search, MoreHorizontal, Ban, ShieldCheck, ShieldX } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Profile } from '@/lib/types'

export function UserManagement() {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)

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
      const {
        data: { user },
      } = await supabase.auth.getUser()
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

  async function handleSetRole(
    userId: string,
    role: string,
    username: string,
  ) {
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

  const roleColors: Record<string, string> = {
    owner: 'bg-red-500/10 text-red-500',
    admin: 'bg-amber-500/10 text-amber-500',
    moderator: 'bg-blue-500/10 text-blue-500',
    support: 'bg-emerald-500/10 text-emerald-500',
    user: 'bg-muted text-muted-foreground',
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
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
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {users.length > 0 ? (
        <div className="rounded-lg border border-border">
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
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        src={user.avatar_url}
                        fallback={
                          user.display_name?.[0] || user.username?.[0] || '?'
                        }
                        size="sm"
                        status={user.status}
                      />
                      <span className="text-sm font-medium text-foreground">
                        {user.display_name || user.username}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.username}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={roleColors[user.global_role] || ''}
                    >
                      {user.global_role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm capitalize text-muted-foreground">
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            handleSetRole(user.id, 'admin', user.username)
                          }
                        >
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          Make Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleSetRole(user.id, 'moderator', user.username)
                          }
                        >
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          Make Moderator
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleSetRole(user.id, 'user', user.username)
                          }
                        >
                          <ShieldX className="mr-2 h-4 w-4" />
                          Reset to User
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() =>
                            handleGlobalBan(user.id, user.username)
                          }
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          Global Ban
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border">
          <p className="text-sm text-muted-foreground">
            Search for users to manage them
          </p>
        </div>
      )}
    </div>
  )
}
