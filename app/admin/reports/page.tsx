import { ReportList } from '@/components/admin/report-list'

export default function AdminReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Review and resolve user reports
        </p>
      </div>
      <ReportList />
    </div>
  )
}
