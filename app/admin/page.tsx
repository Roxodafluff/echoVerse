'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserAvatar } from '@/components/ui/user-avatar'
import { StaffBadge } from '@/components/ui/staff-badge'
import { Users, Server, Flag, ShieldAlert, TrendingUp, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getAdminStats, getRecentReports, getRecentUsers } from '@/lib/queries/admin'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { Profile, Report } from '@/lib/types'

// Demo chart data -- will be replaced with real analytics when connected
const chartData = [
  { day: 'Mon', users: 4, reports: 1 },
  { day: 'Tue', users: 7, reports: 2 },
  { day: 'Wed', users: 5, reports: 0 },
  { day: 'Thu', users: 9, reports: 3 },
  { day: 'Fri', users: 12, reports: 1 },
  { day: 'Sat', users: 8, reports: 2 },
  { day: 'Sun', users: 6, reports: 0 },
]

interface Stats {
  totalUsers: number
  totalServers: number
  openReports: number
  activeBans: number
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalServers: 0,
    openReports: 0,
    activeBans: 0,
  })
  const [recentReports, setRecentReports] = useState<Report[]>([])
  const [recentUsers, setRecentUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, reports, users] = await Promise.all([
          getAdminStats(),
          getRecentReports(5),
          getRecentUsers(5),
        ])
        setStats(statsData)
        setRecentReports(reports)
        setRecentUsers(users)
      } catch {
        // Supabase not connected yet
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const statCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      accent: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Total Servers',
      value: stats.totalServers,
      icon: Server,
      accent: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Open Reports',
      value: stats.openReports,
      icon: Flag,
      accent: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Active Bans',
      value: stats.activeBans,
      icon: ShieldAlert,
      accent: 'text-red-500',
      bg: 'bg-red-500/10',
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground text-balance">
          Admin Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Overview of your EchoVerse platform
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
              <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', card.bg)}>
                <card.icon className={cn('h-4 w-4', card.accent)} />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-8 w-16 animate-pulse rounded bg-muted" />
              ) : (
                <p className="text-3xl font-bold text-foreground">
                  {card.value.toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Weekly Activity
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full sm:h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.58 0.2 264)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.58 0.2 264)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="reportGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.75 0.16 65)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.75 0.16 65)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'var(--foreground)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="oklch(0.58 0.2 264)"
                  fillOpacity={1}
                  fill="url(#userGradient)"
                  strokeWidth={2}
                  name="New Users"
                />
                <Area
                  type="monotone"
                  dataKey="reports"
                  stroke="oklch(0.75 0.16 65)"
                  fillOpacity={1}
                  fill="url(#reportGradient)"
                  strokeWidth={2}
                  name="Reports"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent activity row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Recent Reports */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-amber-500" />
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Recent Reports
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded bg-muted" />
                ))}
              </div>
            ) : recentReports.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No open reports
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center gap-3 rounded-lg bg-accent/50 px-3 py-2"
                  >
                    <UserAvatar
                      src={report.reported_user?.avatar_url}
                      username={report.reported_user?.username ?? '?'}
                      size="sm"
                      showStatus={false}
                    />
                    <div className="flex-1 truncate">
                      <p className="truncate text-xs font-medium text-foreground">
                        {report.reported_user?.username ?? 'Unknown'}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {report.reason}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span className="hidden sm:inline">
                        {new Date(report.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Recent Signups
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded bg-muted" />
                ))}
              </div>
            ) : recentUsers.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No users yet
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 rounded-lg bg-accent/50 px-3 py-2"
                  >
                    <UserAvatar
                      src={user.avatar_url}
                      username={user.username}
                      status={user.status}
                      size="sm"
                    />
                    <div className="flex-1 truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-medium text-foreground">
                          {user.display_name || user.username}
                        </span>
                        <StaffBadge
                          role={user.global_role}
                          showBadge={user.show_staff_badge}
                          iconOnly
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        @{user.username}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span className="hidden sm:inline">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
