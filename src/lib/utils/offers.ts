import type { Offer } from '@prisma/client'

type DisplayStatusKey = 'active' | 'expired' | 'draft'

export type DisplayStatus = {
  key: DisplayStatusKey
  label: string
  variant: 'default' | 'secondary' | 'outline'
  className?: string
}

export function getOfferDisplayStatus(offer: { status: Offer['status']; endDate: Date | string }): DisplayStatus {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endDate = new Date(offer.endDate)
  endDate.setHours(0, 0, 0, 0)

  if (endDate < today) {
    return { key: 'expired', label: 'Expirée', variant: 'secondary' }
  }

  if (offer.status === 'DRAFT') {
    return { key: 'draft', label: 'Brouillon', variant: 'outline', className: 'border-orange-300 text-orange-700' }
  }

  return { key: 'active', label: 'Active', variant: 'default', className: 'bg-green-600 text-white hover:bg-green-600/90' }
}

export type SerializedOffer = Omit<Offer, 'promoPrice' | 'margin' | 'startDate' | 'endDate' | 'createdAt' | 'updatedAt' | 'deletedAt'> & {
  promoPrice: number
  margin: number | null
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export function serializeOffer(offer: Offer): SerializedOffer {
  return {
    ...offer,
    promoPrice: Number(offer.promoPrice),
    margin: offer.margin ? Number(offer.margin) : null,
    startDate: offer.startDate.toISOString(),
    endDate: offer.endDate.toISOString(),
    createdAt: offer.createdAt.toISOString(),
    updatedAt: offer.updatedAt.toISOString(),
    deletedAt: offer.deletedAt?.toISOString() ?? null,
  }
}
