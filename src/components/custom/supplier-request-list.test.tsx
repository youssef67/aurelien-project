import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SupplierRequestList } from './supplier-request-list'
import type { SerializedSupplierRequest } from '@/lib/utils/requests'

const mockRefresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
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

function createMockRequest(overrides: Partial<SerializedSupplierRequest> = {}): SerializedSupplierRequest {
  return {
    id: 'req-1',
    type: 'INFO',
    status: 'PENDING',
    message: 'Test message',
    createdAt: '2026-02-10T12:00:00Z',
    store: { name: 'Mon Magasin', brand: 'LECLERC', city: 'Strasbourg' },
    offer: { id: 'offer-1', name: 'Nutella 1kg' },
    ...overrides,
  }
}

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string): string | null => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    get length() { return Object.keys(store).length },
    key: vi.fn((index: number): string | null => Object.keys(store)[index] ?? null),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('SupplierRequestList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
  })

  // === Existing tests ===

  it('renders all request cards', () => {
    const requests = [
      createMockRequest({ id: 'req-1', store: { name: 'Magasin A', brand: 'LECLERC', city: 'Paris' } }),
      createMockRequest({ id: 'req-2', store: { name: 'Magasin B', brand: 'INTERMARCHE', city: 'Lyon' } }),
    ]
    render(<SupplierRequestList requests={requests} />)

    expect(screen.getByText('Magasin A')).toBeInTheDocument()
    expect(screen.getByText('Magasin B')).toBeInTheDocument()
  })

  it('renders refresh button with text', () => {
    render(<SupplierRequestList requests={[createMockRequest()]} />)
    expect(screen.getByRole('button', { name: /actualiser/i })).toBeInTheDocument()
    expect(screen.getByText('Actualiser')).toBeInTheDocument()
  })

  it('refresh button has aria-label', () => {
    render(<SupplierRequestList requests={[createMockRequest()]} />)
    expect(screen.getByLabelText('Actualiser la liste')).toBeInTheDocument()
  })

  it('calls router.refresh when refresh button is clicked', () => {
    render(<SupplierRequestList requests={[createMockRequest()]} />)
    const button = screen.getByRole('button', { name: /actualiser/i })
    fireEvent.click(button)
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('renders request cards with links to detail', () => {
    render(<SupplierRequestList requests={[createMockRequest()]} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/requests/req-1')
  })

  it('renders correct number of cards for multiple requests', () => {
    const requests = [
      createMockRequest({ id: 'req-1' }),
      createMockRequest({ id: 'req-2' }),
      createMockRequest({ id: 'req-3' }),
    ]
    const { container } = render(<SupplierRequestList requests={requests} />)
    const cards = container.querySelectorAll('article')
    expect(cards).toHaveLength(3)
  })

  // === Filter chips rendering ===

  it('renders type filter chips', () => {
    const requests = [
      createMockRequest({ id: 'req-1', type: 'INFO' }),
      createMockRequest({ id: 'req-2', type: 'ORDER' }),
    ]
    render(<SupplierRequestList requests={requests} />)
    expect(screen.getByRole('radiogroup', { name: 'Filtrer par type' })).toBeInTheDocument()
    expect(screen.getByText('Renseignements (1)')).toBeInTheDocument()
    expect(screen.getByText('Commandes (1)')).toBeInTheDocument()
  })

  it('renders status filter chips', () => {
    const requests = [
      createMockRequest({ id: 'req-1', status: 'PENDING' }),
      createMockRequest({ id: 'req-2', status: 'TREATED' }),
    ]
    render(<SupplierRequestList requests={requests} />)
    expect(screen.getByRole('radiogroup', { name: 'Filtrer par statut' })).toBeInTheDocument()
    expect(screen.getByText('Nouveaux (1)')).toBeInTheDocument()
    expect(screen.getByText('Traités (1)')).toBeInTheDocument()
  })

  // === Filtering by type ===

  it('filters by type when type chip is clicked', () => {
    const requests = [
      createMockRequest({ id: 'req-1', type: 'INFO', store: { name: 'Magasin Info', brand: 'LECLERC', city: 'Paris' } }),
      createMockRequest({ id: 'req-2', type: 'ORDER', store: { name: 'Magasin Order', brand: 'LECLERC', city: 'Lyon' } }),
    ]
    render(<SupplierRequestList requests={requests} />)
    fireEvent.click(screen.getByText('Commandes (1)'))
    expect(screen.queryByText('Magasin Info')).not.toBeInTheDocument()
    expect(screen.getByText('Magasin Order')).toBeInTheDocument()
  })

  it('stores type filter in localStorage', () => {
    render(<SupplierRequestList requests={[createMockRequest()]} />)
    fireEvent.click(screen.getByText('Renseignements (1)'))
    expect(localStorageMock.setItem).toHaveBeenCalledWith('supplier-requests-type-filter', 'INFO')
  })

  // === Filtering by status ===

  it('filters by status when status chip is clicked', () => {
    const requests = [
      createMockRequest({ id: 'req-1', status: 'PENDING', store: { name: 'Magasin Pending', brand: 'LECLERC', city: 'Paris' } }),
      createMockRequest({ id: 'req-2', status: 'TREATED', store: { name: 'Magasin Treated', brand: 'LECLERC', city: 'Lyon' } }),
    ]
    render(<SupplierRequestList requests={requests} />)
    fireEvent.click(screen.getByText('Nouveaux (1)'))
    expect(screen.getByText('Magasin Pending')).toBeInTheDocument()
    expect(screen.queryByText('Magasin Treated')).not.toBeInTheDocument()
  })

  it('stores status filter in localStorage', () => {
    render(<SupplierRequestList requests={[createMockRequest()]} />)
    fireEvent.click(screen.getByText('Nouveaux (1)'))
    expect(localStorageMock.setItem).toHaveBeenCalledWith('supplier-requests-status-filter', 'PENDING')
  })

  // === Combined filtering ===

  it('filters by both type and status (AND logic)', () => {
    const requests = [
      createMockRequest({ id: 'req-1', type: 'INFO', status: 'PENDING', store: { name: 'Info Pending', brand: 'LECLERC', city: 'Paris' } }),
      createMockRequest({ id: 'req-2', type: 'ORDER', status: 'PENDING', store: { name: 'Order Pending', brand: 'LECLERC', city: 'Lyon' } }),
      createMockRequest({ id: 'req-3', type: 'INFO', status: 'TREATED', store: { name: 'Info Treated', brand: 'LECLERC', city: 'Nice' } }),
      createMockRequest({ id: 'req-4', type: 'ORDER', status: 'TREATED', store: { name: 'Order Treated', brand: 'LECLERC', city: 'Bordeaux' } }),
    ]
    render(<SupplierRequestList requests={requests} />)

    // Select type = ORDER
    fireEvent.click(screen.getByText('Commandes (2)'))
    // Select status = PENDING
    fireEvent.click(screen.getByText('Nouveaux (1)'))

    expect(screen.getByText('Order Pending')).toBeInTheDocument()
    expect(screen.queryByText('Info Pending')).not.toBeInTheDocument()
    expect(screen.queryByText('Info Treated')).not.toBeInTheDocument()
    expect(screen.queryByText('Order Treated')).not.toBeInTheDocument()
  })

  // === Reset filtering ===

  it('resets type filter when "Tous" type chip is clicked', () => {
    const requests = [
      createMockRequest({ id: 'req-1', type: 'INFO', store: { name: 'Magasin Info', brand: 'LECLERC', city: 'Paris' } }),
      createMockRequest({ id: 'req-2', type: 'ORDER', store: { name: 'Magasin Order', brand: 'LECLERC', city: 'Lyon' } }),
    ]
    render(<SupplierRequestList requests={requests} />)

    // Filter to INFO only
    fireEvent.click(screen.getByText('Renseignements (1)'))
    expect(screen.queryByText('Magasin Order')).not.toBeInTheDocument()

    // Click "Tous" in type group to reset
    fireEvent.click(screen.getAllByText(/^Tous/)[0])
    expect(screen.getByText('Magasin Info')).toBeInTheDocument()
    expect(screen.getByText('Magasin Order')).toBeInTheDocument()
  })

  it('removes type filter from localStorage when "Tous" is clicked', () => {
    render(<SupplierRequestList requests={[createMockRequest()]} />)
    fireEvent.click(screen.getByText('Renseignements (1)'))
    fireEvent.click(screen.getAllByText(/^Tous/)[0])
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('supplier-requests-type-filter')
  })

  // === Empty state ===

  it('shows filtered empty state with type-specific message', () => {
    const requests = [
      createMockRequest({ id: 'req-1', type: 'ORDER', store: { name: 'Magasin Order', brand: 'LECLERC', city: 'Paris' } }),
    ]
    render(<SupplierRequestList requests={requests} />)
    fireEvent.click(screen.getByText('Renseignements (0)'))
    expect(screen.getByText('Aucune demande de renseignements')).toBeInTheDocument()
  })

  it('shows filtered empty state with status-specific message', () => {
    const requests = [
      createMockRequest({ id: 'req-1', status: 'TREATED', store: { name: 'Magasin Treated', brand: 'LECLERC', city: 'Paris' } }),
    ]
    render(<SupplierRequestList requests={requests} />)
    fireEvent.click(screen.getByText('Nouveaux (0)'))
    expect(screen.getByText('Aucune nouvelle demande')).toBeInTheDocument()
  })

  it('shows filtered empty state with ORDER type message', () => {
    const requests = [
      createMockRequest({ id: 'req-1', type: 'INFO', store: { name: 'Magasin Info', brand: 'LECLERC', city: 'Paris' } }),
    ]
    render(<SupplierRequestList requests={requests} />)
    fireEvent.click(screen.getByText('Commandes (0)'))
    expect(screen.getByText('Aucune intention de commande')).toBeInTheDocument()
  })

  it('shows filtered empty state with TREATED status message', () => {
    const requests = [
      createMockRequest({ id: 'req-1', status: 'PENDING', store: { name: 'Magasin Pending', brand: 'LECLERC', city: 'Paris' } }),
    ]
    render(<SupplierRequestList requests={requests} />)
    fireEvent.click(screen.getByText('Traités (0)'))
    expect(screen.getByText('Aucune demande traitée')).toBeInTheDocument()
  })

  it('shows combined empty state message when both filters active', () => {
    const requests = [
      createMockRequest({ id: 'req-1', type: 'INFO', status: 'PENDING', store: { name: 'Magasin A', brand: 'LECLERC', city: 'Paris' } }),
    ]
    render(<SupplierRequestList requests={requests} />)
    fireEvent.click(screen.getByText('Commandes (0)'))
    fireEvent.click(screen.getByText('Nouveaux (0)'))
    expect(screen.getByText('Aucune demande correspondant aux filtres')).toBeInTheDocument()
  })

  it('shows reset filters button in empty state', () => {
    const requests = [
      createMockRequest({ id: 'req-1', type: 'ORDER' }),
    ]
    render(<SupplierRequestList requests={requests} />)
    fireEvent.click(screen.getByText('Renseignements (0)'))
    expect(screen.getByText('Réinitialiser les filtres')).toBeInTheDocument()
  })

  it('resets all filters when reset button is clicked', () => {
    const requests = [
      createMockRequest({ id: 'req-1', type: 'ORDER', store: { name: 'Magasin Order', brand: 'LECLERC', city: 'Paris' } }),
    ]
    render(<SupplierRequestList requests={requests} />)
    fireEvent.click(screen.getByText('Renseignements (0)'))
    fireEvent.click(screen.getByText('Réinitialiser les filtres'))
    expect(screen.getByText('Magasin Order')).toBeInTheDocument()
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('supplier-requests-type-filter')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('supplier-requests-status-filter')
  })

  // === Combined reset ===

  it('resets all filters when both type and status are active', () => {
    const requests = [
      createMockRequest({ id: 'req-1', type: 'INFO', status: 'PENDING', store: { name: 'Store A', brand: 'LECLERC', city: 'Paris' } }),
      createMockRequest({ id: 'req-2', type: 'ORDER', status: 'TREATED', store: { name: 'Store B', brand: 'LECLERC', city: 'Lyon' } }),
    ]
    render(<SupplierRequestList requests={requests} />)

    // Activate both filters — only ORDER + PENDING (no match)
    fireEvent.click(screen.getByText('Commandes (1)'))
    fireEvent.click(screen.getByText('Nouveaux (0)'))

    // Should show empty state
    expect(screen.getByText('Aucune demande correspondant aux filtres')).toBeInTheDocument()

    // Reset all
    fireEvent.click(screen.getByText('Réinitialiser les filtres'))

    // Both stores should be visible
    expect(screen.getByText('Store A')).toBeInTheDocument()
    expect(screen.getByText('Store B')).toBeInTheDocument()
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('supplier-requests-type-filter')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('supplier-requests-status-filter')
  })

  // === Counters ===

  it('displays correct type counts', () => {
    const requests = [
      createMockRequest({ id: 'req-1', type: 'INFO' }),
      createMockRequest({ id: 'req-2', type: 'INFO' }),
      createMockRequest({ id: 'req-3', type: 'ORDER' }),
    ]
    render(<SupplierRequestList requests={requests} />)
    expect(screen.getByText('Renseignements (2)')).toBeInTheDocument()
    expect(screen.getByText('Commandes (1)')).toBeInTheDocument()
  })

  it('displays cross-counts: status counts reflect type filter', () => {
    const requests = [
      createMockRequest({ id: 'req-1', type: 'INFO', status: 'PENDING' }),
      createMockRequest({ id: 'req-2', type: 'INFO', status: 'TREATED' }),
      createMockRequest({ id: 'req-3', type: 'ORDER', status: 'PENDING' }),
    ]
    render(<SupplierRequestList requests={requests} />)

    // Filter to INFO only
    fireEvent.click(screen.getByText('Renseignements (2)'))

    // Status counts should reflect INFO-only requests: PENDING(1), TREATED(1)
    expect(screen.getByText('Nouveaux (1)')).toBeInTheDocument()
    expect(screen.getByText('Traités (1)')).toBeInTheDocument()
  })

  it('displays cross-counts: type counts reflect status filter', () => {
    const requests = [
      createMockRequest({ id: 'req-1', type: 'INFO', status: 'PENDING' }),
      createMockRequest({ id: 'req-2', type: 'INFO', status: 'TREATED' }),
      createMockRequest({ id: 'req-3', type: 'ORDER', status: 'PENDING' }),
    ]
    render(<SupplierRequestList requests={requests} />)

    // Filter to PENDING only
    fireEvent.click(screen.getByText('Nouveaux (2)'))

    // Type counts should reflect PENDING-only requests: INFO(1), ORDER(1)
    expect(screen.getByText('Renseignements (1)')).toBeInTheDocument()
    expect(screen.getByText('Commandes (1)')).toBeInTheDocument()
  })

  // === localStorage persistence ===

  it('restores type filter from localStorage on mount', () => {
    localStorageMock.getItem.mockImplementation((key: string): string | null => {
      if (key === 'supplier-requests-type-filter') return 'ORDER'
      return null
    })

    const requests = [
      createMockRequest({ id: 'req-1', type: 'INFO', store: { name: 'Magasin Info', brand: 'LECLERC', city: 'Paris' } }),
      createMockRequest({ id: 'req-2', type: 'ORDER', store: { name: 'Magasin Order', brand: 'LECLERC', city: 'Lyon' } }),
    ]
    render(<SupplierRequestList requests={requests} />)

    expect(screen.queryByText('Magasin Info')).not.toBeInTheDocument()
    expect(screen.getByText('Magasin Order')).toBeInTheDocument()
  })

  it('restores status filter from localStorage on mount', () => {
    localStorageMock.getItem.mockImplementation((key: string): string | null => {
      if (key === 'supplier-requests-status-filter') return 'TREATED'
      return null
    })

    const requests = [
      createMockRequest({ id: 'req-1', status: 'PENDING', store: { name: 'Magasin Pending', brand: 'LECLERC', city: 'Paris' } }),
      createMockRequest({ id: 'req-2', status: 'TREATED', store: { name: 'Magasin Treated', brand: 'LECLERC', city: 'Lyon' } }),
    ]
    render(<SupplierRequestList requests={requests} />)

    expect(screen.queryByText('Magasin Pending')).not.toBeInTheDocument()
    expect(screen.getByText('Magasin Treated')).toBeInTheDocument()
  })

  it('ignores invalid localStorage value for type filter', () => {
    localStorageMock.getItem.mockImplementation((key: string): string | null => {
      if (key === 'supplier-requests-type-filter') return 'INVALID'
      return null
    })

    const requests = [
      createMockRequest({ id: 'req-1', type: 'INFO', store: { name: 'Magasin Info', brand: 'LECLERC', city: 'Paris' } }),
      createMockRequest({ id: 'req-2', type: 'ORDER', store: { name: 'Magasin Order', brand: 'LECLERC', city: 'Lyon' } }),
    ]
    render(<SupplierRequestList requests={requests} />)

    // Both should be visible since invalid value is ignored
    expect(screen.getByText('Magasin Info')).toBeInTheDocument()
    expect(screen.getByText('Magasin Order')).toBeInTheDocument()
  })

  // === No empty state when no filters active ===

  it('does not show filtered empty state when no requests and no filters active', () => {
    render(<SupplierRequestList requests={[]} />)
    expect(screen.queryByText('Réinitialiser les filtres')).not.toBeInTheDocument()
  })
})
