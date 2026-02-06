import { PageHeader } from '@/components/layout/page-header'
import { OfferListSkeleton } from '@/components/custom/offer-card-skeleton'

export default function DashboardLoading() {
  return (
    <>
      <PageHeader title="Mes offres" />
      <div className="flex-1 overflow-auto p-4">
        <OfferListSkeleton />
      </div>
    </>
  )
}
