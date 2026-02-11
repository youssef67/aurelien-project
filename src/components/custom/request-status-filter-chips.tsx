'use client'

import { cn } from '@/lib/utils/cn'
import { SUPPLIER_REQUEST_STATUS_CONFIG } from '@/lib/utils/requests'

const REQUEST_STATUSES = ['PENDING', 'TREATED'] as const

interface RequestStatusFilterChipsProps {
  selectedStatus: string | null
  onStatusChange: (status: string | null) => void
  statusCounts: Record<string, number>
  totalCount: number
}

export function RequestStatusFilterChips({
  selectedStatus,
  onStatusChange,
  statusCounts,
  totalCount,
}: RequestStatusFilterChipsProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto scrollbar-hide flex-nowrap pb-1"
      role="radiogroup"
      aria-label="Filtrer par statut"
    >
      <button
        type="button"
        role="radio"
        aria-checked={selectedStatus === null}
        onClick={() => onStatusChange(null)}
        className={cn(
          'min-h-[36px] px-3 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
          selectedStatus === null
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground'
        )}
      >
        Tous ({totalCount})
      </button>
      {REQUEST_STATUSES.map((status) => (
        <button
          type="button"
          key={status}
          role="radio"
          aria-checked={selectedStatus === status}
          onClick={() => onStatusChange(status)}
          className={cn(
            'min-h-[36px] px-3 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
            selectedStatus === status
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          )}
        >
          {SUPPLIER_REQUEST_STATUS_CONFIG[status].chipLabel} ({statusCounts[status] || 0})
        </button>
      ))}
    </div>
  )
}
