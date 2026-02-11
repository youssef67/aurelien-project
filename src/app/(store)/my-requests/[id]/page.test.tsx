import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/lib/queries/requests', () => ({
  getStoreRequestDetail: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
    },
  }),
}))

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
  useRouter: () => ({
    back: vi.fn(),
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

vi.mock('@/lib/utils/format', () => ({
  formatRelativeDate: () => 'il y a 2h',
  formatAbsoluteDate: () => '10 février 2026',
  formatPrice: (price: number) => `${price} €`,
  formatDateRange: () => '15 fév. - 28 fév.',
}))

import { Decimal } from '@prisma/client/runtime/library'
import { getStoreRequestDetail } from '@/lib/queries/requests'
import { notFound } from 'next/navigation'
import MyRequestDetailPage from './page'

function createMockRequestDetail(overrides = {}) {
  return {
    id: 'req-1',
    storeId: 'user-1',
    offerId: 'offer-1',
    supplierId: 'supplier-1',
    type: 'INFO' as const,
    status: 'PENDING' as const,
    message: 'Je souhaite des renseignements',
    createdAt: new Date('2026-02-10T12:00:00Z'),
    updatedAt: new Date('2026-02-10T12:00:00Z'),
    offer: {
      id: 'offer-1',
      name: 'Pommes Golden',
      promoPrice: new Decimal('2.49'),
      discountPercent: 25,
      startDate: new Date('2026-02-15'),
      endDate: new Date('2026-02-28'),
      category: 'EPICERIE' as const,
      photoUrl: null,
    },
    supplier: { companyName: 'FruitCo' },
    ...overrides,
  }
}

describe('MyRequestDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders offer name', async () => {
    vi.mocked(getStoreRequestDetail).mockResolvedValue(createMockRequestDetail())

    const result = await MyRequestDetailPage({ params: Promise.resolve({ id: 'req-1' }) })
    render(result as React.ReactElement)

    expect(screen.getByText('Pommes Golden')).toBeInTheDocument()
  })

  it('renders supplier name', async () => {
    vi.mocked(getStoreRequestDetail).mockResolvedValue(createMockRequestDetail())

    const result = await MyRequestDetailPage({ params: Promise.resolve({ id: 'req-1' }) })
    render(result as React.ReactElement)

    expect(screen.getByText('FruitCo')).toBeInTheDocument()
  })

  it('renders type badge', async () => {
    vi.mocked(getStoreRequestDetail).mockResolvedValue(createMockRequestDetail({ type: 'INFO' }))

    const result = await MyRequestDetailPage({ params: Promise.resolve({ id: 'req-1' }) })
    render(result as React.ReactElement)

    expect(screen.getByText('Renseignements')).toBeInTheDocument()
  })

  it('renders status badge', async () => {
    vi.mocked(getStoreRequestDetail).mockResolvedValue(createMockRequestDetail({ status: 'PENDING' }))

    const result = await MyRequestDetailPage({ params: Promise.resolve({ id: 'req-1' }) })
    render(result as React.ReactElement)

    expect(screen.getByText('En attente')).toBeInTheDocument()
  })

  it('renders message when present', async () => {
    vi.mocked(getStoreRequestDetail).mockResolvedValue(createMockRequestDetail())

    const result = await MyRequestDetailPage({ params: Promise.resolve({ id: 'req-1' }) })
    render(result as React.ReactElement)

    expect(screen.getByText('Je souhaite des renseignements')).toBeInTheDocument()
  })

  it('renders "Aucun message" when message is null', async () => {
    vi.mocked(getStoreRequestDetail).mockResolvedValue(createMockRequestDetail({ message: null }))

    const result = await MyRequestDetailPage({ params: Promise.resolve({ id: 'req-1' }) })
    render(result as React.ReactElement)

    expect(screen.getByText('Aucun message')).toBeInTheDocument()
  })

  it('calls notFound when request does not exist', async () => {
    vi.mocked(getStoreRequestDetail).mockResolvedValue(null)

    await MyRequestDetailPage({ params: Promise.resolve({ id: 'req-999' }) })

    expect(notFound).toHaveBeenCalled()
  })

  it('calls getStoreRequestDetail with correct params', async () => {
    vi.mocked(getStoreRequestDetail).mockResolvedValue(createMockRequestDetail())

    await MyRequestDetailPage({ params: Promise.resolve({ id: 'req-1' }) })

    expect(getStoreRequestDetail).toHaveBeenCalledWith('req-1', 'user-1')
  })

  it('renders page header with back button', async () => {
    vi.mocked(getStoreRequestDetail).mockResolvedValue(createMockRequestDetail())

    const result = await MyRequestDetailPage({ params: Promise.resolve({ id: 'req-1' }) })
    render(result as React.ReactElement)

    expect(screen.getByText('Détail de la demande')).toBeInTheDocument()
    expect(screen.getByLabelText('Retour')).toBeInTheDocument()
  })

  it('renders relative date', async () => {
    vi.mocked(getStoreRequestDetail).mockResolvedValue(createMockRequestDetail())

    const result = await MyRequestDetailPage({ params: Promise.resolve({ id: 'req-1' }) })
    render(result as React.ReactElement)

    expect(screen.getByText(/il y a 2h/)).toBeInTheDocument()
  })

  it('renders ORDER type badge as "Commande"', async () => {
    vi.mocked(getStoreRequestDetail).mockResolvedValue(createMockRequestDetail({ type: 'ORDER' }))

    const result = await MyRequestDetailPage({ params: Promise.resolve({ id: 'req-1' }) })
    render(result as React.ReactElement)

    expect(screen.getByText('Commande')).toBeInTheDocument()
  })

  it('renders TREATED status badge as "Traité"', async () => {
    vi.mocked(getStoreRequestDetail).mockResolvedValue(createMockRequestDetail({ status: 'TREATED' }))

    const result = await MyRequestDetailPage({ params: Promise.resolve({ id: 'req-1' }) })
    render(result as React.ReactElement)

    expect(screen.getByText('Traité')).toBeInTheDocument()
  })

  it('renders promo price', async () => {
    vi.mocked(getStoreRequestDetail).mockResolvedValue(createMockRequestDetail())

    const result = await MyRequestDetailPage({ params: Promise.resolve({ id: 'req-1' }) })
    render(result as React.ReactElement)

    expect(screen.getByText('2.49 €')).toBeInTheDocument()
  })

  it('renders absolute date', async () => {
    vi.mocked(getStoreRequestDetail).mockResolvedValue(createMockRequestDetail())

    const result = await MyRequestDetailPage({ params: Promise.resolve({ id: 'req-1' }) })
    render(result as React.ReactElement)

    expect(screen.getByText('10 février 2026')).toBeInTheDocument()
  })
})
