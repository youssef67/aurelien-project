import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/lib/queries/offers', () => ({
  getActiveOffers: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
    },
  }),
}))

vi.mock('@/lib/prisma/client', () => ({
  prisma: {
    store: {
      findUnique: vi.fn().mockResolvedValue({ brand: 'LECLERC' }),
    },
  },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
  }),
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

import { Decimal } from '@prisma/client/runtime/library'
import { getActiveOffers } from '@/lib/queries/offers'
import type { OfferWithSupplier } from '@/lib/queries/offers'
import { prisma } from '@/lib/prisma/client'
import StoreOffersPage from './page'

function createMockOfferWithSupplier(overrides: Partial<OfferWithSupplier> = {}): OfferWithSupplier {
  return {
    id: '1',
    supplierId: 'supplier-1',
    name: 'Pommes Golden',
    promoPrice: new Decimal('2.49'),
    discountPercent: 25,
    startDate: new Date('2026-02-15'),
    endDate: new Date('2099-02-28'),
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
    supplier: { companyName: 'Test Supplier' },
    ...overrides,
  } as OfferWithSupplier
}

describe('StoreOffersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the offer list when offers exist', async () => {
    vi.mocked(getActiveOffers).mockResolvedValue([
      createMockOfferWithSupplier(),
    ])

    const result = await StoreOffersPage()
    render(result as React.ReactElement)

    expect(screen.getByText('Pommes Golden')).toBeInTheDocument()
  })

  it('renders empty state when no offers exist', async () => {
    vi.mocked(getActiveOffers).mockResolvedValue([])

    const result = await StoreOffersPage()
    render(result as React.ReactElement)

    expect(screen.getByText('Aucune offre disponible')).toBeInTheDocument()
    expect(screen.getByText(/Aucune offre disponible pour le moment/)).toBeInTheDocument()
  })

  it('calls getActiveOffers', async () => {
    vi.mocked(getActiveOffers).mockResolvedValue([])

    await StoreOffersPage()

    expect(getActiveOffers).toHaveBeenCalled()
  })

  it('fetches store brand for the authenticated user', async () => {
    vi.mocked(getActiveOffers).mockResolvedValue([createMockOfferWithSupplier()])

    await StoreOffersPage()

    expect(prisma.store.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: { brand: true },
    })
  })
})
