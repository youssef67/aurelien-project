'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import type { DateFilterValue } from '@/lib/utils/filters'

export type { DateFilterValue }

export type BrandFilterValue = 'all' | 'my-brand'

const DATE_OPTIONS: { value: DateFilterValue; label: string }[] = [
  { value: 'all', label: 'Toutes les dates' },
  { value: 'this-week', label: 'Cette semaine' },
  { value: 'this-month', label: 'Ce mois' },
]

interface Supplier {
  id: string
  companyName: string
}

interface OfferFilterSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  suppliers: Supplier[]
  dateFilter: DateFilterValue
  supplierFilter: string[]
  storeBrandLabel?: string
  brandFilter: BrandFilterValue
  onApply: (date: DateFilterValue, suppliers: string[], brand: BrandFilterValue) => void
  onReset: () => void
}

export function OfferFilterSheet({
  open,
  onOpenChange,
  suppliers,
  dateFilter,
  supplierFilter,
  storeBrandLabel,
  brandFilter,
  onApply,
  onReset,
}: OfferFilterSheetProps) {
  const [localDateFilter, setLocalDateFilter] = useState<DateFilterValue>(dateFilter)
  const [localSuppliers, setLocalSuppliers] = useState<string[]>(supplierFilter)
  const [localBrandFilter, setLocalBrandFilter] = useState<BrandFilterValue>(brandFilter)
  const [prevOpen, setPrevOpen] = useState(open)

  if (open && !prevOpen) {
    setLocalDateFilter(dateFilter)
    setLocalSuppliers(supplierFilter)
    setLocalBrandFilter(brandFilter)
  }
  if (open !== prevOpen) {
    setPrevOpen(open)
  }

  function toggleSupplier(id: string) {
    setLocalSuppliers((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  function handleApply() {
    onApply(localDateFilter, localSuppliers, localBrandFilter)
    onOpenChange(false)
  }

  function handleReset() {
    setLocalDateFilter('all')
    setLocalSuppliers([])
    setLocalBrandFilter('all')
    onReset()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filtrer les offres</SheetTitle>
          <SheetDescription>Affinez votre recherche par date de validité, fournisseur et enseigne</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-4 px-4">
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Date de validité</h3>
            <div role="radiogroup" aria-label="Filtre par date" className="space-y-2">
              {DATE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={localDateFilter === option.value}
                  onClick={() => setLocalDateFilter(option.value)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                    localDateFilter === option.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Fournisseur</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {suppliers.map((supplier) => (
                <label key={supplier.id} className="flex items-center gap-3 py-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSuppliers.includes(supplier.id)}
                    onChange={() => toggleSupplier(supplier.id)}
                    className="h-4 w-4 rounded border-input"
                  />
                  <span className="text-sm">{supplier.companyName}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Enseigne compatible</h3>
            <div role="radiogroup" aria-label="Filtre par enseigne" className="space-y-2">
              <button
                type="button"
                role="radio"
                aria-checked={localBrandFilter === 'all'}
                onClick={() => setLocalBrandFilter('all')}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                  localBrandFilter === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                )}
              >
                Toutes les enseignes
              </button>
              {storeBrandLabel && (
                <button
                  type="button"
                  role="radio"
                  aria-checked={localBrandFilter === 'my-brand'}
                  onClick={() => setLocalBrandFilter('my-brand')}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                    localBrandFilter === 'my-brand'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  )}
                >
                  Mon enseigne uniquement ({storeBrandLabel})
                </button>
              )}
            </div>
          </div>
        </div>

        <SheetFooter className="flex-row gap-2 px-4">
          <Button type="button" variant="ghost" onClick={handleReset} className="flex-1">
            Réinitialiser
          </Button>
          <Button type="button" onClick={handleApply} className="flex-1">
            Appliquer
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
