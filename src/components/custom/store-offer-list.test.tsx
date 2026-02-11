import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
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
  category = 'EPICERIE',
  overrides: Partial<SerializedOfferWithSupplier> = {}
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
    ...overrides,
  }
}

const mixedOffers = [
  createMockOffer('1', 'Pommes Golden', 'EPICERIE'),
  createMockOffer('2', 'Bananes Bio', 'EPICERIE'),
  createMockOffer('3', 'Yaourt Nature', 'FRAIS'),
  createMockOffer('4', 'Jus Orange', 'BOISSONS'),
]

const multiSupplierOffers = [
  createMockOffer('1', 'Pommes Golden', 'EPICERIE', {
    supplierId: 'sup-a',
    supplier: { companyName: 'Alpha Foods' },
    startDate: '2026-02-01T00:00:00.000Z',
    endDate: '2026-02-28T00:00:00.000Z',
  }),
  createMockOffer('2', 'Chocolat Noir', 'EPICERIE', {
    supplierId: 'sup-b',
    supplier: { companyName: 'Beta Sweets' },
    startDate: '2026-02-10T00:00:00.000Z',
    endDate: '2026-02-20T00:00:00.000Z',
  }),
  createMockOffer('3', 'Yaourt Frais', 'FRAIS', {
    supplierId: 'sup-a',
    supplier: { companyName: 'Alpha Foods' },
    startDate: '2026-03-01T00:00:00.000Z',
    endDate: '2026-03-31T00:00:00.000Z',
  }),
  createMockOffer('4', 'Jus Pomme', 'BOISSONS', {
    supplierId: 'sup-c',
    supplier: { companyName: 'Charlie Drinks' },
    startDate: '2026-02-01T00:00:00.000Z',
    endDate: '2026-12-31T00:00:00.000Z',
  }),
]

