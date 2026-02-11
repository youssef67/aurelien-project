import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PageHeader } from './page-header'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    back: vi.fn(),
  }),
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

describe('PageHeader', () => {
  it('renders title correctly', () => {
    render(<PageHeader title="Test Title" />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Title')
  })

  it('does not show back button by default', () => {
    render(<PageHeader title="Test" />)
    expect(screen.queryByRole('button', { name: /retour/i })).not.toBeInTheDocument()
  })

  it('shows back button when showBack is true', () => {
    render(<PageHeader title="Test" showBack />)
    expect(screen.getByRole('button', { name: /retour/i })).toBeInTheDocument()
  })

  it('calls onBack when back button is clicked', () => {
    const onBack = vi.fn()
    render(<PageHeader title="Test" showBack onBack={onBack} />)

    fireEvent.click(screen.getByRole('button', { name: /retour/i }))
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('renders actions when provided', () => {
    render(<PageHeader title="Test" actions={<button>Action</button>} />)
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
  })

  it('back button has minimum touch target size (44x44px)', () => {
    render(<PageHeader title="Test" showBack />)
    const backButton = screen.getByRole('button', { name: /retour/i })

    expect(backButton).toHaveClass('min-w-[44px]')
    expect(backButton).toHaveClass('min-h-[44px]')
  })

  it('back button has accessible label', () => {
    render(<PageHeader title="Test" showBack />)
    const backButton = screen.getByRole('button', { name: /retour/i })

    expect(backButton).toHaveAttribute('aria-label', 'Retour')
  })

  it('renders a link instead of button when backHref is provided', () => {
    render(<PageHeader title="Test" showBack backHref="/requests" />)

    const backLink = screen.getByRole('link', { name: /retour/i })
    expect(backLink).toHaveAttribute('href', '/requests')
  })

  it('backHref link has accessible label', () => {
    render(<PageHeader title="Test" showBack backHref="/requests" />)

    const backLink = screen.getByRole('link', { name: /retour/i })
    expect(backLink).toHaveAttribute('aria-label', 'Retour')
  })

  it('backHref link has minimum touch target size', () => {
    render(<PageHeader title="Test" showBack backHref="/requests" />)

    const backLink = screen.getByRole('link', { name: /retour/i })
    expect(backLink).toHaveClass('min-w-[44px]')
    expect(backLink).toHaveClass('min-h-[44px]')
  })
})
