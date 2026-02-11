'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StoreRequestCard } from '@/components/custom/store-request-card'
import { cn } from '@/lib/utils/cn'
import type { SerializedStoreRequest } from '@/lib/utils/requests'

interface StoreRequestListProps {
  requests: SerializedStoreRequest[]
}

export function StoreRequestList({ requests }: StoreRequestListProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleRefresh() {
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
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

      <div className="space-y-3">
        {requests.map((request) => (
          <StoreRequestCard key={request.id} request={request} />
        ))}
      </div>
    </div>
  )
}
