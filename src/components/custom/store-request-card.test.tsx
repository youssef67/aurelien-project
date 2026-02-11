import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StoreRequestCard } from './store-request-card'
import type { SerializedStoreRequest } from '@/lib/utils/requests'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

vi.mock('@/lib/utils/format', () => ({
  formatRelativeDate: (date: string) => `il y a 2h`,
}))

function createMockRequest(overrides: Partial<SerializedStoreRequest> = {}): SerializedStoreRequest {
  return {
    id: 'req-1',
    type: 'INFO',
    status: 'PENDING',
    message: 'Test message',
    createdAt: '2026-02-10T12:00:00Z',
    offer: { id: 'offer-1', name: 'Pommes Golden', promoPrice: 2.49 },
    supplier: { companyName: 'FruitCo' },
    ...overrides,
  }
}

describe('StoreRequestCard', () => {
  it('renders offer name', () => {
    render(<StoreRequestCard request={createMockRequest()} />)
    expect(screen.getByText('Pommes Golden')).toBeInTheDocument()
  })

  it('renders supplier name', () => {
    render(<StoreRequestCard request={createMockRequest()} />)
    expect(screen.getByText('FruitCo')).toBeInTheDocument()
  })

  it('renders relative date', () => {
    render(<StoreRequestCard request={createMockRequest()} />)
    expect(screen.getByText('il y a 2h')).toBeInTheDocument()
  })

  it('links to /my-requests/[id]', () => {
    render(<StoreRequestCard request={createMockRequest()} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/my-requests/req-1')
  })

  it('renders "Renseignements" badge for INFO type', () => {
    render(<StoreRequestCard request={createMockRequest({ type: 'INFO' })} />)
    expect(screen.getByText('Renseignements')).toBeInTheDocument()
  })

  it('renders "Commande" badge for ORDER type', () => {
    render(<StoreRequestCard request={createMockRequest({ type: 'ORDER' })} />)
    expect(screen.getByText('Commande')).toBeInTheDocument()
  })

  it('renders "En attente" badge for PENDING status', () => {
    render(<StoreRequestCard request={createMockRequest({ status: 'PENDING' })} />)
    expect(screen.getByText('En attente')).toBeInTheDocument()
  })

  it('renders "Traité" badge for TREATED status', () => {
    render(<StoreRequestCard request={createMockRequest({ status: 'TREATED' })} />)
    expect(screen.getByText('Traité')).toBeInTheDocument()
  })

  it('INFO badge has default variant (primary)', () => {
    render(<StoreRequestCard request={createMockRequest({ type: 'INFO' })} />)
    const badge = screen.getByText('Renseignements')
    expect(badge).toHaveAttribute('data-variant', 'default')
  })

  it('ORDER badge has success class', () => {
    render(<StoreRequestCard request={createMockRequest({ type: 'ORDER' })} />)
    const badge = screen.getByText('Commande')
    expect(badge).toHaveClass('bg-green-100')
  })

  it('PENDING badge has warning class', () => {
    render(<StoreRequestCard request={createMockRequest({ status: 'PENDING' })} />)
    const badge = screen.getByText('En attente')
    expect(badge).toHaveClass('bg-yellow-100')
  })

  it('TREATED badge has secondary variant', () => {
    render(<StoreRequestCard request={createMockRequest({ status: 'TREATED' })} />)
    const badge = screen.getByText('Traité')
    expect(badge).toHaveAttribute('data-variant', 'secondary')
  })

  it('has asymmetric border-radius card style', () => {
    const { container } = render(<StoreRequestCard request={createMockRequest()} />)
    const card = container.querySelector('[data-slot="card"]')
    expect(card).toHaveClass('rounded-[0_16px_16px_16px]')
  })

  it('has hover shadow style on card', () => {
    const { container } = render(<StoreRequestCard request={createMockRequest()} />)
    const card = container.querySelector('[data-slot="card"]')
    expect(card).toHaveClass('hover:shadow-[0_4px_12px_rgba(37,34,74,0.08)]')
  })

  it('renders as article element', () => {
    render(<StoreRequestCard request={createMockRequest()} />)
    expect(screen.getByRole('article')).toBeInTheDocument()
  })
})
