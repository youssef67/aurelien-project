import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotificationList } from './notification-list'
import type { SerializedNotification } from '@/lib/utils/notifications'

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// Mock sonner
vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}))

// Mock server actions
const mockMarkNotificationAsRead = vi.fn()
const mockMarkAllNotificationsAsRead = vi.fn()
const mockLoadMoreNotifications = vi.fn()
vi.mock('@/lib/actions/notifications', () => ({
  markNotificationAsRead: (...args: unknown[]) => mockMarkNotificationAsRead(...args),
  markAllNotificationsAsRead: (...args: unknown[]) => mockMarkAllNotificationsAsRead(...args),
  loadMoreNotifications: (...args: unknown[]) => mockLoadMoreNotifications(...args),
}))

// Mock formatRelativeDate
vi.mock('@/lib/utils/format', () => ({
  formatRelativeDate: vi.fn(() => 'il y a 5min'),
}))

// Mock useNotifications hook
const mockDecrementCount = vi.fn()
const mockResetCount = vi.fn()
const mockUseNotifications = vi.fn()
vi.mock('@/lib/hooks/use-notifications', () => ({
  useNotifications: (...args: unknown[]) => mockUseNotifications(...args),
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

describe('NotificationList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMarkNotificationAsRead.mockResolvedValue({ success: true, data: { id: 'notif-uuid-1' } })
    mockMarkAllNotificationsAsRead.mockResolvedValue({ success: true, data: { count: 2 } })
    mockUseNotifications.mockReturnValue({
      unreadCount: 2,
      decrementCount: mockDecrementCount,
      resetCount: mockResetCount,
    })
  })

  it('renders notifications', () => {
    render(
      <NotificationList
        initialNotifications={[mockNotification()]}
        userId="user-123"
        userType="SUPPLIER"
        initialUnreadCount={1}
        hasMore={false}
      />
    )

    expect(screen.getByText('Nouvelle demande')).toBeInTheDocument()
  })

  it('shows "Tout marquer comme lu" button when unread notifications exist', () => {
    render(
      <NotificationList
        initialNotifications={[mockNotification({ read: false })]}
        userId="user-123"
        userType="SUPPLIER"
        initialUnreadCount={1}
        hasMore={false}
      />
    )

    expect(screen.getByText('Tout marquer comme lu')).toBeInTheDocument()
  })

  it('does not show "Tout marquer comme lu" when all are read', () => {
    mockUseNotifications.mockReturnValue({
      unreadCount: 0,
      decrementCount: mockDecrementCount,
      resetCount: mockResetCount,
    })

    render(
      <NotificationList
        initialNotifications={[mockNotification({ read: true })]}
        userId="user-123"
        userType="SUPPLIER"
        initialUnreadCount={0}
        hasMore={false}
      />
    )

    expect(screen.queryByText('Tout marquer comme lu')).not.toBeInTheDocument()
  })

  it('shows empty state when no notifications', () => {
    mockUseNotifications.mockReturnValue({
      unreadCount: 0,
      decrementCount: mockDecrementCount,
      resetCount: mockResetCount,
    })

    render(
      <NotificationList
        initialNotifications={[]}
        userId="user-123"
        userType="SUPPLIER"
        initialUnreadCount={0}
        hasMore={false}
      />
    )

    expect(screen.getByText('Aucune notification')).toBeInTheDocument()
  })

  it('shows supplier-specific empty state message', () => {
    mockUseNotifications.mockReturnValue({
      unreadCount: 0,
      decrementCount: mockDecrementCount,
      resetCount: mockResetCount,
    })

    render(
      <NotificationList
        initialNotifications={[]}
        userId="user-123"
        userType="SUPPLIER"
        initialUnreadCount={0}
        hasMore={false}
      />
    )

    expect(screen.getByText(/magasin enverra une demande/)).toBeInTheDocument()
  })

  it('shows store-specific empty state message', () => {
    mockUseNotifications.mockReturnValue({
      unreadCount: 0,
      decrementCount: mockDecrementCount,
      resetCount: mockResetCount,
    })

    render(
      <NotificationList
        initialNotifications={[]}
        userId="user-123"
        userType="STORE"
        initialUnreadCount={0}
        hasMore={false}
      />
    )

    expect(screen.getByText(/fournisseur traitera votre demande/)).toBeInTheDocument()
  })

  it('shows "Charger plus" button when hasMore is true', () => {
    render(
      <NotificationList
        initialNotifications={[mockNotification()]}
        userId="user-123"
        userType="SUPPLIER"
        initialUnreadCount={1}
        hasMore={true}
      />
    )

    expect(screen.getByText('Charger plus')).toBeInTheDocument()
  })

  it('does not show "Charger plus" when hasMore is false', () => {
    render(
      <NotificationList
        initialNotifications={[mockNotification()]}
        userId="user-123"
        userType="SUPPLIER"
        initialUnreadCount={1}
        hasMore={false}
      />
    )

    expect(screen.queryByText('Charger plus')).not.toBeInTheDocument()
  })

  it('calls markNotificationAsRead and navigates on notification click for supplier', async () => {
    const user = userEvent.setup()
    render(
      <NotificationList
        initialNotifications={[mockNotification({ relatedId: 'req-123' })]}
        userId="user-123"
        userType="SUPPLIER"
        initialUnreadCount={1}
        hasMore={false}
      />
    )

    await user.click(screen.getByRole('button', { name: /Nouvelle demande/i }))

    expect(mockMarkNotificationAsRead).toHaveBeenCalledWith('notif-uuid-1')
  })

  it('navigates to /requests/[relatedId] for supplier on click', async () => {
    const user = userEvent.setup()
    render(
      <NotificationList
        initialNotifications={[mockNotification({ relatedId: 'req-123' })]}
        userId="user-123"
        userType="SUPPLIER"
        initialUnreadCount={1}
        hasMore={false}
      />
    )

    await user.click(screen.getByRole('button', { name: /Nouvelle demande/i }))

    expect(mockPush).toHaveBeenCalledWith('/requests/req-123')
  })

  it('navigates to /my-requests for store on click', async () => {
    const user = userEvent.setup()
    render(
      <NotificationList
        initialNotifications={[mockNotification({ userType: 'STORE', relatedId: 'req-123' })]}
        userId="user-123"
        userType="STORE"
        initialUnreadCount={1}
        hasMore={false}
      />
    )

    await user.click(screen.getByRole('button', { name: /Nouvelle demande/i }))

    expect(mockPush).toHaveBeenCalledWith('/my-requests')
  })

  it('calls loadMoreNotifications when "Charger plus" is clicked', async () => {
    const user = userEvent.setup()
    mockLoadMoreNotifications.mockResolvedValue({
      success: true,
      data: {
        notifications: [mockNotification({ id: 'notif-uuid-2', title: 'Deuxième notification' })],
        hasMore: false,
      },
    })

    render(
      <NotificationList
        initialNotifications={[mockNotification()]}
        userId="user-123"
        userType="SUPPLIER"
        initialUnreadCount={1}
        hasMore={true}
      />
    )

    await user.click(screen.getByText('Charger plus'))

    expect(mockLoadMoreNotifications).toHaveBeenCalledWith('SUPPLIER', 1)
  })

  it('appends loaded notifications to the list', async () => {
    const user = userEvent.setup()
    mockLoadMoreNotifications.mockResolvedValue({
      success: true,
      data: {
        notifications: [mockNotification({ id: 'notif-uuid-2', title: 'Deuxième notification' })],
        hasMore: false,
      },
    })

    render(
      <NotificationList
        initialNotifications={[mockNotification()]}
        userId="user-123"
        userType="SUPPLIER"
        initialUnreadCount={1}
        hasMore={true}
      />
    )

    await user.click(screen.getByText('Charger plus'))

    expect(screen.getByText('Deuxième notification')).toBeInTheDocument()
  })

  it('calls markAllNotificationsAsRead when "Tout marquer comme lu" is clicked', async () => {
    const user = userEvent.setup()
    render(
      <NotificationList
        initialNotifications={[mockNotification()]}
        userId="user-123"
        userType="SUPPLIER"
        initialUnreadCount={1}
        hasMore={false}
      />
    )

    await user.click(screen.getByText('Tout marquer comme lu'))

    expect(mockMarkAllNotificationsAsRead).toHaveBeenCalledTimes(1)
  })
})
