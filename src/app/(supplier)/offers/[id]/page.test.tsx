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
  usePathname: vi.fn(() => '/offers/1'),
}))

import { Decimal } from '@prisma/client/runtime/library'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma/client'
import { redirect } from 'next/navigation'
import OfferDetailPage from './page'

function mockOffer(overrides = {}) {
  return {
    id: 'offer-uuid-1',
    supplierId: 'user-1',
    name: 'Nutella 1kg',
    promoPrice: new Decimal('12.99'),
    discountPercent: 25,
    startDate: new Date('2026-02-01'),
    endDate: new Date('2026-12-31'),
    category: 'EPICERIE',
    subcategory: 'Bio',
    photoUrl: null,
    margin: new Decimal('15.50'),
    volume: '2 palettes',
    conditions: 'Franco 500€',
    animation: 'PLV fournie',
    status: 'ACTIVE',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
    ...overrides,
  }
}

describe('OfferDetailPage', () => {
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
      OfferDetailPage({ params: Promise.resolve({ id: 'offer-uuid-1' }) })
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
      OfferDetailPage({ params: Promise.resolve({ id: 'nonexistent' }) })
    ).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/dashboard')
  })

  it('displays offer information', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
      },
    } as never)
    vi.mocked(prisma.offer.findUnique).mockResolvedValue(mockOffer() as never)

    const result = await OfferDetailPage({ params: Promise.resolve({ id: 'offer-uuid-1' }) })
    render(result as React.ReactElement)

    expect(screen.getByText('Nutella 1kg')).toBeInTheDocument()
    expect(screen.getByText(/12,99/)).toBeInTheDocument()
    expect(screen.getByText(/-25%/)).toBeInTheDocument()
    expect(screen.getByText(/Épicerie/)).toBeInTheDocument()
  })

  it('displays the "Modifier" button', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
      },
    } as never)
    vi.mocked(prisma.offer.findUnique).mockResolvedValue(mockOffer() as never)

    const result = await OfferDetailPage({ params: Promise.resolve({ id: 'offer-uuid-1' }) })
    render(result as React.ReactElement)

    const modifyButton = screen.getByRole('link', { name: /modifier/i })
    expect(modifyButton).toBeInTheDocument()
    expect(modifyButton).toHaveAttribute('href', '/offers/offer-uuid-1/edit')
  })

  it('displays optional fields when present', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
      },
    } as never)
    vi.mocked(prisma.offer.findUnique).mockResolvedValue(mockOffer() as never)

    const result = await OfferDetailPage({ params: Promise.resolve({ id: 'offer-uuid-1' }) })
    render(result as React.ReactElement)

    expect(screen.getByText('Bio')).toBeInTheDocument()
    expect(screen.getByText('15.5%')).toBeInTheDocument()
    expect(screen.getByText('2 palettes')).toBeInTheDocument()
    expect(screen.getByText('Franco 500€')).toBeInTheDocument()
    expect(screen.getByText('PLV fournie')).toBeInTheDocument()
  })

  it('displays back button linking to dashboard', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
      },
    } as never)
    vi.mocked(prisma.offer.findUnique).mockResolvedValue(mockOffer() as never)

    const result = await OfferDetailPage({ params: Promise.resolve({ id: 'offer-uuid-1' }) })
    render(result as React.ReactElement)

    const backLink = screen.getByRole('link', { name: /retour aux offres/i })
    expect(backLink).toHaveAttribute('href', '/dashboard')
  })

  it('queries offer with supplierId and deletedAt check', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }),
      },
    } as never)
    vi.mocked(prisma.offer.findUnique).mockResolvedValue(null)

    try {
      await OfferDetailPage({ params: Promise.resolve({ id: 'offer-uuid-1' }) })
    } catch {
      // redirect throws
    }

    expect(prisma.offer.findUnique).toHaveBeenCalledWith({
      where: { id: 'offer-uuid-1', supplierId: 'user-123', deletedAt: null },
    })
  })

  it('displays status badge', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
      },
    } as never)
    vi.mocked(prisma.offer.findUnique).mockResolvedValue(mockOffer() as never)

    const result = await OfferDetailPage({ params: Promise.resolve({ id: 'offer-uuid-1' }) })
    render(result as React.ReactElement)

    expect(screen.getByText('Active')).toBeInTheDocument()
  })
})
