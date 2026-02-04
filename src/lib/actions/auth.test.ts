import { describe, it, expect, vi, beforeEach } from 'vitest'
import { registerSupplier, registerStore, login, logout, resendConfirmationEmail } from './auth'

// Mock Supabase
const mockSignUp = vi.fn()
const mockSignInWithPassword = vi.fn()
const mockSignOut = vi.fn()
const mockResend = vi.fn()
const mockInsert = vi.fn()
const mockFrom = vi.fn(() => ({ insert: mockInsert }))
const mockDeleteUser = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    auth: {
      signUp: mockSignUp,
      signInWithPassword: mockSignInWithPassword,
      signOut: mockSignOut,
      resend: mockResend,
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

// ============================================
// registerStore Tests
// ============================================

describe('registerStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('validation', () => {
    it('returns validation error for invalid email', async () => {
      const result = await registerStore({
        name: 'Mon Magasin',
        brand: 'LECLERC',
        email: 'invalid-email',
        city: 'Paris',
        password: 'password123',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('VALIDATION_ERROR')
        expect(result.error).toContain('email valide')
      }
    })

    it('returns validation error for short password', async () => {
      const result = await registerStore({
        name: 'Mon Magasin',
        brand: 'LECLERC',
        email: 'test@example.com',
        city: 'Paris',
        password: 'short',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('VALIDATION_ERROR')
        expect(result.error).toContain('8 caractères')
      }
    })

    it('returns validation error for short store name', async () => {
      const result = await registerStore({
        name: 'A',
        brand: 'LECLERC',
        email: 'test@example.com',
        city: 'Paris',
        password: 'password123',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('VALIDATION_ERROR')
        expect(result.error).toContain('2 caractères')
      }
    })

    it('returns validation error for missing city', async () => {
      const result = await registerStore({
        name: 'Mon Magasin',
        brand: 'LECLERC',
        email: 'test@example.com',
        city: '',
        password: 'password123',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('VALIDATION_ERROR')
      }
    })
  })

  describe('successful registration', () => {
    it('creates user and profile successfully', async () => {
      const mockUserId = 'test-store-uuid'

      mockSignUp.mockResolvedValueOnce({
        data: { user: { id: mockUserId } },
        error: null,
      })

      mockInsert.mockResolvedValueOnce({
        error: null,
      })

      const result = await registerStore({
        name: 'Super U Bordeaux',
        brand: 'SUPER_U',
        email: 'contact@superubordeaux.fr',
        city: 'Bordeaux',
        phone: '0556123456',
        password: 'password123',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.userId).toBe(mockUserId)
      }

      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'contact@superubordeaux.fr',
        password: 'password123',
        options: {
          data: {
            user_type: 'store',
            store_name: 'Super U Bordeaux',
            brand: 'SUPER_U',
          },
        },
      })

      expect(mockFrom).toHaveBeenCalledWith('stores')
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockUserId,
          email: 'contact@superubordeaux.fr',
          name: 'Super U Bordeaux',
          brand: 'SUPER_U',
          city: 'Bordeaux',
          phone: '0556123456',
        })
      )
    })

    it('handles empty phone as null', async () => {
      const mockUserId = 'test-store-uuid'

      mockSignUp.mockResolvedValueOnce({
        data: { user: { id: mockUserId } },
        error: null,
      })

      mockInsert.mockResolvedValueOnce({
        error: null,
      })

      await registerStore({
        name: 'Leclerc Paris',
        brand: 'LECLERC',
        email: 'test@example.com',
        city: 'Paris',
        phone: '',
        password: 'password123',
      })

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
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

      const result = await registerStore({
        name: 'Mon Magasin',
        brand: 'LECLERC',
        email: 'existing@example.com',
        city: 'Paris',
        password: 'password123',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('VALIDATION_ERROR')
        expect(result.error).toBe('Cet email est déjà utilisé')
      }
    })

    it('performs rollback when profile creation fails', async () => {
      const mockUserId = 'test-store-uuid'

      mockSignUp.mockResolvedValueOnce({
        data: { user: { id: mockUserId } },
        error: null,
      })

      mockInsert.mockResolvedValueOnce({
        error: { message: 'Database error' },
      })

      const result = await registerStore({
        name: 'Mon Magasin',
        brand: 'LECLERC',
        email: 'test@example.com',
        city: 'Paris',
        password: 'password123',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('SERVER_ERROR')
        expect(result.error).toBe('Erreur lors de la création du profil')
      }

      // Verify rollback was called
      expect(mockDeleteUser).toHaveBeenCalledWith(mockUserId)
    })
  })
})

// ============================================
// login Tests
// ============================================

