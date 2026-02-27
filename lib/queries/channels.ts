import { createClient } from '@/lib/supabase/client'
import type { Channel, ChannelCategory } from '@/lib/types'

const supabase = createClient()

export async function getChannelCategories(serverId: string) {
  const { data, error } = await supabase
    .from('channel_categories')
    .select('*, channels(*)')
    .eq('server_id', serverId)
    .order('position')

  if (error) throw error

  const categories = (data ?? []) as ChannelCategory[]
  categories.forEach(cat => {
    if (cat.channels) {
      cat.channels.sort((a, b) => a.position - b.position)
    }
  })
  return categories
}

export async function getChannels(serverId: string) {
  const { data, error } = await supabase
    .from('channels')
    .select('*')
    .eq('server_id', serverId)
    .order('position')

  if (error) throw error
  return (data ?? []) as Channel[]
}

export async function getChannel(channelId: string) {
  const { data, error } = await supabase
    .from('channels')
    .select('*')
    .eq('id', channelId)
    .single()

  if (error) throw error
  return data as Channel
}

export async function createChannel(serverId: string, categoryId: string | null, name: string, type: 'text' | 'voice' = 'text') {
  const { data, error } = await supabase
    .from('channels')
    .insert({ server_id: serverId, category_id: categoryId, name, type })
    .select()
    .single()

  if (error) throw error
  return data as Channel
}

export async function updateChannel(channelId: string, updates: Partial<Pick<Channel, 'name' | 'topic'>>) {
  const { data, error } = await supabase
    .from('channels')
    .update(updates)
    .eq('id', channelId)
    .select()
    .single()

  if (error) throw error
  return data as Channel
}

export async function deleteChannel(channelId: string) {
  const { error } = await supabase
    .from('channels')
    .delete()
    .eq('id', channelId)

  if (error) throw error
}

export async function createCategory(serverId: string, name: string) {
  const { data, error } = await supabase
    .from('channel_categories')
    .insert({ server_id: serverId, name })
    .select()
    .single()

  if (error) throw error
  return data as ChannelCategory
}
