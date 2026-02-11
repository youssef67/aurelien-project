import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/lib/queries/requests', () => ({
  getStoreRequests: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
    },
  }),
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

vi.mock('@/lib/utils/format', () => ({
  formatRelativeDate: () => 'il y a 2h',
}))

import { Decimal } from '@prisma/client/runtime/library'
import { getStoreRequests } from '@/lib/queries/requests'
import MyRequestsPage from './page'

function createMockRequest(overrides = {}) {
  return {
    id: 'req-1',
    storeId: 'store-1',
    offerId: 'offer-1',
    supplierId: 'supplier-1',
    type: 'INFO' as const,
    status: 'PENDING' as const,
    message: 'Test message',
    createdAt: new Date('2026-02-10T12:00:00Z'),
    updatedAt: new Date('2026-02-10T12:00:00Z'),
    offer: { id: 'offer-1', name: 'Pommes Golden', promoPrice: new Decimal('2.49') },
    supplier: { companyName: 'FruitCo' },
    ...overrides,
  }
}

describe('MyRequestsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the request list when requests exist', async () => {
    vi.mocked(getStoreRequests).mockResolvedValue([createMockRequest()])

    const result = await MyRequestsPage()
    render(result as React.ReactElement)

    expect(screen.getByText('Pommes Golden')).toBeInTheDocument()
    expect(screen.getByText('FruitCo')).toBeInTheDocument()
  })

  it('renders empty state when no requests exist', async () => {
    vi.mocked(getStoreRequests).mockResolvedValue([])

    const result = await MyRequestsPage()
    render(result as React.ReactElement)

    expect(screen.getByText("Vous n'avez pas encore envoyé de demande")).toBeInTheDocument()
  })

  it('renders refresh button', async () => {
    vi.mocked(getStoreRequests).mockResolvedValue([createMockRequest()])

    const result = await MyRequestsPage()
    render(result as React.ReactElement)

    expect(screen.getByRole('button', { name: /actualiser/i })).toBeInTheDocument()
  })

  it('renders CTA link in empty state', async () => {
    vi.mocked(getStoreRequests).mockResolvedValue([])

    const result = await MyRequestsPage()
    render(result as React.ReactElement)

    const ctaLink = screen.getByRole('link', { name: /découvrir les offres/i })
    expect(ctaLink).toHaveAttribute('href', '/offers')
  })

  it('renders page header with title', async () => {
    vi.mocked(getStoreRequests).mockResolvedValue([])

    const result = await MyRequestsPage()
    render(result as React.ReactElement)

    expect(screen.getByText('Mes demandes')).toBeInTheDocument()
  })

  it('calls getStoreRequests with store id', async () => {
    vi.mocked(getStoreRequests).mockResolvedValue([])

    await MyRequestsPage()

    expect(getStoreRequests).toHaveBeenCalledWith('user-1')
  })

  it('renders multiple requests', async () => {
    vi.mocked(getStoreRequests).mockResolvedValue([
      createMockRequest({ id: 'req-1', offer: { id: 'o1', name: 'Pommes', promoPrice: new Decimal('2.49') } }),
      createMockRequest({ id: 'req-2', offer: { id: 'o2', name: 'Bananes', promoPrice: new Decimal('1.99') } }),
    ])

    const result = await MyRequestsPage()
    render(result as React.ReactElement)

    expect(screen.getByText('Pommes')).toBeInTheDocument()
    expect(screen.getByText('Bananes')).toBeInTheDocument()
  })

  it('renders type badges correctly', async () => {
    vi.mocked(getStoreRequests).mockResolvedValue([
      createMockRequest({ type: 'INFO' }),
    ])

    const result = await MyRequestsPage()
    render(result as React.ReactElement)

    expect(screen.getByText('Renseignements')).toBeInTheDocument()
  })

  it('renders status badges correctly', async () => {
    vi.mocked(getStoreRequests).mockResolvedValue([
      createMockRequest({ status: 'TREATED' }),
    ])

    const result = await MyRequestsPage()
    render(result as React.ReactElement)

    expect(screen.getByText('Traité')).toBeInTheDocument()
  })
})
