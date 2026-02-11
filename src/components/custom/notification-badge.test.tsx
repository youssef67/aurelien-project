import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NotificationBadge } from './notification-badge'

describe('NotificationBadge', () => {
  it('renders nothing when count is 0', () => {
    const { container } = render(<NotificationBadge count={0} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when count is negative', () => {
    const { container } = render(<NotificationBadge count={-1} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders count when count > 0', () => {
    render(<NotificationBadge count={5} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders "99+" when count > 99', () => {
    render(<NotificationBadge count={100} />)
    expect(screen.getByText('99+')).toBeInTheDocument()
  })

  it('renders "99" when count is exactly 99', () => {
    render(<NotificationBadge count={99} />)
    expect(screen.getByText('99')).toBeInTheDocument()
  })

  it('renders single digit count', () => {
    render(<NotificationBadge count={1} />)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('has aria-hidden="true"', () => {
    render(<NotificationBadge count={3} />)
    const badge = screen.getByText('3')
    expect(badge).toHaveAttribute('aria-hidden', 'true')
  })

  it('uses destructive background color', () => {
    render(<NotificationBadge count={3} />)
    const badge = screen.getByText('3')
    expect(badge).toHaveClass('bg-destructive')
    expect(badge).toHaveClass('text-destructive-foreground')
  })

  it('uses rounded-full shape', () => {
    render(<NotificationBadge count={3} />)
    const badge = screen.getByText('3')
    expect(badge).toHaveClass('rounded-full')
  })

  it('renders dot variant without text', () => {
    const { container } = render(<NotificationBadge count={5} variant="dot" />)
    const badge = container.querySelector('span')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('h-2.5', 'w-2.5')
    expect(badge?.textContent).toBe('')
  })

  it('count variant has min-width for pill shape', () => {
    render(<NotificationBadge count={5} />)
    const badge = screen.getByText('5')
    expect(badge).toHaveClass('min-w-4')
  })

  it('applies custom className', () => {
    render(<NotificationBadge count={3} className="custom-class" />)
    const badge = screen.getByText('3')
    expect(badge).toHaveClass('custom-class')
  })
})
