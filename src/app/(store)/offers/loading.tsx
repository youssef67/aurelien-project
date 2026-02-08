import { PageHeader } from '@/components/layout/page-header'
import { StoreOfferListSkeleton } from '@/components/custom/store-offer-card-skeleton'

export default function StoreOffersLoading() {
  return (
    <>
      <PageHeader title="Offres disponibles" />
      <div className="flex-1 overflow-auto p-4">
        <StoreOfferListSkeleton />
      </div>
    </>
  )
}
