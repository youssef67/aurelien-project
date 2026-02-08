import Link from 'next/link'
import Image from 'next/image'
import { Package } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import { getOfferDisplayStatus } from '@/lib/utils/offers'
import { formatPrice, formatDateRange, formatDiscount } from '@/lib/utils/format'
import type { SerializedOffer } from '@/lib/utils/offers'

interface OfferCardProps {
  offer: SerializedOffer
}

export function OfferCard({ offer }: OfferCardProps) {
  const displayStatus = getOfferDisplayStatus(offer)
  const isExpired = displayStatus.key === 'expired'

  return (
    <Link href={`/offers/${offer.id}`}>
      <article
        aria-labelledby={`offer-${offer.id}-title`}
        className={cn(
          isExpired && 'opacity-50'
        )}
      >
        <Card className="transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(37,34,74,0.08)]">
          <CardContent className="flex gap-3 p-3">
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-[0_0.75rem_0_0] bg-muted">
              {offer.photoUrl ? (
                <Image
                  src={offer.photoUrl}
                  alt={offer.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col justify-between min-w-0">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3
                    id={`offer-${offer.id}-title`}
                    className="font-display text-lg font-semibold leading-tight truncate"
                  >
                    {offer.name}
                  </h3>
                  <Badge variant={displayStatus.variant} className={displayStatus.className}>
                    {displayStatus.label}
                  </Badge>
                </div>
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
