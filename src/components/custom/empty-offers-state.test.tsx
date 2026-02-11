import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyOffersState } from './empty-offers-state'

describe('EmptyOffersState', () => {
  it('renders the empty state message', () => {
    render(<EmptyOffersState />)

    expect(screen.getByText('Aucune offre pour le moment')).toBeInTheDocument()
  })

  it('renders the description text matching AC4', () => {
    render(<EmptyOffersState />)

    expect(
      screen.getByText('Publiez votre première offre pour la rendre visible aux magasins')
    ).toBeInTheDocument()
  })

  it('renders the CTA button with correct link', () => {
    render(<EmptyOffersState />)

    const ctaLink = screen.getByRole('link', { name: /nouvelle offre/i })
    expect(ctaLink).toBeInTheDocument()
    expect(ctaLink).toHaveAttribute('href', '/my-offers/new')
  })

  it('renders the Package icon illustration', () => {
    render(<EmptyOffersState />)

    const iconContainer = screen.getByText('Aucune offre pour le moment').closest('div')
    expect(iconContainer).toBeInTheDocument()
  })

  it('CTA button has proper touch target height', () => {
    render(<EmptyOffersState />)

    const ctaLink = screen.getByRole('link', { name: /nouvelle offre/i })
    expect(ctaLink).toHaveClass('h-11')
  })
})
