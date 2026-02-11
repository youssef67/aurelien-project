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
    expect(screen.getByRole('link', { name: /notifs/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /profil/i })).toBeInTheDocument()
  })

  it('has correct href for each link', () => {
    render(<SupplierBottomNavigation />)

    expect(screen.getByRole('link', { name: /offres/i })).toHaveAttribute('href', '/dashboard')
    expect(screen.getByRole('link', { name: /demandes/i })).toHaveAttribute('href', '/requests')
    expect(screen.getByRole('link', { name: /notifs/i })).toHaveAttribute('href', '/notifications')
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

  describe('notification badge', () => {
    it('shows badge on Demandes when unreadRequestCount > 0', () => {
      render(<SupplierBottomNavigation unreadRequestCount={3} />)

      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('does not show badge when unreadRequestCount is 0', () => {
      render(<SupplierBottomNavigation unreadRequestCount={0} />)

      expect(screen.queryByText('0')).not.toBeInTheDocument()
    })

    it('does not show badge by default (no prop)', () => {
      const { container } = render(<SupplierBottomNavigation />)

      // Badge renders as a span with bg-destructive class — should not be present
      expect(container.querySelector('span.bg-destructive')).not.toBeInTheDocument()
    })

    it('shows "99+" for counts over 99', () => {
      render(<SupplierBottomNavigation unreadRequestCount={150} />)

      expect(screen.getByText('99+')).toBeInTheDocument()
    })

    it('updates aria-label on Demandes link when badge is shown', () => {
      render(<SupplierBottomNavigation unreadRequestCount={5} />)

      const demandesLink = screen.getByRole('link', { name: /demandes.*5 non lues/i })
      expect(demandesLink).toBeInTheDocument()
    })

    it('does not add count to aria-label when no unread', () => {
      render(<SupplierBottomNavigation unreadRequestCount={0} />)

      const demandesLink = screen.getByRole('link', { name: 'Demandes' })
      expect(demandesLink).toBeInTheDocument()
    })
  })
})
