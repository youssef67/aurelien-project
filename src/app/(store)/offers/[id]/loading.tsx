import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-8 w-48 bg-secondary" />
      <Skeleton className="aspect-video w-full rounded-[0_1rem_1rem_1rem] bg-secondary" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-64 bg-secondary" />
        <Skeleton className="h-4 w-32 bg-secondary" />
      </div>
      <Skeleton className="h-24 w-full rounded-lg bg-secondary" />
      <Skeleton className="h-20 w-full rounded-lg bg-secondary" />
    </div>
  )
}