describe('login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('validation', () => {
    it('returns validation error for invalid email', async () => {
      const result = await login({
        email: 'invalid-email',
        password: 'password123',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('VALIDATION_ERROR')
        expect(result.error).toContain('email valide')
      }
    })

    it('returns validation error for empty password', async () => {
      const result = await login({
        email: 'test@example.com',
        password: '',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('VALIDATION_ERROR')
        expect(result.error).toContain('requis')
      }
    })
  })

  describe('successful login', () => {
    it('returns redirect to /dashboard for supplier', async () => {
      mockSignInWithPassword.mockResolvedValueOnce({
        data: {
          user: {
            id: 'supplier-uuid',
            user_metadata: { user_type: 'supplier' },
          },
        },
        error: null,
      })

      const result = await login({
        email: 'supplier@example.com',
        password: 'password123',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.userType).toBe('supplier')
        expect(result.data.redirectUrl).toBe('/dashboard')
      }

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'supplier@example.com',
        password: 'password123',
      })
    })

    it('returns redirect to /offers for store', async () => {
      mockSignInWithPassword.mockResolvedValueOnce({
        data: {
          user: {
            id: 'store-uuid',
            user_metadata: { user_type: 'store' },
          },
        },
        error: null,
      })

      const result = await login({
        email: 'store@example.com',
        password: 'password123',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.userType).toBe('store')
        expect(result.data.redirectUrl).toBe('/offers')
      }
    })
  })

  describe('error handling', () => {
    it('returns unauthorized for invalid credentials', async () => {
      mockSignInWithPassword.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Invalid login credentials' },
      })

      const result = await login({
        email: 'test@example.com',
        password: 'wrongpassword',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('UNAUTHORIZED')
        expect(result.error).toBe('Email ou mot de passe incorrect')
      }
    })

    it('returns unauthorized for unconfirmed email', async () => {
      mockSignInWithPassword.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Email not confirmed' },
      })

      const result = await login({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('UNAUTHORIZED')
        expect(result.error).toContain('confirmer votre email')
      }
    })

    it('returns server error when user_type is missing', async () => {
      mockSignInWithPassword.mockResolvedValueOnce({
        data: {
          user: {
            id: 'user-uuid',
            user_metadata: {},
          },
        },
        error: null,
      })

      const result = await login({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('SERVER_ERROR')
        expect(result.error).toContain('Type d\'utilisateur')
      }
    })

    it('returns unauthorized when user is null after sign in', async () => {
      mockSignInWithPassword.mockResolvedValueOnce({
        data: { user: null },
        error: null,
      })

      const result = await login({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('UNAUTHORIZED')
      }
    })

    it('returns server error when unexpected exception occurs', async () => {
      mockSignInWithPassword.mockRejectedValueOnce(new Error('Network error'))

      const result = await login({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('SERVER_ERROR')
        expect(result.error).toBe('Une erreur inattendue s\'est produite')
      }
    })
  })
})

// ============================================
// resendConfirmationEmail Tests
// ============================================

describe('resendConfirmationEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('validation', () => {
    it('returns validation error for invalid email', async () => {
      const result = await resendConfirmationEmail('invalid-email')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('VALIDATION_ERROR')
        expect(result.error).toContain('invalide')
      }
    })

    it('returns validation error for empty email', async () => {
      const result = await resendConfirmationEmail('')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('VALIDATION_ERROR')
      }
    })
  })

  describe('successful resend', () => {
    it('sends confirmation email successfully', async () => {
      mockResend.mockResolvedValueOnce({
        error: null,
      })

      const result = await resendConfirmationEmail('test@example.com')

      expect(result.success).toBe(true)
      expect(mockResend).toHaveBeenCalledWith({
        type: 'signup',
        email: 'test@example.com',
      })
    })
  })

  describe('error handling', () => {
    it('returns error for rate limit', async () => {
      mockResend.mockResolvedValueOnce({
        error: { message: 'rate limit exceeded' },
      })

      const result = await resendConfirmationEmail('test@example.com')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('SERVER_ERROR')
        expect(result.error).toContain('patienter')
      }
    })

    it('returns error for general failure', async () => {
      mockResend.mockResolvedValueOnce({
        error: { message: 'Some error' },
      })

      const result = await resendConfirmationEmail('test@example.com')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('SERVER_ERROR')
      }
    })
  })
})

// ============================================
// logout Tests
// ============================================

describe('logout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('successful logout', () => {
    it('returns success when signOut succeeds', async () => {
      mockSignOut.mockResolvedValueOnce({
        error: null,
      })

      const result = await logout()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBeUndefined()
      }
      expect(mockSignOut).toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('returns error when signOut fails', async () => {
      mockSignOut.mockResolvedValueOnce({
        error: { message: 'Sign out error' },
      })

      const result = await logout()

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('SERVER_ERROR')
        expect(result.error).toBe('Une erreur est survenue lors de la déconnexion')
      }
    })

    it('handles unexpected exceptions', async () => {
      mockSignOut.mockRejectedValueOnce(new Error('Network error'))

      const result = await logout()

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('SERVER_ERROR')
        expect(result.error).toBe('Une erreur inattendue s\'est produite')
      }
    })
  })
})
