import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/lib/queries/notifications', () => ({
  getNotifications: vi.fn(),
  getUnreadNotificationCount: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'supplier-1' } } }),
    },
  }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  redirect: vi.fn(),
}))

vi.mock('@/lib/utils/format', () => ({
  formatRelativeDate: () => 'il y a 5min',
}))

vi.mock('@/lib/hooks/use-notifications', () => ({
  useNotifications: () => ({
    unreadCount: 0,
    decrementCount: vi.fn(),
    resetCount: vi.fn(),
  }),
}))

vi.mock('@/lib/actions/notifications', () => ({
  markNotificationAsRead: vi.fn(),
  markAllNotificationsAsRead: vi.fn(),
}))

import { getNotifications, getUnreadNotificationCount } from '@/lib/queries/notifications'
import SupplierNotificationsPage from './page'

describe('SupplierNotificationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page header with title "Notifications"', async () => {
    vi.mocked(getNotifications).mockResolvedValue([])
    vi.mocked(getUnreadNotificationCount).mockResolvedValue(0)

    const result = await SupplierNotificationsPage()
    render(result as React.ReactElement)

    expect(screen.getByText('Notifications')).toBeInTheDocument()
  })

  it('renders empty state when no notifications', async () => {
    vi.mocked(getNotifications).mockResolvedValue([])
    vi.mocked(getUnreadNotificationCount).mockResolvedValue(0)

    const result = await SupplierNotificationsPage()
    render(result as React.ReactElement)

    expect(screen.getByText('Aucune notification')).toBeInTheDocument()
  })

  it('renders notifications when they exist', async () => {
    vi.mocked(getNotifications).mockResolvedValue([{
      id: 'n1',
      userId: 'supplier-1',
      userType: 'SUPPLIER',
      type: 'NEW_REQUEST',
      title: 'Nouvelle demande',
      body: 'Mon Magasin - Promo',
      relatedId: 'req-1',
      read: false,
      createdAt: '2026-02-10T10:00:00.000Z',
      updatedAt: '2026-02-10T10:00:00.000Z',
    }])
    vi.mocked(getUnreadNotificationCount).mockResolvedValue(1)

    const result = await SupplierNotificationsPage()
    render(result as React.ReactElement)

    expect(screen.getByText('Nouvelle demande')).toBeInTheDocument()
  })

  it('calls getNotifications with SUPPLIER userType', async () => {
    vi.mocked(getNotifications).mockResolvedValue([])
    vi.mocked(getUnreadNotificationCount).mockResolvedValue(0)

    await SupplierNotificationsPage()

    expect(getNotifications).toHaveBeenCalledWith('supplier-1', 'SUPPLIER', 0, 50)
  })
})
