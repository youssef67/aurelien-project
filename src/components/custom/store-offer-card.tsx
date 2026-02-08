import Link from 'next/link'
import Image from 'next/image'
import { Package } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDateRange, formatDiscount } from '@/lib/utils/format'
import { getCategoryLabel, isNewOffer } from '@/lib/utils/offers'
import type { SerializedOfferWithSupplier } from '@/lib/utils/offers'

interface StoreOfferCardProps {
  offer: SerializedOfferWithSupplier
}

export function StoreOfferCard({ offer }: StoreOfferCardProps) {
  const isNew = isNewOffer(offer.createdAt)

  return (
    <Link href={`/offers/${offer.id}`}>
      <article
        aria-labelledby={`offer-${offer.id}-title`}
        className=""
      >
        <Card className="transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(37,34,74,0.08)]">
          <CardContent className="flex gap-3 p-3">
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-[0_0.75rem_0_0] bg-muted">
              {offer.photoUrl ? (
                <Image
                  src={offer.photoUrl}
                  alt={offer.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              {isNew && (
                <Badge
                  className="absolute top-1 right-1 bg-emerald-600 text-white text-[10px] px-1.5 py-0"
                >
                  Nouveau
                </Badge>
              )}
            </div>

            <div className="flex flex-1 flex-col justify-between min-w-0">
              <div>
                <h3
                  id={`offer-${offer.id}-title`}
                  className="font-display text-lg font-semibold leading-tight truncate"
                >
                  {offer.name}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {offer.supplier.companyName} • {getCategoryLabel(offer.category)}
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="font-semibold tabular-nums">
                  {formatPrice(offer.promoPrice)}
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {formatDiscount(offer.discountPercent)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDateRange(offer.startDate, offer.endDate)}
              </p>
            </div>
          </CardContent>
        </Card>
      </article>
    </Link>
  )
}
