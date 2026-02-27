'use client'

import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Lock, Unlock, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface ServerRow {
  id: string
  name: string
  description: string | null
  is_locked: boolean
  created_at: string
  owner: { username: string } | null
  member_count: number
}

export function ServerOverview() {
  const [servers, setServers] = useState<ServerRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchServers() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('servers')
          .select(
            '*, owner:profiles!servers_owner_id_fkey(username), server_members(count)',
          )
          .order('created_at', { ascending: false })
          .limit(100)

        if (error) throw error

        const mapped = (data ?? []).map((s: Record<string, unknown>) => ({
          id: s.id as string,
          name: s.name as string,
          description: s.description as string | null,
          is_locked: s.is_locked as boolean,
          created_at: s.created_at as string,
          owner: s.owner as { username: string } | null,
          member_count: Array.isArray(s.server_members)
            ? (s.server_members[0] as { count: number })?.count ?? 0
            : 0,
        }))

        setServers(mapped)
      } catch {
        // Supabase not connected
      } finally {
        setLoading(false)
      }
    }
    fetchServers()
  }, [])

  async function handleToggleLock(serverId: string, currentLocked: boolean) {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('servers')
        .update({ is_locked: !currentLocked })
        .eq('id', serverId)

      if (error) throw error

      setServers((prev) =>
        prev.map((s) =>
          s.id === serverId ? { ...s, is_locked: !currentLocked } : s,
        ),
      )
      toast.success(currentLocked ? 'Server unlocked' : 'Server locked')
    } catch {
      toast.error('Failed to update server')
    }
  }

  async function handleDelete(serverId: string) {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('servers')
        .delete()
        .eq('id', serverId)

      if (error) throw error

      setServers((prev) => prev.filter((s) => s.id !== serverId))
      toast.success('Server deleted')
    } catch {
      toast.error('Failed to delete server')
    }
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (servers.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border">
        <p className="text-sm text-muted-foreground">No servers found</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Members</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {servers.map((server) => (
            <TableRow key={server.id}>
              <TableCell className="text-sm font-medium text-foreground">
                {server.name}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {server.owner?.username ?? 'Unknown'}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {server.member_count}
              </TableCell>
              <TableCell>
                {server.is_locked ? (
                  <Badge
                    variant="secondary"
                    className="bg-red-500/10 text-red-500"
                  >
                    Locked
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-emerald-500/10 text-emerald-500"
                  >
                    Active
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(server.created_at).toLocaleDateString()}
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
                        handleToggleLock(server.id, server.is_locked)
                      }
                    >
                      {server.is_locked ? (
                        <>
                          <Unlock className="mr-2 h-4 w-4" />
                          Unlock Server
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Lock Server
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDelete(server.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Server
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
