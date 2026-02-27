import { createClient } from '@/lib/supabase/client'
import type { Message } from '@/lib/types'

const supabase = createClient()

export async function getMessages(channelId: string, limit = 50, cursor?: string) {
  let query = supabase
    .from('messages')
    .select('*, profiles(*), message_reactions(*)')
    .eq('channel_id', channelId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (cursor) {
    query = query.lt('created_at', cursor)
  }

  const { data, error } = await query

  if (error) throw error
  return ((data ?? []) as Message[]).reverse()
}

export async function sendMessage(channelId: string, content: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('messages')
    .insert({ channel_id: channelId, content, author_id: user.id })
    .select('*, profiles(*), message_reactions(*)')
    .single()

  if (error) throw error
  return data as Message
}

export async function editMessage(messageId: string, content: string) {
  const { data, error } = await supabase
    .from('messages')
    .update({ content, edited_at: new Date().toISOString() })
    .eq('id', messageId)
    .select('*, profiles(*), message_reactions(*)')
    .single()

  if (error) throw error
  return data as Message
}

export async function deleteMessage(messageId: string) {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId)

  if (error) throw error
}

export async function addReaction(messageId: string, emoji: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('message_reactions')
    .insert({ message_id: messageId, user_id: user.id, emoji })

  if (error) throw error
}

export async function removeReaction(messageId: string, emoji: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('message_reactions')
    .delete()
    .eq('message_id', messageId)
    .eq('user_id', user.id)
    .eq('emoji', emoji)

  if (error) throw error
}
