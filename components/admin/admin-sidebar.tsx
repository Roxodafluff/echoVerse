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

const navItems = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Reports', href: '/admin/reports', icon: Flag },
  { label: 'Servers', href: '/admin/servers', icon: Server },
  { label: 'Global Roles', href: '/admin/roles', icon: Shield },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-4">
        <Shield className="h-5 w-5 text-primary" />
        <span className="text-sm font-semibold text-foreground">
          Admin Panel
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-2">
        {navItems.map((item) => {
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground"
          asChild
        >
          <Link href="/servers">
            <ArrowLeft className="h-4 w-4" />
            Back to App
          </Link>
        </Button>
      </div>
    </aside>
  )
}
