import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

const supabase = createClient()

export async function getCurrentProfile() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) return null
  return data as Profile
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data as Profile
}

export async function updateProfile(updates: Partial<Pick<Profile, 'display_name' | 'avatar_url' | 'bio' | 'status' | 'banner_color' | 'show_staff_badge'>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()

  if (error) throw error
  return data as Profile
}

export async function searchProfiles(query: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', `%${query}%`)
    .limit(20)

  if (error) throw error
  return (data ?? []) as Profile[]
}
