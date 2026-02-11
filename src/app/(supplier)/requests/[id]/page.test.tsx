import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const mockNotFound = vi.fn()

vi.mock('@/lib/queries/requests', () => ({
  getSupplierRequestDetail: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'supplier-1' } } }),
    },
  }),
}))

vi.mock('next/navigation', () => ({
  notFound: () => { mockNotFound(); return null },
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
    back: vi.fn(),
  }),
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

vi.mock('@/components/custom/request-detail-actions', () => ({
  RequestDetailActions: ({ requestId, status, phone, updatedAt }: {
    requestId: string; status: string; phone: string | null; updatedAt: string
  }) => (
    <div data-testid="request-detail-actions" data-request-id={requestId} data-status={status} data-phone={phone} data-updated-at={updatedAt} />
  ),
}))

vi.mock('@/lib/utils/format', () => ({
  formatRelativeDate: () => 'il y a 2h',
  formatAbsoluteDate: () => '10 février 2026',
  formatPrice: (price: number) => `${price.toFixed(2)} €`,
}))

import { Decimal } from '@prisma/client/runtime/library'
import { getSupplierRequestDetail } from '@/lib/queries/requests'
import RequestDetailPage from './page'

function createMockDetail(overrides = {}) {
  return {
    id: 'req-1',
    storeId: 'store-1',
    offerId: 'offer-1',
    supplierId: 'supplier-1',
    type: 'INFO' as const,
    status: 'PENDING' as const,
    message: 'Je voudrais en savoir plus',
    createdAt: new Date('2026-02-10T12:00:00Z'),
    updatedAt: new Date('2026-02-10T12:00:00Z'),
    store: {
      name: 'Mon Magasin',
      brand: 'LECLERC' as const,
      city: 'Strasbourg',
      email: 'contact@monmagasin.fr',
      phone: '0388123456',
    },
    offer: { id: 'offer-1', name: 'Nutella 1kg', promoPrice: new Decimal('4.99') },
    ...overrides,
  }
}

describe('RequestDetailPage (supplier)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders store name', async () => {
    vi.mocked(getSupplierRequestDetail).mockResolvedValue(createMockDetail())

    const result = await RequestDetailPage({ params: Promise.resolve({ id: 'req-1' }) })
    render(result as React.ReactElement)

    expect(screen.getByText('Mon Magasin')).toBeInTheDocument()
  })

  it('renders store brand as badge', async () => {
    vi.mocked(getSupplierRequestDetail).mockResolvedValue(createMockDetail())

    const result = await RequestDetailPage({ params: Promise.resolve({ id: 'req-1' }) })
    render(result as React.ReactElement)

    expect(screen.getByText('LECLERC')).toBeInTheDocument()
  })

  it('renders store city', async () => {
    vi.mocked(getSupplierRequestDetail).mockResolvedValue(createMockDetail())

    const result = await RequestDetailPage({ params: Promise.resolve({ id: 'req-1' }) })
    render(result as React.ReactElement)

    expect(screen.getByText('Strasbourg')).toBeInTheDocument()
  })

  it('renders email as mailto link', async () => {
    vi.mocked(getSupplierRequestDetail).mockResolvedValue(createMockDetail())

    const result = await RequestDetailPage({ params: Promise.resolve({ id: 'req-1' }) })
    render(result as React.ReactElement)

    const emailLink = screen.getByText('contact@monmagasin.fr')
    expect(emailLink.closest('a')).toHaveAttribute('href', 'mailto:contact@monmagasin.fr')
  })

  it('renders phone as tel link', async () => {
    vi.mocked(getSupplierRequestDetail).mockResolvedValue(createMockDetail())

    const result = await RequestDetailPage({ params: Promise.resolve({ id: 'req-1' }) })
    render(result as React.ReactElement)

    const phoneLink = screen.getByText('0388123456')
    expect(phoneLink.closest('a')).toHaveAttribute('href', 'tel:0388123456')
  })

  it('renders "Non renseigné" when phone is null', async () => {
    vi.mocked(getSupplierRequestDetail).mockResolvedValue(
      createMockDetail({ store: { name: 'Mon Magasin', brand: 'LECLERC', city: 'Strasbourg', email: 'contact@monmagasin.fr', phone: null } })
    )

    const result = await RequestDetailPage({ params: Promise.resolve({ id: 'req-1' }) })
    render(result as React.ReactElement)

    expect(screen.getByText('Non renseigné')).toBeInTheDocument()
  })

  it('renders type badge', async () => {
    vi.mocked(getSupplierRequestDetail).mockResolvedValue(createMockDetail())

    const result = await RequestDetailPage({ params: Promise.resolve({ id: 'req-1' }) })
    render(result as React.ReactElement)

    expect(screen.getByText('Renseignements')).toBeInTheDocument()
  })

  it('renders status badge with supplier label "Nouveau"', async () => {
    vi.mocked(getSupplierRequestDetail).mockResolvedValue(createMockDetail({ status: 'PENDING' }))

    const result = await RequestDetailPage({ params: Promise.resolve({ id: 'req-1' }) })
    render(result as React.ReactElement)

    expect(screen.getByText('Nouveau')).toBeInTheDocument()
  })

  it('renders relative date', async () => {
    vi.mocked(getSupplierRequestDetail).mockResolvedValue(createMockDetail())

    const result = await RequestDetailPage({ params: Promise.resolve({ id: 'req-1' }) })
    render(result as React.ReactElement)

    expect(screen.getByText(/il y a 2h/)).toBeInTheDocument()
  })

  it('renders absolute date', async () => {
    vi.mocked(getSupplierRequestDetail).mockResolvedValue(createMockDetail())

    const result = await RequestDetailPage({ params: Promise.resolve({ id: 'req-1' }) })
    render(result as React.ReactElement)

    expect(screen.getByText('10 février 2026')).toBeInTheDocument()
  })

  it('renders message content', async () => {
    vi.mocked(getSupplierRequestDetail).mockResolvedValue(createMockDetail())

    const result = await RequestDetailPage({ params: Promise.resolve({ id: 'req-1' }) })
    render(result as React.ReactElement)

    expect(screen.getByText('Je voudrais en savoir plus')).toBeInTheDocument()
  })

  it('renders "Aucun message" when message is null', async () => {
    vi.mocked(getSupplierRequestDetail).mockResolvedValue(createMockDetail({ message: null }))

    const result = await RequestDetailPage({ params: Promise.resolve({ id: 'req-1' }) })
    render(result as React.ReactElement)

    expect(screen.getByText('Aucun message')).toBeInTheDocument()
  })

  it('renders offer link to /my-offers/[id]', async () => {
    vi.mocked(getSupplierRequestDetail).mockResolvedValue(createMockDetail())

    const result = await RequestDetailPage({ params: Promise.resolve({ id: 'req-1' }) })
    render(result as React.ReactElement)

    const offerLink = screen.getByText('Nutella 1kg')
    expect(offerLink.closest('a')).toHaveAttribute('href', '/my-offers/offer-1')
  })

  it('renders offer promo price', async () => {
    vi.mocked(getSupplierRequestDetail).mockResolvedValue(createMockDetail())

    const result = await RequestDetailPage({ params: Promise.resolve({ id: 'req-1' }) })
    render(result as React.ReactElement)

    expect(screen.getByText('4.99 €')).toBeInTheDocument()
  })

  it('calls notFound when request is null', async () => {
    vi.mocked(getSupplierRequestDetail).mockResolvedValue(null)

    await RequestDetailPage({ params: Promise.resolve({ id: 'req-not-found' }) })

    expect(mockNotFound).toHaveBeenCalled()
  })

  it('calls getSupplierRequestDetail with correct args', async () => {
    vi.mocked(getSupplierRequestDetail).mockResolvedValue(createMockDetail())

    await RequestDetailPage({ params: Promise.resolve({ id: 'req-1' }) })

    expect(getSupplierRequestDetail).toHaveBeenCalledWith('req-1', 'supplier-1')
  })

  it('renders page header with title and back button', async () => {
    vi.mocked(getSupplierRequestDetail).mockResolvedValue(createMockDetail())

    const result = await RequestDetailPage({ params: Promise.resolve({ id: 'req-1' }) })
    render(result as React.ReactElement)

    expect(screen.getByText('Détail de la demande')).toBeInTheDocument()
    expect(screen.getByLabelText('Retour')).toBeInTheDocument()
  })

  it('renders ORDER type badge', async () => {
    vi.mocked(getSupplierRequestDetail).mockResolvedValue(createMockDetail({ type: 'ORDER' }))

    const result = await RequestDetailPage({ params: Promise.resolve({ id: 'req-1' }) })
    render(result as React.ReactElement)

    expect(screen.getByText('Commande')).toBeInTheDocument()
  })

  it('renders RequestDetailActions with correct props', async () => {
    vi.mocked(getSupplierRequestDetail).mockResolvedValue(createMockDetail())

    const result = await RequestDetailPage({ params: Promise.resolve({ id: 'req-1' }) })
    render(result as React.ReactElement)

    const actions = screen.getByTestId('request-detail-actions')
    expect(actions).toHaveAttribute('data-request-id', 'req-1')
    expect(actions).toHaveAttribute('data-status', 'PENDING')
    expect(actions).toHaveAttribute('data-phone', '0388123456')
    expect(actions).toHaveAttribute('data-updated-at', '2026-02-10T12:00:00.000Z')
  })

  it('passes updatedAt to RequestDetailActions', async () => {
    vi.mocked(getSupplierRequestDetail).mockResolvedValue(
      createMockDetail({ updatedAt: new Date('2026-02-10T15:30:00Z') })
    )

    const result = await RequestDetailPage({ params: Promise.resolve({ id: 'req-1' }) })
    render(result as React.ReactElement)

    const actions = screen.getByTestId('request-detail-actions')
    expect(actions).toHaveAttribute('data-updated-at', '2026-02-10T15:30:00.000Z')
  })
})
