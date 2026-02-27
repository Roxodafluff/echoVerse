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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Report } from '@/lib/types'

export function ReportList() {
  const [reports, setReports] = useState<
    (Report & {
      reporter?: { username: string }
      reported_user?: { username: string }
    })[]
  >([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReports() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('reports')
          .select(
            '*, reporter:profiles!reports_reporter_id_fkey(username), reported_user:profiles!reports_reported_user_id_fkey(username)',
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

  async function handleAction(
    reportId: string,
    action: 'resolved' | 'dismissed',
  ) {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('reports')
        .update({ status: action, resolved_by: user.id })
        .eq('id', reportId)

      if (error) throw error

      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId ? { ...r, status: action } : r,
        ),
      )
      toast.success(`Report ${action}`)
    } catch {
      toast.error('Failed to update report')
    }
  }

  const statusColors: Record<string, string> = {
    open: 'bg-amber-500/10 text-amber-500',
    resolved: 'bg-emerald-500/10 text-emerald-500',
    dismissed: 'bg-muted text-muted-foreground',
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border">
        <p className="text-sm text-muted-foreground">No reports found</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border">
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
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell className="text-sm text-foreground">
                {report.reporter?.username ?? 'Unknown'}
              </TableCell>
              <TableCell className="text-sm text-foreground">
                {report.reported_user?.username ?? 'Unknown'}
              </TableCell>
              <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                {report.reason}
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={statusColors[report.status] || ''}
                >
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
                      onClick={() => handleAction(report.id, 'resolved')}
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span className="sr-only">Resolve</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handleAction(report.id, 'dismissed')}
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
  )
}
