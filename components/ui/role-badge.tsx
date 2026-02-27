import { cn } from '@/lib/utils'

interface RoleBadgeProps {
  name: string
  color: string
  className?: string
}

export function RoleBadge({ name, color, className }: RoleBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        className
      )}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      {name}
    </span>
  )
}
