import { describe, it, expect, vi, beforeEach } from 'vitest'
import { registerSupplier } from './auth'

// Mock Supabase
const mockSignUp = vi.fn()
const mockInsert = vi.fn()
const mockFrom = vi.fn(() => ({ insert: mockInsert }))
const mockDeleteUser = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    auth: {
      signUp: mockSignUp,
    },
  })),
  createAdminClient: vi.fn(() => ({
    from: mockFrom,
    auth: {
      admin: {
        deleteUser: mockDeleteUser,
      },
    },
  })),
}))

describe('registerSupplier', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('validation', () => {
    it('returns validation error for invalid email', async () => {
      const result = await registerSupplier({
        companyName: 'Test Company',
        email: 'invalid-email',
        password: 'password123',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('VALIDATION_ERROR')
        expect(result.error).toContain('email valide')
      }
    })

    it('returns validation error for short password', async () => {
      const result = await registerSupplier({
        companyName: 'Test Company',
        email: 'test@example.com',
        password: 'short',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('VALIDATION_ERROR')
        expect(result.error).toContain('8 caractères')
      }
    })

    it('returns validation error for short company name', async () => {
      const result = await registerSupplier({
        companyName: 'A',
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('VALIDATION_ERROR')
        expect(result.error).toContain('2 caractères')
      }
    })
  })

  describe('successful registration', () => {
    it('creates user and profile successfully', async () => {
      const mockUserId = 'test-user-uuid'

      mockSignUp.mockResolvedValueOnce({
        data: { user: { id: mockUserId } },
        error: null,
      })

      mockInsert.mockResolvedValueOnce({
        error: null,
      })

      const result = await registerSupplier({
        companyName: 'Test Company',
        email: 'test@example.com',
        phone: '0612345678',
        password: 'password123',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.userId).toBe(mockUserId)
      }

      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            user_type: 'supplier',
            company_name: 'Test Company',
          },
        },
      })

      expect(mockFrom).toHaveBeenCalledWith('suppliers')
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockUserId,
          email: 'test@example.com',
          company_name: 'Test Company',
          phone: '0612345678',
        })
      )
    })

    it('handles empty phone as null', async () => {
      const mockUserId = 'test-user-uuid'

      mockSignUp.mockResolvedValueOnce({
        data: { user: { id: mockUserId } },
        error: null,
      })

      mockInsert.mockResolvedValueOnce({
        error: null,
      })

      await registerSupplier({
        companyName: 'Test Company',
        email: 'test@example.com',
        phone: '',
        password: 'password123',
      })

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockUserId,
          email: 'test@example.com',
          company_name: 'Test Company',
          phone: null,
        })
      )
    })
  })

  describe('error handling', () => {
    it('returns validation error when email already exists', async () => {
      mockSignUp.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'User already registered' },
      })

      const result = await registerSupplier({
        companyName: 'Test Company',
        email: 'existing@example.com',
        password: 'password123',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('VALIDATION_ERROR')
        expect(result.error).toBe('Cet email est déjà utilisé')
      }
    })

    it('returns server error when auth creation fails', async () => {
      mockSignUp.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Internal server error' },
      })

      const result = await registerSupplier({
        companyName: 'Test Company',
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('SERVER_ERROR')
      }
    })

    it('returns server error when profile creation fails', async () => {
      mockSignUp.mockResolvedValueOnce({
        data: { user: { id: 'test-uuid' } },
        error: null,
      })

      mockInsert.mockResolvedValueOnce({
        error: { message: 'Database error' },
      })

      const result = await registerSupplier({
        companyName: 'Test Company',
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('SERVER_ERROR')
        expect(result.error).toBe('Erreur lors de la création du profil')
      }
    })

    it('returns server error when user is null after signup', async () => {
      mockSignUp.mockResolvedValueOnce({
        data: { user: null },
        error: null,
      })

      const result = await registerSupplier({
        companyName: 'Test Company',
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('SERVER_ERROR')
        expect(result.error).toBe('Erreur lors de la création du compte')
      }
    })
  })
})
