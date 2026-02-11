'use client'

import { cn } from '@/lib/utils/cn'
import { REQUEST_TYPE_CONFIG } from '@/lib/utils/requests'

const REQUEST_TYPES = ['INFO', 'ORDER'] as const

interface RequestTypeFilterChipsProps {
  selectedType: string | null
  onTypeChange: (type: string | null) => void
  typeCounts: Record<string, number>
  totalCount: number
}

export function RequestTypeFilterChips({
  selectedType,
  onTypeChange,
  typeCounts,
  totalCount,
}: RequestTypeFilterChipsProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto scrollbar-hide flex-nowrap pb-1"
      role="radiogroup"
      aria-label="Filtrer par type"
    >
      <button
        type="button"
        role="radio"
        aria-checked={selectedType === null}
        onClick={() => onTypeChange(null)}
        className={cn(
          'min-h-[36px] px-3 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
          selectedType === null
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground'
        )}
      >
        Tous ({totalCount})
      </button>
      {REQUEST_TYPES.map((type) => (
        <button
          type="button"
          key={type}
          role="radio"
          aria-checked={selectedType === type}
          onClick={() => onTypeChange(type)}
          className={cn(
            'min-h-[36px] px-3 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
            selectedType === type
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          )}
        >
          {REQUEST_TYPE_CONFIG[type].chipLabel} ({typeCounts[type] || 0})
        </button>
      ))}
    </div>
  )
}
