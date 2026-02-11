import type {
  StoreRequestWithRelations,
  StoreRequestDetailWithRelations,
  SupplierRequestWithRelations,
  SupplierRequestDetailWithRelations,
} from '@/lib/queries/requests'

export type SerializedStoreRequest = {
  id: string
  type: 'INFO' | 'ORDER'
  status: 'PENDING' | 'TREATED'
  message: string | null
  createdAt: string
  offer: { id: string; name: string; promoPrice: number }
  supplier: { companyName: string }
}

export type SerializedStoreRequestDetail = {
  id: string
  type: 'INFO' | 'ORDER'
  status: 'PENDING' | 'TREATED'
  message: string | null
  createdAt: string
  offer: {
    id: string
    name: string
    promoPrice: number
    discountPercent: number
    startDate: string
    endDate: string
    category: string
    photoUrl: string | null
  }
  supplier: { companyName: string }
}

export function serializeStoreRequest(request: StoreRequestWithRelations): SerializedStoreRequest {
  return {
    id: request.id,
    type: request.type,
    status: request.status,
    message: request.message,
    createdAt: request.createdAt.toISOString(),
    offer: {
      id: request.offer.id,
      name: request.offer.name,
      promoPrice: Number(request.offer.promoPrice),
    },
    supplier: { companyName: request.supplier.companyName },
  }
}

export function serializeStoreRequestDetail(request: StoreRequestDetailWithRelations): SerializedStoreRequestDetail {
  return {
    id: request.id,
    type: request.type,
    status: request.status,
    message: request.message,
    createdAt: request.createdAt.toISOString(),
    offer: {
      id: request.offer.id,
      name: request.offer.name,
      promoPrice: Number(request.offer.promoPrice),
      discountPercent: request.offer.discountPercent,
      startDate: request.offer.startDate.toISOString(),
      endDate: request.offer.endDate.toISOString(),
      category: request.offer.category,
      photoUrl: request.offer.photoUrl,
    },
    supplier: { companyName: request.supplier.companyName },
  }
}

export type SerializedSupplierRequest = {
  id: string
  type: 'INFO' | 'ORDER'
  status: 'PENDING' | 'TREATED'
  message: string | null
  createdAt: string
  store: { name: string; brand: string; city: string }
  offer: { id: string; name: string }
}

export type SerializedSupplierRequestDetail = {
  id: string
  type: 'INFO' | 'ORDER'
  status: 'PENDING' | 'TREATED'
  message: string | null
  createdAt: string
  updatedAt: string
  store: { name: string; brand: string; city: string; email: string; phone: string | null }
  offer: { id: string; name: string; promoPrice: number }
}

export function serializeSupplierRequest(
  request: SupplierRequestWithRelations
): SerializedSupplierRequest {
  return {
    id: request.id,
    type: request.type,
    status: request.status,
    message: request.message,
    createdAt: request.createdAt.toISOString(),
    store: {
      name: request.store.name,
      brand: request.store.brand,
      city: request.store.city,
    },
    offer: {
      id: request.offer.id,
      name: request.offer.name,
    },
  }
}

export function serializeSupplierRequestDetail(
  request: SupplierRequestDetailWithRelations
): SerializedSupplierRequestDetail {
  return {
    id: request.id,
    type: request.type,
    status: request.status,
    message: request.message,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
    store: {
      name: request.store.name,
      brand: request.store.brand,
      city: request.store.city,
      email: request.store.email,
      phone: request.store.phone,
    },
    offer: {
      id: request.offer.id,
      name: request.offer.name,
      promoPrice: Number(request.offer.promoPrice),
    },
  }
}

export const SUPPLIER_REQUEST_STATUS_CONFIG = {
  PENDING: { label: 'Nouveau', chipLabel: 'Nouveaux', variant: 'default' as const, className: 'bg-primary/10 text-primary border-transparent' },
  TREATED: { label: 'Traité', chipLabel: 'Traités', variant: 'secondary' as const, className: '' },
}

export const REQUEST_TYPE_CONFIG = {
  INFO: { label: 'Renseignements', chipLabel: 'Renseignements', variant: 'default' as const, className: '' },
  ORDER: { label: 'Commande', chipLabel: 'Commandes', variant: 'default' as const, className: 'bg-green-100 text-green-800 border-transparent' },
}

export const REQUEST_STATUS_CONFIG = {
  PENDING: { label: 'En attente', variant: 'default' as const, className: 'bg-yellow-100 text-yellow-800 border-transparent' },
  TREATED: { label: 'Traité', variant: 'secondary' as const, className: '' },
}
