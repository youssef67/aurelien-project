import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { OfferList } from './offer-list'
import type { SerializedOffer } from '@/lib/utils/offers'

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

function createSerializedOffer(id: string, name: string): SerializedOffer {
  return {
    id,
    supplierId: 'supplier-1',
    name,
    promoPrice: 5.99,
    discountPercent: 15,
    startDate: '2026-02-01T00:00:00.000Z',
    endDate: '2099-12-31T00:00:00.000Z',
    category: 'FRUITS_LEGUMES',
    subcategory: null,
    photoUrl: null,
    margin: null,
    volume: null,
    conditions: null,
    animation: null,
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    deletedAt: null,
  }
}

describe('OfferList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the list of offers', () => {
    const offers = [
      createSerializedOffer('1', 'Pommes Golden'),
      createSerializedOffer('2', 'Bananes Bio'),
    ]
    render(<OfferList offers={offers} />)

    expect(screen.getByText('Pommes Golden')).toBeInTheDocument()
    expect(screen.getByText('Bananes Bio')).toBeInTheDocument()
  })

  it('renders the refresh button', () => {
    render(<OfferList offers={[]} />)

    const refreshButton = screen.getByRole('button', { name: /actualiser/i })
    expect(refreshButton).toBeInTheDocument()
  })

  it('calls router.refresh when refresh button is clicked', () => {
    render(<OfferList offers={[]} />)

    const refreshButton = screen.getByRole('button', { name: /actualiser/i })
    fireEvent.click(refreshButton)

    expect(mockRefresh).toHaveBeenCalled()
  })
})
