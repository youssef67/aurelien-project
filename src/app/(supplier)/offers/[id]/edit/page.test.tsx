import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/prisma/client', () => ({
  prisma: {
    offer: {
      findUnique: vi.fn(),
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
  usePathname: vi.fn(() => '/offers/1/edit'),
}))

// Mock storage utilities (used by PhotoUpload inside EditOfferForm)
vi.mock('@/lib/supabase/storage', () => ({
  uploadOfferPhoto: vi.fn(),
  deleteOfferPhoto: vi.fn(),
}))

// Mock Supabase client (for PhotoUpload)
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: () => Promise.resolve({ data: { user: { id: 'user-1' } } }),
    },
  }),
}))

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock updateOffer action
vi.mock('@/lib/actions/offers', () => ({
  updateOffer: vi.fn(),
}))

import { Decimal } from '@prisma/client/runtime/library'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma/client'
import { redirect } from 'next/navigation'
import EditOfferPage from './page'

function mockOffer(overrides = {}) {
  return {
    id: 'offer-uuid-1',
    supplierId: 'user-1',
    name: 'Nutella 1kg',
    promoPrice: new Decimal('12.99'),
    discountPercent: 25,
    startDate: new Date('2026-03-01'),
    endDate: new Date('2026-12-31'),
    category: 'EPICERIE',
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
    ...overrides,
  }
}

describe('EditOfferPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to login when user is not authenticated', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    } as never)

    await expect(
      EditOfferPage({ params: Promise.resolve({ id: 'offer-uuid-1' }) })
    ).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/login')
  })

  it('redirects to dashboard when offer not found', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
      },
    } as never)
    vi.mocked(prisma.offer.findUnique).mockResolvedValue(null)

    await expect(
      EditOfferPage({ params: Promise.resolve({ id: 'nonexistent' }) })
    ).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/dashboard')
  })

  it('renders the edit form with offer data', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
      },
    } as never)
    vi.mocked(prisma.offer.findUnique).mockResolvedValue(mockOffer() as never)

    const result = await EditOfferPage({ params: Promise.resolve({ id: 'offer-uuid-1' }) })
    render(result as React.ReactElement)

    expect(screen.getByText("Modifier l'offre")).toBeInTheDocument()
    expect(screen.getByDisplayValue('Nutella 1kg')).toBeInTheDocument()
  })

  it('queries offer with supplierId and deletedAt check', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }),
      },
    } as never)
    vi.mocked(prisma.offer.findUnique).mockResolvedValue(null)

    try {
      await EditOfferPage({ params: Promise.resolve({ id: 'offer-uuid-1' }) })
    } catch {
      // redirect throws
    }

    expect(prisma.offer.findUnique).toHaveBeenCalledWith({
      where: { id: 'offer-uuid-1', supplierId: 'user-123', deletedAt: null },
    })
  })
})
