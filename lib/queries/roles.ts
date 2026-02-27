import { createClient } from '@/lib/supabase/client'
import type { ServerRole, MemberRole, RolePermissions } from '@/lib/types'

const supabase = createClient()

export async function getRoles(serverId: string) {
  const { data, error } = await supabase
    .from('server_roles')
    .select('*')
    .eq('server_id', serverId)
    .order('position', { ascending: false })

  if (error) throw error
  return (data ?? []) as ServerRole[]
}

export async function createRole(serverId: string, name: string, color: string, permissions: RolePermissions) {
  const { data, error } = await supabase
    .from('server_roles')
    .insert({ server_id: serverId, name, color, permissions })
    .select()
    .single()

  if (error) throw error
  return data as ServerRole
}

export async function updateRole(roleId: string, updates: Partial<Pick<ServerRole, 'name' | 'color' | 'permissions' | 'position'>>) {
  const { data, error } = await supabase
    .from('server_roles')
    .update(updates)
    .eq('id', roleId)
    .select()
    .single()

  if (error) throw error
  return data as ServerRole
}

export async function deleteRole(roleId: string) {
  const { error } = await supabase
    .from('server_roles')
    .delete()
    .eq('id', roleId)

  if (error) throw error
}

export async function getMemberRoles(memberId: string) {
  const { data, error } = await supabase
    .from('member_roles')
    .select('*, server_roles(*)')
    .eq('member_id', memberId)

  if (error) throw error
  return (data ?? []) as MemberRole[]
}

export async function assignRole(memberId: string, roleId: string) {
  const { error } = await supabase
    .from('member_roles')
    .insert({ member_id: memberId, role_id: roleId })

  if (error) throw error
}

export async function removeRole(memberId: string, roleId: string) {
  const { error } = await supabase
    .from('member_roles')
    .delete()
    .eq('member_id', memberId)
    .eq('role_id', roleId)

  if (error) throw error
}
