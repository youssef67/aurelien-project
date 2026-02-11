import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-8 w-48 bg-secondary" />
      <Skeleton className="h-24 w-full rounded-[0_16px_16px_16px] bg-secondary" />
      <Skeleton className="h-28 w-full rounded-[0_16px_16px_16px] bg-secondary" />
      <Skeleton className="h-20 w-full rounded-[0_16px_16px_16px] bg-secondary" />
    </div>
  )
}
