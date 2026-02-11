import { describe, it, expect } from 'vitest'
import { getOfferDisplayStatus, serializeOffer, getCategoryLabel, isNewOffer, serializeOfferWithSupplier } from './offers'
import type { Offer } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import type { OfferWithSupplier } from '@/lib/queries/offers'

function createMockOffer(overrides: Partial<Offer> = {}): Offer {
  return {
    id: 'test-id',
    supplierId: 'supplier-id',
    name: 'Test Offer',
    promoPrice: new Decimal('12.99'),
    discountPercent: 25,
    startDate: new Date('2026-02-01'),
    endDate: new Date('2026-12-31'),
    category: 'EPICERIE',
    subcategory: null,
    photoUrl: null,
    margin: null,
    volume: null,
    conditions: null,
    animation: null,
    status: 'ACTIVE',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
    ...overrides,
  } as Offer
}

describe('getOfferDisplayStatus', () => {
  it('returns active for ACTIVE offer with future endDate', () => {
    const offer = { status: 'ACTIVE' as const, endDate: new Date('2099-12-31') }
    const result = getOfferDisplayStatus(offer)

    expect(result.key).toBe('active')
    expect(result.label).toBe('Active')
    expect(result.variant).toBe('default')
  })

  it('returns expired when endDate is in the past', () => {
    const offer = { status: 'ACTIVE' as const, endDate: new Date('2020-01-01') }
    const result = getOfferDisplayStatus(offer)

    expect(result.key).toBe('expired')
    expect(result.label).toBe('Expirée')
    expect(result.variant).toBe('secondary')
  })

  it('returns expired for ACTIVE offer with past endDate (auto-expiration)', () => {
    const offer = { status: 'ACTIVE' as const, endDate: new Date('2024-06-15') }
    const result = getOfferDisplayStatus(offer)

    expect(result.key).toBe('expired')
    expect(result.label).toBe('Expirée')
  })

  it('returns draft for DRAFT offer', () => {
    const offer = { status: 'DRAFT' as const, endDate: new Date('2099-12-31') }
    const result = getOfferDisplayStatus(offer)

    expect(result.key).toBe('draft')
    expect(result.label).toBe('Brouillon')
    expect(result.variant).toBe('outline')
  })

  it('returns expired for DRAFT offer with past endDate (expiration takes precedence)', () => {
    const offer = { status: 'DRAFT' as const, endDate: new Date('2020-01-01') }
    const result = getOfferDisplayStatus(offer)

    expect(result.key).toBe('expired')
  })

  it('returns active when endDate is today (not expired)', () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const offer = { status: 'ACTIVE' as const, endDate: today }
    const result = getOfferDisplayStatus(offer)

    expect(result.key).toBe('active')
    expect(result.label).toBe('Active')
  })

  it('returns expired for EXPIRED status even with future endDate', () => {
    const offer = { status: 'EXPIRED' as const, endDate: new Date('2099-12-31') }
    const result = getOfferDisplayStatus(offer)

    expect(result.key).toBe('expired')
    expect(result.label).toBe('Expirée')
    expect(result.variant).toBe('secondary')
  })

  it('accepts string endDate', () => {
    const offer = { status: 'ACTIVE' as const, endDate: '2099-12-31T00:00:00.000Z' }
    const result = getOfferDisplayStatus(offer)

    expect(result.key).toBe('active')
  })
})

describe('serializeOffer', () => {
  it('converts Decimal promoPrice to number', () => {
    const offer = createMockOffer({ promoPrice: new Decimal('12.99') })
    const result = serializeOffer(offer)

    expect(result.promoPrice).toBe(12.99)
    expect(typeof result.promoPrice).toBe('number')
  })

  it('converts Decimal margin to number', () => {
    const offer = createMockOffer({ margin: new Decimal('5.50') })
    const result = serializeOffer(offer)

    expect(result.margin).toBe(5.5)
  })

  it('keeps null margin as null', () => {
    const offer = createMockOffer({ margin: null })
    const result = serializeOffer(offer)

    expect(result.margin).toBeNull()
  })

  it('converts Date fields to ISO strings', () => {
    const date = new Date('2026-02-15T00:00:00.000Z')
    const offer = createMockOffer({ startDate: date, endDate: date })
    const result = serializeOffer(offer)

    expect(typeof result.startDate).toBe('string')
    expect(typeof result.endDate).toBe('string')
    expect(result.startDate).toBe(date.toISOString())
  })

  it('converts deletedAt null to null', () => {
    const offer = createMockOffer({ deletedAt: null })
    const result = serializeOffer(offer)

    expect(result.deletedAt).toBeNull()
  })

  it('converts deletedAt Date to string', () => {
    const date = new Date('2026-03-01')
    const offer = createMockOffer({ deletedAt: date })
    const result = serializeOffer(offer)

    expect(result.deletedAt).toBe(date.toISOString())
  })

  it('preserves non-transformed fields', () => {
    const offer = createMockOffer({ name: 'My Offer', discountPercent: 30 })
    const result = serializeOffer(offer)

    expect(result.name).toBe('My Offer')
    expect(result.discountPercent).toBe(30)
    expect(result.id).toBe('test-id')
  })
})

