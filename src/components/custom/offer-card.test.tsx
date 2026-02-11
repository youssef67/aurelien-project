import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OfferCard } from './offer-card'
import type { SerializedOffer } from '@/lib/utils/offers'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

function createSerializedOffer(overrides: Partial<SerializedOffer> = {}): SerializedOffer {
  return {
    id: 'offer-1',
    supplierId: 'supplier-1',
    name: 'Pommes Golden',
    promoPrice: 2.49,
    discountPercent: 25,
    startDate: '2026-02-15T00:00:00.000Z',
    endDate: '2099-02-28T00:00:00.000Z',
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
    ...overrides,
  }
}

describe('OfferCard', () => {
  it('renders the product name', () => {
    render(<OfferCard offer={createSerializedOffer()} />)

    expect(screen.getByText('Pommes Golden')).toBeInTheDocument()
  })

  it('renders the formatted price', () => {
    render(<OfferCard offer={createSerializedOffer({ promoPrice: 12.99 })} />)

    expect(screen.getByText(/12,99/)).toBeInTheDocument()
  })

  it('renders the formatted discount', () => {
    render(<OfferCard offer={createSerializedOffer({ discountPercent: 25 })} />)

    expect(screen.getByText('-25%')).toBeInTheDocument()
  })

  it('renders the date range', () => {
    render(<OfferCard offer={createSerializedOffer()} />)

    const dateText = screen.getByText(/fév/i)
    expect(dateText).toBeInTheDocument()
  })

  it('renders Active badge for active offer', () => {
    render(<OfferCard offer={createSerializedOffer()} />)

    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders Expirée badge and opacity for expired offer', () => {
    const offer = createSerializedOffer({
      endDate: '2020-01-01T00:00:00.000Z',
    })
    render(<OfferCard offer={offer} />)

    expect(screen.getByText('Expirée')).toBeInTheDocument()
    const article = screen.getByRole('article')
    expect(article).toHaveClass('opacity-50')
  })

  it('renders Brouillon badge for draft offer', () => {
    const offer = createSerializedOffer({ status: 'DRAFT' })
    render(<OfferCard offer={offer} />)

    expect(screen.getByText('Brouillon')).toBeInTheDocument()
  })

  it('renders Package placeholder when no photo', () => {
    render(<OfferCard offer={createSerializedOffer({ photoUrl: null })} />)

    // Package icon should be rendered (as svg)
    const article = screen.getByRole('article')
    expect(article.querySelector('svg')).toBeInTheDocument()
  })

  it('renders image when photoUrl exists', () => {
    render(<OfferCard offer={createSerializedOffer({ photoUrl: 'https://example.com/photo.jpg' })} />)

    const img = screen.getByAltText('Pommes Golden')
    expect(img).toBeInTheDocument()
    expect(img.getAttribute('src')).toContain('photo.jpg')
  })

  it('links to /my-offers/[id]', () => {
    render(<OfferCard offer={createSerializedOffer({ id: 'abc-123' })} />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/my-offers/abc-123')
  })

  it('has aria-labelledby on article', () => {
    render(<OfferCard offer={createSerializedOffer({ id: 'offer-1' })} />)

    const article = screen.getByRole('article')
    expect(article).toHaveAttribute('aria-labelledby', 'offer-offer-1-title')
  })

  it('does not apply opacity for active offers', () => {
    render(<OfferCard offer={createSerializedOffer()} />)

    const article = screen.getByRole('article')
    expect(article).not.toHaveClass('opacity-60')
  })
})
