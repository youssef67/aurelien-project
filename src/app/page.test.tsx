import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next/navigation
const mockRedirect = vi.fn()
vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    mockRedirect(url)
    throw new Error(`NEXT_REDIRECT:${url}`)
  },
}))

// Mock supabase client
const mockGetUser = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: {
        getUser: mockGetUser,
      },
    })
  ),
}))

// Mock LandingHero component
vi.mock('@/components/landing/landing-hero', () => ({
  default: () => <div data-testid="landing-hero-mock">Landing Hero</div>,
}))

describe('HomePage (AC4: Redirection des utilisateurs connectés)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects supplier to /dashboard', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: '123',
          user_metadata: { user_type: 'supplier' },
        },
      },
    })

    // Dynamically import to test async server component
    const { default: HomePage } = await import('./page')

    await expect(HomePage()).rejects.toThrow('NEXT_REDIRECT:/dashboard')
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
  })

  it('redirects store to /offers', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: '456',
          user_metadata: { user_type: 'store' },
        },
      },
    })

    const { default: HomePage } = await import('./page')

    await expect(HomePage()).rejects.toThrow('NEXT_REDIRECT:/offers')
    expect(mockRedirect).toHaveBeenCalledWith('/offers')
  })

  it('renders landing page for non-authenticated users', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
    })

    const { default: HomePage } = await import('./page')
    const result = await HomePage()

    expect(result).toBeDefined()
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('renders landing page for authenticated user without user_type', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: '789',
          user_metadata: {},
        },
      },
    })

    const { default: HomePage } = await import('./page')
    const result = await HomePage()

    expect(result).toBeDefined()
    expect(mockRedirect).not.toHaveBeenCalled()
  })
})
