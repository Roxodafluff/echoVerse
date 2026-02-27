import { createClient } from '@/lib/supabase/client'
import type { DmConversation, DirectMessage } from '@/lib/types'

const supabase = createClient()

export async function getConversations() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('dm_participants')
    .select('conversation_id, dm_conversations(*, dm_participants(*, profiles(*)))')
    .eq('user_id', user.id)

  if (error) throw error
  return (data?.map((p: { dm_conversations: DmConversation }) => p.dm_conversations) ?? []) as DmConversation[]
}

export async function getOrCreateConversation(otherUserId: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Check if conversation already exists
  const { data: existing } = await supabase
    .from('dm_participants')
    .select('conversation_id')
    .eq('user_id', user.id)

  if (existing) {
    for (const p of existing) {
      const { data: otherP } = await supabase
        .from('dm_participants')
        .select('conversation_id')
        .eq('conversation_id', p.conversation_id)
        .eq('user_id', otherUserId)
        .single()

      if (otherP) return otherP.conversation_id as string
    }
  }

  // Create new conversation
  const { data: conv, error: convError } = await supabase
    .from('dm_conversations')
    .insert({})
    .select()
    .single()

  if (convError) throw convError

  const { error: partError } = await supabase
    .from('dm_participants')
    .insert([
      { conversation_id: conv.id, user_id: user.id },
      { conversation_id: conv.id, user_id: otherUserId },
    ])

  if (partError) throw partError
  return conv.id as string
}

export async function getDmMessages(conversationId: string, limit = 50, cursor?: string) {
  let query = supabase
    .from('direct_messages')
    .select('*, profiles(*)')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (cursor) {
    query = query.lt('created_at', cursor)
  }

  const { data, error } = await query

  if (error) throw error
  return ((data ?? []) as DirectMessage[]).reverse()
}

export async function sendDm(conversationId: string, content: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('direct_messages')
    .insert({ conversation_id: conversationId, content, author_id: user.id })
    .select('*, profiles(*)')
    .single()

  if (error) throw error
  return data as DirectMessage
}
