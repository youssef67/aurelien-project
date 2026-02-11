import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptySupplierRequestsState } from './empty-supplier-requests-state'

describe('EmptySupplierRequestsState', () => {
  it('renders the empty state message', () => {
    render(<EmptySupplierRequestsState />)
    expect(screen.getByText('Les demandes de vos clients apparaîtront ici')).toBeInTheDocument()
  })

  it('renders the description text', () => {
    render(<EmptySupplierRequestsState />)
    expect(
      screen.getByText('Publiez des offres pour recevoir des demandes')
    ).toBeInTheDocument()
  })

  it('does NOT render any CTA button', () => {
    render(<EmptySupplierRequestsState />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('heading uses font-display class', () => {
    render(<EmptySupplierRequestsState />)
    const heading = screen.getByText('Les demandes de vos clients apparaîtront ici')
    expect(heading).toHaveClass('font-display')
  })

  it('renders the MessageSquare icon container', () => {
    const { container } = render(<EmptySupplierRequestsState />)
    const iconContainer = container.querySelector('.rounded-full.bg-muted')
    expect(iconContainer).toBeInTheDocument()
  })
})
