import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Package, Pencil, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma/client'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DeleteOfferButton } from '@/components/custom/delete-offer-button'
import { getOfferDisplayStatus } from '@/lib/utils/offers'
import { formatPrice, formatDiscount } from '@/lib/utils/format'
import { OFFER_CATEGORY_LABELS } from '@/lib/validations/offers'

export const metadata: Metadata = {
  title: "Détail de l'offre - aurelien-project",
  description: "Détail d'une offre promotionnelle",
}

interface OfferDetailPageProps {
  params: Promise<{ id: string }>
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export default async function OfferDetailPage({ params }: OfferDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const offer = await prisma.offer.findUnique({
    where: { id, supplierId: user.id, deletedAt: null },
  })

  if (!offer) redirect('/dashboard')

  const displayStatus = getOfferDisplayStatus(offer)

  return (
    <>
      <PageHeader
        title={offer.name}
        showBack
        actions={
          <Link href={`/offers/${offer.id}/edit`}>
            <Button variant="ghost" size="sm" className="h-11">
              <Pencil className="mr-1 h-4 w-4" />
              Modifier
            </Button>
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Photo */}
        <div className="relative aspect-video w-full overflow-hidden rounded-[0_1rem_1rem_1rem] bg-muted">
          {offer.photoUrl ? (
            <Image
              src={offer.photoUrl}
              alt={offer.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Status + Price */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant={displayStatus.variant} className={displayStatus.className}>
                {displayStatus.label}
              </Badge>
              <span className="font-display text-2xl font-bold tabular-nums">
                {formatPrice(Number(offer.promoPrice))}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Remise : {formatDiscount(offer.discountPercent)}</span>
              <span>Catégorie : {OFFER_CATEGORY_LABELS[offer.category] ?? offer.category}</span>
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardContent className="p-4 space-y-2">
            <h2 className="font-display text-sm font-medium text-muted-foreground">Dates</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Début</p>
                <p className="font-medium">{dateFormatter.format(new Date(offer.startDate))}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Fin</p>
                <p className="font-medium">{dateFormatter.format(new Date(offer.endDate))}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Optional details */}
        {(offer.subcategory || offer.margin || offer.volume || offer.conditions || offer.animation) && (
          <Card>
            <CardContent className="p-4 space-y-3">
              <h2 className="font-display text-sm font-medium text-muted-foreground">Détails</h2>
              {offer.subcategory && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Sous-catégorie</p>
                  <p>{offer.subcategory}</p>
                </div>
              )}
              {offer.margin && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Marge proposée</p>
                  <p>{Number(offer.margin)}%</p>
                </div>
              )}
              {offer.volume && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Volume estimé</p>
                  <p>{offer.volume}</p>
                </div>
              )}
              {offer.conditions && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Conditions commerciales</p>
                  <p className="whitespace-pre-wrap">{offer.conditions}</p>
                </div>
              )}
              {offer.animation && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Animation prévue</p>
                  <p className="whitespace-pre-wrap">{offer.animation}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Delete button */}
        <DeleteOfferButton offerId={offer.id} />

        {/* Back button */}
        <Link href="/dashboard" className="block">
          <Button variant="outline" className="w-full h-11">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux offres
          </Button>
        </Link>
      </div>
    </>
  )
}
