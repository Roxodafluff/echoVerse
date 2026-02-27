import { ServerOverview } from '@/components/admin/server-overview'

export default function AdminServersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Server Overview</h1>
        <p className="text-sm text-muted-foreground">
          Monitor, lock, or remove servers from the platform
        </p>
      </div>
      <ServerOverview />
    </div>
  )
}
