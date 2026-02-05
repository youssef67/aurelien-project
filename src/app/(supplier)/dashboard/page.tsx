import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma/client'
import { PageHeader } from '@/components/layout/page-header'
import { EmptyOffersState } from '@/components/custom/empty-offers-state'
import { FloatingActionButton } from '@/components/custom/floating-action-button'

export const metadata: Metadata = {
  title: 'Mes offres - aurelien-project',
  description: 'Gérez vos offres promotionnelles',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const offers = await prisma.offer.findMany({
    where: {
      supplierId: user.id,
      deletedAt: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <>
      <PageHeader title="Mes offres" />

      <div className="flex-1 overflow-auto p-4">
        {offers.length === 0 ? (
          <EmptyOffersState />
        ) : (
          <div>Liste des offres à implémenter (Story 2.4)</div>
        )}
      </div>

      <FloatingActionButton href="/offers/new" />
    </>
  )
}
