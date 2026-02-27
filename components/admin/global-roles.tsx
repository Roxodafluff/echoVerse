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
import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/ui/user-avatar'
import { Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Profile } from '@/lib/types'

const GLOBAL_ROLES = ['owner', 'admin', 'moderator', 'support', 'user'] as const

export function GlobalRoles() {
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

  async function handleRoleChange(userId: string, newRole: string) {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({ global_role: newRole })
        .eq('id', userId)

      if (error) throw error

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, global_role: newRole as Profile['global_role'] }
            : u,
        ),
      )
      toast.success('Role updated')
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
            placeholder="Search users to change their global role..."
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
                    <Select
                      value={user.global_role}
                      onValueChange={(val) => handleRoleChange(user.id, val)}
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
      ) : (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border">
          <p className="text-sm text-muted-foreground">
            Search for users to manage their global roles
          </p>
        </div>
      )}
    </div>
  )
}
