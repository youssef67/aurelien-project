import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/lib/queries/requests', () => ({
  getSupplierRequests: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'supplier-1' } } }),
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

import { getSupplierRequests } from '@/lib/queries/requests'
import RequestsPage from './page'

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
    store: { name: 'Mon Magasin', brand: 'LECLERC' as const, city: 'Strasbourg' },
    offer: { id: 'offer-1', name: 'Nutella 1kg' },
    ...overrides,
  }
}

describe('RequestsPage (supplier)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the request list when requests exist', async () => {
    vi.mocked(getSupplierRequests).mockResolvedValue([createMockRequest()])

    const result = await RequestsPage()
    render(result as React.ReactElement)

    expect(screen.getByText('Mon Magasin')).toBeInTheDocument()
    expect(screen.getByText(/Nutella 1kg/)).toBeInTheDocument()
  })

  it('renders empty state when no requests exist', async () => {
    vi.mocked(getSupplierRequests).mockResolvedValue([])

    const result = await RequestsPage()
    render(result as React.ReactElement)

    expect(screen.getByText('Les demandes de vos clients apparaîtront ici')).toBeInTheDocument()
  })

  it('renders refresh button', async () => {
    vi.mocked(getSupplierRequests).mockResolvedValue([createMockRequest()])

    const result = await RequestsPage()
    render(result as React.ReactElement)

    expect(screen.getByRole('button', { name: /actualiser/i })).toBeInTheDocument()
  })

  it('does NOT render CTA link in empty state', async () => {
    vi.mocked(getSupplierRequests).mockResolvedValue([])

    const result = await RequestsPage()
    render(result as React.ReactElement)

    expect(screen.queryByRole('link', { name: /découvrir/i })).not.toBeInTheDocument()
  })

  it('renders page header with title "Demandes reçues"', async () => {
    vi.mocked(getSupplierRequests).mockResolvedValue([])

    const result = await RequestsPage()
    render(result as React.ReactElement)

    expect(screen.getByText('Demandes reçues')).toBeInTheDocument()
  })

  it('calls getSupplierRequests with supplier id', async () => {
    vi.mocked(getSupplierRequests).mockResolvedValue([])

    await RequestsPage()

    expect(getSupplierRequests).toHaveBeenCalledWith('supplier-1')
  })

  it('renders multiple requests', async () => {
    vi.mocked(getSupplierRequests).mockResolvedValue([
      createMockRequest({ id: 'req-1', store: { name: 'Magasin A', brand: 'LECLERC', city: 'Paris' } }),
      createMockRequest({ id: 'req-2', store: { name: 'Magasin B', brand: 'INTERMARCHE', city: 'Lyon' } }),
    ])

    const result = await RequestsPage()
    render(result as React.ReactElement)

    expect(screen.getByText('Magasin A')).toBeInTheDocument()
    expect(screen.getByText('Magasin B')).toBeInTheDocument()
  })

  it('renders type badges correctly', async () => {
    vi.mocked(getSupplierRequests).mockResolvedValue([
      createMockRequest({ type: 'ORDER' }),
    ])

    const result = await RequestsPage()
    render(result as React.ReactElement)

    expect(screen.getByText('Commande')).toBeInTheDocument()
  })

  it('renders status badges correctly', async () => {
    vi.mocked(getSupplierRequests).mockResolvedValue([
      createMockRequest({ status: 'TREATED' }),
    ])

    const result = await RequestsPage()
    render(result as React.ReactElement)

    expect(screen.getByText('Traité')).toBeInTheDocument()
  })
})
