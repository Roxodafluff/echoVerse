import { GlobalRoles } from '@/components/admin/global-roles'

export default function AdminRolesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Global Roles</h1>
        <p className="text-sm text-muted-foreground">
          Assign global platform roles to users
        </p>
      </div>
      <GlobalRoles />
    </div>
  )
}
