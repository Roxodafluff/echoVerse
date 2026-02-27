'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { RoleBadge } from '@/components/ui/role-badge'
import { createRole, updateRole, deleteRole } from '@/lib/queries/roles'
import type { ServerRole, RolePermissions } from '@/lib/types'
import { Plus, Trash2, Loader2 } from 'lucide-react'

const PERMISSION_LABELS: Record<keyof RolePermissions, string> = {
  manage_channels: 'Manage Channels',
  manage_roles: 'Manage Roles',
  kick_members: 'Kick Members',
  ban_members: 'Ban Members',
  manage_messages: 'Manage Messages',
  view_logs: 'View Audit Logs',
  administrator: 'Administrator',
}

const DEFAULT_PERMISSIONS: RolePermissions = {
  manage_channels: false,
  manage_roles: false,
  kick_members: false,
  ban_members: false,
  manage_messages: false,
  view_logs: false,
  administrator: false,
}

interface RoleEditorProps {
  serverId: string
  roles: ServerRole[]
  onRolesChange: () => void
}

export function RoleEditor({ serverId, roles, onRolesChange }: RoleEditorProps) {
  const [selectedRole, setSelectedRole] = useState<ServerRole | null>(null)
  const [creating, setCreating] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')
  const [newRoleColor, setNewRoleColor] = useState('#5865f2')
  const [saving, setSaving] = useState(false)

  async function handleCreateRole() {
    if (!newRoleName.trim()) return
    setCreating(true)
    try {
      await createRole(serverId, newRoleName.trim(), newRoleColor, DEFAULT_PERMISSIONS)
      setNewRoleName('')
      setNewRoleColor('#5865f2')
      onRolesChange()
    } finally {
      setCreating(false)
    }
  }

  async function handleUpdatePermission(roleId: string, key: keyof RolePermissions, value: boolean) {
    const role = roles.find((r) => r.id === roleId)
    if (!role) return
    setSaving(true)
    try {
      const updated = { ...role.permissions, [key]: value }
      await updateRole(roleId, { permissions: updated })
      onRolesChange()
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteRole(roleId: string) {
    try {
      await deleteRole(roleId)
      if (selectedRole?.id === roleId) setSelectedRole(null)
      onRolesChange()
    } catch {
      // Error deleting role
    }
  }

  return (
    <div className="flex gap-4">
      {/* Role list */}
      <div className="w-48 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-foreground">Roles</h3>
        </div>
        <div className="flex flex-col gap-1">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role)}
              className={`flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors ${
                selectedRole?.id === role.id
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50'
              }`}
            >
              <RoleBadge name={role.name} color={role.color} />
            </button>
          ))}
        </div>

        {/* New role form */}
        <div className="mt-4 flex flex-col gap-2">
          <Input
            placeholder="New role name"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            className="h-8 text-sm"
          />
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={newRoleColor}
              onChange={(e) => setNewRoleColor(e.target.value)}
              className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent"
              aria-label="Role color"
            />
            <Button
              size="sm"
              onClick={handleCreateRole}
              disabled={creating || !newRoleName.trim()}
              className="flex-1"
            >
              {creating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="mr-1 h-3 w-3" />}
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Permission editor */}
      <div className="flex-1">
        {selectedRole ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Permissions for{' '}
                <RoleBadge name={selectedRole.name} color={selectedRole.color} />
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => handleDeleteRole(selectedRole.id)}
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Delete Role
              </Button>
            </div>
            <div className="flex flex-col gap-3">
              {(Object.keys(PERMISSION_LABELS) as (keyof RolePermissions)[]).map((key) => (
                <div key={key} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{PERMISSION_LABELS[key]}</p>
                  </div>
                  <Switch
                    checked={selectedRole.permissions[key]}
                    onCheckedChange={(checked) =>
                      handleUpdatePermission(selectedRole.id, key, checked)
                    }
                    disabled={saving}
                    aria-label={PERMISSION_LABELS[key]}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center py-12 text-sm text-muted-foreground">
            Select a role to edit its permissions
          </div>
        )}
      </div>
    </div>
  )
}
