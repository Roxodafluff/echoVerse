'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { Home, Users, Plus, Settings, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { createClient } from '@/lib/supabase/client'
import type { Server } from '@/lib/types'

export function ServerBar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [servers, setServers] = useState<Server[]>([])
  const [showCreateServer, setShowCreateServer] = useState(false)

  useEffect(() => {
    async function fetchServers() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
          .from('server_members')
          .select('server_id, servers(*)')
          .eq('user_id', user.id)

        if (data) {
          setServers(data.map((m: { servers: Server }) => m.servers))
        }
      } catch {
        // Supabase not connected yet
      }
    }
    fetchServers()
  }, [])

  return (
    <TooltipProvider delayDuration={0}>
      <nav
        className="flex h-full w-[72px] flex-col items-center gap-2 bg-echoverse-server-bar py-3 overflow-y-auto"
        aria-label="Server navigation"
      >
        {/* Home / Friends */}
        <ServerBarIcon
          href="/friends"
          tooltip="Friends"
          active={pathname === '/friends'}
        >
          <Home className="h-5 w-5" />
        </ServerBarIcon>

        <ServerBarIcon
          href="/dms"
          tooltip="Direct Messages"
          active={pathname.startsWith('/dms')}
        >
          <Users className="h-5 w-5" />
        </ServerBarIcon>

        <Separator className="mx-auto w-8 bg-border" />

        {/* Server list */}
        {servers.map((server) => {
          const active = pathname.startsWith(`/servers/${server.id}`)
          return (
            <ServerBarIcon
              key={server.id}
              href={`/servers/${server.id}`}
              tooltip={server.name}
              active={active}
            >
              {server.icon_url ? (
                <img
                  src={server.icon_url}
                  alt={server.name}
                  className="h-full w-full rounded-full object-cover"
                  crossOrigin="anonymous"
                />
              ) : (
                <span className="text-sm font-semibold">
                  {server.name.slice(0, 2).toUpperCase()}
                </span>
              )}
            </ServerBarIcon>
          )
        })}

        {/* Create server */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => {
                // Dispatch custom event to open create server dialog
                window.dispatchEvent(new CustomEvent('open-create-server'))
                setShowCreateServer(!showCreateServer)
              }}
              className="flex h-12 w-12 items-center justify-center rounded-3xl bg-secondary text-muted-foreground transition-all hover:rounded-xl hover:bg-primary hover:text-primary-foreground"
              aria-label="Create a server"
            >
              <Plus className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Add a Server</TooltipContent>
        </Tooltip>

        <div className="mt-auto flex flex-col gap-2">
          <Separator className="mx-auto w-8 bg-border" />

          {/* Theme toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex h-12 w-12 items-center justify-center rounded-3xl bg-secondary text-muted-foreground transition-all hover:rounded-xl hover:bg-accent hover:text-accent-foreground"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </TooltipContent>
          </Tooltip>

          {/* Settings */}
          <ServerBarIcon href="/settings" tooltip="User Settings" active={pathname === '/settings'}>
            <Settings className="h-5 w-5" />
          </ServerBarIcon>
        </div>
      </nav>
    </TooltipProvider>
  )
}

function ServerBarIcon({
  href,
  tooltip,
  active,
  children,
}: {
  href: string
  tooltip: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className={cn(
            'relative flex h-12 w-12 items-center justify-center transition-all',
            active
              ? 'rounded-xl bg-primary text-primary-foreground'
              : 'rounded-3xl bg-secondary text-muted-foreground hover:rounded-xl hover:bg-primary hover:text-primary-foreground'
          )}
        >
          {active && (
            <span className="absolute left-0 top-1/2 h-5 w-1 -translate-x-[22px] -translate-y-1/2 rounded-r-full bg-foreground" />
          )}
          {children}
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">{tooltip}</TooltipContent>
    </Tooltip>
  )
}
