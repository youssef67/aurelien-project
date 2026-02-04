import { describe, it, expect } from 'vitest'
import { registerSupplierSchema, registerStoreSchema, BrandEnum, BRAND_LABELS, loginSchema } from './auth'

describe('registerSupplierSchema', () => {
  describe('valid inputs', () => {
    it('accepts valid input with all fields', () => {
      const result = registerSupplierSchema.safeParse({
        companyName: 'Ma Société SAS',
        email: 'contact@entreprise.fr',
        phone: '0612345678',
        password: 'password123',
        confirmPassword: 'password123',
      })
      expect(result.success).toBe(true)
    })

    it('accepts valid input without phone (optional)', () => {
      const result = registerSupplierSchema.safeParse({
        companyName: 'Ma Société',
        email: 'test@example.com',
        phone: '',
        password: 'password123',
        confirmPassword: 'password123',
      })
      expect(result.success).toBe(true)
    })

    it('accepts phone with +33 format', () => {
      const result = registerSupplierSchema.safeParse({
        companyName: 'Ma Société',
        email: 'test@example.com',
        phone: '+33612345678',
        password: 'password123',
        confirmPassword: 'password123',
      })
      expect(result.success).toBe(true)
    })

    it('accepts phone with spaces format', () => {
      const result = registerSupplierSchema.safeParse({
        companyName: 'Ma Société',
        email: 'test@example.com',
        phone: '06 12 34 56 78',
        password: 'password123',
        confirmPassword: 'password123',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('companyName validation', () => {
    it('rejects company name shorter than 2 characters', () => {
      const result = registerSupplierSchema.safeParse({
        companyName: 'A',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const issues = JSON.parse(result.error.message)
        expect(issues[0]?.message).toContain('2 caractères')
      }
    })

    it('rejects company name longer than 100 characters', () => {
      const result = registerSupplierSchema.safeParse({
        companyName: 'A'.repeat(101),
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const issues = JSON.parse(result.error.message)
        expect(issues[0]?.message).toContain('100 caractères')
      }
    })
  })

  describe('email validation', () => {
    it('rejects invalid email format', () => {
      const result = registerSupplierSchema.safeParse({
        companyName: 'Ma Société',
        email: 'invalid-email',
        password: 'password123',
        confirmPassword: 'password123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const issues = JSON.parse(result.error.message)
        expect(issues[0]?.message).toContain('email valide')
      }
    })

    it('rejects email without domain', () => {
      const result = registerSupplierSchema.safeParse({
        companyName: 'Ma Société',
        email: 'test@',
        password: 'password123',
        confirmPassword: 'password123',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('password validation', () => {
    it('rejects password shorter than 8 characters', () => {
      const result = registerSupplierSchema.safeParse({
        companyName: 'Ma Société',
        email: 'test@example.com',
        password: 'short',
        confirmPassword: 'short',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const issues = JSON.parse(result.error.message)
        expect(issues[0]?.message).toContain('8 caractères')
      }
    })

    it('accepts password with exactly 8 characters', () => {
      const result = registerSupplierSchema.safeParse({
        companyName: 'Ma Société',
        email: 'test@example.com',
        password: '12345678',
        confirmPassword: '12345678',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('confirmPassword validation', () => {
    it('rejects mismatched passwords', () => {
      const result = registerSupplierSchema.safeParse({
        companyName: 'Ma Société',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'different',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const issues = JSON.parse(result.error.message)
        expect(issues[0]?.message).toContain('ne correspondent pas')
      }
    })
  })

  describe('phone validation', () => {
    it('rejects invalid phone format', () => {
      const result = registerSupplierSchema.safeParse({
        companyName: 'Ma Société',
        email: 'test@example.com',
        phone: '123',
        password: 'password123',
        confirmPassword: 'password123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const issues = JSON.parse(result.error.message)
        expect(issues[0]?.message).toContain('numéro de téléphone valide')
      }
    })
  })
})

// ============================================
// Store Registration Schema Tests
// ============================================

describe('registerStoreSchema', () => {
  describe('valid inputs', () => {
    it('accepts valid input with all fields', () => {
      const result = registerStoreSchema.safeParse({
        name: 'Super U Bordeaux',
        brand: 'SUPER_U',
        email: 'contact@superubordeaux.fr',
        city: 'Bordeaux',
        phone: '0556123456',
        password: 'password123',
        confirmPassword: 'password123',
      })
      expect(result.success).toBe(true)
    })

    it('accepts valid input without phone (optional)', () => {
      const result = registerStoreSchema.safeParse({
        name: 'Leclerc Paris',
        brand: 'LECLERC',
        email: 'test@example.com',
        city: 'Paris',
        phone: '',
        password: 'password123',
        confirmPassword: 'password123',
      })
      expect(result.success).toBe(true)
    })

    it('accepts all valid brand values', () => {
      const brands = ['LECLERC', 'INTERMARCHE', 'SUPER_U', 'SYSTEME_U'] as const
      brands.forEach(brand => {
        const result = registerStoreSchema.safeParse({
          name: 'Mon Magasin',
          brand,
          email: 'test@example.com',
          city: 'Paris',
          password: 'password123',
          confirmPassword: 'password123',
        })
        expect(result.success).toBe(true)
      })
    })
  })

  describe('brand validation', () => {
    it('rejects invalid brand', () => {
      const result = registerStoreSchema.safeParse({
        name: 'Mon Magasin',
        brand: 'INVALID_BRAND',
        email: 'test@example.com',
        city: 'Paris',
        password: 'password123',
        confirmPassword: 'password123',
      })
      expect(result.success).toBe(false)
    })

    it('rejects missing brand', () => {
      const result = registerStoreSchema.safeParse({
        name: 'Mon Magasin',
        email: 'test@example.com',
        city: 'Paris',
        password: 'password123',
        confirmPassword: 'password123',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('name validation', () => {
    it('rejects name shorter than 2 characters', () => {
      const result = registerStoreSchema.safeParse({
        name: 'A',
        brand: 'LECLERC',
        email: 'test@example.com',
        city: 'Paris',
        password: 'password123',
        confirmPassword: 'password123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const issues = JSON.parse(result.error.message)
        expect(issues[0]?.message).toContain('2 caractères')
      }
    })

    it('rejects name longer than 100 characters', () => {
      const result = registerStoreSchema.safeParse({
        name: 'A'.repeat(101),
        brand: 'LECLERC',
        email: 'test@example.com',
        city: 'Paris',
        password: 'password123',
        confirmPassword: 'password123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const issues = JSON.parse(result.error.message)
        expect(issues[0]?.message).toContain('100 caractères')
      }
    })
  })

  describe('city validation', () => {
    it('rejects city shorter than 2 characters', () => {
      const result = registerStoreSchema.safeParse({
        name: 'Mon Magasin',
        brand: 'LECLERC',
        email: 'test@example.com',
        city: 'A',
        password: 'password123',
        confirmPassword: 'password123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const issues = JSON.parse(result.error.message)
        expect(issues[0]?.message).toContain('2 caractères')
      }
    })

    it('rejects missing city', () => {
      const result = registerStoreSchema.safeParse({
        name: 'Mon Magasin',
        brand: 'LECLERC',
        email: 'test@example.com',
        city: '',
        password: 'password123',
        confirmPassword: 'password123',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('email validation', () => {
    it('rejects invalid email format', () => {
      const result = registerStoreSchema.safeParse({
        name: 'Mon Magasin',
        brand: 'LECLERC',
        email: 'invalid-email',
        city: 'Paris',
        password: 'password123',
        confirmPassword: 'password123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const issues = JSON.parse(result.error.message)
        expect(issues[0]?.message).toContain('email valide')
      }
    })
  })

  describe('password validation', () => {
    it('rejects password shorter than 8 characters', () => {
      const result = registerStoreSchema.safeParse({
        name: 'Mon Magasin',
        brand: 'LECLERC',
        email: 'test@example.com',
        city: 'Paris',
        password: 'short',
        confirmPassword: 'short',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const issues = JSON.parse(result.error.message)
        expect(issues[0]?.message).toContain('8 caractères')
      }
    })

    it('rejects mismatched passwords', () => {
      const result = registerStoreSchema.safeParse({
        name: 'Mon Magasin',
        brand: 'LECLERC',
        email: 'test@example.com',
        city: 'Paris',
        password: 'password123',
        confirmPassword: 'different',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const issues = JSON.parse(result.error.message)
        expect(issues[0]?.message).toContain('ne correspondent pas')
      }
    })
  })
})

describe('BrandEnum', () => {
  it('contains all expected brands', () => {
    const brands = BrandEnum.options
    expect(brands).toContain('LECLERC')
    expect(brands).toContain('INTERMARCHE')
    expect(brands).toContain('SUPER_U')
    expect(brands).toContain('SYSTEME_U')
    expect(brands.length).toBe(4)
  })
})

describe('BRAND_LABELS', () => {
  it('has French labels for all brands', () => {
    expect(BRAND_LABELS.LECLERC).toBe('Leclerc')
    expect(BRAND_LABELS.INTERMARCHE).toBe('Intermarché')
    expect(BRAND_LABELS.SUPER_U).toBe('Super U')
    expect(BRAND_LABELS.SYSTEME_U).toBe('Système U')
  })
})

// ============================================
// Login Schema Tests
// ============================================

describe('loginSchema', () => {
  describe('valid inputs', () => {
    it('accepts valid credentials', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(result.success).toBe(true)
    })

    it('accepts email with various valid formats', () => {
      const validEmails = [
        'user@domain.com',
        'user.name@domain.fr',
        'user+tag@company.co.uk',
      ]
      validEmails.forEach(email => {
        const result = loginSchema.safeParse({
          email,
          password: 'password123',
        })
        expect(result.success).toBe(true)
      })
    })
  })

  describe('email validation', () => {
    it('rejects invalid email format', () => {
      const result = loginSchema.safeParse({
        email: 'invalid-email',
        password: 'password123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const issues = JSON.parse(result.error.message)
        expect(issues[0]?.message).toContain('email valide')
      }
    })

    it('rejects empty email', () => {
      const result = loginSchema.safeParse({
        email: '',
        password: 'password123',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('password validation', () => {
    it('rejects empty password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const issues = JSON.parse(result.error.message)
        expect(issues[0]?.message).toContain('requis')
      }
    })

    it('accepts any non-empty password (no min length for login)', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'a',
      })
      expect(result.success).toBe(true)
    })
  })
})
