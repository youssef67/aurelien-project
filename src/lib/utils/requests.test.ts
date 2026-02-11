import { describe, it, expect } from 'vitest'
import { Decimal } from '@prisma/client/runtime/library'
import {
  serializeSupplierRequest,
  serializeSupplierRequestDetail,
  SUPPLIER_REQUEST_STATUS_CONFIG,
  REQUEST_TYPE_CONFIG,
  REQUEST_STATUS_CONFIG,
} from './requests'
import type {
  SupplierRequestWithRelations,
  SupplierRequestDetailWithRelations,
} from '@/lib/queries/requests'

function createMockSupplierRequest(overrides = {}): SupplierRequestWithRelations {
  return {
    id: 'req-1',
    storeId: 'store-1',
    offerId: 'offer-1',
    supplierId: 'supplier-1',
    type: 'INFO' as const,
    status: 'PENDING' as const,
    message: 'Test message',
    createdAt: new Date('2026-02-10T12:00:00Z'),
    updatedAt: new Date('2026-02-10T12:00:00Z'),
    store: { name: 'Mon Magasin', brand: 'LECLERC' as const, city: 'Strasbourg' },
    offer: { id: 'offer-1', name: 'Nutella 1kg' },
    ...overrides,
  }
}

function createMockSupplierRequestDetail(overrides = {}): SupplierRequestDetailWithRelations {
  return {
    id: 'req-1',
    storeId: 'store-1',
    offerId: 'offer-1',
    supplierId: 'supplier-1',
    type: 'ORDER' as const,
    status: 'TREATED' as const,
    message: 'Je voudrais commander',
    createdAt: new Date('2026-02-10T14:00:00Z'),
    updatedAt: new Date('2026-02-10T14:00:00Z'),
    store: {
      name: 'Super Magasin',
      brand: 'INTERMARCHE' as const,
      city: 'Lyon',
      email: 'contact@super.fr',
      phone: '0472123456',
    },
    offer: { id: 'offer-2', name: 'Café Lavazza', promoPrice: new Decimal('6.49') },
    ...overrides,
  }
}

describe('serializeSupplierRequest', () => {
  it('serializes all fields correctly', () => {
    const result = serializeSupplierRequest(createMockSupplierRequest())

    expect(result).toEqual({
      id: 'req-1',
      type: 'INFO',
      status: 'PENDING',
      message: 'Test message',
      createdAt: '2026-02-10T12:00:00.000Z',
      store: { name: 'Mon Magasin', brand: 'LECLERC', city: 'Strasbourg' },
      offer: { id: 'offer-1', name: 'Nutella 1kg' },
    })
  })

  it('converts createdAt Date to ISO string', () => {
    const result = serializeSupplierRequest(createMockSupplierRequest())
    expect(typeof result.createdAt).toBe('string')
    expect(result.createdAt).toBe('2026-02-10T12:00:00.000Z')
  })

  it('preserves null message', () => {
    const result = serializeSupplierRequest(createMockSupplierRequest({ message: null }))
    expect(result.message).toBeNull()
  })

  it('serializes ORDER type correctly', () => {
    const result = serializeSupplierRequest(createMockSupplierRequest({ type: 'ORDER' }))
    expect(result.type).toBe('ORDER')
  })

  it('serializes TREATED status correctly', () => {
    const result = serializeSupplierRequest(createMockSupplierRequest({ status: 'TREATED' }))
    expect(result.status).toBe('TREATED')
  })
})

describe('serializeSupplierRequestDetail', () => {
  it('serializes all fields correctly', () => {
    const result = serializeSupplierRequestDetail(createMockSupplierRequestDetail())

    expect(result).toEqual({
      id: 'req-1',
      type: 'ORDER',
      status: 'TREATED',
      message: 'Je voudrais commander',
      createdAt: '2026-02-10T14:00:00.000Z',
      updatedAt: '2026-02-10T14:00:00.000Z',
      store: {
        name: 'Super Magasin',
        brand: 'INTERMARCHE',
        city: 'Lyon',
        email: 'contact@super.fr',
        phone: '0472123456',
      },
      offer: { id: 'offer-2', name: 'Café Lavazza', promoPrice: 6.49 },
    })
  })

  it('converts Decimal promoPrice to number', () => {
    const result = serializeSupplierRequestDetail(createMockSupplierRequestDetail())
    expect(typeof result.offer.promoPrice).toBe('number')
    expect(result.offer.promoPrice).toBe(6.49)
  })

  it('includes store email and phone', () => {
    const result = serializeSupplierRequestDetail(createMockSupplierRequestDetail())
    expect(result.store.email).toBe('contact@super.fr')
    expect(result.store.phone).toBe('0472123456')
  })

  it('preserves null phone', () => {
    const result = serializeSupplierRequestDetail(
      createMockSupplierRequestDetail({
        store: { name: 'Test', brand: 'LECLERC', city: 'Paris', email: 'a@b.fr', phone: null },
      })
    )
    expect(result.store.phone).toBeNull()
  })

  it('preserves null message', () => {
    const result = serializeSupplierRequestDetail(createMockSupplierRequestDetail({ message: null }))
    expect(result.message).toBeNull()
  })
})

describe('SUPPLIER_REQUEST_STATUS_CONFIG', () => {
  it('PENDING has label "Nouveau"', () => {
    expect(SUPPLIER_REQUEST_STATUS_CONFIG.PENDING.label).toBe('Nouveau')
  })

  it('PENDING has variant "default"', () => {
    expect(SUPPLIER_REQUEST_STATUS_CONFIG.PENDING.variant).toBe('default')
  })

  it('PENDING has primary className', () => {
    expect(SUPPLIER_REQUEST_STATUS_CONFIG.PENDING.className).toContain('bg-primary/10')
  })

  it('TREATED has label "Traité"', () => {
    expect(SUPPLIER_REQUEST_STATUS_CONFIG.TREATED.label).toBe('Traité')
  })

  it('TREATED has variant "secondary"', () => {
    expect(SUPPLIER_REQUEST_STATUS_CONFIG.TREATED.variant).toBe('secondary')
  })
})

describe('REQUEST_TYPE_CONFIG', () => {
  it('INFO has label "Renseignements"', () => {
    expect(REQUEST_TYPE_CONFIG.INFO.label).toBe('Renseignements')
  })

  it('ORDER has label "Commande"', () => {
    expect(REQUEST_TYPE_CONFIG.ORDER.label).toBe('Commande')
  })

  it('ORDER has green className', () => {
    expect(REQUEST_TYPE_CONFIG.ORDER.className).toContain('bg-green-100')
  })
})

describe('REQUEST_STATUS_CONFIG', () => {
  it('PENDING has label "En attente"', () => {
    expect(REQUEST_STATUS_CONFIG.PENDING.label).toBe('En attente')
  })

  it('TREATED has label "Traité"', () => {
    expect(REQUEST_STATUS_CONFIG.TREATED.label).toBe('Traité')
  })
})
