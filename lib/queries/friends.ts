import { createClient } from '@/lib/supabase/client'
import type { FriendRequest } from '@/lib/types'

const supabase = createClient()

export async function getFriends() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('friend_requests')
    .select('*, from_profile:profiles!friend_requests_from_user_id_fkey(*), to_profile:profiles!friend_requests_to_user_id_fkey(*)')
    .eq('status', 'accepted')
    .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)

  if (error) throw error
  return (data ?? []) as FriendRequest[]
}

export async function getPendingRequests() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('friend_requests')
    .select('*, from_profile:profiles!friend_requests_from_user_id_fkey(*), to_profile:profiles!friend_requests_to_user_id_fkey(*)')
    .eq('status', 'pending')
    .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)

  if (error) throw error
  return (data ?? []) as FriendRequest[]
}

export async function sendFriendRequest(toUserId: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('friend_requests')
    .insert({ from_user_id: user.id, to_user_id: toUserId })

  if (error) throw error
}

export async function respondToRequest(requestId: string, status: 'accepted' | 'rejected') {
  const { error } = await supabase
    .from('friend_requests')
    .update({ status })
    .eq('id', requestId)

  if (error) throw error
}

export async function removeFriend(requestId: string) {
  const { error } = await supabase
    .from('friend_requests')
    .delete()
    .eq('id', requestId)

  if (error) throw error
}
