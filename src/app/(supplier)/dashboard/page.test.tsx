import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/prisma/client', () => ({
  prisma: {
    offer: {
      findMany: vi.fn(),
    },
  },
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT')
  }),
  useRouter: vi.fn(() => ({
    back: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
  })),
  usePathname: vi.fn(() => '/dashboard'),
}))

import { Decimal } from '@prisma/client/runtime/library'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma/client'
import { redirect } from 'next/navigation'
import DashboardPage from './page'

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to login when user is not authenticated', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    } as never)

    await expect(DashboardPage()).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/login')
  })

  it('renders empty state when user has no offers', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
      },
    } as never)
    vi.mocked(prisma.offer.findMany).mockResolvedValue([])

    // Prevent redirect mock from throwing for this test
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    const result = await DashboardPage()
    render(result as React.ReactElement)

    expect(screen.getByText('Aucune offre pour le moment')).toBeInTheDocument()
  })

  it('renders offer list when offers exist', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
      },
    } as never)
    vi.mocked(prisma.offer.findMany).mockResolvedValue([
      {
        id: '1',
        supplierId: 'user-1',
        name: 'Test Offer',
        promoPrice: new Decimal('9.99'),
        discountPercent: 20,
        startDate: new Date('2026-02-01'),
        endDate: new Date('2099-12-31'),
        category: 'FRUITS_LEGUMES',
        subcategory: null,
        photoUrl: null,
        margin: null,
        volume: null,
        conditions: null,
        animation: null,
        status: 'ACTIVE',
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        deletedAt: null,
      } as never,
    ])

    const result = await DashboardPage()
    render(result as React.ReactElement)

    expect(screen.getByText('Test Offer')).toBeInTheDocument()
    expect(screen.getByText(/9,99/)).toBeInTheDocument()
    expect(screen.getByText(/-20%/)).toBeInTheDocument()
  })

  it('queries only non-deleted offers for the current user', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }),
      },
    } as never)
    vi.mocked(prisma.offer.findMany).mockResolvedValue([])

    await DashboardPage()

    expect(prisma.offer.findMany).toHaveBeenCalledWith({
      where: {
        supplierId: 'user-123',
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  })

  it('renders the FloatingActionButton linking to /offers/new', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
      },
    } as never)
    vi.mocked(prisma.offer.findMany).mockResolvedValue([])

    const result = await DashboardPage()
    render(result as React.ReactElement)

    const fabLink = screen.getByRole('link', { name: /créer une nouvelle offre/i })
    expect(fabLink).toHaveAttribute('href', '/offers/new')
  })
})
