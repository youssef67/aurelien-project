import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function OfferCardSkeleton() {
  return (
    <Card>
      <CardContent className="flex gap-3 p-3">
        <Skeleton className="h-20 w-20 flex-shrink-0 rounded-lg" />
        <div className="flex flex-1 flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-10" />
          </div>
          <Skeleton className="h-3 w-28" />
        </div>
      </CardContent>
    </Card>
  )
}

export function OfferListSkeleton() {
  return (
    <div className="space-y-3">
      <OfferCardSkeleton />
      <OfferCardSkeleton />
      <OfferCardSkeleton />
    </div>
  )
}
