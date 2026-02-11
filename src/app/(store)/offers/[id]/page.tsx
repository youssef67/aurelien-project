import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Package, AlertTriangle } from 'lucide-react'
import { getOfferForStoreDetail } from '@/lib/queries/offers'
import { getExistingRequestTypes } from '@/lib/queries/requests'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RequestSheet } from '@/components/custom/request-sheet'
import { getOfferDisplayStatus, getCategoryLabel } from '@/lib/utils/offers'
import { formatPrice, formatDiscount } from '@/lib/utils/format'

interface StoreOfferDetailPageProps {
  params: Promise<{ id: string }>
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export async function generateMetadata({ params }: StoreOfferDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const offer = await getOfferForStoreDetail(id)

  if (!offer) {
    return { title: 'Offre introuvable - aurelien-project' }
  }

  return {
    title: `${offer.name} - aurelien-project`,
    description: `Détail de l'offre ${offer.name}`,
  }
}

export default async function StoreOfferDetailPage({ params }: StoreOfferDetailPageProps) {
  const { id } = await params
  const offer = await getOfferForStoreDetail(id)

  if (!offer) {
    notFound()
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const existingTypes = user ? await getExistingRequestTypes(user.id, offer.id) : []
  const hasInfoRequest = existingTypes.includes('INFO')
  const hasOrderRequest = existingTypes.includes('ORDER')

  const displayStatus = getOfferDisplayStatus(offer)
  const isExpired = displayStatus.key === 'expired'

  return (
    <>
      <PageHeader title={offer.name} showBack />

      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-4">
          {/* Expired banner */}
          {isExpired && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Cette offre a expiré</span>
            </div>
          )}

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

          {/* Title section */}
          <div>
            <h1 className="font-display text-xl font-bold">{offer.name}</h1>
            <p className="text-sm text-muted-foreground">{offer.supplier.companyName}</p>
          </div>

          {/* Price card */}
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
                <span>Catégorie : {getCategoryLabel(offer.category)}</span>
              </div>
              {offer.margin !== null && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Marge proposée : </span>
                  <span className="font-medium">{Number(offer.margin)}%</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dates card */}
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

          {/* Optional details card */}
          {(offer.subcategory || offer.volume || offer.conditions || offer.animation) && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <h2 className="font-display text-sm font-medium text-muted-foreground">Détails</h2>
                {offer.subcategory && (
                  <div className="text-sm">
                    <p className="text-muted-foreground">Sous-catégorie</p>
                    <p>{offer.subcategory}</p>
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
        </div>

        {/* Sticky CTA buttons */}
        <div className="sticky bottom-0 border-t bg-background p-4">
          <div className="flex gap-3">
            {hasInfoRequest ? (
              <Button variant="outline" className="flex-1 h-11" disabled>
                Demande envoyée
              </Button>
            ) : (
              <RequestSheet
                offerId={offer.id}
                supplierName={offer.supplier.companyName}
                type="INFO"
                trigger={
                  <Button variant="outline" className="flex-1 h-11" disabled={isExpired}>
                    Demande de renseignements
                  </Button>
                }
                disabled={isExpired}
              />
            )}
            {hasOrderRequest ? (
              <Button className="flex-1 h-11 rounded-[0_0.5rem_0.5rem_0.5rem]" disabled>
                Commande envoyée
              </Button>
            ) : (
              <RequestSheet
                offerId={offer.id}
                supplierName={offer.supplier.companyName}
                type="ORDER"
                trigger={
                  <Button className="flex-1 h-11 rounded-[0_0.5rem_0.5rem_0.5rem]" disabled={isExpired}>
                    Souhaite commander
                  </Button>
                }
                disabled={isExpired}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
