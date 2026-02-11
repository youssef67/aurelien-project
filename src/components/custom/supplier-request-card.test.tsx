import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SupplierRequestCard } from './supplier-request-card'
import type { SerializedSupplierRequest } from '@/lib/utils/requests'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

vi.mock('@/lib/utils/format', () => ({
  formatRelativeDate: () => 'il y a 2h',
}))

function createMockRequest(overrides: Partial<SerializedSupplierRequest> = {}): SerializedSupplierRequest {
  return {
    id: 'req-1',
    type: 'INFO',
    status: 'PENDING',
    message: 'Test message',
    createdAt: '2026-02-10T12:00:00Z',
    store: { name: 'Mon Magasin', brand: 'LECLERC', city: 'Strasbourg' },
    offer: { id: 'offer-1', name: 'Nutella 1kg' },
    ...overrides,
  }
}

describe('SupplierRequestCard', () => {
  it('renders store name', () => {
    render(<SupplierRequestCard request={createMockRequest()} />)
    expect(screen.getByText('Mon Magasin')).toBeInTheDocument()
  })

  it('renders store brand and city', () => {
    render(<SupplierRequestCard request={createMockRequest()} />)
    expect(screen.getByText(/LECLERC/)).toBeInTheDocument()
    expect(screen.getByText(/Strasbourg/)).toBeInTheDocument()
  })

  it('renders offer name', () => {
    render(<SupplierRequestCard request={createMockRequest()} />)
    expect(screen.getByText(/Nutella 1kg/)).toBeInTheDocument()
  })

  it('renders relative date', () => {
    render(<SupplierRequestCard request={createMockRequest()} />)
    expect(screen.getByText('il y a 2h')).toBeInTheDocument()
  })

  it('links to /requests/[id]', () => {
    render(<SupplierRequestCard request={createMockRequest()} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/requests/req-1')
  })

  it('renders "Renseignements" badge for INFO type', () => {
    render(<SupplierRequestCard request={createMockRequest({ type: 'INFO' })} />)
    expect(screen.getByText('Renseignements')).toBeInTheDocument()
  })

  it('renders "Commande" badge for ORDER type', () => {
    render(<SupplierRequestCard request={createMockRequest({ type: 'ORDER' })} />)
    expect(screen.getByText('Commande')).toBeInTheDocument()
  })

  it('renders "Nouveau" badge for PENDING status', () => {
    render(<SupplierRequestCard request={createMockRequest({ status: 'PENDING' })} />)
    expect(screen.getByText('Nouveau')).toBeInTheDocument()
  })

  it('renders "Traité" badge for TREATED status', () => {
    render(<SupplierRequestCard request={createMockRequest({ status: 'TREATED' })} />)
    expect(screen.getByText('Traité')).toBeInTheDocument()
  })

  it('ORDER badge has success class', () => {
    render(<SupplierRequestCard request={createMockRequest({ type: 'ORDER' })} />)
    const badge = screen.getByText('Commande')
    expect(badge).toHaveClass('bg-green-100')
  })

  it('PENDING badge has primary class', () => {
    render(<SupplierRequestCard request={createMockRequest({ status: 'PENDING' })} />)
    const badge = screen.getByText('Nouveau')
    expect(badge).toHaveClass('bg-primary/10')
  })

  it('TREATED badge has secondary variant', () => {
    render(<SupplierRequestCard request={createMockRequest({ status: 'TREATED' })} />)
    const badge = screen.getByText('Traité')
    expect(badge).toHaveAttribute('data-variant', 'secondary')
  })

  it('has asymmetric border-radius card style', () => {
    const { container } = render(<SupplierRequestCard request={createMockRequest()} />)
    const card = container.querySelector('[data-slot="card"]')
    expect(card).toHaveClass('rounded-[0_16px_16px_16px]')
  })

  it('has hover shadow style on card', () => {
    const { container } = render(<SupplierRequestCard request={createMockRequest()} />)
    const card = container.querySelector('[data-slot="card"]')
    expect(card).toHaveClass('hover:shadow-[0_4px_12px_rgba(37,34,74,0.08)]')
  })

  it('PENDING card has bg-secondary/50 highlight', () => {
    const { container } = render(<SupplierRequestCard request={createMockRequest({ status: 'PENDING' })} />)
    const card = container.querySelector('[data-slot="card"]')
    expect(card).toHaveClass('bg-secondary/50')
  })

  it('TREATED card has opacity-60', () => {
    const { container } = render(<SupplierRequestCard request={createMockRequest({ status: 'TREATED' })} />)
    const card = container.querySelector('[data-slot="card"]')
    expect(card).toHaveClass('opacity-60')
  })

  it('renders as article element', () => {
    render(<SupplierRequestCard request={createMockRequest()} />)
    expect(screen.getByRole('article')).toBeInTheDocument()
  })
})
