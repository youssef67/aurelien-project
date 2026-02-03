import { MobileLayout } from '@/components/layout/mobile-layout'
import { PageHeader } from '@/components/layout/page-header'

export default function OffersPage() {
  return (
    <MobileLayout header={<PageHeader title="Offres" />}>
      <div className="p-4">
        <p className="text-muted-foreground">Page des offres (à implémenter)</p>
      </div>
    </MobileLayout>
  )
}