describe('StoreOfferList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  // ==========================================
  // Existing tests (preserved from story 3.2)
  // ==========================================

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

    fireEvent.click(screen.getByText('Frais (1)'))
    expect(screen.queryByText('Pommes Golden')).not.toBeInTheDocument()

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

    fireEvent.click(screen.getByText('Frais (1)'))
    fireEvent.click(screen.getByText('Tout (4)'))

    expect(removeItemSpy).toHaveBeenCalledWith('store-offers-category-filter')
    removeItemSpy.mockRestore()
  })

  it('restores category filter from localStorage on mount', () => {
    localStorage.setItem('store-offers-category-filter', 'BOISSONS')

    render(<StoreOfferList offers={mixedOffers} />)

    expect(screen.getByText('Jus Orange')).toBeInTheDocument()
    expect(screen.queryByText('Pommes Golden')).not.toBeInTheDocument()
  })

  it('ignores invalid category in localStorage and shows all offers', () => {
    localStorage.setItem('store-offers-category-filter', 'INVALID_CATEGORY')

    render(<StoreOfferList offers={mixedOffers} />)

    expect(screen.getByText('Pommes Golden')).toBeInTheDocument()
    expect(screen.getByText('Yaourt Nature')).toBeInTheDocument()
    expect(screen.getByText('Jus Orange')).toBeInTheDocument()
  })

  // ==========================================
  // Story 3.3 — Advanced filters tests
  // ==========================================

  describe('advanced filters button', () => {
    it('renders the advanced filters button', () => {
      render(<StoreOfferList offers={mixedOffers} />)
      const btn = screen.getByRole('button', { name: 'Filtres avancés' })
      expect(btn).toBeInTheDocument()
    })

    it('does not show badge when no advanced filters are active', () => {
      render(<StoreOfferList offers={mixedOffers} />)
      const btn = screen.getByRole('button', { name: 'Filtres avancés' })
      expect(btn.querySelector('span')).toBeNull()
    })

    it('shows badge "1" when date filter is active', () => {
      localStorage.setItem('store-offers-date-filter', 'this-week')

      render(<StoreOfferList offers={mixedOffers} />)
      const btn = screen.getByRole('button', { name: 'Filtres avancés' })
      const badge = btn.querySelector('span')
      expect(badge).not.toBeNull()
      expect(badge?.textContent).toBe('1')
    })

    it('shows badge "1" when supplier filter is active', () => {
      localStorage.setItem('store-offers-supplier-filter', JSON.stringify(['supplier-1']))

      render(<StoreOfferList offers={mixedOffers} />)
      const btn = screen.getByRole('button', { name: 'Filtres avancés' })
      const badge = btn.querySelector('span')
      expect(badge?.textContent).toBe('1')
    })

    it('shows badge "2" when both date and supplier filters are active', () => {
      localStorage.setItem('store-offers-date-filter', 'this-month')
      localStorage.setItem('store-offers-supplier-filter', JSON.stringify(['supplier-1']))

      render(<StoreOfferList offers={mixedOffers} />)
      const btn = screen.getByRole('button', { name: 'Filtres avancés' })
      const badge = btn.querySelector('span')
      expect(badge?.textContent).toBe('2')
    })

    it('shows badge "3" when date, supplier and brand filters are all active', () => {
      localStorage.setItem('store-offers-date-filter', 'this-month')
      localStorage.setItem('store-offers-supplier-filter', JSON.stringify(['supplier-1']))
      localStorage.setItem('store-offers-brand-filter', 'my-brand')

      render(<StoreOfferList offers={mixedOffers} storeBrand="LECLERC" />)
      const btn = screen.getByRole('button', { name: 'Filtres avancés' })
      const badge = btn.querySelector('span')
      expect(badge?.textContent).toBe('3')
    })
  })

  describe('date filtering', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    it('filters offers by this-week date range', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-02-15T12:00:00Z'))

      // Offer 1: Feb 10-20 (overlaps week Feb 9-15) → visible
      // Offer 2: Feb 20-28 (does NOT overlap week Feb 9-15) → hidden
      const offers = [
        createMockOffer('1', 'Offre Semaine', 'EPICERIE', {
          startDate: '2026-02-10T00:00:00.000Z',
          endDate: '2026-02-20T00:00:00.000Z',
        }),
        createMockOffer('2', 'Offre Future', 'EPICERIE', {
          startDate: '2026-02-20T00:00:00.000Z',
          endDate: '2026-02-28T00:00:00.000Z',
        }),
      ]

      localStorage.setItem('store-offers-date-filter', 'this-week')
      render(<StoreOfferList offers={offers} />)

      expect(screen.getByText('Offre Semaine')).toBeInTheDocument()
      expect(screen.queryByText('Offre Future')).not.toBeInTheDocument()
    })

    it('filters offers by this-month date range', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-02-15T12:00:00Z'))

      const offers = [
        createMockOffer('1', 'Offre Février', 'EPICERIE', {
          startDate: '2026-02-01T00:00:00.000Z',
          endDate: '2026-02-28T00:00:00.000Z',
        }),
        createMockOffer('2', 'Offre Mars', 'EPICERIE', {
          startDate: '2026-03-01T00:00:00.000Z',
          endDate: '2026-03-31T00:00:00.000Z',
        }),
      ]

      localStorage.setItem('store-offers-date-filter', 'this-month')
      render(<StoreOfferList offers={offers} />)

      expect(screen.getByText('Offre Février')).toBeInTheDocument()
      expect(screen.queryByText('Offre Mars')).not.toBeInTheDocument()
    })
  })

  describe('supplier filtering', () => {
    it('filters offers by supplier', () => {
      localStorage.setItem('store-offers-supplier-filter', JSON.stringify(['sup-a']))

      render(<StoreOfferList offers={multiSupplierOffers} />)

      expect(screen.getByText('Pommes Golden')).toBeInTheDocument()
      expect(screen.getByText('Yaourt Frais')).toBeInTheDocument()
      expect(screen.queryByText('Chocolat Noir')).not.toBeInTheDocument()
      expect(screen.queryByText('Jus Pomme')).not.toBeInTheDocument()
    })

    it('shows all offers when no supplier filter is set', () => {
      render(<StoreOfferList offers={multiSupplierOffers} />)

      expect(screen.getByText('Pommes Golden')).toBeInTheDocument()
      expect(screen.getByText('Chocolat Noir')).toBeInTheDocument()
      expect(screen.getByText('Yaourt Frais')).toBeInTheDocument()
      expect(screen.getByText('Jus Pomme')).toBeInTheDocument()
    })
  })

  describe('combined filtering (category + date + supplier)', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    it('combines category + supplier filters (AND)', () => {
      localStorage.setItem('store-offers-supplier-filter', JSON.stringify(['sup-a']))
      localStorage.setItem('store-offers-category-filter', 'EPICERIE')

      render(<StoreOfferList offers={multiSupplierOffers} />)

      // Only EPICERIE + sup-a → Pommes Golden only
      expect(screen.getByText('Pommes Golden')).toBeInTheDocument()
      expect(screen.queryByText('Yaourt Frais')).not.toBeInTheDocument() // FRAIS, not EPICERIE
      expect(screen.queryByText('Chocolat Noir')).not.toBeInTheDocument() // sup-b
      expect(screen.queryByText('Jus Pomme')).not.toBeInTheDocument() // sup-c
    })

    it('combines date + supplier + category filters (AND)', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-02-15T12:00:00Z'))

      localStorage.setItem('store-offers-date-filter', 'this-month')
      localStorage.setItem('store-offers-supplier-filter', JSON.stringify(['sup-a']))
      localStorage.setItem('store-offers-category-filter', 'EPICERIE')

      render(<StoreOfferList offers={multiSupplierOffers} />)

      // this-month (Feb) + sup-a + EPICERIE → Pommes Golden only
      // Yaourt Frais is sup-a but March, so excluded by date
      expect(screen.getByText('Pommes Golden')).toBeInTheDocument()
      expect(screen.queryByText('Yaourt Frais')).not.toBeInTheDocument()
    })
  })

  describe('categoryCounts after advanced filtering', () => {
    it('recalculates category counts after supplier filter', () => {
      localStorage.setItem('store-offers-supplier-filter', JSON.stringify(['sup-a']))

      render(<StoreOfferList offers={multiSupplierOffers} />)

      // sup-a has: Pommes Golden (EPICERIE) + Yaourt Frais (FRAIS) = 2 total
      expect(screen.getByText('Tout (2)')).toBeInTheDocument()
      expect(screen.getByText('Épicerie (1)')).toBeInTheDocument()
      expect(screen.getByText('Frais (1)')).toBeInTheDocument()
    })
  })

  describe('localStorage persistence of advanced filters', () => {
    it('restores date filter from localStorage on mount', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-02-15T12:00:00Z'))

      const offers = [
        createMockOffer('1', 'Offre Février', 'EPICERIE', {
          startDate: '2026-02-01T00:00:00.000Z',
          endDate: '2026-02-28T00:00:00.000Z',
        }),
        createMockOffer('2', 'Offre Mars', 'EPICERIE', {
          startDate: '2026-03-01T00:00:00.000Z',
          endDate: '2026-03-31T00:00:00.000Z',
        }),
      ]

      localStorage.setItem('store-offers-date-filter', 'this-month')
      render(<StoreOfferList offers={offers} />)

      expect(screen.getByText('Offre Février')).toBeInTheDocument()
      expect(screen.queryByText('Offre Mars')).not.toBeInTheDocument()

      vi.useRealTimers()
    })

    it('restores supplier filter from localStorage on mount', () => {
      localStorage.setItem('store-offers-supplier-filter', JSON.stringify(['sup-a']))

      render(<StoreOfferList offers={multiSupplierOffers} />)

      expect(screen.getByText('Pommes Golden')).toBeInTheDocument()
      expect(screen.queryByText('Chocolat Noir')).not.toBeInTheDocument()
    })

    it('restores brand filter from localStorage on mount', () => {
      localStorage.setItem('store-offers-brand-filter', 'my-brand')

      render(<StoreOfferList offers={mixedOffers} storeBrand="LECLERC" />)

      // MVP: brand filter is no-op, all offers still visible
      expect(screen.getByText('Pommes Golden')).toBeInTheDocument()
      expect(screen.getByText('Bananes Bio')).toBeInTheDocument()
      expect(screen.getByText('Yaourt Nature')).toBeInTheDocument()
      expect(screen.getByText('Jus Orange')).toBeInTheDocument()

      // But badge should show 1 for brand filter
      const btn = screen.getByRole('button', { name: 'Filtres avancés' })
      const badge = btn.querySelector('span')
      expect(badge?.textContent).toBe('1')
    })
  })

  // ==========================================
  // Story 3.4 — Brand filter tests
  // ==========================================

  describe('brand filter', () => {
    it('brand filter MVP does not hide any offers (all pass)', () => {
      localStorage.setItem('store-offers-brand-filter', 'my-brand')

      render(<StoreOfferList offers={mixedOffers} storeBrand="LECLERC" />)

      // All 4 offers should be visible — MVP no-op
      expect(screen.getByText('Pommes Golden')).toBeInTheDocument()
      expect(screen.getByText('Bananes Bio')).toBeInTheDocument()
      expect(screen.getByText('Yaourt Nature')).toBeInTheDocument()
      expect(screen.getByText('Jus Orange')).toBeInTheDocument()
    })

    it('shows badge "1" when only brand filter is active', () => {
      localStorage.setItem('store-offers-brand-filter', 'my-brand')

      render(<StoreOfferList offers={mixedOffers} storeBrand="LECLERC" />)
      const btn = screen.getByRole('button', { name: 'Filtres avancés' })
      const badge = btn.querySelector('span')
      expect(badge?.textContent).toBe('1')
    })

    it('works without storeBrand prop (optional)', () => {
      render(<StoreOfferList offers={mixedOffers} />)

      // Should render fine without storeBrand
      expect(screen.getByText('Pommes Golden')).toBeInTheDocument()
    })

    it('saves brand filter to localStorage when applying from Sheet', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
      render(<StoreOfferList offers={mixedOffers} storeBrand="LECLERC" />)

      // Open the filter sheet
      fireEvent.click(screen.getByRole('button', { name: 'Filtres avancés' }))

      // Select "Mon enseigne uniquement (Leclerc)"
      fireEvent.click(screen.getByRole('radio', { name: 'Mon enseigne uniquement (Leclerc)' }))

      // Click "Appliquer"
      fireEvent.click(screen.getByText('Appliquer'))

      expect(setItemSpy).toHaveBeenCalledWith('store-offers-brand-filter', 'my-brand')
      setItemSpy.mockRestore()
    })
  })

  describe('empty state with advanced filters', () => {
    it('shows advanced filter empty state message', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-02-15T12:00:00Z'))

      const offers = [
        createMockOffer('1', 'Offre Mars', 'EPICERIE', {
          startDate: '2026-03-01T00:00:00.000Z',
          endDate: '2026-03-31T00:00:00.000Z',
        }),
      ]

      // this-week in Feb → no March offers match
      localStorage.setItem('store-offers-date-filter', 'this-week')
      render(<StoreOfferList offers={offers} />)

      expect(screen.getByText('Aucune offre ne correspond à vos filtres')).toBeInTheDocument()
      expect(screen.getByText('Réinitialiser les filtres')).toBeInTheDocument()

      vi.useRealTimers()
    })

    it('shows category empty state when only category filter active', () => {
      render(<StoreOfferList offers={mixedOffers} />)

      fireEvent.click(screen.getByText('Surgelés (0)'))

      expect(screen.getByText('Aucune offre dans cette catégorie')).toBeInTheDocument()
      expect(screen.getByText('Voir toutes les offres')).toBeInTheDocument()
    })

    it('"Réinitialiser les filtres" resets all filters including brand', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-02-15T12:00:00Z'))

      const offers = [
        createMockOffer('1', 'Offre Mars', 'EPICERIE', {
          startDate: '2026-03-01T00:00:00.000Z',
          endDate: '2026-03-31T00:00:00.000Z',
        }),
      ]

      localStorage.setItem('store-offers-date-filter', 'this-week')
      localStorage.setItem('store-offers-category-filter', 'EPICERIE')
      localStorage.setItem('store-offers-brand-filter', 'my-brand')
      render(<StoreOfferList offers={offers} storeBrand="LECLERC" />)

      expect(screen.getByText('Aucune offre ne correspond à vos filtres')).toBeInTheDocument()

      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem')
      fireEvent.click(screen.getByText('Réinitialiser les filtres'))

      // After reset, all filters removed → all offers visible
      expect(screen.getByText('Offre Mars')).toBeInTheDocument()
      expect(removeItemSpy).toHaveBeenCalledWith('store-offers-brand-filter')
      removeItemSpy.mockRestore()

      vi.useRealTimers()
    })
  })

  it('resets filter when "Voir toutes les offres" button is clicked in empty state', () => {
    render(<StoreOfferList offers={mixedOffers} />)

    fireEvent.click(screen.getByText('Surgelés (0)'))
    expect(screen.getByText('Aucune offre dans cette catégorie')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Voir toutes les offres'))
    expect(screen.getByText('Pommes Golden')).toBeInTheDocument()
    expect(screen.queryByText('Aucune offre dans cette catégorie')).not.toBeInTheDocument()
  })
})
