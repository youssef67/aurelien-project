import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StoreRequestList } from './store-request-list'
import type { SerializedStoreRequest } from '@/lib/utils/requests'

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

function createMockRequest(overrides: Partial<SerializedStoreRequest> = {}): SerializedStoreRequest {
  return {
    id: 'req-1',
    type: 'INFO',
    status: 'PENDING',
    message: 'Test message',
    createdAt: '2026-02-10T12:00:00Z',
    offer: { id: 'offer-1', name: 'Pommes Golden', promoPrice: 2.49 },
    supplier: { companyName: 'FruitCo' },
    ...overrides,
  }
}

describe('StoreRequestList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all request cards', () => {
    const requests = [
      createMockRequest({ id: 'req-1', offer: { id: 'o1', name: 'Pommes', promoPrice: 2.49 } }),
      createMockRequest({ id: 'req-2', offer: { id: 'o2', name: 'Bananes', promoPrice: 1.99 } }),
    ]
    render(<StoreRequestList requests={requests} />)

    expect(screen.getByText('Pommes')).toBeInTheDocument()
    expect(screen.getByText('Bananes')).toBeInTheDocument()
  })

  it('renders refresh button with text', () => {
    render(<StoreRequestList requests={[createMockRequest()]} />)
    expect(screen.getByRole('button', { name: /actualiser/i })).toBeInTheDocument()
    expect(screen.getByText('Actualiser')).toBeInTheDocument()
  })

  it('refresh button has aria-label', () => {
    render(<StoreRequestList requests={[createMockRequest()]} />)
    expect(screen.getByLabelText('Actualiser la liste')).toBeInTheDocument()
  })

  it('calls router.refresh when refresh button is clicked', () => {
    render(<StoreRequestList requests={[createMockRequest()]} />)
    const button = screen.getByRole('button', { name: /actualiser/i })
    fireEvent.click(button)
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('renders request cards with links to detail', () => {
    render(<StoreRequestList requests={[createMockRequest()]} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/my-requests/req-1')
  })

  it('renders no cards when requests array is empty', () => {
    const { container } = render(<StoreRequestList requests={[]} />)
    const cards = container.querySelectorAll('article')
    expect(cards).toHaveLength(0)
  })

  it('renders correct number of cards for multiple requests', () => {
    const requests = [
      createMockRequest({ id: 'req-1' }),
      createMockRequest({ id: 'req-2' }),
      createMockRequest({ id: 'req-3' }),
    ]
    const { container } = render(<StoreRequestList requests={requests} />)
    const cards = container.querySelectorAll('article')
    expect(cards).toHaveLength(3)
  })
})
