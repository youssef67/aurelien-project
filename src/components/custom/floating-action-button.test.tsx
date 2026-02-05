import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FloatingActionButton } from './floating-action-button'

describe('FloatingActionButton', () => {
  it('renders a link with the correct href', () => {
    render(<FloatingActionButton href="/offers/new" />)

    const link = screen.getByRole('link', { name: /créer une nouvelle offre/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/offers/new')
  })

  it('has aria-label for accessibility', () => {
    render(<FloatingActionButton href="/offers/new" />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('aria-label', 'Créer une nouvelle offre')
  })

  it('has fixed positioning with proper dimensions', () => {
    render(<FloatingActionButton href="/offers/new" />)

    const link = screen.getByRole('link')
    expect(link).toHaveClass('fixed')
    expect(link).toHaveClass('h-14')
    expect(link).toHaveClass('w-14')
    expect(link).toHaveClass('rounded-full')
  })

  it('is positioned above the bottom navigation', () => {
    render(<FloatingActionButton href="/offers/new" />)

    const link = screen.getByRole('link')
    expect(link).toHaveClass('bottom-20')
    expect(link).toHaveClass('right-4')
  })

  it('has shadow and hover effects', () => {
    render(<FloatingActionButton href="/offers/new" />)

    const link = screen.getByRole('link')
    expect(link).toHaveClass('shadow-lg')
    expect(link).toHaveClass('hover:shadow-xl')
    expect(link).toHaveClass('hover:scale-105')
  })

  it('accepts custom className', () => {
    render(<FloatingActionButton href="/test" className="custom-class" />)

    const link = screen.getByRole('link')
    expect(link).toHaveClass('custom-class')
  })

  it('has focus styles for accessibility', () => {
    render(<FloatingActionButton href="/offers/new" />)

    const link = screen.getByRole('link')
    expect(link).toHaveClass('focus:ring-2')
  })
})
