import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { CreateOfferForm } from '@/components/forms/create-offer-form'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Nouvelle offre - aurelien-project',
  description: 'Créer une nouvelle offre promotionnelle',
}

export default async function NewOfferPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <>
      <PageHeader title="Nouvelle offre" showBack />
      <div className="flex-1 overflow-auto p-4">
        <CreateOfferForm supplierId={user.id} />
      </div>
    </>
  )
}
