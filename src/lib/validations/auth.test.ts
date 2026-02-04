import { describe, it, expect } from 'vitest'
import { registerSupplierSchema } from './auth'

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
