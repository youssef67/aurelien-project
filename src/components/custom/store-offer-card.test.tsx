import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StoreOfferCard } from './store-offer-card'
import type { SerializedOfferWithSupplier } from '@/lib/utils/offers'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

function createMockOffer(overrides: Partial<SerializedOfferWithSupplier> = {}): SerializedOfferWithSupplier {
  return {
    id: 'offer-1',
    supplierId: 'supplier-1',
    name: 'Pommes Golden',
    promoPrice: 2.49,
    discountPercent: 25,
    startDate: '2026-02-15T00:00:00.000Z',
    endDate: '2099-02-28T00:00:00.000Z',
    category: 'EPICERIE',
    subcategory: null,
    photoUrl: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    supplier: { companyName: 'Fournisseur ABC' },
    ...overrides,
  }
}

describe('StoreOfferCard', () => {
  it('renders the product name', () => {
    render(<StoreOfferCard offer={createMockOffer()} />)

    expect(screen.getByText('Pommes Golden')).toBeInTheDocument()
  })

  it('renders the formatted price', () => {
    render(<StoreOfferCard offer={createMockOffer({ promoPrice: 12.99 })} />)

    expect(screen.getByText(/12,99/)).toBeInTheDocument()
  })

  it('renders the formatted discount', () => {
    render(<StoreOfferCard offer={createMockOffer({ discountPercent: 25 })} />)

    expect(screen.getByText('-25%')).toBeInTheDocument()
  })

  it('renders the supplier name', () => {
    render(<StoreOfferCard offer={createMockOffer()} />)

    expect(screen.getByText(/Fournisseur ABC/)).toBeInTheDocument()
  })

  it('renders the category label in French', () => {
    render(<StoreOfferCard offer={createMockOffer({ category: 'EPICERIE' })} />)

    expect(screen.getByText(/Épicerie/)).toBeInTheDocument()
  })

  it('renders the date range', () => {
    render(<StoreOfferCard offer={createMockOffer()} />)

    const dateText = screen.getByText(/fév/i)
    expect(dateText).toBeInTheDocument()
  })

  it('renders "Nouveau" badge for recent offer (< 48h)', () => {
    const recentDate = new Date()
    recentDate.setHours(recentDate.getHours() - 1)
    render(<StoreOfferCard offer={createMockOffer({ createdAt: recentDate.toISOString() })} />)

    expect(screen.getByText('Nouveau')).toBeInTheDocument()
  })

  it('does NOT render "Nouveau" badge for old offer (> 48h)', () => {
    const oldDate = new Date()
    oldDate.setDate(oldDate.getDate() - 5)
    render(<StoreOfferCard offer={createMockOffer({ createdAt: oldDate.toISOString() })} />)

    expect(screen.queryByText('Nouveau')).not.toBeInTheDocument()
  })

  it('renders Package placeholder when no photo', () => {
    render(<StoreOfferCard offer={createMockOffer({ photoUrl: null })} />)

    const article = screen.getByRole('article')
    expect(article.querySelector('svg')).toBeInTheDocument()
  })

  it('renders image when photoUrl exists', () => {
    render(<StoreOfferCard offer={createMockOffer({ photoUrl: 'https://example.com/photo.jpg' })} />)

    const img = screen.getByAltText('Pommes Golden')
    expect(img).toBeInTheDocument()
    expect(img.getAttribute('src')).toContain('photo.jpg')
  })

  it('links to /offers/[id]', () => {
    render(<StoreOfferCard offer={createMockOffer({ id: 'abc-123' })} />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/offers/abc-123')
  })

  it('has aria-labelledby on article', () => {
    render(<StoreOfferCard offer={createMockOffer({ id: 'offer-1' })} />)

    const article = screen.getByRole('article')
    expect(article).toHaveAttribute('aria-labelledby', 'offer-offer-1-title')
  })
})
