import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotificationItem } from './notification-item'
import type { SerializedNotification } from '@/lib/utils/notifications'

// Mock formatRelativeDate
vi.mock('@/lib/utils/format', () => ({
  formatRelativeDate: vi.fn(() => 'il y a 5min'),
}))

function mockNotification(overrides: Partial<SerializedNotification> = {}): SerializedNotification {
  return {
    id: 'notif-uuid-1',
    userId: 'user-123',
    userType: 'SUPPLIER',
    type: 'NEW_REQUEST',
    title: 'Nouvelle demande',
    body: 'Mon Magasin - Promo Biscuits',
    relatedId: 'req-uuid-1',
    read: false,
    createdAt: '2026-02-10T10:00:00.000Z',
    updatedAt: '2026-02-10T10:00:00.000Z',
    ...overrides,
  }
}

describe('NotificationItem', () => {
  it('renders notification title', () => {
    render(<NotificationItem notification={mockNotification()} onClick={vi.fn()} />)

    expect(screen.getByText('Nouvelle demande')).toBeInTheDocument()
  })

  it('renders notification body', () => {
    render(<NotificationItem notification={mockNotification()} onClick={vi.fn()} />)

    expect(screen.getByText('Mon Magasin - Promo Biscuits')).toBeInTheDocument()
  })

  it('renders relative date', () => {
    render(<NotificationItem notification={mockNotification()} onClick={vi.fn()} />)

    expect(screen.getByText('il y a 5min')).toBeInTheDocument()
  })

  it('applies bg-secondary for unread notification', () => {
    const { container } = render(
      <NotificationItem notification={mockNotification({ read: false })} onClick={vi.fn()} />
    )

    expect(container.firstChild).toHaveClass('bg-secondary')
  })

  it('does not apply bg-secondary for read notification', () => {
    const { container } = render(
      <NotificationItem notification={mockNotification({ read: true })} onClick={vi.fn()} />
    )

    expect(container.firstChild).not.toHaveClass('bg-secondary')
  })

  it('applies text-muted-foreground for read notification', () => {
    const { container } = render(
      <NotificationItem notification={mockNotification({ read: true })} onClick={vi.fn()} />
    )

    expect(container.firstChild).toHaveClass('text-muted-foreground')
  })

  it('shows blue dot indicator for unread notification', () => {
    render(<NotificationItem notification={mockNotification({ read: false })} onClick={vi.fn()} />)

    const dot = screen.getByTestId('unread-dot')
    expect(dot).toHaveClass('bg-primary')
  })

  it('does not show blue dot for read notification', () => {
    render(<NotificationItem notification={mockNotification({ read: true })} onClick={vi.fn()} />)

    expect(screen.queryByTestId('unread-dot')).not.toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<NotificationItem notification={mockNotification()} onClick={onClick} />)

    await user.click(screen.getByRole('button'))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders MessageSquare icon for NEW_REQUEST type', () => {
    render(
      <NotificationItem notification={mockNotification({ type: 'NEW_REQUEST' })} onClick={vi.fn()} />
    )

    expect(screen.getByTestId('icon-message-square')).toBeInTheDocument()
  })

  it('renders CheckCircle icon for REQUEST_TREATED type', () => {
    render(
      <NotificationItem notification={mockNotification({ type: 'REQUEST_TREATED' })} onClick={vi.fn()} />
    )

    expect(screen.getByTestId('icon-check-circle')).toBeInTheDocument()
  })
})
