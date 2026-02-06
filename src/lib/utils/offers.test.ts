import { describe, it, expect } from 'vitest'
import { getOfferDisplayStatus, serializeOffer } from './offers'
import type { Offer } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

function createMockOffer(overrides: Partial<Offer> = {}): Offer {
  return {
    id: 'test-id',
    supplierId: 'supplier-id',
    name: 'Test Offer',
    promoPrice: new Decimal('12.99'),
    discountPercent: 25,
    startDate: new Date('2026-02-01'),
    endDate: new Date('2026-12-31'),
    category: 'FRUITS_LEGUMES',
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
