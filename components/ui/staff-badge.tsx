import { cn } from '@/lib/utils'
import type { GlobalRole } from '@/lib/types'
import { Shield, ShieldCheck, Crown, Headset } from 'lucide-react'

const staffConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  owner: {
    label: 'Owner',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/30',
    icon: Crown,
  },
  admin: {
    label: 'Admin',
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/30',
    icon: ShieldCheck,
  },
  moderator: {
    label: 'Mod',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/30',
    icon: Shield,
  },
  support: {
    label: 'Support',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/30',
    icon: Headset,
  },
}

interface StaffBadgeProps {
  role: GlobalRole
  showBadge?: boolean
  className?: string
  iconOnly?: boolean
}

export function StaffBadge({ role, showBadge = true, className, iconOnly = false }: StaffBadgeProps) {
  if (role === 'user' || !showBadge) return null

  const config = staffConfig[role]
  if (!config) return null

  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold leading-none',
        config.bg,
        config.border,
        config.color,
        className
      )}
      title={config.label}
    >
      <Icon className="h-2.5 w-2.5" />
      {!iconOnly && <span>{config.label}</span>}
    </span>
  )
}
