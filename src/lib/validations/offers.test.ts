import { describe, it, expect } from 'vitest'
import {
  createOfferStep1Schema,
  createOfferStep2Schema,
  createOfferStep3Schema,
  createOfferSchema,
  updateOfferSchema,
  deleteOfferSchema,
  OFFER_CATEGORIES,
  OFFER_CATEGORY_LABELS,
  type CreateOfferStep1Input,
  type CreateOfferStep2Input,
  type CreateOfferInput,
  type UpdateOfferInput,
  type DeleteOfferInput,
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
// Step 3 Schema: Détails (optionnel)
// ============================================

describe('createOfferStep3Schema', () => {
  it('accepts all fields empty (everything optional)', () => {
    const result = createOfferStep3Schema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('accepts all fields with valid values', () => {
    const result = createOfferStep3Schema.safeParse({
      subcategory: 'Bio',
      margin: 15.5,
      volume: '2 palettes',
      conditions: 'Franco à partir de 500€',
      animation: 'PLV tête de gondole fournie',
      photoUrl: 'https://example.com/photo.jpg',
    })
    expect(result.success).toBe(true)
  })

  it('accepts empty strings (treated as optional)', () => {
    const result = createOfferStep3Schema.safeParse({
      subcategory: '',
      volume: '',
      conditions: '',
      animation: '',
      photoUrl: '',
    })
    expect(result.success).toBe(true)
  })

  describe('subcategory validation', () => {
    it('accepts subcategory up to 100 characters', () => {
      const result = createOfferStep3Schema.safeParse({ subcategory: 'A'.repeat(100) })
      expect(result.success).toBe(true)
    })

    it('rejects subcategory over 100 characters', () => {
      const result = createOfferStep3Schema.safeParse({ subcategory: 'A'.repeat(101) })
      expect(result.success).toBe(false)
      if (!result.success) {
        const issues = JSON.parse(result.error.message)
        expect(issues[0]?.message).toContain('100')
      }
    })
  })

  describe('margin validation', () => {
    it('accepts margin at minimum (0.01)', () => {
      const result = createOfferStep3Schema.safeParse({ margin: 0.01 })
      expect(result.success).toBe(true)
    })

    it('accepts margin at maximum (99.99)', () => {
      const result = createOfferStep3Schema.safeParse({ margin: 99.99 })
      expect(result.success).toBe(true)
    })

    it('rejects margin below 0.01', () => {
      const result = createOfferStep3Schema.safeParse({ margin: 0 })
      expect(result.success).toBe(false)
    })

    it('rejects margin above 99.99', () => {
      const result = createOfferStep3Schema.safeParse({ margin: 100 })
      expect(result.success).toBe(false)
    })

    it('rejects margin with more than 2 decimals', () => {
      const result = createOfferStep3Schema.safeParse({ margin: 15.555 })
      expect(result.success).toBe(false)
    })

    it('accepts null margin', () => {
      const result = createOfferStep3Schema.safeParse({ margin: null })
      expect(result.success).toBe(true)
    })
  })

  describe('volume validation', () => {
    it('accepts volume up to 255 characters', () => {
      const result = createOfferStep3Schema.safeParse({ volume: 'A'.repeat(255) })
      expect(result.success).toBe(true)
    })

    it('rejects volume over 255 characters', () => {
      const result = createOfferStep3Schema.safeParse({ volume: 'A'.repeat(256) })
      expect(result.success).toBe(false)
    })
  })

  describe('conditions validation', () => {
    it('accepts conditions up to 1000 characters', () => {
      const result = createOfferStep3Schema.safeParse({ conditions: 'A'.repeat(1000) })
      expect(result.success).toBe(true)
    })

    it('rejects conditions over 1000 characters', () => {
      const result = createOfferStep3Schema.safeParse({ conditions: 'A'.repeat(1001) })
      expect(result.success).toBe(false)
    })
  })

  describe('animation validation', () => {
    it('accepts animation up to 1000 characters', () => {
      const result = createOfferStep3Schema.safeParse({ animation: 'A'.repeat(1000) })
      expect(result.success).toBe(true)
    })

    it('rejects animation over 1000 characters', () => {
      const result = createOfferStep3Schema.safeParse({ animation: 'A'.repeat(1001) })
      expect(result.success).toBe(false)
    })
  })

  describe('photoUrl validation', () => {
    it('accepts valid URL', () => {
      const result = createOfferStep3Schema.safeParse({ photoUrl: 'https://storage.example.com/photo.jpg' })
      expect(result.success).toBe(true)
    })

    it('accepts null photoUrl', () => {
      const result = createOfferStep3Schema.safeParse({ photoUrl: null })
      expect(result.success).toBe(true)
    })

    it('rejects invalid URL', () => {
      const result = createOfferStep3Schema.safeParse({ photoUrl: 'not-a-url' })
      expect(result.success).toBe(false)
    })
  })
})

// ============================================
// Complete Schema with Step 3 (optional)
// ============================================

describe('createOfferSchema with step 3', () => {
  const validInput: CreateOfferInput = {
    name: 'Nutella 1kg',
    promoPrice: 12.99,
    discountPercent: 25,
    startDate: futureDate(1),
    endDate: futureDate(10),
    category: 'EPICERIE',
  }

  it('accepts complete data without step 3 fields (backward compat)', () => {
    const result = createOfferSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('accepts complete data with all step 3 fields', () => {
    const result = createOfferSchema.safeParse({
      ...validInput,
      subcategory: 'Bio',
      margin: 15.5,
      volume: '2 palettes',
      conditions: 'Franco 500€',
      animation: 'PLV tête de gondole',
      photoUrl: 'https://example.com/photo.jpg',
    })
    expect(result.success).toBe(true)
  })

  it('accepts complete data with only some step 3 fields', () => {
    const result = createOfferSchema.safeParse({
      ...validInput,
      subcategory: 'Bio',
      margin: 15.5,
    })
    expect(result.success).toBe(true)
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

// ============================================
// updateOfferSchema
// ============================================

describe('updateOfferSchema', () => {
  const validUpdateInput: UpdateOfferInput = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Nutella 1kg',
    promoPrice: 12.99,
    discountPercent: 25,
    startDate: futureDate(1),
    endDate: futureDate(10),
    category: 'EPICERIE',
  }

  describe('valid inputs', () => {
    it('accepts complete valid data with UUID id', () => {
      const result = updateOfferSchema.safeParse(validUpdateInput)
      expect(result.success).toBe(true)
    })

    it('accepts startDate in the past (offre en cours)', () => {
      const result = updateOfferSchema.safeParse({
        ...validUpdateInput,
        startDate: pastDate(5),
        endDate: futureDate(10),
      })
      expect(result.success).toBe(true)
    })

    it('accepts endDate equal to startDate', () => {
      const start = futureDate(1)
      const result = updateOfferSchema.safeParse({
        ...validUpdateInput,
        startDate: start,
        endDate: start,
      })
      expect(result.success).toBe(true)
    })

    it('accepts data with all optional step 3 fields', () => {
      const result = updateOfferSchema.safeParse({
        ...validUpdateInput,
        subcategory: 'Bio',
        margin: 15.5,
        volume: '2 palettes',
        conditions: 'Franco 500€',
        animation: 'PLV fournie',
        photoUrl: 'https://example.com/photo.jpg',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('id validation', () => {
    it('rejects invalid UUID', () => {
      const result = updateOfferSchema.safeParse({
        ...validUpdateInput,
        id: 'not-a-uuid',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const issues = JSON.parse(result.error.message)
        expect(issues[0]?.message).toContain('ID offre invalide')
      }
    })

    it('rejects empty id', () => {
      const result = updateOfferSchema.safeParse({
        ...validUpdateInput,
        id: '',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('date validation', () => {
    it('rejects endDate before startDate', () => {
      const result = updateOfferSchema.safeParse({
        ...validUpdateInput,
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

    it('does NOT reject startDate in the past (unlike createOfferSchema)', () => {
      const result = updateOfferSchema.safeParse({
        ...validUpdateInput,
        startDate: pastDate(10),
        endDate: futureDate(10),
      })
      expect(result.success).toBe(true)
    })
  })

  describe('field validation (same as create)', () => {
    it('rejects empty name', () => {
      const result = updateOfferSchema.safeParse({
        ...validUpdateInput,
        name: '',
      })
      expect(result.success).toBe(false)
    })

    it('rejects negative price', () => {
      const result = updateOfferSchema.safeParse({
        ...validUpdateInput,
        promoPrice: -5,
      })
      expect(result.success).toBe(false)
    })

    it('rejects discount above 99', () => {
      const result = updateOfferSchema.safeParse({
        ...validUpdateInput,
        discountPercent: 100,
      })
      expect(result.success).toBe(false)
    })

    it('rejects invalid category', () => {
      const result = updateOfferSchema.safeParse({
        ...validUpdateInput,
        category: 'INVALID',
      })
      expect(result.success).toBe(false)
    })
  })
})

// ============================================
// deleteOfferSchema
// ============================================

describe('deleteOfferSchema', () => {
  const validDeleteInput: DeleteOfferInput = {
    id: '550e8400-e29b-41d4-a716-446655440000',
  }

  describe('valid inputs', () => {
    it('accepts valid UUID id', () => {
      const result = deleteOfferSchema.safeParse(validDeleteInput)
      expect(result.success).toBe(true)
    })
  })

  describe('id validation', () => {
    it('rejects invalid UUID', () => {
      const result = deleteOfferSchema.safeParse({ id: 'not-a-uuid' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const issues = JSON.parse(result.error.message)
        expect(issues[0]?.message).toContain('ID offre invalide')
      }
    })

    it('rejects empty id', () => {
      const result = deleteOfferSchema.safeParse({ id: '' })
      expect(result.success).toBe(false)
    })

    it('rejects missing id', () => {
      const result = deleteOfferSchema.safeParse({})
      expect(result.success).toBe(false)
    })
  })
})
