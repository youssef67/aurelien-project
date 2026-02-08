import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import LandingHero from './landing-hero'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

describe('LandingHero', () => {
  describe('AC1: Affichage de la landing page', () => {
    it('renders the landing page with main heading', () => {
      render(<LandingHero />)
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })

    it('uses design system components (responsive layout)', () => {
      render(<LandingHero />)
      const container = screen.getByTestId('landing-hero')
      expect(container).toHaveClass('flex', 'flex-col')
    })
  })

  describe('AC2: Présentation de la proposition de valeur', () => {
    it('displays a catchy title explaining the application', () => {
      render(<LandingHero />)
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveTextContent(/fournisseurs|magasins/i)
    })

    it('displays value proposition for suppliers', () => {
      render(<LandingHero />)
      expect(screen.getByText(/fournisseurs/i, { selector: 'h2' })).toBeInTheDocument()
      expect(screen.getByText(/publiez vos offres/i)).toBeInTheDocument()
    })

    it('displays value proposition for stores', () => {
      render(<LandingHero />)
      expect(screen.getByText(/magasins/i, { selector: 'h2' })).toBeInTheDocument()
      expect(screen.getByText(/commandez en quelques clics/i)).toBeInTheDocument()
    })
  })

  describe('AC3: Call-to-actions clairs', () => {
    it('renders "Créer un compte" button linking to /register', () => {
      render(<LandingHero />)
      const registerButton = screen.getByRole('link', { name: /créer un compte/i })
      expect(registerButton).toBeInTheDocument()
      expect(registerButton).toHaveAttribute('href', '/register')
    })

    it('renders "Déjà inscrit ? Se connecter" link to /login', () => {
      render(<LandingHero />)
      const loginLink = screen.getByRole('link', { name: /se connecter/i })
      expect(loginLink).toBeInTheDocument()
      expect(loginLink).toHaveAttribute('href', '/login')
    })

    it('CTA button has minimum 44x44px touch target', () => {
      render(<LandingHero />)
      const registerButton = screen.getByRole('link', { name: /créer un compte/i })
      expect(registerButton).toHaveClass('min-h-[44px]')
      expect(registerButton).toHaveClass('min-w-[200px]')
    })

    it('login link has minimum 44x44px touch target', () => {
      render(<LandingHero />)
      const loginLink = screen.getByRole('link', { name: /se connecter/i })
      expect(loginLink).toHaveClass('min-h-[44px]')
      expect(loginLink).toHaveClass('min-w-[44px]')
    })
  })

  describe('AC5: Responsive design', () => {
    it('has responsive grid classes for value propositions', () => {
      render(<LandingHero />)
      const valuePropsContainer = screen.getByTestId('value-props')
      expect(valuePropsContainer).toHaveClass('md:grid-cols-2')
    })

    it('content is centered and stacks vertically on mobile', () => {
      render(<LandingHero />)
      const container = screen.getByTestId('landing-hero')
      expect(container).toHaveClass('flex', 'flex-col')
    })
  })

  describe('AC6: SEO et accessibilité', () => {
    it('has a unique h1 heading', () => {
      render(<LandingHero />)
      const headings = screen.getAllByRole('heading', { level: 1 })
      expect(headings).toHaveLength(1)
    })

    it('links have explicit labels', () => {
      render(<LandingHero />)
      const links = screen.getAllByRole('link')
      links.forEach(link => {
        expect(link).toHaveAccessibleName()
      })
    })

    it('icons have aria-hidden for accessibility', () => {
      render(<LandingHero />)
      const svgs = document.querySelectorAll('svg')
      svgs.forEach(svg => {
        expect(svg).toHaveAttribute('aria-hidden', 'true')
      })
    })
  })
})
