import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/page-header'

export const metadata: Metadata = {
  title: 'Demandes - aurelien-project',
  description: 'Gérer les demandes reçues',
}

export default function RequestsPage() {
  return (
    <>
      <PageHeader title="Demandes" />
      <div className="flex-1 overflow-auto p-4">
        <p className="text-muted-foreground">Liste des demandes à venir (Epic 5)</p>
      </div>
    </>
  )
}
