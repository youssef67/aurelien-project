import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/page-header'
import { CreateOfferForm } from '@/components/forms/create-offer-form'

export const metadata: Metadata = {
  title: 'Nouvelle offre - aurelien-project',
  description: 'Créer une nouvelle offre promotionnelle',
}

export default function NewOfferPage() {
  return (
    <>
      <PageHeader title="Nouvelle offre" showBack />
      <div className="flex-1 overflow-auto p-4">
        <CreateOfferForm />
      </div>
    </>
  )
}
