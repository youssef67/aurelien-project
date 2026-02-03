import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MobileLayout } from './mobile-layout'

// Mock BottomNavigation
vi.mock('@/components/custom/bottom-navigation', () => ({
  BottomNavigation: () => <nav data-testid="bottom-nav">Bottom Nav</nav>,
}))

describe('MobileLayout', () => {
  it('renders children content', () => {
    render(
      <MobileLayout>
        <div>Test Content</div>
      </MobileLayout>
    )

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders header when provided', () => {
    render(
      <MobileLayout header={<div>Header Content</div>}>
        <div>Main Content</div>
      </MobileLayout>
    )

    expect(screen.getByText('Header Content')).toBeInTheDocument()
  })

  it('does not render header element when header prop is not provided', () => {
    render(
      <MobileLayout>
        <div>Content</div>
      </MobileLayout>
    )

    expect(screen.queryByRole('banner')).not.toBeInTheDocument()
  })

  it('shows bottom navigation by default', () => {
    render(
      <MobileLayout>
        <div>Content</div>
      </MobileLayout>
    )

    expect(screen.getByTestId('bottom-nav')).toBeInTheDocument()
  })

  it('hides bottom navigation when showBottomNav is false', () => {
    render(
      <MobileLayout showBottomNav={false}>
        <div>Content</div>
      </MobileLayout>
    )

    expect(screen.queryByTestId('bottom-nav')).not.toBeInTheDocument()
  })

  it('has sticky header with proper z-index', () => {
    render(
      <MobileLayout header={<div>Header</div>}>
        <div>Content</div>
      </MobileLayout>
    )

    const header = screen.getByRole('banner')
    expect(header).toHaveClass('sticky')
    expect(header).toHaveClass('top-0')
    expect(header).toHaveClass('z-50')
  })

  it('main content has proper padding for bottom nav', () => {
    render(
      <MobileLayout>
        <div>Content</div>
      </MobileLayout>
    )

    const main = screen.getByRole('main')
    expect(main).toHaveClass('pb-16')
  })
})
