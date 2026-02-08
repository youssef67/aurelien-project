import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StoreOfferList } from './store-offer-list'
import type { SerializedOfferWithSupplier } from '@/lib/utils/offers'

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

function createMockOffer(
  id: string,
  name: string,
  category = 'EPICERIE'
): SerializedOfferWithSupplier {
  return {
    id,
    supplierId: 'supplier-1',
    name,
    promoPrice: 5.99,
    discountPercent: 15,
    startDate: '2026-02-01T00:00:00.000Z',
    endDate: '2099-12-31T00:00:00.000Z',
    category,
    subcategory: null,
    photoUrl: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    supplier: { companyName: 'Test Supplier' },
  }
}

const mixedOffers = [
  createMockOffer('1', 'Pommes Golden', 'EPICERIE'),
  createMockOffer('2', 'Bananes Bio', 'EPICERIE'),
  createMockOffer('3', 'Yaourt Nature', 'FRAIS'),
  createMockOffer('4', 'Jus Orange', 'BOISSONS'),
]

describe('StoreOfferList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders the list of offers', () => {
    render(<StoreOfferList offers={mixedOffers} />)

    expect(screen.getByText('Pommes Golden')).toBeInTheDocument()
    expect(screen.getByText('Bananes Bio')).toBeInTheDocument()
    expect(screen.getByText('Yaourt Nature')).toBeInTheDocument()
    expect(screen.getByText('Jus Orange')).toBeInTheDocument()
  })

  it('renders the refresh button', () => {
    render(<StoreOfferList offers={[]} />)

    const refreshButton = screen.getByRole('button', { name: /actualiser/i })
    expect(refreshButton).toBeInTheDocument()
  })

  it('calls router.refresh when refresh button is clicked', () => {
    render(<StoreOfferList offers={[]} />)

    const refreshButton = screen.getByRole('button', { name: /actualiser/i })
    fireEvent.click(refreshButton)

    expect(mockRefresh).toHaveBeenCalled()
  })

  it('refresh button is not in loading state initially', () => {
    render(<StoreOfferList offers={[]} />)

    const refreshButton = screen.getByRole('button', { name: /actualiser/i })
    expect(refreshButton).not.toBeDisabled()
    const svg = refreshButton.querySelector('svg')
    expect(svg?.classList.contains('animate-spin')).toBe(false)
  })

  it('renders CategoryFilterChips', () => {
    render(<StoreOfferList offers={mixedOffers} />)

    const radiogroup = screen.getByRole('radiogroup', { name: /filtrer par catégorie/i })
    expect(radiogroup).toBeInTheDocument()
    expect(screen.getByText('Tout (4)')).toBeInTheDocument()
  })

  it('filters offers when a category chip is clicked', () => {
    render(<StoreOfferList offers={mixedOffers} />)

    fireEvent.click(screen.getByText('Frais (1)'))

    expect(screen.getByText('Yaourt Nature')).toBeInTheDocument()
    expect(screen.queryByText('Pommes Golden')).not.toBeInTheDocument()
    expect(screen.queryByText('Bananes Bio')).not.toBeInTheDocument()
    expect(screen.queryByText('Jus Orange')).not.toBeInTheDocument()
  })

  it('shows all offers when "Tout" chip is clicked after filtering', () => {
    render(<StoreOfferList offers={mixedOffers} />)

    // Filter first
    fireEvent.click(screen.getByText('Frais (1)'))
    expect(screen.queryByText('Pommes Golden')).not.toBeInTheDocument()

    // Reset
    fireEvent.click(screen.getByText('Tout (4)'))
    expect(screen.getByText('Pommes Golden')).toBeInTheDocument()
    expect(screen.getByText('Yaourt Nature')).toBeInTheDocument()
  })

  it('persists selected category to localStorage', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
    render(<StoreOfferList offers={mixedOffers} />)

    fireEvent.click(screen.getByText('Frais (1)'))

    expect(setItemSpy).toHaveBeenCalledWith('store-offers-category-filter', 'FRAIS')
    setItemSpy.mockRestore()
  })

  it('removes localStorage key when "Tout" is selected', () => {
    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem')
    render(<StoreOfferList offers={mixedOffers} />)

    // Select a category then reset
    fireEvent.click(screen.getByText('Frais (1)'))
    fireEvent.click(screen.getByText('Tout (4)'))

    expect(removeItemSpy).toHaveBeenCalledWith('store-offers-category-filter')
    removeItemSpy.mockRestore()
  })

  it('restores category filter from localStorage on mount', () => {
    localStorage.setItem('store-offers-category-filter', 'BOISSONS')

    render(<StoreOfferList offers={mixedOffers} />)

    // After useEffect runs, only BOISSONS offers should show
    expect(screen.getByText('Jus Orange')).toBeInTheDocument()
    expect(screen.queryByText('Pommes Golden')).not.toBeInTheDocument()
  })

  it('shows filtered empty state when no offers match selected category', () => {
    render(<StoreOfferList offers={mixedOffers} />)

    fireEvent.click(screen.getByText('Surgelés (0)'))

    expect(screen.getByText('Aucune offre dans cette catégorie')).toBeInTheDocument()
    expect(screen.getByText('Voir toutes les offres')).toBeInTheDocument()
  })

  it('resets filter when "Voir toutes les offres" button is clicked in empty state', () => {
    render(<StoreOfferList offers={mixedOffers} />)

    fireEvent.click(screen.getByText('Surgelés (0)'))
    expect(screen.getByText('Aucune offre dans cette catégorie')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Voir toutes les offres'))
    expect(screen.getByText('Pommes Golden')).toBeInTheDocument()
    expect(screen.queryByText('Aucune offre dans cette catégorie')).not.toBeInTheDocument()
  })

  it('ignores invalid category in localStorage and shows all offers', () => {
    localStorage.setItem('store-offers-category-filter', 'INVALID_CATEGORY')

    render(<StoreOfferList offers={mixedOffers} />)

    expect(screen.getByText('Pommes Golden')).toBeInTheDocument()
    expect(screen.getByText('Yaourt Nature')).toBeInTheDocument()
    expect(screen.getByText('Jus Orange')).toBeInTheDocument()
  })

  it('category counts reflect total offers (not filtered)', () => {
    render(<StoreOfferList offers={mixedOffers} />)

    // Filter by FRAIS
    fireEvent.click(screen.getByText('Frais (1)'))

    // Counts should still reflect total, not filtered
    expect(screen.getByText('Tout (4)')).toBeInTheDocument()
    expect(screen.getByText('Épicerie (2)')).toBeInTheDocument()
    expect(screen.getByText('Frais (1)')).toBeInTheDocument()
    expect(screen.getByText('Boissons (1)')).toBeInTheDocument()
  })
})
