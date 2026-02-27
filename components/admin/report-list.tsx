'use client'

import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/ui/user-avatar'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Report } from '@/lib/types'

type FilterTab = 'all' | 'open' | 'resolved' | 'dismissed'

type ReportRow = Report & {
  reporter?: { username: string; avatar_url: string | null }
  reported_user?: { username: string; avatar_url: string | null }
}

export function ReportList() {
  const [reports, setReports] = useState<ReportRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterTab>('all')
  const [actionTarget, setActionTarget] = useState<{ id: string; action: 'resolved' | 'dismissed' } | null>(null)

  useEffect(() => {
    async function fetchReports() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('reports')
          .select(
            '*, reporter:profiles!reports_reporter_id_fkey(username, avatar_url), reported_user:profiles!reports_reported_user_id_fkey(username, avatar_url)',
          )
          .order('created_at', { ascending: false })
          .limit(100)

        if (error) throw error
        setReports(data ?? [])
      } catch {
        // Supabase not connected
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [])

  async function handleAction(reportId: string, action: 'resolved' | 'dismissed') {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('reports')
        .update({ status: action, resolved_by: user.id })
        .eq('id', reportId)

      if (error) throw error
      setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status: action } : r)))
      toast.success(`Report ${action}`)
    } catch {
      toast.error('Failed to update report')
    }
  }

  const filteredReports = reports.filter((r) => {
    if (filter === 'all') return true
    return r.status === filter
  })

  const statusColors: Record<string, string> = {
    open: 'bg-amber-500/10 text-amber-500',
    resolved: 'bg-emerald-500/10 text-emerald-500',
    dismissed: 'bg-muted text-muted-foreground',
  }

  const filterTabs: { value: FilterTab; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: reports.length },
    { value: 'open', label: 'Open', count: reports.filter((r) => r.status === 'open').length },
    { value: 'resolved', label: 'Resolved', count: reports.filter((r) => r.status === 'resolved').length },
    { value: 'dismissed', label: 'Dismissed', count: reports.filter((r) => r.status === 'dismissed').length },
  ]

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFilter(tab.value)}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              filter === tab.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-accent',
            )}
          >
            {tab.label}
            <span className={cn(
              'rounded-full px-1.5 py-0.5 text-[10px]',
              filter === tab.value ? 'bg-primary-foreground/20' : 'bg-muted-foreground/20',
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {filteredReports.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border">
          <p className="text-sm text-muted-foreground">No reports found</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Reported User</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          src={report.reporter?.avatar_url}
                          username={report.reporter?.username ?? '?'}
                          size="sm"
                          showStatus={false}
                        />
                        <span className="text-sm text-foreground">
                          {report.reporter?.username ?? 'Unknown'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          src={report.reported_user?.avatar_url}
                          username={report.reported_user?.username ?? '?'}
                          size="sm"
                          showStatus={false}
                        />
                        <span className="text-sm text-foreground">
                          {report.reported_user?.username ?? 'Unknown'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                      {report.reason}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusColors[report.status] || ''}>
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(report.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {report.status === 'open' && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-emerald-500 hover:text-emerald-600"
                            onClick={() => setActionTarget({ id: report.id, action: 'resolved' })}
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span className="sr-only">Resolve</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => setActionTarget({ id: report.id, action: 'dismissed' })}
                          >
                            <XCircle className="h-4 w-4" />
                            <span className="sr-only">Dismiss</span>
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile card layout */}
          <div className="flex flex-col gap-2 md:hidden">
            {filteredReports.map((report) => (
              <div key={report.id} className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <UserAvatar
                        src={report.reported_user?.avatar_url}
                        username={report.reported_user?.username ?? '?'}
                        size="sm"
                        showStatus={false}
                      />
                      <span className="font-medium text-foreground">
                        {report.reported_user?.username ?? 'Unknown'}
                      </span>
                      <Badge variant="secondary" className={cn('text-[10px]', statusColors[report.status] || '')}>
                        {report.status}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                      {report.reason}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>by {report.reporter?.username ?? 'Unknown'}</span>
                      <span>--</span>
                      <span>{new Date(report.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {report.status === 'open' && (
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-emerald-500"
                        onClick={() => setActionTarget({ id: report.id, action: 'resolved' })}
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground"
                        onClick={() => setActionTarget({ id: report.id, action: 'dismissed' })}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Confirmation dialog */}
      <AlertDialog open={!!actionTarget} onOpenChange={(open) => !open && setActionTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionTarget?.action === 'resolved' ? 'Resolve Report' : 'Dismiss Report'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {actionTarget?.action === 'resolved' ? 'resolve' : 'dismiss'} this report? This action will mark it as {actionTarget?.action}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (actionTarget) {
                  handleAction(actionTarget.id, actionTarget.action)
                  setActionTarget(null)
                }
              }}
            >
              {actionTarget?.action === 'resolved' ? 'Resolve' : 'Dismiss'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
