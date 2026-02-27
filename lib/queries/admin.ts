import { createClient } from '@/lib/supabase/client'
import type { Profile, Server, Report, GlobalBan, GlobalRole } from '@/lib/types'

const supabase = createClient()

export async function searchUsers(query: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
    .limit(50)

  if (error) throw error
  return (data ?? []) as Profile[]
}

export async function globalBanUser(userId: string, reason: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('global_bans')
    .insert({ user_id: userId, banned_by: user.id, reason })

  if (error) throw error
}

export async function removeGlobalBan(userId: string) {
  const { error } = await supabase
    .from('global_bans')
    .delete()
    .eq('user_id', userId)

  if (error) throw error
}

export async function getGlobalBans() {
  const { data, error } = await supabase
    .from('global_bans')
    .select('*, profile:profiles!global_bans_user_id_fkey(*), banned_by_profile:profiles!global_bans_banned_by_fkey(*)')

  if (error) throw error
  return (data ?? []) as GlobalBan[]
}

export async function getReports() {
  const { data, error } = await supabase
    .from('reports')
    .select('*, reporter:profiles!reports_reporter_id_fkey(*), reported_user:profiles!reports_reported_user_id_fkey(*), server:servers(*)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Report[]
}

export async function resolveReport(reportId: string, status: 'resolved' | 'dismissed') {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('reports')
    .update({ status, resolved_by: user.id })
    .eq('id', reportId)

  if (error) throw error
}

export async function getAllServers() {
  const { data, error } = await supabase
    .from('servers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Server[]
}

export async function lockServer(serverId: string, locked: boolean) {
  const { error } = await supabase
    .from('servers')
    .update({ is_locked: locked })
    .eq('id', serverId)

  if (error) throw error
}

export async function assignGlobalRole(userId: string, role: GlobalRole) {
  const { error } = await supabase
    .from('profiles')
    .update({ global_role: role })
    .eq('id', userId)

  if (error) throw error
}

export async function getRecentReports(limit = 5) {
  const { data, error } = await supabase
    .from('reports')
    .select('*, reporter:profiles!reports_reporter_id_fkey(*), reported_user:profiles!reports_reported_user_id_fkey(*)')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as Report[]
}

export async function getRecentUsers(limit = 5) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as Profile[]
}

export async function getAdminStats() {
  const [usersResult, serversResult, reportsResult, bansResult] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('servers').select('*', { count: 'exact', head: true }),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('global_bans').select('*', { count: 'exact', head: true }),
  ])

  return {
    totalUsers: usersResult.count ?? 0,
    totalServers: serversResult.count ?? 0,
    openReports: reportsResult.count ?? 0,
    activeBans: bansResult.count ?? 0,
  }
}

export async function deleteServer(serverId: string) {
  const { error } = await supabase
    .from('servers')
    .delete()
    .eq('id', serverId)

  if (error) throw error
}
