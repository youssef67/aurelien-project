'use client'

import { useSyncExternalStore, useMemo, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SupplierRequestCard } from '@/components/custom/supplier-request-card'
import { RequestTypeFilterChips } from '@/components/custom/request-type-filter-chips'
import { RequestStatusFilterChips } from '@/components/custom/request-status-filter-chips'
import { cn } from '@/lib/utils/cn'
import type { SerializedSupplierRequest } from '@/lib/utils/requests'

// Type filter store
const TYPE_FILTER_KEY = 'supplier-requests-type-filter'
const TYPE_FILTER_EVENT = 'supplier-requests-type-filter-change'

const VALID_TYPES: ReadonlySet<string> = new Set(['INFO', 'ORDER'])

function subscribeTypeFilter(callback: () => void): () => void {
  window.addEventListener(TYPE_FILTER_EVENT, callback)
  return () => window.removeEventListener(TYPE_FILTER_EVENT, callback)
}

function getTypeFilterSnapshot(): string | null {
  const value = localStorage.getItem(TYPE_FILTER_KEY)
  if (value !== null && !VALID_TYPES.has(value)) return null
  return value
}

function getTypeFilterServerSnapshot(): null {
  return null
}

// Status filter store
const STATUS_FILTER_KEY = 'supplier-requests-status-filter'
const STATUS_FILTER_EVENT = 'supplier-requests-status-filter-change'

const VALID_STATUSES: ReadonlySet<string> = new Set(['PENDING', 'TREATED'])

function subscribeStatusFilter(callback: () => void): () => void {
  window.addEventListener(STATUS_FILTER_EVENT, callback)
  return () => window.removeEventListener(STATUS_FILTER_EVENT, callback)
}

function getStatusFilterSnapshot(): string | null {
  const value = localStorage.getItem(STATUS_FILTER_KEY)
  if (value !== null && !VALID_STATUSES.has(value)) return null
  return value
}

function getStatusFilterServerSnapshot(): null {
  return null
}

function getFilteredEmptyMessage(selectedType: string | null, selectedStatus: string | null): string {
  if (selectedType && selectedStatus) return 'Aucune demande correspondant aux filtres'
  if (selectedType === 'INFO') return 'Aucune demande de renseignements'
  if (selectedType === 'ORDER') return 'Aucune intention de commande'
  if (selectedStatus === 'PENDING') return 'Aucune nouvelle demande'
  if (selectedStatus === 'TREATED') return 'Aucune demande traitée'
  return 'Aucune demande correspondant aux filtres'
}

interface SupplierRequestListProps {
  requests: SerializedSupplierRequest[]
}

export function SupplierRequestList({ requests }: SupplierRequestListProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const selectedType = useSyncExternalStore(subscribeTypeFilter, getTypeFilterSnapshot, getTypeFilterServerSnapshot)
  const selectedStatus = useSyncExternalStore(subscribeStatusFilter, getStatusFilterSnapshot, getStatusFilterServerSnapshot)

  const handleTypeChange = useCallback((type: string | null) => {
    if (type) {
      localStorage.setItem(TYPE_FILTER_KEY, type)
    } else {
      localStorage.removeItem(TYPE_FILTER_KEY)
    }
    window.dispatchEvent(new Event(TYPE_FILTER_EVENT))
  }, [])

  const handleStatusChange = useCallback((status: string | null) => {
    if (status) {
      localStorage.setItem(STATUS_FILTER_KEY, status)
    } else {
      localStorage.removeItem(STATUS_FILTER_KEY)
    }
    window.dispatchEvent(new Event(STATUS_FILTER_EVENT))
  }, [])

  const handleResetFilters = useCallback(() => {
    localStorage.removeItem(TYPE_FILTER_KEY)
    localStorage.removeItem(STATUS_FILTER_KEY)
    window.dispatchEvent(new Event(TYPE_FILTER_EVENT))
    window.dispatchEvent(new Event(STATUS_FILTER_EVENT))
  }, [])

  // Cross-counts: type counts based on status-filtered requests
  const typeFilteredRequests = useMemo(() => {
    if (!selectedStatus) return requests
    return requests.filter((r) => r.status === selectedStatus)
  }, [requests, selectedStatus])

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const r of typeFilteredRequests) {
      counts[r.type] = (counts[r.type] || 0) + 1
    }
    return counts
  }, [typeFilteredRequests])

  // Cross-counts: status counts based on type-filtered requests
  const statusFilteredRequests = useMemo(() => {
    if (!selectedType) return requests
    return requests.filter((r) => r.type === selectedType)
  }, [requests, selectedType])

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const r of statusFilteredRequests) {
      counts[r.status] = (counts[r.status] || 0) + 1
    }
    return counts
  }, [statusFilteredRequests])

  // Final filtered list: both filters in AND
  const filteredRequests = useMemo(() => {
    let result = requests
    if (selectedType) result = result.filter((r) => r.type === selectedType)
    if (selectedStatus) result = result.filter((r) => r.status === selectedStatus)
    return result
  }, [requests, selectedType, selectedStatus])

  const hasActiveFilters = selectedType !== null || selectedStatus !== null

  function handleRefresh() {
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <RequestTypeFilterChips
          selectedType={selectedType}
          onTypeChange={handleTypeChange}
          typeCounts={typeCounts}
          totalCount={typeFilteredRequests.length}
        />
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <RequestStatusFilterChips
              selectedStatus={selectedStatus}
              onStatusChange={handleStatusChange}
              statusCounts={statusCounts}
              totalCount={statusFilteredRequests.length}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isPending}
            aria-label="Actualiser la liste"
            className="flex-shrink-0"
          >
            <RefreshCw className={cn('mr-1 h-4 w-4', isPending && 'animate-spin')} />
            Actualiser
          </Button>
        </div>
      </div>

      {filteredRequests.length === 0 && hasActiveFilters ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="font-display text-base font-semibold text-foreground mb-1">
            {getFilteredEmptyMessage(selectedType, selectedStatus)}
          </p>
          <Button variant="link" onClick={handleResetFilters} className="text-sm">
            Réinitialiser les filtres
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((request) => (
            <SupplierRequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  )
}
