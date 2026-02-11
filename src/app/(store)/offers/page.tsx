import type { Metadata } from 'next'
import { PackageSearch } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { StoreOfferList } from '@/components/custom/store-offer-list'
import { getActiveOffers } from '@/lib/queries/offers'
import { serializeOfferWithSupplier } from '@/lib/utils/offers'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma/client'

export const metadata: Metadata = {
  title: 'Offres disponibles',
}

export default async function StoreOffersPage() {
  const supabase = await createClient()

  const [{ data: { user } }, offers] = await Promise.all([
    supabase.auth.getUser(),
    getActiveOffers(),
  ])

  const serializedOffers = offers.map(serializeOfferWithSupplier)

  const store = user
    ? await prisma.store.findUnique({ where: { id: user.id }, select: { brand: true } })
    : null

  return (
    <>
      <PageHeader title="Offres disponibles" />
      <div className="flex-1 overflow-auto p-4 bg-muted">
        {serializedOffers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <PackageSearch className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h2 className="font-display text-lg font-semibold text-foreground mb-2">
              Aucune offre disponible
            </h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              Aucune offre disponible pour le moment. Revenez bientôt !
            </p>
          </div>
        ) : (
          <StoreOfferList offers={serializedOffers} storeBrand={store?.brand} />
        )}
      </div>
    </>
  )
}
