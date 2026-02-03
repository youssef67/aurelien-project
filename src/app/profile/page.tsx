import { MobileLayout } from '@/components/layout/mobile-layout'
import { PageHeader } from '@/components/layout/page-header'

export default function ProfilePage() {
  return (
    <MobileLayout header={<PageHeader title="Profil" />}>
      <div className="p-4">
        <p className="text-muted-foreground">Page profil (à implémenter)</p>
      </div>
    </MobileLayout>
  )
}
