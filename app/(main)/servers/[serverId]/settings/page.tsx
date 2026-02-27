'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { RoleEditor } from '@/components/server/role-editor'
import { MemberManagement } from '@/components/server/member-management'
import { CreateChannelDialog } from '@/components/server/create-channel-dialog'
import { getServer, updateServer, deleteServer, getServerMembers } from '@/lib/queries/servers'
import { getChannelCategories } from '@/lib/queries/channels'
import { getRoles } from '@/lib/queries/roles'
import type { Server, ServerMember, ServerRole, ChannelCategory } from '@/lib/types'
import { Loader2, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ServerSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const serverId = params?.serverId as string

  const [server, setServer] = useState<Server | null>(null)
  const [members, setMembers] = useState<ServerMember[]>([])
  const [roles, setRoles] = useState<ServerRole[]>([])
  const [categories, setCategories] = useState<ChannelCategory[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [s, m, r, c] = await Promise.all([
        getServer(serverId),
        getServerMembers(serverId),
        getRoles(serverId),
        getChannelCategories(serverId),
      ])
      setServer(s)
      setMembers(m)
      setRoles(r)
      setCategories(c)
      setName(s.name)
      setDescription(s.description)
    } catch {
      // Server might not exist
    } finally {
      setLoading(false)
    }
  }, [serverId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleSave() {
    setSaving(true)
    try {
      await updateServer(serverId, { name, description })
      fetchData()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this server? This cannot be undone.')) return
    try {
      await deleteServer(serverId)
      router.push('/servers')
    } catch {
      // Error deleting
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!server) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Server not found
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/servers/${serverId}`}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold text-foreground">Server Settings</h1>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl px-6 py-6">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="channels">Channels</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="server-name">Server Name</Label>
                <Input
                  id="server-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="server-desc">Description</Label>
                <Textarea
                  id="server-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Server
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="roles" className="mt-6">
            <RoleEditor serverId={serverId} roles={roles} onRolesChange={fetchData} />
          </TabsContent>

          <TabsContent value="members" className="mt-6">
            <MemberManagement
              serverId={serverId}
              members={members}
              roles={roles}
              onRefresh={fetchData}
            />
          </TabsContent>

          <TabsContent value="channels" className="mt-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Channels</h3>
                <CreateChannelDialog
                  serverId={serverId}
                  categories={categories}
                  onCreated={fetchData}
                />
              </div>
              {categories.map((cat) => (
                <div key={cat.id}>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {cat.name}
                  </h4>
                  <div className="flex flex-col gap-1">
                    {cat.channels?.map((ch) => (
                      <div
                        key={ch.id}
                        className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                      >
                        <span className="text-sm text-foreground">
                          {ch.type === 'text' ? '#' : ''} {ch.name}
                        </span>
                        <span className="text-xs text-muted-foreground">{ch.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
