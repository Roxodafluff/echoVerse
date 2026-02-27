'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Flag,
  Server,
  Shield,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const dashboardItems = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
]

const managementItems = [
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Reports', href: '/admin/reports', icon: Flag },
  { label: 'Servers', href: '/admin/servers', icon: Server },
  { label: 'Global Roles', href: '/admin/roles', icon: Shield },
]

interface AdminSidebarProps {
  onNavigate?: () => void
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const pathname = usePathname()

  function isActive(href: string) {
    return href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
  }

  function renderNavItem(item: { label: string; href: string; icon: React.ElementType }) {
    const active = isActive(item.href)
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          active
            ? 'border-l-2 border-primary bg-primary/10 text-primary'
            : 'border-l-2 border-transparent text-muted-foreground hover:bg-accent hover:text-foreground',
        )}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        {item.label}
      </Link>
    )
  }

  return (
    <aside className="flex h-full w-60 flex-col bg-card">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
          <Shield className="h-4 w-4 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-none text-foreground">
            EchoVerse
          </span>
          <span className="text-[10px] font-medium text-muted-foreground">
            Admin Panel
          </span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-4 p-3">
        {/* Dashboard section */}
        <div className="flex flex-col gap-1">
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Dashboard
          </span>
          {dashboardItems.map(renderNavItem)}
        </div>

        {/* Management section */}
        <div className="flex flex-col gap-1">
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Management
          </span>
          {managementItems.map(renderNavItem)}
        </div>
      </nav>

      <div className="border-t border-border p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground"
          asChild
        >
          <Link href="/servers" onClick={onNavigate}>
            <ArrowLeft className="h-4 w-4" />
            Back to App
          </Link>
        </Button>
      </div>
    </aside>
  )
}
