'use client'

import { useSyncExternalStore, useMemo, useTransition, useCallback, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, PackageSearch, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StoreOfferCard } from '@/components/custom/store-offer-card'
import { CategoryFilterChips } from '@/components/custom/category-filter-chips'
import { OfferFilterSheet } from '@/components/custom/offer-filter-sheet'
import type { BrandFilterValue } from '@/components/custom/offer-filter-sheet'
import { getWeekRange, getMonthRange, dateRangesOverlap } from '@/lib/utils/filters'
import type { DateFilterValue } from '@/lib/utils/filters'
import { cn } from '@/lib/utils/cn'
import { BRAND_LABELS, type BrandType } from '@/lib/validations/auth'
import type { SerializedOfferWithSupplier } from '@/lib/utils/offers'

// Category filter store (existing)
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

// Date filter store
const DATE_FILTER_KEY = 'store-offers-date-filter'
const DATE_FILTER_EVENT = 'date-filter-change'

const VALID_DATE_FILTERS: ReadonlySet<string> = new Set(['this-week', 'this-month'])

function subscribeDateFilter(callback: () => void): () => void {
  window.addEventListener(DATE_FILTER_EVENT, callback)
  return () => window.removeEventListener(DATE_FILTER_EVENT, callback)
}

function getDateFilterSnapshot(): DateFilterValue {
  const value = localStorage.getItem(DATE_FILTER_KEY)
  if (value !== null && VALID_DATE_FILTERS.has(value)) return value as DateFilterValue
  return 'all'
}

function getDateFilterServerSnapshot(): DateFilterValue {
  return 'all'
}

// Supplier filter store
const SUPPLIER_FILTER_KEY = 'store-offers-supplier-filter'
const SUPPLIER_FILTER_EVENT = 'supplier-filter-change'

function subscribeSupplierFilter(callback: () => void): () => void {
  window.addEventListener(SUPPLIER_FILTER_EVENT, callback)
  return () => window.removeEventListener(SUPPLIER_FILTER_EVENT, callback)
}

// Cache for supplier filter to avoid infinite loop with useSyncExternalStore
let cachedSupplierRaw: string | null = null
let cachedSupplierParsed: string[] = []
const EMPTY_SUPPLIER_FILTER: string[] = []

function getSupplierFilterSnapshot(): string[] {
  const value = localStorage.getItem(SUPPLIER_FILTER_KEY)
  if (!value) return EMPTY_SUPPLIER_FILTER
  if (value === cachedSupplierRaw) return cachedSupplierParsed
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) {
      cachedSupplierRaw = value
      cachedSupplierParsed = parsed
      return parsed
    }
    return EMPTY_SUPPLIER_FILTER
  } catch {
    return EMPTY_SUPPLIER_FILTER
  }
}

function getSupplierFilterServerSnapshot(): string[] {
  return EMPTY_SUPPLIER_FILTER
}

// Brand filter store
const BRAND_FILTER_KEY = 'store-offers-brand-filter'
const BRAND_FILTER_EVENT = 'brand-filter-change'

const VALID_BRAND_FILTERS: ReadonlySet<string> = new Set(['my-brand'])

function subscribeBrandFilter(callback: () => void): () => void {
  window.addEventListener(BRAND_FILTER_EVENT, callback)
  return () => window.removeEventListener(BRAND_FILTER_EVENT, callback)
}

function getBrandFilterSnapshot(): BrandFilterValue {
  const value = localStorage.getItem(BRAND_FILTER_KEY)
  if (value !== null && VALID_BRAND_FILTERS.has(value)) return value as BrandFilterValue
  return 'all'
}

function getBrandFilterServerSnapshot(): BrandFilterValue {
  return 'all'
}

interface StoreOfferListProps {
  offers: SerializedOfferWithSupplier[]
  storeBrand?: string
}

