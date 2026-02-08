import type { Offer, OfferCategory } from '@prisma/client'
import type { OfferWithSupplier } from '@/lib/queries/offers'

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

const CATEGORY_LABELS: Record<OfferCategory, string> = {
  EPICERIE: 'Épicerie',
  FRAIS: 'Frais',
  DPH: 'DPH',
  SURGELES: 'Surgelés',
  BOISSONS: 'Boissons',
  AUTRES: 'Autres',
}

export function getCategoryLabel(category: OfferCategory | string): string {
  return CATEGORY_LABELS[category as OfferCategory] ?? category
}

export function isNewOffer(createdAt: Date | string): boolean {
  const created = typeof createdAt === 'string' ? new Date(createdAt) : createdAt
  const fortyEightHoursAgo = new Date()
  fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48)
  return created > fortyEightHoursAgo
}

export type SerializedOfferWithSupplier = {
  id: string
  name: string
  promoPrice: number
  discountPercent: number
  startDate: string
  endDate: string
  category: string
  subcategory: string | null
  photoUrl: string | null
  supplierId: string
  createdAt: string
  supplier: { companyName: string }
}

export function serializeOfferWithSupplier(
  offer: OfferWithSupplier
): SerializedOfferWithSupplier {
  return {
    id: offer.id,
    name: offer.name,
    promoPrice: Number(offer.promoPrice),
    discountPercent: offer.discountPercent,
    startDate: offer.startDate.toISOString(),
    endDate: offer.endDate.toISOString(),
    category: offer.category,
    subcategory: offer.subcategory,
    photoUrl: offer.photoUrl,
    supplierId: offer.supplierId,
    createdAt: offer.createdAt.toISOString(),
    supplier: { companyName: offer.supplier.companyName },
  }
}
