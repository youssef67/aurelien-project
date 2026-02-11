import { PageHeader } from '@/components/layout/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export default function OfferDetailLoading() {
  return (
    <>
      <PageHeader title="" showBack />
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Photo skeleton */}
        <Skeleton className="aspect-video w-full rounded-lg" />

        {/* Status + Price skeleton */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>
          </CardContent>
        </Card>

        {/* Dates skeleton */}
        <Card>
          <CardContent className="p-4 space-y-2">
            <Skeleton className="h-4 w-12" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-5 w-28" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-5 w-28" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details skeleton */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
