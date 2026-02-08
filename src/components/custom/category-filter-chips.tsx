'use client'

import { cn } from '@/lib/utils/cn'
import { getCategoryLabel } from '@/lib/utils/offers'
import type { OfferCategory } from '@prisma/client'

const CATEGORIES: OfferCategory[] = [
  'EPICERIE',
  'FRAIS',
  'DPH',
  'SURGELES',
  'BOISSONS',
  'AUTRES',
]

interface CategoryFilterChipsProps {
  selectedCategory: string | null
  onCategoryChange: (category: string | null) => void
  categoryCounts: Record<string, number>
  totalCount: number
}

export function CategoryFilterChips({
  selectedCategory,
  onCategoryChange,
  categoryCounts,
  totalCount,
}: CategoryFilterChipsProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto scrollbar-hide flex-nowrap pb-1"
      role="radiogroup"
      aria-label="Filtrer par catégorie"
    >
      <button
        type="button"
        role="radio"
        aria-checked={selectedCategory === null}
        onClick={() => onCategoryChange(null)}
        className={cn(
          'min-h-[36px] px-3 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
          selectedCategory === null
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground'
        )}
      >
        Tout ({totalCount})
      </button>

      {CATEGORIES.map((cat) => (
        <button
          type="button"
          key={cat}
          role="radio"
          aria-checked={selectedCategory === cat}
          onClick={() => onCategoryChange(cat)}
          className={cn(
            'min-h-[36px] px-3 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
            selectedCategory === cat
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          )}
        >
          {getCategoryLabel(cat)} ({categoryCounts[cat] || 0})
        </button>
      ))}
    </div>
  )
}
