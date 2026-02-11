import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BottomNavigation } from './bottom-navigation'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/offers',
}))

describe('BottomNavigation', () => {
  it('renders all navigation items', () => {
    render(<BottomNavigation />)

    expect(screen.getByRole('link', { name: /offres/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /demandes/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /notifs/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /profil/i })).toBeInTheDocument()
  })

  it('has correct href for each link', () => {
    render(<BottomNavigation />)

    expect(screen.getByRole('link', { name: /offres/i })).toHaveAttribute('href', '/offers')
    expect(screen.getByRole('link', { name: /demandes/i })).toHaveAttribute('href', '/my-requests')
    expect(screen.getByRole('link', { name: /notifs/i })).toHaveAttribute('href', '/notifications')
    expect(screen.getByRole('link', { name: /profil/i })).toHaveAttribute('href', '/profile')
  })

  it('marks active link with aria-current', () => {
    render(<BottomNavigation />)

    const offersLink = screen.getByRole('link', { name: /offres/i })
    expect(offersLink).toHaveAttribute('aria-current', 'page')
  })

  it('has navigation role with aria-label', () => {
    render(<BottomNavigation />)

    const nav = screen.getByRole('navigation')
    expect(nav).toHaveAttribute('aria-label', 'Navigation principale')
  })

  it('each link has minimum touch target size (44x44px)', () => {
    render(<BottomNavigation />)

    const links = screen.getAllByRole('link')
    links.forEach((link) => {
      expect(link).toHaveClass('min-w-[44px]')
      expect(link).toHaveClass('min-h-[44px]')
    })
  })

  it('each link has focus-visible styles', () => {
    render(<BottomNavigation />)

    const links = screen.getAllByRole('link')
    links.forEach((link) => {
      expect(link).toHaveClass('focus-visible:ring-2')
    })
  })

  it('shows notification badge on Demandes when unreadRequestCount > 0', () => {
    render(<BottomNavigation unreadRequestCount={5} />)

    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('does not show badge when unreadRequestCount is 0', () => {
    render(<BottomNavigation unreadRequestCount={0} />)

    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('shows 99+ for counts over 99', () => {
    render(<BottomNavigation unreadRequestCount={150} />)

    expect(screen.getByText('99+')).toBeInTheDocument()
  })

  it('updates aria-label on Demandes link when badge is shown', () => {
    render(<BottomNavigation unreadRequestCount={3} />)

    expect(screen.getByRole('link', { name: /demandes \(3 non lues\)/i })).toBeInTheDocument()
  })
})
