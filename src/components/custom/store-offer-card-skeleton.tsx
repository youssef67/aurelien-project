import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function StoreOfferCardSkeleton() {
  return (
    <Card>
      <CardContent className="flex gap-3 p-3">
        <Skeleton className="h-20 w-20 flex-shrink-0 rounded-[0_0.75rem_0_0]" />
        <div className="flex flex-1 flex-col justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-2/5" />
        </div>
      </CardContent>
    </Card>
  )
}

export function StoreOfferListSkeleton() {
  return (
    <div className="space-y-3">
      <StoreOfferCardSkeleton />
      <StoreOfferCardSkeleton />
      <StoreOfferCardSkeleton />
    </div>
  )
}
