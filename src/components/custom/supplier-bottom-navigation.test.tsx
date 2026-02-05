import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SupplierBottomNavigation } from './supplier-bottom-navigation'

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}))

describe('SupplierBottomNavigation', () => {
  it('renders all navigation items', () => {
    render(<SupplierBottomNavigation />)

    expect(screen.getByRole('link', { name: /offres/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /demandes/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /profil/i })).toBeInTheDocument()
  })

  it('has correct href for each link', () => {
    render(<SupplierBottomNavigation />)

    expect(screen.getByRole('link', { name: /offres/i })).toHaveAttribute('href', '/dashboard')
    expect(screen.getByRole('link', { name: /demandes/i })).toHaveAttribute('href', '/requests')
    expect(screen.getByRole('link', { name: /profil/i })).toHaveAttribute('href', '/profile')
  })

  it('marks active link with aria-current', () => {
    render(<SupplierBottomNavigation />)

    const offresLink = screen.getByRole('link', { name: /offres/i })
    expect(offresLink).toHaveAttribute('aria-current', 'page')
  })

  it('non-active links do not have aria-current', () => {
    render(<SupplierBottomNavigation />)

    const demandesLink = screen.getByRole('link', { name: /demandes/i })
    expect(demandesLink).not.toHaveAttribute('aria-current')
  })

  it('has navigation role with aria-label', () => {
    render(<SupplierBottomNavigation />)

    const nav = screen.getByRole('navigation')
    expect(nav).toHaveAttribute('aria-label', 'Navigation fournisseur')
  })

  it('each link has minimum touch target size (44x44px)', () => {
    render(<SupplierBottomNavigation />)

    const links = screen.getAllByRole('link')
    links.forEach((link) => {
      expect(link).toHaveClass('min-w-[44px]')
      expect(link).toHaveClass('min-h-[44px]')
    })
  })

  it('each link has focus-visible styles', () => {
    render(<SupplierBottomNavigation />)

    const links = screen.getAllByRole('link')
    links.forEach((link) => {
      expect(link).toHaveClass('focus-visible:ring-2')
    })
  })

  it('active link has primary color', () => {
    render(<SupplierBottomNavigation />)

    const offresLink = screen.getByRole('link', { name: /offres/i })
    expect(offresLink).toHaveClass('text-primary')
  })
})
