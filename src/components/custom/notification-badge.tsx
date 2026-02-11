import { cn } from '@/lib/utils/cn'

interface NotificationBadgeProps {
  count: number
  variant?: 'dot' | 'count'
  className?: string
}

export function NotificationBadge({ count, variant = 'count', className }: NotificationBadgeProps) {
  if (count <= 0) return null

  const displayCount = count > 99 ? '99+' : String(count)

  return (
    <span
      aria-hidden="true"
      className={cn(
        'absolute -top-1 -right-1 flex items-center justify-center bg-destructive text-destructive-foreground rounded-full text-[10px] font-bold leading-none',
        variant === 'dot' ? 'h-2.5 w-2.5' : 'h-4 min-w-4 px-1',
        className
      )}
    >
      {variant === 'count' && displayCount}
    </span>
  )
}
