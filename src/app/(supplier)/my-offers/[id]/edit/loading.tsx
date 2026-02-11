import { PageHeader } from '@/components/layout/page-header'
import { Skeleton } from '@/components/ui/skeleton'

export default function EditOfferLoading() {
  return (
    <>
      <PageHeader title="Modifier l'offre" showBack />
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* StepIndicator skeleton */}
        <Skeleton className="h-8 w-full" />

        {/* Form fields skeleton */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Button skeleton */}
        <Skeleton className="h-11 w-full" />
      </div>
    </>
  )
}
