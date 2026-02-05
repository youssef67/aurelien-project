import { describe, it, expect } from 'vitest'
import { OfferCategory, OfferStatus } from '@prisma/client'

describe('Prisma Offer Types', () => {
  describe('OfferCategory enum', () => {
    it('has all required values', () => {
      expect(OfferCategory.EPICERIE).toBe('EPICERIE')
      expect(OfferCategory.FRAIS).toBe('FRAIS')
      expect(OfferCategory.DPH).toBe('DPH')
      expect(OfferCategory.SURGELES).toBe('SURGELES')
      expect(OfferCategory.BOISSONS).toBe('BOISSONS')
      expect(OfferCategory.AUTRES).toBe('AUTRES')
    })

    it('has exactly 6 values', () => {
      const values = Object.values(OfferCategory)
      expect(values).toHaveLength(6)
    })
  })

  describe('OfferStatus enum', () => {
    it('has all required values', () => {
      expect(OfferStatus.DRAFT).toBe('DRAFT')
      expect(OfferStatus.ACTIVE).toBe('ACTIVE')
      expect(OfferStatus.EXPIRED).toBe('EXPIRED')
    })

    it('has exactly 3 values', () => {
      const values = Object.values(OfferStatus)
      expect(values).toHaveLength(3)
    })
  })
})
