import { UserManagement } from '@/components/admin/user-management'

export default function AdminUsersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        <p className="text-sm text-muted-foreground">
          Search, manage, and moderate users across the platform
        </p>
      </div>
      <UserManagement />
    </div>
  )
}
