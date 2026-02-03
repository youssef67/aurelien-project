import { MobileLayout } from '@/components/layout/mobile-layout'
import { PageHeader } from '@/components/layout/page-header'

export default function RequestsPage() {
  return (
    <MobileLayout header={<PageHeader title="Demandes" />}>
      <div className="p-4">
        <p className="text-muted-foreground">Page des demandes (à implémenter)</p>
      </div>
    </MobileLayout>
  )
}
