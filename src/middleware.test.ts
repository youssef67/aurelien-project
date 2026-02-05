import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock @supabase/ssr
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}))

import { createServerClient } from '@supabase/ssr'
import { middleware, config } from './middleware'

// Helper to create mock NextRequest
function createMockRequest(pathname: string, cookies: Record<string, string> = {}): NextRequest {
  const url = new URL(`http://localhost:3000${pathname}`)
  const request = new NextRequest(url)

  // Mock cookies
  Object.entries(cookies).forEach(([name, value]) => {
    request.cookies.set(name, value)
  })

  return request
}

describe('Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Public routes', () => {
    it('should allow access to login page when not authenticated', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
      }
      vi.mocked(createServerClient).mockReturnValue(mockSupabase as never)

      const request = createMockRequest('/login')
      const response = await middleware(request)

      expect(response.status).not.toBe(307) // Not a redirect
    })

    it('should allow access to register page when not authenticated', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
      }
      vi.mocked(createServerClient).mockReturnValue(mockSupabase as never)

      const request = createMockRequest('/register')
      const response = await middleware(request)

      expect(response.status).not.toBe(307)
    })

    it('should allow access to register/supplier when not authenticated', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
      }
      vi.mocked(createServerClient).mockReturnValue(mockSupabase as never)

      const request = createMockRequest('/register/supplier')
      const response = await middleware(request)

      expect(response.status).not.toBe(307)
    })

    it('should allow access to forgot-password when not authenticated', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
      }
      vi.mocked(createServerClient).mockReturnValue(mockSupabase as never)

      const request = createMockRequest('/forgot-password')
      const response = await middleware(request)

      expect(response.status).not.toBe(307)
    })

    it('should allow access to home page', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
      }
      vi.mocked(createServerClient).mockReturnValue(mockSupabase as never)

      const request = createMockRequest('/')
      const response = await middleware(request)

      expect(response.status).not.toBe(307)
    })
  })

  describe('Protected routes', () => {
    it('should redirect to login when accessing protected route without auth', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
      }
      vi.mocked(createServerClient).mockReturnValue(mockSupabase as never)

      const request = createMockRequest('/offers')
      const response = await middleware(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/login')
      expect(response.headers.get('location')).toContain('redirectTo=%2Foffers')
    })

    it('should redirect to login when accessing dashboard without auth', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
      }
      vi.mocked(createServerClient).mockReturnValue(mockSupabase as never)

      const request = createMockRequest('/dashboard')
      const response = await middleware(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/login')
    })

    it('should allow access to protected route when authenticated', async () => {
      const mockUser = { id: '123', email: 'test@test.com' }
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
      }
      vi.mocked(createServerClient).mockReturnValue(mockSupabase as never)

      const request = createMockRequest('/offers')
      const response = await middleware(request)

      expect(response.status).not.toBe(307)
    })
  })

  describe('Authenticated user on auth pages', () => {
    it('should redirect authenticated user from login to /profile', async () => {
      const mockUser = { id: '123', email: 'test@test.com' }
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
      }
      vi.mocked(createServerClient).mockReturnValue(mockSupabase as never)

      const request = createMockRequest('/login')
      const response = await middleware(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/profile')
    })

    it('should redirect authenticated user from register to /profile', async () => {
      const mockUser = { id: '123', email: 'test@test.com' }
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
      }
      vi.mocked(createServerClient).mockReturnValue(mockSupabase as never)

      const request = createMockRequest('/register')
      const response = await middleware(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/profile')
    })
  })

  describe('Matcher config', () => {
    it('should have correct matcher pattern', () => {
      expect(config.matcher).toBeDefined()
      expect(config.matcher).toHaveLength(1)
      // Should exclude static files, images, favicon
      expect(config.matcher[0]).toContain('_next/static')
      expect(config.matcher[0]).toContain('_next/image')
      expect(config.matcher[0]).toContain('favicon.ico')
    })
  })
})
