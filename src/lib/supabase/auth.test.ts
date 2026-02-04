import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the server module before importing auth
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getSession, getUser, signOut, getUserProfile } from './auth'

describe('Auth helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getSession', () => {
    it('should return session when authenticated', async () => {
      const mockSession = { user: { id: '123', email: 'test@test.com' } }
      const mockSupabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: mockSession },
            error: null,
          }),
        },
      }
      vi.mocked(createClient).mockResolvedValue(mockSupabase as never)

      const result = await getSession()

      expect(result.session).toEqual(mockSession)
      expect(result.error).toBeNull()
    })

    it('should return null session when not authenticated', async () => {
      const mockSupabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: null },
            error: null,
          }),
        },
      }
      vi.mocked(createClient).mockResolvedValue(mockSupabase as never)

      const result = await getSession()

      expect(result.session).toBeNull()
      expect(result.error).toBeNull()
    })
  })

  describe('getUser', () => {
    it('should return user when authenticated', async () => {
      const mockUser = { id: '123', email: 'test@test.com' }
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      }
      vi.mocked(createClient).mockResolvedValue(mockSupabase as never)

      const result = await getUser()

      expect(result.user).toEqual(mockUser)
      expect(result.error).toBeNull()
    })

    it('should return null user when not authenticated', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: null,
          }),
        },
      }
      vi.mocked(createClient).mockResolvedValue(mockSupabase as never)

      const result = await getUser()

      expect(result.user).toBeNull()
    })
  })

  describe('signOut', () => {
    it('should sign out and redirect on success', async () => {
      const mockSupabase = {
        auth: {
          signOut: vi.fn().mockResolvedValue({ error: null }),
        },
      }
      vi.mocked(createClient).mockResolvedValue(mockSupabase as never)

      await signOut()

      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
      expect(redirect).toHaveBeenCalledWith('/login')
    })

    it('should return error result on failure', async () => {
      const mockSupabase = {
        auth: {
          signOut: vi.fn().mockResolvedValue({
            error: { message: 'Sign out failed' },
          }),
        },
      }
      vi.mocked(createClient).mockResolvedValue(mockSupabase as never)

      const result = await signOut()

      expect(result).toEqual({
        success: false,
        error: 'Sign out failed',
        code: 'SERVER_ERROR',
      })
    })
  })

  describe('getUserProfile', () => {
    it('should return null profile when not authenticated', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Not authenticated' },
          }),
        },
      }
      vi.mocked(createClient).mockResolvedValue(mockSupabase as never)

      const result = await getUserProfile()

      expect(result.user).toBeNull()
      expect(result.profile).toBeNull()
      expect(result.userType).toBeNull()
    })

    it('should return supplier profile when user is supplier', async () => {
      const mockUser = { id: '123', email: 'supplier@test.com' }
      const mockSupplier = { id: '123', company_name: 'Test Company' }
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn().mockImplementation((table: string) => ({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: table === 'suppliers' ? mockSupplier : null,
            error: table === 'suppliers' ? null : { message: 'Not found' },
          }),
        })),
      }
      vi.mocked(createClient).mockResolvedValue(mockSupabase as never)

      const result = await getUserProfile()

      expect(result.user).toEqual(mockUser)
      expect(result.profile).toEqual(mockSupplier)
      expect(result.userType).toBe('supplier')
    })

    it('should return store profile when user is store', async () => {
      const mockUser = { id: '456', email: 'store@test.com' }
      const mockStore = { id: '456', name: 'Test Store', brand: 'LECLERC' }
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn().mockImplementation((table: string) => ({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: table === 'stores' ? mockStore : null,
            error: table === 'stores' ? null : { message: 'Not found' },
          }),
        })),
      }
      vi.mocked(createClient).mockResolvedValue(mockSupabase as never)

      const result = await getUserProfile()

      expect(result.user).toEqual(mockUser)
      expect(result.profile).toEqual(mockStore)
      expect(result.userType).toBe('store')
    })

    it('should return null profile when user has no profile', async () => {
      const mockUser = { id: '789', email: 'new@test.com' }
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Not found' },
          }),
        }),
      }
      vi.mocked(createClient).mockResolvedValue(mockSupabase as never)

      const result = await getUserProfile()

      expect(result.user).toEqual(mockUser)
      expect(result.profile).toBeNull()
      expect(result.userType).toBeNull()
    })
  })
})
