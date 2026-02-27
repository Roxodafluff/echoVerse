'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Hash, Volume2, ChevronDown, Plus, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { UserAvatar } from '@/components/ui/user-avatar'
import type { Server, ChannelCategory, Channel, Profile } from '@/lib/types'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

export function ChannelSidebar() {
  const params = useParams()
  const pathname = usePathname()
  const serverId = params?.serverId as string | undefined
  const channelId = params?.channelId as string | undefined

  const [server, setServer] = useState<Server | null>(null)
  const [categories, setCategories] = useState<ChannelCategory[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    if (!serverId) return

    async function fetchData() {
      try {
        const supabase = createClient()

        const [serverRes, categoriesRes, userRes] = await Promise.all([
          supabase.from('servers').select('*').eq('id', serverId).single(),
          supabase
            .from('channel_categories')
            .select('*, channels(*)')
            .eq('server_id', serverId!)
            .order('position'),
          supabase.auth.getUser(),
        ])

        if (serverRes.data) setServer(serverRes.data as Server)
        if (categoriesRes.data) {
          const cats = categoriesRes.data as ChannelCategory[]
          cats.forEach((cat) => {
            if (cat.channels) cat.channels.sort((a, b) => a.position - b.position)
          })
          setCategories(cats)
        }

        if (userRes.data.user) {
          const { data: p } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userRes.data.user.id)
            .single()
          if (p) setProfile(p as Profile)
        }
      } catch {
        // Supabase not connected yet
      }
    }

    fetchData()
  }, [serverId])

  if (!serverId) return null

  return (
    <aside className="flex h-full w-60 flex-col bg-echoverse-sidebar">
      {/* Server header */}
      <div className="flex h-12 items-center justify-between border-b border-border px-4">
        <h2 className="truncate text-sm font-semibold text-foreground">
          {server?.name ?? 'Loading...'}
        </h2>
        {server && (
          <Link
            href={`/servers/${serverId}/settings`}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Server settings"
          >
            <Settings className="h-4 w-4" />
          </Link>
        )}
      </div>

      {/* Channel list */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {categories.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            serverId={serverId}
            activeChannelId={channelId}
          />
        ))}
        {categories.length === 0 && (
          <p className="px-2 py-4 text-center text-xs text-muted-foreground">
            No channels yet
          </p>
        )}
      </div>

      {/* User panel */}
      {profile && (
        <div className="flex items-center gap-2 border-t border-border bg-echoverse-server-bar px-3 py-2">
          <UserAvatar
            src={profile.avatar_url}
            username={profile.username}
            status={profile.status}
            size="sm"
          />
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-xs font-medium text-foreground">
              {profile.display_name || profile.username}
            </p>
            <p className="truncate text-[10px] text-muted-foreground">
              {profile.status}
            </p>
          </div>
        </div>
      )}
    </aside>
  )
}

function CategorySection({
  category,
  serverId,
  activeChannelId,
}: {
  category: ChannelCategory
  serverId: string
  activeChannelId?: string
}) {
  const [open, setOpen] = useState(true)

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mb-1">
      <CollapsibleTrigger className="flex w-full items-center gap-0.5 px-1 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground">
        <ChevronDown
          className={cn('h-3 w-3 transition-transform', !open && '-rotate-90')}
        />
        <span className="truncate">{category.name}</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        {category.channels?.map((channel) => (
          <ChannelItem
            key={channel.id}
            channel={channel}
            serverId={serverId}
            active={channel.id === activeChannelId}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

function ChannelItem({
  channel,
  serverId,
  active,
}: {
  channel: Channel
  serverId: string
  active: boolean
}) {
  return (
    <Link
      href={`/servers/${serverId}/${channel.id}`}
      className={cn(
        'flex items-center gap-1.5 rounded-md px-2 py-1 text-sm transition-colors',
        active
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
      )}
    >
      {channel.type === 'voice' ? (
        <Volume2 className="h-4 w-4 shrink-0 opacity-60" />
      ) : (
        <Hash className="h-4 w-4 shrink-0 opacity-60" />
      )}
      <span className="truncate">{channel.name}</span>
    </Link>
  )
}
