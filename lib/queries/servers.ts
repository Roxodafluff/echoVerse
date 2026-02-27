import { createClient } from '@/lib/supabase/client'
import type { Server, ServerMember } from '@/lib/types'

const supabase = createClient()

export async function getUserServers() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('server_members')
    .select('server_id, servers(*)')
    .eq('user_id', user.id)

  if (error) throw error
  return (data?.map((m: { servers: Server }) => m.servers) ?? []) as Server[]
}

export async function getServer(serverId: string) {
  const { data, error } = await supabase
    .from('servers')
    .select('*')
    .eq('id', serverId)
    .single()

  if (error) throw error
  return data as Server
}

export async function createServer(name: string, description?: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('servers')
    .insert({ name, description: description ?? '', owner_id: user.id })
    .select()
    .single()

  if (error) throw error
  return data as Server
}

export async function updateServer(serverId: string, updates: Partial<Pick<Server, 'name' | 'description' | 'icon_url'>>) {
  const { data, error } = await supabase
    .from('servers')
    .update(updates)
    .eq('id', serverId)
    .select()
    .single()

  if (error) throw error
  return data as Server
}

export async function deleteServer(serverId: string) {
  const { error } = await supabase
    .from('servers')
    .delete()
    .eq('id', serverId)

  if (error) throw error
}

export async function getServerMembers(serverId: string) {
  const { data, error } = await supabase
    .from('server_members')
    .select('*, profiles(*)')
    .eq('server_id', serverId)

  if (error) throw error
  return (data ?? []) as ServerMember[]
}

export async function joinServer(serverId: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('server_members')
    .insert({ server_id: serverId, user_id: user.id })

  if (error) throw error
}

export async function leaveServer(serverId: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('server_members')
    .delete()
    .eq('server_id', serverId)
    .eq('user_id', user.id)

  if (error) throw error
}
