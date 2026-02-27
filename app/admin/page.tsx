'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Server, Flag, ShieldAlert } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Stats {
  totalUsers: number
  totalServers: number
  openReports: number
  globalBans: number
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalServers: 0,
    openReports: 0,
    globalBans: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const supabase = createClient()
        const [usersRes, serversRes, reportsRes, bansRes] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('servers').select('id', { count: 'exact', head: true }),
          supabase
            .from('reports')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'open'),
          supabase
            .from('global_bans')
            .select('id', { count: 'exact', head: true }),
        ])

        setStats({
          totalUsers: usersRes.count ?? 0,
          totalServers: serversRes.count ?? 0,
          openReports: reportsRes.count ?? 0,
          globalBans: bansRes.count ?? 0,
        })
      } catch {
        // Supabase not connected yet
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const cards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-500',
    },
    {
      label: 'Total Servers',
      value: stats.totalServers,
      icon: Server,
      color: 'text-emerald-500',
    },
    {
      label: 'Open Reports',
      value: stats.openReports,
      icon: Flag,
      color: 'text-amber-500',
    },
    {
      label: 'Global Bans',
      value: stats.globalBans,
      icon: ShieldAlert,
      color: 'text-red-500',
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Admin Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Overview of your EchoVerse platform
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
              <card.icon className={cn('h-5 w-5', card.color)} />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-8 w-16 animate-pulse rounded bg-muted" />
              ) : (
                <p className="text-3xl font-bold text-foreground">
                  {card.value}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Quick Info
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Welcome to the EchoVerse admin panel. Use the sidebar to navigate
            between user management, reports, server oversight, and global role
            assignment. Connect your Supabase instance and run the migration
            scripts to populate live data.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ')
}
