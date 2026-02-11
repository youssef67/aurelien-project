import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyRequestsState } from './empty-requests-state'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

describe('EmptyRequestsState', () => {
  it('renders the empty state message', () => {
    render(<EmptyRequestsState />)
    expect(screen.getByText("Vous n'avez pas encore envoyé de demande")).toBeInTheDocument()
  })

  it('renders the description text', () => {
    render(<EmptyRequestsState />)
    expect(
      screen.getByText('Consultez les offres disponibles pour envoyer vos premières demandes')
    ).toBeInTheDocument()
  })

  it('renders the CTA button with correct link to /offers', () => {
    render(<EmptyRequestsState />)
    const ctaLink = screen.getByRole('link', { name: /découvrir les offres/i })
    expect(ctaLink).toBeInTheDocument()
    expect(ctaLink).toHaveAttribute('href', '/offers')
  })

  it('CTA button has proper touch target height', () => {
    render(<EmptyRequestsState />)
    const ctaLink = screen.getByRole('link', { name: /découvrir les offres/i })
    expect(ctaLink).toHaveClass('h-11')
  })

  it('heading uses font-display class', () => {
    render(<EmptyRequestsState />)
    const heading = screen.getByText("Vous n'avez pas encore envoyé de demande")
    expect(heading).toHaveClass('font-display')
  })
})
