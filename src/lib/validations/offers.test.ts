import { describe, it, expect } from 'vitest'
import {
  createOfferStep1Schema,
  createOfferStep2Schema,
  createOfferSchema,
  OFFER_CATEGORIES,
  OFFER_CATEGORY_LABELS,
  type CreateOfferStep1Input,
  type CreateOfferStep2Input,
  type CreateOfferInput,
} from './offers'

// Helper: date en string ISO format YYYY-MM-DD
function futureDate(daysFromNow: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d.toISOString().split('T')[0]
}

function pastDate(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().split('T')[0]
}

function todayDate(): string {
  return new Date().toISOString().split('T')[0]
}

// ============================================
// Step 1 Schema: Produit & Prix
// ============================================

describe('createOfferStep1Schema', () => {
  const validStep1: CreateOfferStep1Input = {
    name: 'Nutella 1kg',
    promoPrice: 12.99,
    discountPercent: 25,
  }

  describe('valid inputs', () => {
    it('accepts valid product with all fields', () => {
      const result = createOfferStep1Schema.safeParse(validStep1)
      expect(result.success).toBe(true)
    })

    it('accepts name with exactly 3 characters', () => {
      const result = createOfferStep1Schema.safeParse({ ...validStep1, name: 'ABC' })
      expect(result.success).toBe(true)
    })

    it('accepts promoPrice with 2 decimals', () => {
      const result = createOfferStep1Schema.safeParse({ ...validStep1, promoPrice: 0.01 })
      expect(result.success).toBe(true)
    })

    it('accepts discountPercent at minimum (1)', () => {
      const result = createOfferStep1Schema.safeParse({ ...validStep1, discountPercent: 1 })
      expect(result.success).toBe(true)
    })

    it('accepts discountPercent at maximum (99)', () => {
      const result = createOfferStep1Schema.safeParse({ ...validStep1, discountPercent: 99 })
      expect(result.success).toBe(true)
    })
  })

  describe('name validation', () => {
    it('rejects name shorter than 3 characters', () => {
      const result = createOfferStep1Schema.safeParse({ ...validStep1, name: 'AB' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const issues = JSON.parse(result.error.message)
        expect(issues[0]?.message).toContain('3 caractères')
      }
    })

    it('rejects name longer than 255 characters', () => {
      const result = createOfferStep1Schema.safeParse({ ...validStep1, name: 'A'.repeat(256) })
      expect(result.success).toBe(false)
      if (!result.success) {
        const issues = JSON.parse(result.error.message)
        expect(issues[0]?.message).toContain('255 caractères')
      }
    })

    it('rejects empty name', () => {
      const result = createOfferStep1Schema.safeParse({ ...validStep1, name: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('promoPrice validation', () => {
    it('rejects negative price', () => {
      const result = createOfferStep1Schema.safeParse({ ...validStep1, promoPrice: -5 })
      expect(result.success).toBe(false)
      if (!result.success) {
        const issues = JSON.parse(result.error.message)
        expect(issues[0]?.message).toContain('supérieur à 0')
      }
    })

    it('rejects zero price', () => {
      const result = createOfferStep1Schema.safeParse({ ...validStep1, promoPrice: 0 })
      expect(result.success).toBe(false)
    })

    it('rejects price with more than 2 decimals', () => {
      const result = createOfferStep1Schema.safeParse({ ...validStep1, promoPrice: 12.999 })
      expect(result.success).toBe(false)
      if (!result.success) {
        const issues = JSON.parse(result.error.message)
        expect(issues[0]?.message).toContain('2 décimales')
      }
    })

    it('rejects non-number price', () => {
      const result = createOfferStep1Schema.safeParse({ ...validStep1, promoPrice: 'abc' })
      expect(result.success).toBe(false)
    })
  })

  describe('discountPercent validation', () => {
    it('rejects discount below 1', () => {
      const result = createOfferStep1Schema.safeParse({ ...validStep1, discountPercent: 0 })
      expect(result.success).toBe(false)
      if (!result.success) {
        const issues = JSON.parse(result.error.message)
        expect(issues[0]?.message).toContain('1%')
      }
    })

    it('rejects discount above 99', () => {
      const result = createOfferStep1Schema.safeParse({ ...validStep1, discountPercent: 100 })
      expect(result.success).toBe(false)
      if (!result.success) {
        const issues = JSON.parse(result.error.message)
        expect(issues[0]?.message).toContain('99%')
      }
    })

    it('rejects non-integer discount', () => {
      const result = createOfferStep1Schema.safeParse({ ...validStep1, discountPercent: 25.5 })
      expect(result.success).toBe(false)
      if (!result.success) {
        const issues = JSON.parse(result.error.message)
        expect(issues[0]?.message).toContain('nombre entier')
      }
    })
  })
})

// ============================================
// Step 2 Schema: Dates & Catégorie
// ============================================

describe('createOfferStep2Schema', () => {
  const validStep2: CreateOfferStep2Input = {
    startDate: futureDate(1),
    endDate: futureDate(10),
    category: 'EPICERIE',
  }

  describe('valid inputs', () => {
    it('accepts valid dates and category', () => {
      const result = createOfferStep2Schema.safeParse(validStep2)
      expect(result.success).toBe(true)
    })

    it('accepts all valid categories', () => {
      OFFER_CATEGORIES.forEach((cat) => {
        const result = createOfferStep2Schema.safeParse({ ...validStep2, category: cat })
        expect(result.success).toBe(true)
      })
    })
  })

  describe('date validation', () => {
    it('rejects empty startDate', () => {
      const result = createOfferStep2Schema.safeParse({ ...validStep2, startDate: '' })
      expect(result.success).toBe(false)
    })

    it('rejects empty endDate', () => {
      const result = createOfferStep2Schema.safeParse({ ...validStep2, endDate: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('category validation', () => {
    it('rejects invalid category', () => {
      const result = createOfferStep2Schema.safeParse({ ...validStep2, category: 'INVALID' })
      expect(result.success).toBe(false)
    })
  })
})

// ============================================
// Complete Schema (with refinements)
// ============================================

describe('createOfferSchema', () => {
  const validInput: CreateOfferInput = {
    name: 'Nutella 1kg',
    promoPrice: 12.99,
    discountPercent: 25,
    startDate: futureDate(1),
    endDate: futureDate(10),
    category: 'EPICERIE',
  }

  describe('valid inputs', () => {
    it('accepts complete valid data', () => {
      const result = createOfferSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('accepts startDate equal to today', () => {
      const result = createOfferSchema.safeParse({
        ...validInput,
        startDate: todayDate(),
        endDate: futureDate(5),
      })
      expect(result.success).toBe(true)
    })

    it('accepts endDate equal to startDate', () => {
      const start = futureDate(1)
      const result = createOfferSchema.safeParse({
        ...validInput,
        startDate: start,
        endDate: start,
      })
      expect(result.success).toBe(true)
    })
  })

  describe('cross-field date validation', () => {
    it('rejects startDate in the past', () => {
      const result = createOfferSchema.safeParse({
        ...validInput,
        startDate: pastDate(1),
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const issues = JSON.parse(result.error.message)
        const startDateIssue = issues.find((i: { path: string[] }) => i.path?.includes('startDate'))
        expect(startDateIssue?.message).toContain('aujourd\'hui')
      }
    })

    it('rejects endDate before startDate', () => {
      const result = createOfferSchema.safeParse({
        ...validInput,
        startDate: futureDate(10),
        endDate: futureDate(5),
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const issues = JSON.parse(result.error.message)
        const endDateIssue = issues.find((i: { path: string[] }) => i.path?.includes('endDate'))
        expect(endDateIssue?.message).toContain('après la date de début')
      }
    })
  })
})

// ============================================
// Constants
// ============================================

describe('OFFER_CATEGORIES', () => {
  it('contains all 6 expected categories', () => {
    expect(OFFER_CATEGORIES).toEqual([
      'EPICERIE',
      'FRAIS',
      'DPH',
      'SURGELES',
      'BOISSONS',
      'AUTRES',
    ])
    expect(OFFER_CATEGORIES.length).toBe(6)
  })
})

describe('OFFER_CATEGORY_LABELS', () => {
  it('has French labels for all categories', () => {
    expect(OFFER_CATEGORY_LABELS.EPICERIE).toBe('Épicerie')
    expect(OFFER_CATEGORY_LABELS.FRAIS).toBe('Frais')
    expect(OFFER_CATEGORY_LABELS.DPH).toBe('DPH')
    expect(OFFER_CATEGORY_LABELS.SURGELES).toBe('Surgelés')
    expect(OFFER_CATEGORY_LABELS.BOISSONS).toBe('Boissons')
    expect(OFFER_CATEGORY_LABELS.AUTRES).toBe('Autres')
  })
})
