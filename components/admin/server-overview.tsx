'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
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
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Lock, Unlock, Trash2, Search, Users } from 'lucide-react'
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

type DeleteTarget = { id: string; name: string } | null

export function ServerOverview() {
  const [servers, setServers] = useState<ServerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null)

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
        prev.map((s) => (s.id === serverId ? { ...s, is_locked: !currentLocked } : s)),
      )
      toast.success(currentLocked ? 'Server unlocked' : 'Server locked')
    } catch {
      toast.error('Failed to update server')
    }
  }

  async function handleDelete(serverId: string) {
    try {
      const supabase = createClient()
      const { error } = await supabase.from('servers').delete().eq('id', serverId)
      if (error) throw error
      setServers((prev) => prev.filter((s) => s.id !== serverId))
      toast.success('Server deleted')
    } catch {
      toast.error('Failed to delete server')
    }
  }

  const filteredServers = servers.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.owner?.username ?? '').toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search servers by name or owner..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredServers.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border">
          <p className="text-sm text-muted-foreground">No servers found</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
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
                {filteredServers.map((server) => (
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
                        <Badge variant="secondary" className="bg-red-500/10 text-red-500">
                          Locked
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(server.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <ServerActionsDropdown
                        server={server}
                        onToggleLock={handleToggleLock}
                        onDelete={(id, name) => setDeleteTarget({ id, name })}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile card layout */}
          <div className="flex flex-col gap-2 md:hidden">
            {filteredServers.map((server) => (
              <div
                key={server.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                  {server.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 truncate">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-foreground">{server.name}</span>
                    {server.is_locked ? (
                      <Badge variant="secondary" className="bg-red-500/10 text-red-500 text-[10px]">
                        Locked
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 text-[10px]">
                        Active
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{server.owner?.username ?? 'Unknown'}</span>
                    <span className="flex items-center gap-0.5">
                      <Users className="h-3 w-3" />
                      {server.member_count}
                    </span>
                  </div>
                </div>
                <ServerActionsDropdown
                  server={server}
                  onToggleLock={handleToggleLock}
                  onDelete={(id, name) => setDeleteTarget({ id, name })}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Server</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone and all channels, messages, and members will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) {
                  handleDelete(deleteTarget.id)
                  setDeleteTarget(null)
                }
              }}
            >
              Delete Server
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function ServerActionsDropdown({
  server,
  onToggleLock,
  onDelete,
}: {
  server: ServerRow
  onToggleLock: (id: string, locked: boolean) => void
  onDelete: (id: string, name: string) => void
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
        <DropdownMenuItem onClick={() => onToggleLock(server.id, server.is_locked)}>
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
          onClick={() => onDelete(server.id, server.name)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Server
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