describe('getCategoryLabel', () => {
  it('returns "Épicerie" for EPICERIE', () => {
    expect(getCategoryLabel('EPICERIE')).toBe('Épicerie')
  })

  it('returns "Frais" for FRAIS', () => {
    expect(getCategoryLabel('FRAIS')).toBe('Frais')
  })

  it('returns "DPH" for DPH', () => {
    expect(getCategoryLabel('DPH')).toBe('DPH')
  })

  it('returns "Surgelés" for SURGELES', () => {
    expect(getCategoryLabel('SURGELES')).toBe('Surgelés')
  })

  it('returns "Boissons" for BOISSONS', () => {
    expect(getCategoryLabel('BOISSONS')).toBe('Boissons')
  })

  it('returns "Autres" for AUTRES', () => {
    expect(getCategoryLabel('AUTRES')).toBe('Autres')
  })

  it('returns the raw value for unknown category', () => {
    expect(getCategoryLabel('UNKNOWN')).toBe('UNKNOWN')
  })
})

describe('isNewOffer', () => {
  it('returns true for offer created just now', () => {
    expect(isNewOffer(new Date())).toBe(true)
  })

  it('returns true for offer created 1 hour ago', () => {
    const oneHourAgo = new Date()
    oneHourAgo.setHours(oneHourAgo.getHours() - 1)
    expect(isNewOffer(oneHourAgo)).toBe(true)
  })

  it('returns false for offer created 3 days ago', () => {
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    expect(isNewOffer(threeDaysAgo)).toBe(false)
  })

  it('returns false for offer created exactly 49 hours ago', () => {
    const fortyNineHoursAgo = new Date()
    fortyNineHoursAgo.setHours(fortyNineHoursAgo.getHours() - 49)
    expect(isNewOffer(fortyNineHoursAgo)).toBe(false)
  })

  it('accepts string date input', () => {
    const recentDate = new Date()
    recentDate.setHours(recentDate.getHours() - 1)
    expect(isNewOffer(recentDate.toISOString())).toBe(true)
  })

  it('returns true for offer created 47 hours ago', () => {
    const fortySevenHoursAgo = new Date()
    fortySevenHoursAgo.setHours(fortySevenHoursAgo.getHours() - 47)
    expect(isNewOffer(fortySevenHoursAgo)).toBe(true)
  })

  it('returns false for offer created exactly 48 hours ago (boundary)', () => {
    const exactly48h = new Date()
    exactly48h.setHours(exactly48h.getHours() - 48)
    expect(isNewOffer(exactly48h)).toBe(false)
  })
})

describe('serializeOfferWithSupplier', () => {
  function createOfferWithSupplier(overrides: Partial<OfferWithSupplier> = {}): OfferWithSupplier {
    return {
      id: 'test-id',
      supplierId: 'supplier-id',
      name: 'Test Offer',
      promoPrice: new Decimal('12.99'),
      discountPercent: 25,
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-12-31'),
      category: 'EPICERIE',
      subcategory: null,
      photoUrl: null,
      margin: null,
      volume: null,
      conditions: null,
      animation: null,
      status: 'ACTIVE',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
      deletedAt: null,
      supplier: { companyName: 'Test Supplier' },
      ...overrides,
    } as OfferWithSupplier
  }

  it('converts promoPrice Decimal to number', () => {
    const result = serializeOfferWithSupplier(createOfferWithSupplier())

    expect(result.promoPrice).toBe(12.99)
    expect(typeof result.promoPrice).toBe('number')
  })

  it('converts Date fields to ISO strings', () => {
    const result = serializeOfferWithSupplier(createOfferWithSupplier())

    expect(typeof result.startDate).toBe('string')
    expect(typeof result.endDate).toBe('string')
    expect(typeof result.createdAt).toBe('string')
  })

  it('includes supplier.companyName', () => {
    const result = serializeOfferWithSupplier(createOfferWithSupplier())

    expect(result.supplier.companyName).toBe('Test Supplier')
  })

  it('preserves id, name, category, discountPercent', () => {
    const result = serializeOfferWithSupplier(createOfferWithSupplier())

    expect(result.id).toBe('test-id')
    expect(result.name).toBe('Test Offer')
    expect(result.category).toBe('EPICERIE')
    expect(result.discountPercent).toBe(25)
  })

  it('preserves null photoUrl and subcategory', () => {
    const result = serializeOfferWithSupplier(createOfferWithSupplier())

    expect(result.photoUrl).toBeNull()
    expect(result.subcategory).toBeNull()
  })
})