export function StoreOfferList({ offers, storeBrand }: StoreOfferListProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [sheetOpen, setSheetOpen] = useState(false)

  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])

  const selectedCategory = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const dateFilter = useSyncExternalStore(subscribeDateFilter, getDateFilterSnapshot, getDateFilterServerSnapshot)
  const supplierFilter = useSyncExternalStore(subscribeSupplierFilter, getSupplierFilterSnapshot, getSupplierFilterServerSnapshot)
  const brandFilter = useSyncExternalStore(subscribeBrandFilter, getBrandFilterSnapshot, getBrandFilterServerSnapshot)

  // Avoid SSR flash: don't apply any category until client has hydrated
  const effectiveCategory = hydrated ? selectedCategory : undefined

  const storeBrandLabel = storeBrand ? BRAND_LABELS[storeBrand as BrandType] : undefined

  const handleCategoryChange = useCallback((category: string | null) => {
    if (category) {
      localStorage.setItem(STORAGE_KEY, category)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }, [])

  const handleApplyFilters = useCallback((date: DateFilterValue, suppliers: string[], brand: BrandFilterValue) => {
    if (date === 'all') {
      localStorage.removeItem(DATE_FILTER_KEY)
    } else {
      localStorage.setItem(DATE_FILTER_KEY, date)
    }
    if (suppliers.length === 0) {
      localStorage.removeItem(SUPPLIER_FILTER_KEY)
    } else {
      localStorage.setItem(SUPPLIER_FILTER_KEY, JSON.stringify(suppliers))
    }
    if (brand === 'all') {
      localStorage.removeItem(BRAND_FILTER_KEY)
    } else {
      localStorage.setItem(BRAND_FILTER_KEY, brand)
    }
    window.dispatchEvent(new Event(DATE_FILTER_EVENT))
    window.dispatchEvent(new Event(SUPPLIER_FILTER_EVENT))
    window.dispatchEvent(new Event(BRAND_FILTER_EVENT))
  }, [])

  const handleResetFilters = useCallback(() => {
    localStorage.removeItem(DATE_FILTER_KEY)
    localStorage.removeItem(SUPPLIER_FILTER_KEY)
    localStorage.removeItem(BRAND_FILTER_KEY)
    window.dispatchEvent(new Event(DATE_FILTER_EVENT))
    window.dispatchEvent(new Event(SUPPLIER_FILTER_EVENT))
    window.dispatchEvent(new Event(BRAND_FILTER_EVENT))
  }, [])

  const handleResetAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(DATE_FILTER_KEY)
    localStorage.removeItem(SUPPLIER_FILTER_KEY)
    localStorage.removeItem(BRAND_FILTER_KEY)
    window.dispatchEvent(new Event(CHANGE_EVENT))
    window.dispatchEvent(new Event(DATE_FILTER_EVENT))
    window.dispatchEvent(new Event(SUPPLIER_FILTER_EVENT))
    window.dispatchEvent(new Event(BRAND_FILTER_EVENT))
  }, [])

  // Extract unique suppliers sorted alphabetically
  const uniqueSuppliers = useMemo(() =>
    [...new Map(offers.map((o) => [o.supplierId, { id: o.supplierId, companyName: o.supplier.companyName }])).values()]
      .sort((a, b) => a.companyName.localeCompare(b.companyName)),
    [offers]
  )

  // 1. Advanced filtering (date + supplier + brand) — applied on all offers
  const advancedFilteredOffers = useMemo(() => {
    let result = offers

    if (dateFilter !== 'all') {
      const range = dateFilter === 'this-week' ? getWeekRange() : getMonthRange()
      result = result.filter((o) => dateRangesOverlap(o.startDate, o.endDate, range.start, range.end))
    }

    if (supplierFilter.length > 0) {
      const supplierSet = new Set(supplierFilter)
      result = result.filter((o) => supplierSet.has(o.supplierId))
    }

    // Brand filter (MVP: no-op — all offers are compatible with all brands)
    if (brandFilter === 'my-brand' && storeBrand) {
      // MVP: All offers are compatible with all brands.
      // Future: Uncomment when Offer has a brandTargets field:
      // result = result.filter((o) =>
      //   !o.brandTargets || o.brandTargets.length === 0 || o.brandTargets.includes(storeBrand)
      // )
    }

    return result
  }, [offers, dateFilter, supplierFilter, brandFilter, storeBrand])

  // 2. Category counts computed AFTER advanced filtering, BEFORE category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const offer of advancedFilteredOffers) {
      counts[offer.category] = (counts[offer.category] || 0) + 1
    }
    return counts
  }, [advancedFilteredOffers])

  // 3. Category filtering on already-filtered offers
  const filteredOffers = useMemo(() => {
    if (!effectiveCategory) return advancedFilteredOffers
    return advancedFilteredOffers.filter((o) => o.category === effectiveCategory)
  }, [advancedFilteredOffers, effectiveCategory])

  const activeFilterCount =
    (dateFilter !== 'all' ? 1 : 0) +
    (supplierFilter.length > 0 ? 1 : 0) +
    (brandFilter !== 'all' ? 1 : 0)

  const hasAdvancedFilters = activeFilterCount > 0

  function handleRefresh() {
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <CategoryFilterChips
              selectedCategory={effectiveCategory}
              onCategoryChange={handleCategoryChange}
              categoryCounts={categoryCounts}
              totalCount={advancedFilteredOffers.length}
            />
          </div>
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="relative flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-secondary text-secondary-foreground"
            aria-label="Filtres avancés"
          >
            <SlidersHorizontal className="h-5 w-5" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                {activeFilterCount}
              </span>
            )}
          </button>
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

      {!hydrated ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-[0_16px_16px_16px] bg-secondary animate-pulse" />
          ))}
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <PackageSearch className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="font-display text-base font-semibold text-foreground mb-1">
            {hasAdvancedFilters
              ? 'Aucune offre ne correspond à vos filtres'
              : 'Aucune offre dans cette catégorie'}
          </p>
          {hasAdvancedFilters ? (
            <Button variant="link" onClick={handleResetAll} className="text-sm">
              Réinitialiser les filtres
            </Button>
          ) : (
            <Button variant="link" onClick={() => handleCategoryChange(null)} className="text-sm">
              Voir toutes les offres
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOffers.map((offer) => (
            <StoreOfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}

      <OfferFilterSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        suppliers={uniqueSuppliers}
        dateFilter={dateFilter}
        supplierFilter={supplierFilter}
        storeBrandLabel={storeBrandLabel}
        brandFilter={brandFilter}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
    </div>
  )
}
