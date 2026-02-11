import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma/client'
import { PageHeader } from '@/components/layout/page-header'
import { EditOfferForm } from '@/components/forms/edit-offer-form'
import { serializeOffer } from '@/lib/utils/offers'

export const metadata: Metadata = {
  title: "Modifier l'offre - aurelien-project",
  description: "Modifier une offre promotionnelle existante",
}

interface EditOfferPageProps {
  params: Promise<{ id: string }>
}

export default async function EditOfferPage({ params }: EditOfferPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const offer = await prisma.offer.findUnique({
    where: { id, supplierId: user.id, deletedAt: null },
  })

  if (!offer) redirect('/dashboard')

  return (
    <>
      <PageHeader title="Modifier l'offre" showBack />
      <div className="flex-1 overflow-auto p-4">
        <EditOfferForm offer={serializeOffer(offer)} supplierId={user.id} />
      </div>
    </>
  )
}
