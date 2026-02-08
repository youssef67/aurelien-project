'use client'

import { useSyncExternalStore, useMemo, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, PackageSearch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StoreOfferCard } from '@/components/custom/store-offer-card'
import { CategoryFilterChips } from '@/components/custom/category-filter-chips'
import { cn } from '@/lib/utils/cn'
import type { SerializedOfferWithSupplier } from '@/lib/utils/offers'

const STORAGE_KEY = 'store-offers-category-filter'
const CHANGE_EVENT = 'category-filter-change'

const VALID_CATEGORIES: ReadonlySet<string> = new Set([
  'EPICERIE', 'FRAIS', 'DPH', 'SURGELES', 'BOISSONS', 'AUTRES',
])

function subscribe(callback: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, callback)
  return () => window.removeEventListener(CHANGE_EVENT, callback)
}

function getSnapshot(): string | null {
  const value = localStorage.getItem(STORAGE_KEY)
  if (value !== null && !VALID_CATEGORIES.has(value)) return null
  return value
}

function getServerSnapshot(): null {
  return null
}

interface StoreOfferListProps {
  offers: SerializedOfferWithSupplier[]
}

export function StoreOfferList({ offers }: StoreOfferListProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const selectedCategory = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const handleCategoryChange = useCallback((category: string | null) => {
    if (category) {
      localStorage.setItem(STORAGE_KEY, category)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }, [])

  const filteredOffers = selectedCategory
    ? offers.filter((o) => o.category === selectedCategory)
    : offers

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const offer of offers) {
      counts[offer.category] = (counts[offer.category] || 0) + 1
    }
    return counts
  }, [offers])

  function handleRefresh() {
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <CategoryFilterChips
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            categoryCounts={categoryCounts}
            totalCount={offers.length}
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isPending}
          aria-label="Actualiser la liste"
        >
          <RefreshCw className={cn('mr-1 h-4 w-4', isPending && 'animate-spin')} />
          Actualiser
        </Button>
      </div>

      {filteredOffers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <PackageSearch className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="font-display text-base font-semibold text-foreground mb-1">
            Aucune offre dans cette catégorie
          </p>
          <Button variant="link" onClick={() => handleCategoryChange(null)} className="text-sm">
            Voir toutes les offres
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOffers.map((offer) => (
            <StoreOfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </div>
  )
}
